import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Mapbox, { Camera, CircleLayer, LineLayer, MapView, ShapeSource } from '@rnmapbox/maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { reverseGeocode } from '../services/location/geocodingService';
import { getRoute, RouteResult } from '../services/location/routingService';
import { getServiceEstimates, RideService } from '../services/pricing/fareService';
import { Coordinate } from '../types/location';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function RideSelectionScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // In production, pass stringified JSON or use a centralized Booking State Provider
    const params = useLocalSearchParams<{
        pickupLat: string, pickupLng: string,
        dropLat: string, dropLng: string
    }>();

    const mapRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);
    const passengerSheetRef = useRef<BottomSheet>(null);

    // Core state
    const [pickupCoord, setPickupCoord] = useState<Coordinate | null>(null);
    const [dropCoord, setDropCoord] = useState<Coordinate | null>(null);
    const [pickupAddress, setPickupAddress] = useState('Resolving pickup...');
    const [dropAddress, setDropAddress] = useState('Resolving dropoff...');

    const [passengers, setPassengers] = useState(1);
    const [luggage, setLuggage] = useState(0);

    const [route, setRoute] = useState<RouteResult | null>(null);
    const [mapReady, setMapReady] = useState(false);

    const [services, setServices] = useState<RideService[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [isCalculating, setIsCalculating] = useState(true);
    const [routeError, setRouteError] = useState(false);

    // Initial Processing
    useEffect(() => {
        if (params.pickupLat && params.pickupLng && params.dropLat && params.dropLng) {
            const pCoord = { latitude: parseFloat(params.pickupLat), longitude: parseFloat(params.pickupLng) };
            const dCoord = { latitude: parseFloat(params.dropLat), longitude: parseFloat(params.dropLng) };

            setPickupCoord(pCoord);
            setDropCoord(dCoord);

            fetchRouteAndEstimates(pCoord, dCoord);
        } else {
            console.error("Missing coordinates for ride selection.");
            setRouteError(true);
            setIsCalculating(false);
        }
    }, [params.pickupLat, params.pickupLng, params.dropLat, params.dropLng]);

    const fetchRouteAndEstimates = async (pickup: Coordinate, drop: Coordinate) => {
        setIsCalculating(true);
        setRouteError(false);

        try {
            // 1. Plot Geographic Route (OSRM)
            const calculatedRoute = await getRoute(pickup, drop, []);
            setRoute(calculatedRoute);

            // 2. Fetch Pricing Engine Estimates based on route length
            const dist = calculatedRoute ? calculatedRoute.distanceMeters : 5000;
            const dur = calculatedRoute ? calculatedRoute.durationSeconds : 600;

            const estimatedServices = await getServiceEstimates(dist, dur);
            setServices(estimatedServices);

            // Default select the 'FASTEST' service, or fallback to auto/first
            if (estimatedServices.length > 0) {
                const fastest = estimatedServices.find(s => s.badge === 'FASTEST');
                setSelectedServiceId(fastest ? fastest.id : estimatedServices[0].id);
            }

            // Geocode logic injection
            reverseGeocode(pickup).then(loc => {
                setPickupAddress(loc?.name || (loc?.formattedAddress ? loc.formattedAddress.split(',')[0] : 'Selected Pickup'));
            });
            reverseGeocode(drop).then(loc => {
                setDropAddress(loc?.name || (loc?.formattedAddress ? loc.formattedAddress.split(',')[0] : 'Selected Destination'));
            });

        } catch (e) {
            console.error(e);
            setRouteError(true);
        } finally {
            setIsCalculating(false);
        }
    };

    const fitMapToBounds = (coords: Coordinate[]) => {
        if (cameraRef.current?.setCamera && coords.length >= 2) {
            const lats = coords.map(c => c.latitude);
            const lngs = coords.map(c => c.longitude);
            const sw = [Math.min(...lngs), Math.min(...lats)];
            const ne = [Math.max(...lngs), Math.max(...lats)];

            // Mapbox fitBounds API paddings are relative to the *MapView* dimension, not the screen object.
            // Since MapView is flex: 1 taking up the top ~55% of the screen, we only need internal padding.
            cameraRef.current.setCamera({
                bounds: {
                    ne,
                    sw,
                    paddingTop: 60,
                    paddingLeft: 40,
                    paddingBottom: 60,
                    paddingRight: 40
                },
                animationDuration: 1200
            });
        }
    };

    // Safely trigger camera bounds ONLY when Map engine is fully alive and math is finished
    useEffect(() => {
        if (mapReady && route && !isCalculating && pickupCoord && dropCoord) {
            // Unify OSRM route points + Absolute Pins to guarantee no markers clip off screen
            const boundsCoords = route.coordinates.length > 0 ? [...route.coordinates, pickupCoord, dropCoord] : [pickupCoord, dropCoord];
            fitMapToBounds(boundsCoords);
        }
    }, [mapReady, route, isCalculating]);

    // Calculate arrival time dynamically
    const formatTime = (addMinutes = 0) => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + addMinutes);
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    };

    const selectedService = services.find(s => s.id === selectedServiceId);

    const geoJSONRoute = {
        type: 'FeatureCollection',
        features: route && route.coordinates.length > 0 ? [{
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route.coordinates.map(c => [c.longitude, c.latitude])
            }
        }] : []
    };

    const handleConfirmBooking = () => {
        passengerSheetRef.current?.expand();
    };

    return (
        <View style={styles.container}>
            {/* MAP AREA */}
            <View style={styles.mapContainer}>
                {Platform.OS !== 'web' && (pickupCoord || dropCoord) && (
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        styleURL={Mapbox.StyleURL.Street}
                        logoEnabled={false}
                        onDidFinishLoadingMap={() => {
                            console.log('[MAPBOX] Ride-Selection MAP LOAD SUCCESS');
                            setMapReady(true);
                        }}
                        onMapLoadingError={() => {
                            console.error('[MAPBOX] Ride-Selection MAP LOAD ERROR — check token');
                        }}
                    >
                        <Camera
                            ref={cameraRef}
                            defaultSettings={{
                                centerCoordinate: [(pickupCoord || dropCoord!).longitude, (pickupCoord || dropCoord!).latitude],
                                zoomLevel: 14,
                            }}
                        />

                        {/* THE ROUTE LINE */}
                        {route && mapReady && (
                            <ShapeSource id="routeSource" shape={geoJSONRoute as any}>
                                <LineLayer
                                    id="routeLayer"
                                    style={{
                                        lineColor: '#3B82F6',
                                        lineWidth: 4,
                                        lineJoin: 'round',
                                        lineCap: 'round',
                                    }}
                                />
                            </ShapeSource>
                        )}

                        {/* PICKUP MARKER (GREEN) */}
                        {pickupCoord && mapReady && (
                            <ShapeSource id="pickupSource" shape={{
                                type: 'Feature', geometry: { type: 'Point', coordinates: [pickupCoord.longitude, pickupCoord.latitude] }, properties: {}
                            } as any}>
                                <CircleLayer id="pickupLayerRing" style={{ circleColor: colors.green, circleRadius: 6, circleStrokeWidth: 2, circleStrokeColor: colors.white }} />
                            </ShapeSource>
                        )}
                        {/* DROP MARKER (ORANGE) */}
                        {dropCoord && mapReady && (
                            <ShapeSource id="dropSource" shape={{
                                type: 'Feature', geometry: { type: 'Point', coordinates: [dropCoord.longitude, dropCoord.latitude] }, properties: {}
                            } as any}>
                                <CircleLayer id="dropLayerRing" style={{ circleColor: '#EF4444', circleRadius: 6, circleStrokeWidth: 2, circleStrokeColor: colors.white }} />
                            </ShapeSource>
                        )}
                        {/* We use strict absolute RN views for 100% precision with Custom UI Markers mapped geographically */}
                    </MapView>
                )}

                {/* React Native Fixed Overlay Markers mapping strictly to coordinates */}
                {/* Note: In full production, you would map these Custom Views directly inside MapLibre MarkerViews, 
                    but since we are strictly reusing infrastructure without breaking MapLibre's experimental API, 
                    we place them seamlessly over the viewport for demo.
                 */}

                {/* FLOATING BACK BUTTON */}
                <TouchableOpacity
                    style={[styles.floatingBackBtn, { top: Math.max(insets.top + 10, 20) }]}
                    onPress={() => router.back()}
                    activeOpacity={0.8}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.ink} />
                </TouchableOpacity>
            </View>

            {/* C2 PREVIEW SHEET (BOTTOM 35-40% OF SCREEN) */}
            <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                {/* Visual handle */}
                <View style={{ alignItems: 'center', marginVertical: 12 }}>
                    <View style={styles.sheetHandle} />
                </View>

                {isCalculating ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.gold} />
                        <Text style={styles.loadingText}>Calculating route...</Text>
                    </View>
                ) : routeError ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="warning" size={32} color="#EF4444" />
                        <Text style={styles.errorText}>Unable to calculate route.</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={() => fetchRouteAndEstimates(pickupCoord!, dropCoord!)}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.c2Container}>
                        {/* 12.4 km . 28 min / Fastest route currently available + Surge Pill */}
                        <View style={styles.c2HeaderRow}>
                            <View style={styles.c2TimeInfo}>
                                <Text style={styles.c2Distance}>{route ? (route.distanceMeters / 1000).toFixed(1) : 0} km <Text style={styles.c2Duration}>· {route ? Math.round(route.durationSeconds / 60) : 0} min</Text></Text>
                                <Text style={styles.c2Subtitle}>Fastest route currently available</Text>
                            </View>
                            <View style={styles.c2SurgePill}>
                                <Ionicons name="flash" size={14} color="#92400E" />
                                <Text style={styles.c2SurgeText}>Surge</Text>
                            </View>
                        </View>

                        <View style={styles.c2Divider} />

                        {/* Waypoints line map */}
                        <View style={styles.c2RouteBlock}>
                            <View style={styles.c2RouteLineCol}>
                                <View style={styles.c2DotPickup}>
                                    <View style={styles.c2DotPickupInner} />
                                </View>
                                <View style={styles.c2VerticalLink} />
                                <View style={styles.c2DotDropoff}>
                                    <View style={styles.c2DotDropInner} />
                                </View>
                            </View>

                            <View style={styles.c2RouteTextCol}>
                                <View style={styles.c2RouteLocation}>
                                    <Text style={styles.c2Label}>PICKUP</Text>
                                    <Text style={styles.c2Name} numberOfLines={1}>{pickupAddress}</Text>
                                </View>
                                <View style={{ height: 16 }} />
                                <View style={styles.c2RouteLocation}>
                                    <Text style={styles.c2Label}>DROPOFF</Text>
                                    <Text style={styles.c2Name} numberOfLines={1}>{dropAddress}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Continue Button triggers C3 Passenger Sheet */}
                        <TouchableOpacity style={styles.c2ContinueBtn} activeOpacity={0.9} onPress={() => passengerSheetRef.current?.expand()}>
                            <Text style={styles.c2ContinueBtnText}>Continue</Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* PASSENGERS & LUGGAGE BOTTOM SHEET */}
            <BottomSheet
                ref={passengerSheetRef}
                index={-1}
                snapPoints={['50%']}
                enablePanDownToClose
                handleIndicatorStyle={styles.sheetHandle}
                backgroundStyle={styles.passengerSheetBackground}
                style={{ zIndex: 999, elevation: 20 }}
            >
                <BottomSheetView style={styles.sheetContent}>
                    <View>
                        <Text style={styles.psgTitle}>Passengers & Luggage</Text>
                        <Text style={styles.psgSubtitle}>Select the number of travelers and bags.</Text>

                        {/* Passengers */}
                        <View style={styles.psgRow}>
                            <View style={styles.psgIconBox}>
                                <Ionicons name="people" size={24} color="#FFF" />
                            </View>
                            <View style={styles.psgInfo}>
                                <Text style={styles.psgLabel}>Passengers</Text>
                                <Text style={styles.psgLimit}>Max 10 per ride</Text>
                            </View>
                            <View style={styles.stepperZone}>
                                <TouchableOpacity style={styles.stepperBtn} onPress={() => setPassengers(Math.max(1, passengers - 1))}>
                                    <Ionicons name="remove" size={20} color="#0F172A" />
                                </TouchableOpacity>
                                <Text style={styles.stepperVal}>{passengers}</Text>
                                <TouchableOpacity style={styles.stepperBtn} onPress={() => setPassengers(Math.min(10, passengers + 1))}>
                                    <Ionicons name="add" size={20} color="#0F172A" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Luggage */}
                        <View style={styles.psgRow}>
                            <View style={styles.psgIconBox}>
                                <Ionicons name="briefcase" size={24} color="#FFF" />
                            </View>
                            <View style={styles.psgInfo}>
                                <Text style={styles.psgLabel}>Luggage</Text>
                                <Text style={styles.psgLimit}>Large suitcases (Max 6)</Text>
                            </View>
                            <View style={styles.stepperZone}>
                                <TouchableOpacity style={styles.stepperBtn} onPress={() => setLuggage(Math.max(0, luggage - 1))}>
                                    <Ionicons name="remove" size={20} color="#0F172A" />
                                </TouchableOpacity>
                                <Text style={styles.stepperVal}>{luggage}</Text>
                                <TouchableOpacity style={styles.stepperBtn} onPress={() => setLuggage(Math.min(6, luggage + 1))}>
                                    <Ionicons name="add" size={20} color="#0F172A" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Footer fixed */}
                    <View style={[styles.bottomApplyZone, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                        <TouchableOpacity style={styles.applyBtn} onPress={() => {
                            passengerSheetRef.current?.close();
                            router.push({
                                pathname: '/plan-route',
                                params: {
                                    pickupLat: params.pickupLat,
                                    pickupLng: params.pickupLng,
                                    dropLat: params.dropLat,
                                    dropLng: params.dropLng
                                }
                            });
                        }}>
                            <Text style={styles.applyBtnText}>Apply</Text>
                            <Ionicons name="checkmark" size={20} color="#92400E" />
                        </TouchableOpacity>
                    </View>
                </BottomSheetView>
            </BottomSheet>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    floatingBackBtn: {
        position: 'absolute',
        left: 20,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bottomSheet: {
        backgroundColor: colors.white,
        height: '48%', // Approx half screen
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
        fontWeight: '600',
        color: colors.inkSoft,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        color: colors.inkSoft,
        marginBottom: 16,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: colors.line,
        borderRadius: 8,
    },
    retryText: {
        color: colors.ink,
        fontWeight: '600',
    },
    servicesScroll: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    serviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    serviceRowSelected: {
        borderColor: colors.gold,
        backgroundColor: '#FFFBEB',
    },
    serviceIconContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    serviceDetails: {
        flex: 1,
    },
    serviceNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    serviceName: {
        fontSize: 17,
        fontWeight: '800',
        color: colors.ink,
        marginRight: 8,
    },
    capacityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.line,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        marginRight: 8,
    },
    capacityText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.inkSoft,
        marginLeft: 2,
    },
    serviceBadge: {
        backgroundColor: colors.green,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    serviceBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: colors.white,
    },
    serviceDescription: {
        fontSize: 12,
        color: colors.inkSoft,
        marginBottom: 4,
    },
    serviceETA: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.ink,
    },
    fareContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingLeft: 12,
    },
    fareText: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.ink,
    },
    actionBar: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderColor: colors.line,
    },
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: 12,
    },
    paymentButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    paymentText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: colors.ink,
        marginLeft: 8,
    },
    paymentDivider: {
        width: 1,
        height: 20,
        backgroundColor: colors.line,
    },
    offersButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    offersText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: colors.ink,
        marginLeft: 8,
    },
    bookButton: {
        backgroundColor: colors.gold,
        width: '100%',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    bookButtonText: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.ink,
    },
    // Passenger & Luggage UI Styles
    passengerSheetBackground: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        elevation: 20,
    },
    sheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#E2E8F0',
        borderRadius: 2.5,
        marginTop: 10,
    },
    sheetContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    psgTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        marginTop: 12,
        marginHorizontal: 20,
    },
    psgSubtitle: {
        fontSize: 14,
        color: '#475569',
        marginHorizontal: 20,
        marginBottom: 24,
        marginTop: 6,
    },
    psgRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    psgIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#0F172A', // Navy per design
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    psgInfo: {
        flex: 1,
    },
    psgLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    psgLimit: {
        fontSize: 12,
        color: '#475569',
        marginTop: 4,
    },
    stepperZone: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9', // light gray
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    stepperBtn: {
        padding: 6,
    },
    stepperVal: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginHorizontal: 16,
        minWidth: 16,
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginHorizontal: 20,
        marginBottom: 24,
    },
    bottomApplyZone: {
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    applyBtn: {
        backgroundColor: '#FBBF24', // Golden yellow
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    applyBtnText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#92400E',
        marginRight: 8,
    },
    // --- C2 Preview Bottom Sheet Styles ---
    c2Container: {
        paddingHorizontal: 20,
    },
    c2HeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    c2TimeInfo: {
        flex: 1,
    },
    c2Distance: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0F172A',
    },
    c2Duration: {
        fontSize: 16,
        fontWeight: '500',
        color: '#475569',
    },
    c2Subtitle: {
        fontSize: 13,
        color: '#475569',
        marginTop: 4,
    },
    c2SurgePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    c2SurgeText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#92400E',
        marginLeft: 4,
    },
    c2Divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 12,
    },
    c2RouteBlock: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginBottom: 24,
        paddingTop: 8,
    },
    c2RouteLineCol: {
        width: 30,
        alignItems: 'center',
    },
    c2DotPickup: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 4,
        borderColor: '#0F172A',
        backgroundColor: '#FFF',
    },
    c2DotPickupInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#0F172A',
    },
    c2VerticalLink: {
        width: 2,
        flex: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 4,
    },
    c2DotDropoff: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#F59E0B',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    c2DotDropInner: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFF',
    },
    c2RouteTextCol: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    c2RouteLocation: {
        justifyContent: 'center',
    },
    c2Label: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    c2Name: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0F172A',
    },
    c2ContinueBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        paddingVertical: 18,
        borderRadius: 14,
    },
    c2ContinueBtnText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginRight: 8,
    }
});
