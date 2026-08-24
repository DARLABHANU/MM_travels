import { Coordinate } from '../../types/location';

export interface LocationSearchResult {
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    subtitle: string;
    formattedAddress: string;
}

// Hardcoded token (same pattern as rest of app)
const MAPBOX_TOKEN = (process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '').trim();

// In-memory cache: key = query+lat+lng to prevent bias conflicts
const searchCache = new Map<string, LocationSearchResult[]>();

// OSM rate limiting
let lastOsmQueryTime = 0;

// ─── Mapbox Forward Geocoding (Primary) ───────────────────────────────────────
async function searchViaMapbox(
    query: string,
    focusCoordinate?: Coordinate
): Promise<LocationSearchResult[]> {
    try {
        // All granular place types including village-level for rural India
        const types = 'poi,address,neighborhood,locality,place,district,region,postcode';
        let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`
            + `?access_token=${MAPBOX_TOKEN}`
            + `&types=${types}`
            + `&limit=8`
            + `&language=en`
            + `&autocomplete=true`
            + `&country=IN`; // Bias to India for MM Travels

        if (focusCoordinate) {
            url += `&proximity=${focusCoordinate.longitude},${focusCoordinate.latitude}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
            console.warn(`[SEARCH] Mapbox returned ${res.status}`);
            return [];
        }

        const data = await res.json();
        if (!data.features || !Array.isArray(data.features)) return [];

        return data.features.map((feature: any) => {
            const context: any[] = feature.context || [];
            const getCtx = (prefix: string) =>
                context.find((c: any) => c.id?.startsWith(prefix))?.text || null;

            const name = feature.text || feature.place_name?.split(',')[0] || 'Unknown';

            // Build subtitle from context hierarchy
            const locality = getCtx('locality') || getCtx('neighborhood');
            const place = getCtx('place');
            const district = getCtx('district');
            const region = getCtx('region');

            const subtitleParts = [locality, place || district, region].filter(
                (p): p is string => !!p && p !== name
            );
            const subtitle = subtitleParts.join(', ') || feature.place_name?.split(',').slice(1).join(',').trim() || '';

            return {
                id: feature.id || Math.random().toString(),
                latitude: feature.geometry.coordinates[1],
                longitude: feature.geometry.coordinates[0],
                title: name,
                subtitle,
                formattedAddress: feature.place_name || name,
            };
        });
    } catch (e) {
        console.warn('[SEARCH] Mapbox search error:', e);
        return [];
    }
}

// ─── OSM Nominatim Fallback ───────────────────────────────────────────────────
async function searchViaOSM(
    query: string,
    focusCoordinate?: Coordinate
): Promise<LocationSearchResult[]> {
    // Rate limit: 1 req/sec for public Nominatim
    const now = Date.now();
    const elapsed = now - lastOsmQueryTime;
    if (elapsed < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsed));
    }
    lastOsmQueryTime = Date.now();

    try {
        let url = `https://nominatim.openstreetmap.org/search`
            + `?q=${encodeURIComponent(query)}`
            + `&format=jsonv2&addressdetails=1&limit=8`
            + `&countrycodes=in`; // India only

        if (focusCoordinate) {
            const lat = focusCoordinate.latitude;
            const lon = focusCoordinate.longitude;
            // ~50 km viewbox, bounded=0 biases but allows outside results
            url += `&viewbox=${lon - 0.5},${lat + 0.5},${lon + 0.5},${lat - 0.5}&bounded=0`;
        }

        const res = await fetch(url, {
            headers: {
                'Accept-Language': 'en',
                'User-Agent': 'MMTravelsApp/1.0',
            },
        });

        const data = await res.json();
        if (!Array.isArray(data)) return [];

        return data.map((item: any) => {
            const addr = item.address || {};

            // Village priority chain for rural India
            const name =
                item.name ||
                addr.hamlet ||
                addr.village ||
                addr.isolated_dwelling ||
                addr.suburb ||
                addr.neighbourhood ||
                addr.town ||
                addr.road ||
                'Unknown Location';

            // Subtitle: mandal/block → district → state
            const subtitleParts = [
                addr.suburb || addr.county || addr.state_district,
                addr.city || addr.town || addr.municipality,
                addr.state,
            ].filter((p): p is string => !!p && p !== name);

            const uniqueParts = [...new Set(subtitleParts)];

            return {
                id: item.place_id?.toString() || Math.random().toString(),
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon),
                title: name,
                subtitle: uniqueParts.join(', '),
                formattedAddress: item.display_name,
            };
        });
    } catch (e) {
        console.warn('[SEARCH] OSM search error:', e);
        return [];
    }
}

// ─── Deduplicate results by proximity (within ~300m) ─────────────────────────
function deduplicateResults(results: LocationSearchResult[]): LocationSearchResult[] {
    const seen: LocationSearchResult[] = [];
    for (const r of results) {
        const isDuplicate = seen.some(
            s =>
                Math.abs(s.latitude - r.latitude) < 0.003 &&
                Math.abs(s.longitude - r.longitude) < 0.003
        );
        if (!isDuplicate) seen.push(r);
    }
    return seen;
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export async function searchLocations(
    query: string,
    focusCoordinate?: Coordinate
): Promise<LocationSearchResult[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const cacheKey = `${trimmed.toLowerCase()}::${focusCoordinate?.latitude?.toFixed(2) || 'x'}::${focusCoordinate?.longitude?.toFixed(2) || 'x'}`;
    if (searchCache.has(cacheKey)) {
        return searchCache.get(cacheKey)!;
    }

    // Run Mapbox first (fast, fuzzy, village-aware for India)
    const mapboxResults = await searchViaMapbox(trimmed, focusCoordinate);

    // If Mapbox returns < 3 results, supplement with OSM
    let finalResults = mapboxResults;
    if (mapboxResults.length < 3) {
        const osmResults = await searchViaOSM(trimmed, focusCoordinate);
        finalResults = deduplicateResults([...mapboxResults, ...osmResults]);
    }

    searchCache.set(cacheKey, finalResults);
    console.log(`[SEARCH] "${trimmed}" → ${finalResults.length} results`);
    return finalResults;
}
