import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getServiceDefinition } from '../config/serviceDefinitions';
import { LocationSearchResult, searchLocations } from '../services/location/locationSearchService';
import { useIntentStore } from '../store/intentStore';
import { Coordinate } from '../types/location';

export interface SavedLocation {
    id: string;
    title: string;
    subtitle: string;
    latitude: number;
    longitude: number;
    type: 'recent' | 'favorite' | 'work' | 'home';
    isFavorite: boolean;
}

const INITIAL_RECENT_LOCATIONS: SavedLocation[] = [
    { id: '1', title: 'Work', subtitle: 'Cyber Towers, Hitech City, Hyderabad', latitude: 17.4504, longitude: 78.3808, type: 'work', isFavorite: true },
    { id: '2', title: 'Home', subtitle: 'Gopalapatnam, Visakhapatnam', latitude: 17.7471, longitude: 83.2198, type: 'home', isFavorite: true },
    { id: '3', title: 'NAD Junction', subtitle: 'Shanti Nagar, NSTL, Visakhapatnam', latitude: 17.7425, longitude: 83.2201, type: 'recent', isFavorite: false },
    { id: '4', title: 'VMR Central Mall', subtitle: 'Aganampudi, Visakhapatnam', latitude: 17.6896, longitude: 83.1666, type: 'recent', isFavorite: false }
];

