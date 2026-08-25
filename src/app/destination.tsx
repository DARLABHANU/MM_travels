import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
import { LocationSearchResult, searchLocations } from '../services/location/locationSearchService';
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
    const params = useLocalSearchParams<{ lat?: string, lng?: string, pickupTitle?: string, pickupSubtitle?: string, action?: string, dropLat?: string, dropLng?: string, dropTitle?: string, dropSubtitle?: string }>();

    const [pickupQuery, setPickupQuery] = useState(params.pickupTitle || 'Current Location');
    const [dropQuery, setDropQuery] = useState('');
    const [activeField, setActiveField] = useState<'pickup' | 'drop'>('drop');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);

    useEffect(() => {
        if (params.action === 'mapSelected' && params.dropTitle && params.dropLat && params.dropLng) {
            setDropQuery(params.dropTitle);
            Keyboard.dismiss();
            proceedToRideSelection(params.dropLat, params.dropLng, params.dropTitle, params.dropSubtitle);
        }
    }, [params]);

    useEffect(() => {
        const activeQuery = activeField === 'pickup' ? pickupQuery : dropQuery;
        const timeoutId = setTimeout(() => {
            if (activeQuery.trim().length >= 2 && params.action !== 'mapSelected') {
                performSearch(activeQuery);
            } else if (activeQuery.trim().length === 0) {
                setSearchResults([]);
            }
        }, 300); // 300ms debounce per spec
        return () => clearTimeout(timeoutId);
    }, [dropQuery, pickupQuery, activeField]);

    const performSearch = async (query: string) => {
        setIsSearching(true);
        const focusCoord: Coordinate | undefined = (params.lat && params.lng) ? { latitude: parseFloat(params.lat), longitude: parseFloat(params.lng) } : undefined;
        const results = await searchLocations(query, focusCoord);
        setSearchResults(results);
        setIsSearching(false);
    };

    const proceedToRideSelection = (dLat: string, dLng: string, dTitle: string, dSub?: string) => {
        if (!params.lat || !params.lng) return;
        router.push({ pathname: '/ride-selection', params: { pickupLat: params.lat, pickupLng: params.lng, dropLat: dLat, dropLng: dLng } });
    };

    const handleSelectResult = (result: LocationSearchResult) => {
        Keyboard.dismiss();
        setSearchResults([]);
        if (activeField === 'drop') {
            setDropQuery(result.title);
            proceedToRideSelection(result.latitude.toString(), result.longitude.toString(), result.title, result.subtitle);
        } else {
            setPickupQuery(result.title);
            setActiveField('drop');
        }
    };

    const handleSelectRecent = (recent: SavedLocation) => {
        Keyboard.dismiss();
        if (activeField === 'drop') {
            setDropQuery(recent.title);
            proceedToRideSelection(recent.latitude.toString(), recent.longitude.toString(), recent.title, recent.subtitle);
        } else {
            setPickupQuery(recent.title);
            setActiveField('drop');
        }
    };

    const handleSwap = () => {
        setPickupQuery(dropQuery);
        setDropQuery(pickupQuery);
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="close" size={24} color={colors.ink} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>

                    {/* FIELD STACK */}
                    <View style={styles.fieldStack}>
                        <View style={styles.fieldRow}>
                            <View style={styles.leadingDotGreen} />
                            <TextInput
                                style={[styles.input, activeField === 'pickup' && styles.inputActive]}
                                value={pickupQuery}
                                onChangeText={(t) => { setPickupQuery(t); setActiveField('pickup'); }}
                                onFocus={() => setActiveField('pickup')}
                                placeholder="Pickup location"
                                placeholderTextColor={colors.inkFaint}
                            />
                            {activeField === 'pickup' && isSearching && <ActivityIndicator size="small" color={colors.inkFaint} style={styles.loadingSpinner} />}
                        </View>

                        <View style={styles.connector} />

                        <View style={styles.fieldRow}>
                            <Ionicons name="pin" size={12} color={colors.inkFaint} style={styles.leadingPin} />
                            <TextInput
                                style={[styles.input, activeField === 'drop' && styles.inputActive]}
                                value={dropQuery}
                                onChangeText={(t) => { setDropQuery(t); setActiveField('drop'); }}
                                onFocus={() => setActiveField('drop')}
                                placeholder="Where to?"
                                placeholderTextColor={colors.inkFaint}
                                autoFocus={true}
                            />
                            {activeField === 'drop' && isSearching && <ActivityIndicator size="small" color={colors.inkFaint} style={styles.loadingSpinner} />}
                        </View>

                        <TouchableOpacity style={styles.swapBtn} onPress={handleSwap} activeOpacity={0.8}>
                            <Ionicons name="swap-vertical" size={14} color={colors.ink} />
                        </TouchableOpacity>
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
                    ) : (pickupQuery.trim().length === 0 && dropQuery.trim().length === 0) ? (
                        <Text style={styles.emptyCaption}>Type to search locations</Text>
                    ) : (dropQuery.trim().length > 1 && searchResults.length === 0 && !isSearching) ? (
                        <Text style={styles.emptyCaption}>No matches — try a nearby landmark</Text>
                    ) : (
                        <View style={styles.presetsArea}>
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
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.screenPadX },
    back: { padding: 4 },
    keyboardAvoid: { flex: 1 },
    scroll: { paddingHorizontal: spacing.screenPadX, paddingTop: 8, paddingBottom: 40 },

    fieldStack: { position: 'relative', marginBottom: 24 },
    fieldRow: { flexDirection: 'row', alignItems: 'center' },
    leadingDotGreen: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.green, marginRight: 16 },
    leadingPin: { marginRight: 16, width: 12, textAlign: 'center' },
    connector: { position: 'absolute', top: 22, left: 5, width: 1, height: 26, backgroundColor: colors.line, borderStyle: 'dashed' },
    input: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 12, fontSize: 13, fontWeight: '600', color: colors.ink },
    inputActive: { backgroundColor: '#F0F1F5' }, // Slightly darker to indicate focus
    loadingSpinner: { position: 'absolute', right: 40 },

    swapBtn: { position: 'absolute', top: '50%', right: 0, marginTop: -14, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.white },

    sectionLabel: { fontSize: 10, fontWeight: '700', color: colors.inkFaint, letterSpacing: 0.5, marginBottom: 12 },
    resultsArea: {},
    presetsArea: {},
    resultRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    iconSq: { width: 34, height: 34, borderRadius: radius.iconSquare, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    resultText: { flex: 1 },
    resultTitle: { fontSize: 13, fontWeight: '600', color: colors.ink },
    resultSub: { fontSize: 11, color: colors.inkFaint, marginTop: 2 },
    emptyCaption: { fontSize: 12, color: colors.inkFaint, textAlign: 'center', marginTop: 40 }
});
