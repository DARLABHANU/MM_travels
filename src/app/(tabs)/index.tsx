import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HomeMap from '../../components/map/HomeMap';
import { AllServicesModal } from '../../components/ui/AllServicesModal';
import { formatAddress } from '../../services/location/geocodingService';
import { Address, Coordinate } from '../../types/location';

import { BookingIntent, useIntentStore } from '../../store/intentStore';

// Fixed Core Riding Options
const QUICK_RIDES = [
    { label: 'Bike', icon: 'bicycle', color: '#E9EEF7', iconColor: '#3B5A8A', intent: { serviceId: 'city_ride', vehicleCategory: 'bike', flowType: 'CITY_RIDE' } },
    { label: 'Auto', icon: 'car-outline', color: '#FDF0DA', iconColor: '#B45309', intent: { serviceId: 'city_ride', vehicleCategory: 'auto', flowType: 'CITY_RIDE' } },
    { label: 'Cab', icon: 'car', color: '#E2FBE9', iconColor: '#065F46', intent: { serviceId: 'city_ride', vehicleCategory: 'cab', flowType: 'CITY_RIDE' } },
    { label: 'XL', icon: 'bus', color: '#F3E9F5', iconColor: '#8B4A9C', intent: { serviceId: 'city_ride', vehicleCategory: 'xl', flowType: 'CITY_RIDE' } },
];