export default function DestinationScreen() {
    const router = useRouter();
    const intent = useIntentStore(state => state.intent);
    const intentLocations = useIntentStore(state => state.locations);
    const setLocationToStore = useIntentStore(state => state.setLocation);
    const params = useLocalSearchParams<{ lat?: string | string[], lng?: string | string[], pickupTitle?: string | string[] }>();

    // Read the authoritative definition using the loaded intent
    const serviceDef = intent ? getServiceDefinition(intent.serviceId) : undefined;

    // Dynamic State arrays mapped by LocationRole for the UI inputs
    const [queries, setQueries] = useState<Record<string, string>>({});
    const [locations, setLocations] = useState<Record<string, { lat: string, lng: string, title?: string, subtitle?: string }>>({});
    const [activeField, setActiveField] = useState<string>('');

    // Handle malformed/unavailable service gracefully
    useEffect(() => {
        if (!intent || !serviceDef) {
            Alert.alert("Service Unavailable", "This service intent is malformed or not found.", [
                { text: 'OK', onPress: () => router.push('/(tabs)') }
            ]);
        }
    }, [serviceDef, intent]);

    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);

    useEffect(() => {
        // Hydrate from Intent Store (This naturally catches Map Selection returns!)
        let changed = false;
        const nextQueries = { ...queries };
        const nextLocations = { ...locations };

        Object.keys(intentLocations).forEach(key => {
            const role = key as string;
            const storeLoc = intentLocations[role as keyof typeof intentLocations];
            if (storeLoc?.coord) {
                const currentLoc = locations[role];
                // Only update if it actually changed, to avoid re-render loops
                if (!currentLoc || currentLoc.lat !== storeLoc.coord.latitude.toString() || currentLoc.lng !== storeLoc.coord.longitude.toString()) {
                    nextQueries[role] = storeLoc.address?.name || 'Selected on Map';
                    nextLocations[role] = {
                        lat: storeLoc.coord.latitude.toString(),
                        lng: storeLoc.coord.longitude.toString(),
                        title: storeLoc.address?.name || 'Selected on Map',
                        subtitle: storeLoc.address?.formattedAddress || ''
                    };
                    changed = true;
                }
            }
        });

        if (changed) {
            setQueries(nextQueries);
            setLocations(nextLocations);

            // Auto advance active field conceptually if there's an unfilled one
            const nextEmptyReq = serviceDef?.locationRequirements.find(req => req.required && !nextLocations[req.role]);
            if (nextEmptyReq) {
                setActiveField(nextEmptyReq.role);
            } else if (serviceDef) {
                // Auto route if all required fields are filled and we just caught a state change 
                setTimeout(() => {
                    router.push({
                        pathname: serviceDef.targetRoute as any,
                        params: {}
                    });
                }, 300);
            }
        }
    }, [intentLocations, serviceDef]);

    // Populate initial state if passed (e.g. from Home GPS location)
    useEffect(() => {
        if (serviceDef?.category === 'city_ride' && params.lat && params.lng) {
            // Using loose param check since legacy home screen passed lat/lng
            const firstRole = serviceDef.locationRequirements[0].role;
            if (!intentLocations[firstRole]) {
                const titleStr = Array.isArray(params.pickupTitle) ? params.pickupTitle[0] || 'Current Location' : params.pickupTitle || 'Current Location';
                const latStr = Array.isArray(params.lat) ? params.lat[0] : (params.lat || '');
                const lngStr = Array.isArray(params.lng) ? params.lng[0] : (params.lng || '');

                if (latStr && lngStr) {
                    setLocationToStore(
                        firstRole as any,
                        { latitude: parseFloat(latStr), longitude: parseFloat(lngStr) },
                        { name: titleStr, formattedAddress: '', streetNumber: null, street: null, district: null, city: null, region: null, postalCode: null, country: null }
                    );
                }
            }
        }
    }, [params.lat, serviceDef]);

    useEffect(() => {
        const activeQuery = queries[activeField] || '';
        const timeoutId = setTimeout(() => {
            if (activeQuery.trim().length >= 2) {
                performSearch(activeQuery);
            } else if (activeQuery.trim().length === 0) {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [queries, activeField]);

    const performSearch = async (query: string) => {
        setIsSearching(true);
        // Find if we have a focus coord to bias the search
        let focusCoord: Coordinate | undefined;
        const firstLocKey = Object.keys(locations)[0];
        if (firstLocKey && locations[firstLocKey]) {
            focusCoord = { latitude: parseFloat(locations[firstLocKey].lat), longitude: parseFloat(locations[firstLocKey].lng) };
        }

        const results = await searchLocations(query, focusCoord);
        setSearchResults(results);
        setIsSearching(false);
    };

    const validateAndRoute = () => {
        if (!serviceDef) return;

        // Validate required fields
        const missing = serviceDef.locationRequirements.filter(req => req.required && !locations[req.role]);
        if (missing.length > 0) {
            Alert.alert("Missing locations", `Please provide: ${missing.map(m => m.label).join(', ')}`);
            return;
        }

        // Store selected locations into the authoritative intentStore
        for (const req of serviceDef.locationRequirements) {
            const loc = locations[req.role];
            if (loc) {
                setLocationToStore(req.role as any, { latitude: parseFloat(loc.lat), longitude: parseFloat(loc.lng) }, { name: loc.title || '', formattedAddress: loc.subtitle || '', streetNumber: null, street: null, district: null, city: null, region: null, postalCode: null, country: null });
            }
        }

        // Flow Router based on architecture definition - NO PARAMS NEEDED (except maybe action triggers), Store handles state!
        // We will pass them as params purely as fallback for now until c6 is fully converted, but we'll also use intentStore.

        // Prepare explicit routing params mapping config keys for legacy backwards support
        const routeParams: Record<string, string> = {};
        for (const req of serviceDef.locationRequirements) {
            const loc = locations[req.role];
            if (loc) {
                routeParams[req.routeParamKeys.lat] = loc.lat;
                routeParams[req.routeParamKeys.lng] = loc.lng;
                if (req.routeParamKeys.title && loc.title) routeParams[req.routeParamKeys.title] = loc.title;
                if (req.routeParamKeys.subtitle && loc.subtitle) routeParams[req.routeParamKeys.subtitle] = loc.subtitle;
            }
        }

        router.push({
            pathname: serviceDef.targetRoute,
            params: routeParams // Keeping for C6 backward compatibility while we refactor C6 next 
        });
    };

    const handleSelectResult = (result: LocationSearchResult) => {
        Keyboard.dismiss();
        setSearchResults([]);

        setLocationToStore(
            activeField as any,
            { latitude: result.latitude, longitude: result.longitude },
            { name: result.title, formattedAddress: result.subtitle || '', streetNumber: null, street: null, district: null, city: null, region: null, postalCode: null, country: null }
        );
    };

    const handleSelectRecent = (recent: SavedLocation) => {
        Keyboard.dismiss();

        setLocationToStore(
            activeField as any,
            { latitude: recent.latitude, longitude: recent.longitude },
            { name: recent.title, formattedAddress: recent.subtitle || '', streetNumber: null, street: null, district: null, city: null, region: null, postalCode: null, country: null }
        );
    };

    const handleSwap = () => {
        if (serviceDef && serviceDef.locationRequirements.length >= 2) {
            const role1 = serviceDef.locationRequirements[0].role;
            const role2 = serviceDef.locationRequirements[1].role;

            const loc1 = intentLocations[role1];
            const loc2 = intentLocations[role2];

            if (loc2 && loc2.coord) setLocationToStore(role1 as any, loc2.coord, loc2.address || { name: '', formattedAddress: '', streetNumber: null, street: null, district: null, city: null, region: null, postalCode: null, country: null });
            if (loc1 && loc1.coord) setLocationToStore(role2 as any, loc1.coord, loc1.address || { name: '', formattedAddress: '', streetNumber: null, street: null, district: null, city: null, region: null, postalCode: null, country: null });
        }
    };

    const activeReq = serviceDef?.locationRequirements.find(r => r.role === activeField) || serviceDef?.locationRequirements[0];
    const canContinue = serviceDef?.locationRequirements.every(req => !req.required || locations[req.role]) ?? false;
    const headerTitle = serviceDef ? "Plan your " + serviceDef.category.replace('_', ' ') : "Loading...";

    if (!serviceDef) {
        return (
            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                <View style={[styles.header, { justifyContent: 'center' }]}>
                    <ActivityIndicator color={colors.ink} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityLabel="Go back">
                    <Ionicons name="arrow-back" size={24} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitleText}>{headerTitle}</Text>
                <View style={{ flex: 1 }} />

                {serviceDef.scheduleEnabled && (
                    <TouchableOpacity style={styles.scheduleHeaderPill}>
                        <Ionicons name="time" size={14} color={colors.ink} />
                        <Text style={styles.scheduleHeaderText}>Now</Text>
                        <Ionicons name="chevron-down" size={12} color={colors.ink} />
                    </TouchableOpacity>
                )}
            </View>

            <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>

                    <View style={styles.fieldStack}>
                        {serviceDef.locationRequirements.map((req, index) => {
                            const isFirst = index === 0;
                            const isLast = index === serviceDef.locationRequirements.length - 1;
                            const isActive = activeField === req.role;

                            // Visuals
                            const iconStyle = {
                                backgroundColor: isFirst ? colors.green : 'transparent',
                                borderRadius: isFirst ? 6 : 0,
                                width: isFirst ? 12 : undefined,
                                height: isFirst ? 12 : undefined,
                            }

                            return (
                                <View key={req.role}>
                                    <View style={styles.fieldRow}>
                                        {isFirst ? (
                                            <View style={iconStyle} />
                                        ) : (
                                            <Ionicons name="pin" size={12} color={colors.inkFaint} style={{ width: 12, textAlign: 'center' }} />
                                        )}
                                        <View style={{ width: 16 }} />
                                        <TextInput
                                            style={[styles.input, isActive && styles.inputActive]}
                                            value={queries[req.role] || ''}
                                            onChangeText={(t) => { setQueries(prev => ({ ...prev, [req.role]: t })); setActiveField(req.role); }}
                                            onFocus={() => setActiveField(req.role)}
                                            placeholder={req.placeholder}
                                            placeholderTextColor={colors.inkFaint}
                                        />
                                        {isActive && isSearching && <ActivityIndicator size="small" color={colors.inkFaint} style={styles.loadingSpinner} />}
                                    </View>
                                    {!isLast && <View style={styles.connector} />}
                                </View>
                            );
                        })}

                        {serviceDef.locationRequirements.length === 2 && (
                            <TouchableOpacity style={styles.swapBtn} onPress={handleSwap} activeOpacity={0.8}>
                                <Ionicons name="swap-vertical" size={14} color={colors.ink} />
                            </TouchableOpacity>
                        )}

                        {serviceDef.stopsEnabled && (
                            <TouchableOpacity style={styles.addStopFloatingBtn} activeOpacity={0.8}>
                                <Ionicons name="add" size={16} color={colors.ink} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* RESULTS OR RECENT/SAVED */}
                    {(searchResults.length > 0) ? (
                        <View style={styles.resultsArea}>
                            {searchResults.map((result) => (
                                <TouchableOpacity key={result.id} style={styles.resultRow} onPress={() => handleSelectResult(result)}>
                                    <View style={styles.iconSq}><Ionicons name="location" size={18} color={colors.ink} /></View>
                                    <View style={styles.resultText}>
                                        <Text style={styles.resultTitle} numberOfLines={1}>{result.title}</Text>
                                        <Text style={styles.resultSub} numberOfLines={1}>{result.subtitle || result.formattedAddress}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.presetsArea}>
                            {activeReq?.allowMapSelection && (
                                <TouchableOpacity style={[styles.resultRow, { paddingBottom: 8 }]} onPress={() => router.push({
                                    pathname: '/select-location-map',
                                    params: {
                                        role: activeField,
                                        pinType: activeReq.pinType,
                                        title: `Select ${activeReq.label}`,
                                        initialLat: locations[activeField]?.lat,
                                        initialLng: locations[activeField]?.lng,
                                        ...params
                                    }
                                })}>
                                    <View style={styles.iconSq}><Ionicons name="map" size={18} color={colors.ink} /></View>
                                    <View style={styles.resultText}>
                                        <Text style={[styles.resultTitle, { color: colors.goldDark }]}>Choose on map</Text>
                                        <Text style={styles.resultSub}>Pinpoint exact location</Text>
                                    </View>
                                </TouchableOpacity>
                            )}

                            {activeReq?.savedPlacesEnabled && (
                                <>
                                    <Text style={styles.sectionLabel}>SAVED PLACES</Text>
                                    {INITIAL_RECENT_LOCATIONS.filter(l => l.isFavorite).map(loc => (
                                        <TouchableOpacity key={loc.id} style={styles.resultRow} onPress={() => handleSelectRecent(loc)}>
                                            <View style={styles.iconSq}><Ionicons name={loc.type === 'home' ? 'home' : 'briefcase'} size={18} color={colors.ink} /></View>
                                            <View style={styles.resultText}>
                                                <Text style={styles.resultTitle} numberOfLines={1}>{loc.title}</Text>
                                                <Text style={styles.resultSub} numberOfLines={1}>{loc.subtitle}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}

                                    <Text style={[styles.sectionLabel, { marginTop: 20 }]}>RECENT SEARCHES</Text>
                                    {INITIAL_RECENT_LOCATIONS.filter(l => !l.isFavorite).map(loc => (
                                        <TouchableOpacity key={loc.id} style={styles.resultRow} onPress={() => handleSelectRecent(loc)}>
                                            <View style={styles.iconSq}><Ionicons name="time" size={18} color={colors.ink} /></View>
                                            <View style={styles.resultText}>
                                                <Text style={styles.resultTitle} numberOfLines={1}>{loc.title}</Text>
                                                <Text style={styles.resultSub} numberOfLines={1}>{loc.subtitle}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </>
                            )}
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Proceed Action Bottom Bar when completely filled */}
            {canContinue && (
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.continueBtn} onPress={validateAndRoute}>
                        <Text style={styles.continueBtnText}>Continue to {serviceDef.category}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.screenPadX },
    back: { padding: 4 },
    headerTitleText: { fontSize: 16, fontWeight: '700', color: colors.ink, marginLeft: 16, textTransform: 'capitalize' },
    keyboardAvoid: { flex: 1 },
    scroll: { paddingHorizontal: spacing.screenPadX, paddingTop: 8, paddingBottom: 100 },

    fieldStack: { position: 'relative', marginBottom: 24, zIndex: 1 },
    fieldRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    connector: { position: 'absolute', top: 22, left: 5, width: 1, height: 26, backgroundColor: colors.line, borderStyle: 'dashed' },
    input: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 12, fontSize: 13, fontWeight: '600', color: colors.ink },
    inputActive: { backgroundColor: '#F0F1F5' },
    loadingSpinner: { position: 'absolute', right: 40 },

    swapBtn: { position: 'absolute', top: '50%', right: 0, marginTop: -14, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.white },

    emptyCaption: { fontSize: 13, fontWeight: '500', color: colors.inkFaint, textAlign: 'center', marginTop: 40 },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.inkSoft, letterSpacing: 0.5, marginBottom: 12 },
    presetsArea: { paddingTop: 10 },
    scheduleHeaderPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, gap: 4 },
    scheduleHeaderText: { fontSize: 13, fontWeight: '700', color: colors.ink },
    addStopFloatingBtn: { position: 'absolute', right: 40, top: 40, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },

    resultsArea: {},
    resultRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    iconSq: { width: 34, height: 34, borderRadius: radius.iconSquare, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    resultText: { flex: 1 },
    resultTitle: { fontSize: 13, fontWeight: '700', color: colors.ink },
    resultSub: { fontSize: 11, color: colors.inkFaint, marginTop: 2 },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.white, padding: 16, borderTopWidth: 1, borderColor: colors.surface, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    continueBtn: { backgroundColor: colors.ink, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    continueBtnText: { color: colors.white, fontSize: 15, fontWeight: '700', textTransform: 'capitalize' }
});
