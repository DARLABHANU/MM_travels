import { Ionicons } from '@expo/vector-icons';
import Mapbox, { Camera, CircleLayer, LineLayer, MapView, ShapeSource } from '@rnmapbox/maps';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRoute, RouteResult } from '../../services/location/routingService';
import { useIntentStore } from '../../store/intentStore';
import { useRideStore } from '../../store/rideStore';

const VEHICLE_CATALOG = {
    'bike': [{ id: 'bike_basic', label: 'Bike standard', price: 120, originalPrice: 150, eta: '4 min', travelTime: '24 min', icon: 'bicycle', iconColor: '#3B5A8A', color: '#E9EEF7' }],
    'auto': [{ id: 'auto_std', label: 'Auto', price: 160, originalPrice: null, eta: '2 min', travelTime: '26 min', icon: 'car-sport', iconColor: '#B45309', color: '#FEF3C7' }],
    'cab': [
        { id: 'cab_economy', label: 'Cab Economy', price: 210, originalPrice: null, eta: '6 min', travelTime: '30 min', icon: 'car', iconColor: '#0F172A', color: '#F8FAFC' },
        { id: 'cab_premium', label: 'Cab Premium', price: 340, originalPrice: null, eta: '8 min', travelTime: '28 min', icon: 'car', iconColor: '#854D0E', color: '#FEF9C3' }
    ],
    'xl': [{ id: 'xl_std', label: 'XL 6-Seater', price: 420, originalPrice: 500, eta: '10 min', travelTime: '32 min', icon: 'bus', iconColor: '#8B4A9C', color: '#F3E9F5' }],
};

