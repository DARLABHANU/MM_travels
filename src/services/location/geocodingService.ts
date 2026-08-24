import { Address, Coordinate } from '../../types/location';

// Cache to prevent duplicate requests and spam
const gcCache = new Map<string, Address>();
let lastGcTimestamp = 0;

// Session flag to gracefully abandon the native OS geocoder proxy if it is structurally offline
let nativeGeocoderUnavailable = false;

const MAPBOX_ACCESS_TOKEN = (process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '').trim();

export async function reverseGeocode(coordinate: Coordinate): Promise<Address | null> {
    const { latitude, longitude } = coordinate;
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    if (gcCache.has(cacheKey)) {
        return gcCache.get(cacheKey)!;
    }

    if (MAPBOX_ACCESS_TOKEN && MAPBOX_ACCESS_TOKEN.startsWith('pk.')) {
        try {
            // Include all granular place types — village, hamlet, locality, district for rural India
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=poi,address,neighborhood,locality,place,district,region&limit=1&language=en`;
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                if (data && data.features && data.features.length > 0) {
                    const bestMatch = data.features[0];

                    // Extract structured context parts (village, district, state etc.)
                    const context: any[] = bestMatch.context || [];
                    const getCtx = (id: string) => context.find((c: any) => c.id?.startsWith(id))?.text || null;

                    const name = bestMatch.text || bestMatch.place_name?.split(',')[0] || null;
                    const district = getCtx('locality') || getCtx('place') || getCtx('district') || null;
                    const city = getCtx('place') || getCtx('district') || null;
                    const region = getCtx('region') || null;
                    const country = getCtx('country') || null;

                    const result: Address = {
                        streetNumber: null,
                        street: getCtx('address') || null,
                        district,
                        city,
                        region,
                        postalCode: getCtx('postcode') || null,
                        country,
                        name,
                        formattedAddress: bestMatch.place_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                    };

                    gcCache.set(cacheKey, result);
                    console.log(`[GEOCODE] Mapbox success: ${name} — ${bestMatch.place_name}`);
                    return result;
                }
            } else {
                console.warn(`Mapbox geocoding returned ${response.status}. Switching to fallback...`);
            }
        } catch (e) {
            console.warn('Mapbox network error, attempting fallback...', e);
        }
    }

    // --- OSM Nominatim FALLBACK (captures village, hamlet, rural areas) ---
    try {
        const fallbackUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`;
        const fbRes = await fetch(fallbackUrl, {
            headers: { 'User-Agent': 'MMTravelsApp/1.0' },
        });
        const fbData = await fbRes.json();
        const addr = fbData.address || {};

        // Priority chain for name: village > hamlet > town > suburb > road (rural India coverage)
        const title =
            addr.village ||
            addr.hamlet ||
            addr.isolated_dwelling ||
            addr.suburb ||
            addr.neighbourhood ||
            addr.town ||
            addr.road ||
            fbData.name ||
            'Selected Location';

        // District-level: from block/tehsil/county/district
        const district =
            addr.county ||
            addr.state_district ||
            addr.suburb ||
            addr.city_district ||
            null;

        const addressStr = fbData.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

        const fallbackResult: Address = {
            streetNumber: addr.house_number || null,
            street: addr.road || null,
            district,
            city: addr.city || addr.town || addr.municipality || null,
            region: addr.state || null,
            postalCode: addr.postcode || null,
            country: addr.country || null,
            name: title,
            formattedAddress: addressStr,
        };

        console.log(`[GEOCODE] OSM fallback success: ${title} — ${addressStr}`);
        gcCache.set(cacheKey, fallbackResult);
        return fallbackResult;
    } catch (fallbackError) {
        console.error("All reverse geocoders failed:", fallbackError);
        const fallbackCoordStr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        return {
            streetNumber: null,
            street: null,
            district: null,
            city: null,
            region: null,
            postalCode: null,
            country: null,
            name: `Near ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
            formattedAddress: `Dropped Pin (${fallbackCoordStr})`,
        };
    }
}

export function formatAddress(address: Address | null): { title: string, subtitle: string } {
    if (!address) return { title: 'Unknown Location', subtitle: 'Tap to refresh' };

    const title = address.name || address.street || address.district || 'Selected Location';

    // Construct subtitle cleanly without hanging commas
    const subtitleParts = [address.street, address.district, address.city, address.region].filter(Boolean);
    const subtitle = subtitleParts.join(', ') || address.formattedAddress || 'Unknown Area';

    return { title, subtitle };
}