// Recommended / Specialized Services (Dynamically ordered)
const SPECIALIZED_SERVICES = [
    { label: 'Pool\nRide', icon: 'people', color: '#FDEAEF', iconColor: '#C24B6E', intent: { serviceId: 'pool', flowType: 'POOL' } },
    { label: 'Outstation', icon: 'map', color: '#FEF3C7', iconColor: '#B45309', intent: { serviceId: 'outstation', flowType: 'OUTSTATION' } },
    { label: 'Rental', icon: 'time', color: '#E0E7FF', iconColor: '#4338CA', intent: { serviceId: 'rental', flowType: 'RENTAL' } },
    { label: 'Parcel', icon: 'cube', color: '#FCE7F3', iconColor: '#BE185D', intent: { serviceId: 'parcel', flowType: 'PARCEL' } },
];

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const router = useRouter();
    const setIntent = useIntentStore(state => state.setIntent);

    const dynamicRecommendations = useMemo(() => {
        const hour = new Date().getHours();
        const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
        let priorityMap: Record<string, number> = {};

        if (isWeekend) {
            priorityMap = { 'Outstation': 1, 'Rental': 2, 'Pool\nRide': 3 };
        } else if (hour >= 7 && hour <= 10) {
            priorityMap = { 'Pool\nRide': 1, 'Outstation': 2 };
        } else {
            priorityMap = { 'Rental': 1, 'Pool\nRide': 2, 'Parcel': 3 };
        }

        return [...SPECIALIZED_SERVICES].sort((a, b) => {
            const pA = priorityMap[a.label] || 99;
            const pB = priorityMap[b.label] || 99;
            return pA - pB;
        });
    }, []);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const servicesModalRef = useRef<BottomSheet>(null);

    // Track selections for future booking flows
    const [selectedCoord, setSelectedCoord] = useState<Coordinate | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

    // Initial snap point carefully tuned to mimic Rapido's visible collapsed state: Search + Explore + Promo
    const snapPoints = useMemo(() => ['43%', '94%'], []);

    // App Kill / Resume Trip Recovery (UX Lockdown Phase P0.2)
    useEffect(() => {
        const fetchCurrentRide = async () => {
            try {
                const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://10.200.240.183:5000'}/api/bookings/current`);
                const data = await res.json();
                if (data && data.booking && data.booking.status !== 'NONE' && data.booking.status !== 'COMPLETED') {
                    console.log("Trip Resumed from App Open");
                    router.replace('/f2-live-tracking');
                }
            } catch (e) {
                // Ignore silent network failure on boot
            }
        };
        fetchCurrentRide();
    }, []);

    const handlePickupChange = (coord: Coordinate, location: Address | null) => {
        setSelectedCoord(coord);
        setSelectedAddress(location);
    };

    const navToDestination = (intent: BookingIntent = { serviceId: 'city_ride', vehicleCategory: 'cab', flowType: 'CITY_RIDE' }) => {
        setIntent(intent);

        if (selectedCoord) {
            let title = 'Current Location';
            if (selectedAddress) {
                title = formatAddress(selectedAddress).title;
            }
            // Temporarily store initial location (could also dispatch to store)
            router.push({
                pathname: '/destination',
                params: {
                    lat: selectedCoord.latitude.toString(),
                    lng: selectedCoord.longitude.toString(),
                    pickupTitle: title
                }
            });
        } else {
            router.push({ pathname: '/destination' });
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* --- MAP LAYER --- */}
            <View style={{ flex: 1 }}>
                <HomeMap onPickupLocationChange={handlePickupChange} />
            </View>
            {/* --- END MAP LAYER --- */}



            {/* --- BOTTOM SHEET LAYER --- */}
            <BottomSheet
                ref={bottomSheetRef}
                index={0}
                snapPoints={snapPoints}
                handleIndicatorStyle={styles.sheetHandle}
                backgroundStyle={styles.sheetBackground}
                style={{ zIndex: 100, elevation: 20 }}
            >
                <BottomSheetScrollView contentContainerStyle={styles.sheetScrollContent} showsVerticalScrollIndicator={false}>

                    {/* SEARCH BAR */}
                    <TouchableOpacity activeOpacity={0.9} style={styles.searchBar} onPress={() => navToDestination()}>
                        <Ionicons name="search" size={20} color={colors.ink} style={{ marginRight: 10 }} />
                        <Text style={styles.searchPlaceholderText}>Where do you want to go?</Text>
                    </TouchableOpacity>

                    <Text style={styles.sectionHeaderTitle}>QUICK RIDES</Text>
                    <View style={styles.servicesRow}>
                        {QUICK_RIDES.map((srv, idx) => (
                            <TouchableOpacity
                                key={`quick-${idx}`}
                                activeOpacity={0.8}
                                style={styles.serviceBlock}
                                onPress={() => navToDestination(srv.intent as BookingIntent)}
                            >
                                <View style={styles.serviceIconFrame}>
                                    <View style={[StyleSheet.absoluteFill, { backgroundColor: srv.color, borderRadius: 16 }]} />
                                    <Ionicons name={srv.icon as any} size={28} color={srv.iconColor} style={styles.serviceIconMock} />
                                </View>
                                <Text style={styles.serviceLabel}>{srv.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionHeaderTitle}>RECOMMENDED</Text>
                    <View style={styles.servicesRow}>
                        {dynamicRecommendations.map((srv, idx) => (
                            <TouchableOpacity
                                key={`rec-${idx}`}
                                activeOpacity={0.8}
                                style={styles.serviceBlock}
                                onPress={() => navToDestination(srv.intent as BookingIntent)}
                            >
                                <View style={styles.serviceIconFrame}>
                                    <View style={[StyleSheet.absoluteFill, { backgroundColor: srv.color, borderRadius: 16 }]} />
                                    <Ionicons name={srv.icon as any} size={28} color={srv.iconColor} style={styles.serviceIconMock} />
                                </View>
                                <Text style={styles.serviceLabel}>{srv.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* COMPACT PROMOTION BANNER */}
                    <View style={styles.promoBannerContainer}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={styles.promoBannerCard}
                            onPress={() => navToDestination()}
                        >
                            <View style={styles.promoBannerContent}>
                                <Text style={styles.promoBannerHeadline}>FIRST AUTO RIDE FREE</Text>
                                <Text style={styles.promoBannerSubtext}>offer has been detected.</Text>
                                <View style={styles.promoBadge}>
                                    <Text style={styles.promoBadgeText}>Tap here to apply</Text>
                                </View>
                            </View>
                            {/* Visual Asset Block */}
                            <View style={styles.promoBannerGraphic}>
                                <Ionicons name="gift" size={40} color="rgba(255,255,255,0.1)" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* ========================================================
                        BELOW THIS LINE IS ONLY VISIBLE IN EXPANDED SNAP POINT 
                        ======================================================== */}

                    <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16, marginHorizontal: 16 }]}>Go Places with MM Travels</Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.placesRow}>

                        {/* International Airport */}
                        <TouchableOpacity activeOpacity={0.9} style={styles.placeCard}>
                            <View style={styles.placeImgZone}>
                                <LinearGradient colors={['#FCD34D', '#F59E0B']} style={StyleSheet.absoluteFill} />
                                <Ionicons name="airplane" size={44} color="#FFF" style={styles.placeIconMock} />
                            </View>
                            <View style={styles.placeTextZone}>
                                <Text style={styles.placeTitle} numberOfLines={2}>Visakhapatnam{'\n'}International...</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Junction */}
                        <TouchableOpacity activeOpacity={0.9} style={styles.placeCard}>
                            <View style={styles.placeImgZone}>
                                <LinearGradient colors={['#FCA5A5', '#EF4444']} style={StyleSheet.absoluteFill} />
                                <Ionicons name="train" size={44} color="#FFF" style={styles.placeIconMock} />
                            </View>
                            <View style={styles.placeTextZone}>
                                <Text style={styles.placeTitle} numberOfLines={2}>Visakhapatnam{'\n'}Junction</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Bus Stand */}
                        <TouchableOpacity activeOpacity={0.9} style={styles.placeCard}>
                            <View style={styles.placeImgZone}>
                                <LinearGradient colors={['#93C5FD', '#3B82F6']} style={StyleSheet.absoluteFill} />
                                <Ionicons name="bus" size={44} color="#FFF" style={styles.placeIconMock} />
                            </View>
                            <View style={styles.placeTextZone}>
                                <Text style={styles.placeTitle} numberOfLines={2}>Visakhapatnam{'\n'}Bus Stand</Text>
                            </View>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Secondary Large Campaign Card */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.campaignCard}
                        onPress={() => navToDestination()}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={styles.campaignHeader}>Three wheels.{'\n'}Free wheels.</Text>
                            <Text style={styles.campaignSubText}>
                                Use coupon: <Text style={{ fontWeight: '800' }}>FREERIDE</Text>{'\n'}on first Auto ride.
                            </Text>
                            <View style={styles.campaignButton}>
                                <Text style={styles.campaignButtonText}>Try Our Auto</Text>
                            </View>
                        </View>
                        <View style={styles.campaignIllustration}>
                            <Ionicons name="car-sport" size={70} color="#166534" />
                        </View>
                    </TouchableOpacity>

                    {/* Massive padding buffer to prevent bottom navigation overlap */}
                    {/* Bottom nav height + safety margin */}
                    <View style={{ height: Platform.OS === 'ios' ? 120 : 100 }} />

                </BottomSheetScrollView>
            </BottomSheet>
            {/* --- END BOTTOM SHEET LAYER --- */}

            {/* --- MODALS --- */}
            <AllServicesModal ref={servicesModalRef} />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    sheetBackground: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    sheetHandle: {
        width: 44,
        height: 5,
        backgroundColor: '#D1D5DB', // subtle gray
        borderRadius: 3,
        marginTop: 8,
    },
    sheetScrollContent: {
        paddingTop: 6, // minimal gap after handle
        paddingBottom: 0,
    },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', marginHorizontal: 16, marginTop: 12, marginBottom: 24, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16 },
    searchPlaceholderText: { fontSize: 16, fontWeight: '600', color: colors.inkSoft },
    sectionHeaderTitle: { marginLeft: 16, marginTop: 4, marginBottom: 12, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: colors.inkFaint },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.ink, marginLeft: 16 },
    servicesRow: { flexDirection: 'row', paddingHorizontal: 8, marginBottom: 16, justifyContent: 'space-between' },
    serviceBlock: {
        alignItems: 'center',
        width: (Dimensions.get('window').width - 32) / 4,
        marginBottom: 16,
    },
    serviceIconFrame: {
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 6,
    },
    serviceIconMock: {
        position: 'absolute',
        zIndex: 2,
    },
    serviceLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.ink,
        textAlign: 'center',
        lineHeight: 14,
    },
    promoBannerContainer: {
        paddingHorizontal: 14,
        marginBottom: 10,
    },
    promoBannerCard: {
        backgroundColor: '#0F172A',
        borderRadius: 12,
        flexDirection: 'row',
        overflow: 'hidden',
        height: 72, // Reduced height per requirements
    },
    promoBannerContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    promoBannerHeadline: {
        color: '#FBBF24',
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    promoBannerSubtext: {
        color: colors.white,
        fontSize: 11,
        marginBottom: 6,
        fontWeight: '400',
    },
    promoBadge: {
        backgroundColor: colors.white,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    promoBadgeText: {
        color: colors.ink,
        fontSize: 10,
        fontWeight: '700',
    },
    promoBannerGraphic: {
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E293B', // subtle map-like dark shade
    },
    placesRow: {
        paddingLeft: 16,
        paddingRight: 6,
        gap: 12,
        marginBottom: 28,
    },
    placeCard: {
        width: 118, // spec width
        height: 148, // spec height
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        overflow: 'hidden',
    },
    placeImgZone: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeIconMock: {
        opacity: 0.9,
    },
    placeTextZone: {
        backgroundColor: colors.white,
        paddingHorizontal: 10,
        paddingVertical: 8,
        height: 52, // 2 lines explicitly
        justifyContent: 'center',
    },
    placeTitle: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.ink,
        lineHeight: 14,
    },
    campaignCard: {
        backgroundColor: '#FFF8F0',
        borderWidth: 1,
        borderColor: '#FEF0DA',
        borderRadius: 16, // Spec radius
        marginHorizontal: 16,
        padding: 20,
        flexDirection: 'row',
    },
    campaignHeader: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.ink,
        lineHeight: 22,
        marginBottom: 8,
    },
    campaignSubText: {
        fontSize: 12,
        color: colors.inkSoft,
        lineHeight: 16,
        marginBottom: 16,
    },
    campaignButton: {
        backgroundColor: '#FDE68A',
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    campaignButtonText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#B45309',
    },
    campaignIllustration: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        flex: 0.5,
    }
});