export default function CityRideCheckoutScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const intent = useIntentStore(state => state.intent);
    const locations = useIntentStore(state => state.locations);
    const applyServerBookingState = useRideStore(state => state.applyServerBookingState);

    const mapRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);

    const [mapReady, setMapReady] = useState(false);
    const [route, setRoute] = useState<RouteResult | null>(null);
    const [isCalculating, setIsCalculating] = useState(true);
    const [routeError, setRouteError] = useState(false);

    // Ensure we handle deep linking missing state gracefully
    useEffect(() => {
        if (!intent || intent.flowType !== 'CITY_RIDE' || !locations.pickup || !locations.dropoff) {
            Alert.alert("Missing Intent", "Booking intent data was lost.");
            router.replace('/(tabs)');
        }
    }, [intent, locations]);

    // Pull from authoritative intent
    const vehicleKey = intent?.vehicleCategory || Object.keys(VEHICLE_CATALOG)[0];
    const availableQuotes = VEHICLE_CATALOG[vehicleKey as keyof typeof VEHICLE_CATALOG] || VEHICLE_CATALOG['cab'];

    const [selectedVariant, setSelectedVariant] = useState(availableQuotes[0]);
    const [isBooking, setIsBooking] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
    const [showPaymentSheet, setShowPaymentSheet] = useState(false);

    // Stable Idempotency Key
    const [idempotencyKey] = useState(() => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));

    useEffect(() => {
        if (locations.pickup?.coord && locations.dropoff?.coord) {
            setIsCalculating(true);
            setRouteError(false);
            getRoute(locations.pickup.coord, locations.dropoff.coord, [])
                .then(calculatedRoute => setRoute(calculatedRoute))
                .catch(() => setRouteError(true))
                .finally(() => setIsCalculating(false));
        }
    }, [locations.pickup, locations.dropoff]);

    useEffect(() => {
        if (mapReady && route && !isCalculating && locations.pickup?.coord && locations.dropoff?.coord) {
            const coords = [...route.coordinates, locations.pickup.coord, locations.dropoff.coord];
            if (cameraRef.current?.setCamera && coords.length >= 2) {
                const lats = coords.map(c => c.latitude);
                const lngs = coords.map(c => c.longitude);
                cameraRef.current.setCamera({
                    bounds: { ne: [Math.max(...lngs), Math.max(...lats)], sw: [Math.min(...lngs), Math.min(...lats)], paddingTop: 40, paddingLeft: 40, paddingBottom: 40, paddingRight: 40 },
                    animationDuration: 1200
                });
            }
        }
    }, [mapReady, route, isCalculating]);

    const handleConfirmBooking = async () => {
        setIsBooking(true);
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://10.200.240.183:5000'}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'tester-123',
                    serviceId: intent?.serviceId,
                    vehicleCategory: selectedVariant.id, // Explicit passing of selected product variant
                    idempotencyKey,
                    fare: {
                        estimatedFare: selectedVariant.price,
                        currency: 'INR',
                        paymentMethod: paymentMethod
                    }
                })
            });

            if (!response.ok) throw new Error("Booking failed");
            const data = await response.json();

            // Store authoritative server state
            if (data.status) {
                applyServerBookingState(data);
                // Redirect to specialized tracking view
                router.replace('/f2-live-tracking');
            }
        } catch (e) {
            Alert.alert("Booking Failed", "Check your connection and try again");
        } finally {
            setIsBooking(false);
        }
    };

    const geoJSONRoute = {
        type: 'FeatureCollection',
        features: route && route.coordinates.length > 0 ? [{
            type: 'Feature', properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route.coordinates.map(c => [c.longitude, c.latitude])
            }
        }] : []
    };

    if (!intent || !locations.pickup || !locations.dropoff) {
        return <View style={styles.container}><ActivityIndicator color="#000" style={{ marginTop: 50 }} /></View>;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Confirm {(intent.vehicleCategory || '').toUpperCase()}</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Subheader */}
            <View style={styles.subheader}>
                <View style={styles.addressRow}>
                    <Ionicons name="locate" size={16} color="#0F172A" />
                    <Text style={styles.addressText} numberOfLines={1}>{locations.pickup.address?.name || 'Pickup'}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#475569" style={{ marginHorizontal: 8 }} />
                    <Text style={styles.addressText} numberOfLines={1}>{locations.dropoff.address?.name || 'Dropoff'}</Text>
                </View>
            </View>

            {/* Map Area */}
            <View style={styles.mapContainer}>
                {Platform.OS !== 'web' && (
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        styleURL={Mapbox.StyleURL.Street}
                        logoEnabled={false}
                        onDidFinishLoadingMap={() => setMapReady(true)}
                    >
                        <Camera ref={cameraRef} defaultSettings={{ centerCoordinate: [locations.pickup.coord.longitude, locations.pickup.coord.latitude], zoomLevel: 12 }} />

                        {route && mapReady && (
                            <ShapeSource id="routeSource" shape={geoJSONRoute as any}>
                                <LineLayer id="routeLayer" style={{ lineColor: '#3B82F6', lineWidth: 4, lineJoin: 'round', lineCap: 'round' }} />
                            </ShapeSource>
                        )}
                        {/* Markers */}
                        {mapReady && (
                            <ShapeSource id="pickupSource" shape={{ type: 'Feature', geometry: { type: 'Point', coordinates: [locations.pickup.coord.longitude, locations.pickup.coord.latitude] }, properties: {} } as any}>
                                <CircleLayer id="pickupLayerRing" style={{ circleColor: '#000000', circleRadius: 6, circleStrokeWidth: 2, circleStrokeColor: '#FFF' }} />
                            </ShapeSource>
                        )}
                        {mapReady && (
                            <ShapeSource id="dropSource" shape={{ type: 'Feature', geometry: { type: 'Point', coordinates: [locations.dropoff.coord.longitude, locations.dropoff.coord.latitude] }, properties: {} } as any}>
                                <CircleLayer id="dropLayerRing" style={{ circleColor: '#F59E0B', circleRadius: 6, circleStrokeWidth: 2, circleStrokeColor: '#FFF' }} />
                            </ShapeSource>
                        )}
                    </MapView>
                )}
            </View>

            {/* Intent Variants View */}
            <View style={styles.bottomSheet}>
                <View style={styles.sheetHandleWrap}><View style={styles.sheetHandle} /></View>

                {isCalculating ? (
                    <View style={styles.centerBox}><ActivityIndicator size="large" color="#000" /></View>
                ) : (
                    <ScrollView style={styles.carList} contentContainerStyle={{ paddingBottom: 100 }}>
                        {availableQuotes.map((v) => {
                            const isSelected = selectedVariant.id === v.id;
                            return (
                                <TouchableOpacity key={v.id} style={[styles.carCard, isSelected && styles.carCardSelected]} onPress={() => setSelectedVariant(v)} activeOpacity={0.8}>
                                    <View style={styles.carCardLeft}>
                                        <View style={[styles.carImageWrap, { backgroundColor: v.color }]}>
                                            <Ionicons name={v.icon as any} size={28} color={v.iconColor} />
                                        </View>
                                        <View style={styles.carInfoWrap}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={styles.carName}>{v.label}</Text>
                                                <Ionicons name="person" size={10} color="#64748B" style={{ marginLeft: 6, marginRight: 2 }} />
                                            </View>
                                            <Text style={styles.carTime}>{v.eta} away • drops at ~{v.travelTime}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.carCardRight}>
                                        <Text style={styles.carPrice}>₹{v.price}</Text>
                                        {v.originalPrice && <Text style={styles.carOriginalPrice}>₹{v.originalPrice}</Text>}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}

                {!isCalculating && (
                    <View style={styles.actionFooter}>
                        {/* Fake Payment Method Selector */}
                        <TouchableOpacity style={styles.paymentSelectorBtn} onPress={() => setShowPaymentSheet(true)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name={paymentMethod === 'Cash' ? "cash-outline" : "card-outline"} size={20} color="#0F172A" />
                                <Text style={styles.paymentSelectorLabel}>{paymentMethod}</Text>
                            </View>
                            <Ionicons name="chevron-down" size={16} color="#0F172A" />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.bookBtn, isBooking && styles.bookBtnDisabled]} onPress={handleConfirmBooking} disabled={isBooking}>
                            {isBooking ? <ActivityIndicator color="#FFF" /> : <Text style={styles.bookBtnText}>Confirm {selectedVariant.label}</Text>}
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {showPaymentSheet && (
                <View style={styles.mockOverlay}>
                    <View style={styles.mockPopup}>
                        <Text style={styles.mockPopupTitle}>Select Payment Method</Text>
                        {['Cash', 'UPI', 'Card'].map(m => (
                            <TouchableOpacity key={m} style={styles.mockPopupOption} onPress={() => { setPaymentMethod(m as any); setShowPaymentSheet(false); }}>
                                <Text style={styles.mockPopupOptionText}>{m}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', justifyContent: 'space-between', zIndex: 10 },
    backBtn: { padding: 4, width: 32 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#000' },
    subheader: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', zIndex: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    addressRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
    addressText: { fontSize: 13, fontWeight: '600', color: '#0F172A', flex: 1 },
    mapContainer: { flex: 1, backgroundColor: '#F8FAFC', position: 'relative' },
    map: { flex: 1 },
    centerBox: { height: 160, justifyContent: 'center', alignItems: 'center' },
    bottomSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 10, minHeight: 320, paddingHorizontal: 20, paddingTop: 8, position: 'absolute', bottom: 0, left: 0, right: 0 },
    sheetHandleWrap: { alignItems: 'center', paddingVertical: 12 },
    sheetHandle: { width: 48, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3 },
    carList: { maxHeight: '60%' },
    carCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16, marginBottom: 8, borderWidth: 2, borderColor: 'transparent' },
    carCardSelected: { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
    carCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    carImageWrap: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 12, marginRight: 16 },
    carInfoWrap: { flex: 1 },
    carName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    carTime: { fontSize: 12, color: '#64748B', marginTop: 4, fontWeight: '500' },
    carCardRight: { alignItems: 'flex-end', paddingLeft: 12 },
    carPrice: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
    carOriginalPrice: { fontSize: 12, color: '#94A3B8', textDecorationLine: 'line-through', marginTop: 2, fontWeight: '500' },
    actionFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', gap: 12 },
    bookBtn: { flex: 1, backgroundColor: '#000', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    bookBtnDisabled: { opacity: 0.7 },
    bookBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    paymentSelectorBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'space-between', minWidth: 100 },
    paymentSelectorLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginLeft: 8 },
    mockOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    mockPopup: { backgroundColor: '#FFF', padding: 24, borderRadius: 16, width: 250 },
    mockPopupTitle: { fontSize: 16, fontWeight: '800', color: '#000', marginBottom: 16 },
    mockPopupOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    mockPopupOptionText: { fontSize: 14, fontWeight: '600' }
});

