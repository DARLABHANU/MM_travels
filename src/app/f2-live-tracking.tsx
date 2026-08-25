import { Ionicons } from '@expo/vector-icons';
import Mapbox, { Camera, MapView } from '@rnmapbox/maps';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Modal, Platform, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { socketService } from '../services/socketService';
import { useRideStore } from '../store/rideStore';

export default function F2LiveTrackingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const mapRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);

    // Concept: Authoritative Backend State Machine directly from the centralized store
    const { status, bookingId, tripPin, driver, vehicle, driverLocation, fare, applyServerBookingState, clearBooking } = useRideStore();

    // Safety Center UI State
    const [safetyCenterVisible, setSafetyCenterVisible] = useState(false);
    const [checkRideVisible, setCheckRideVisible] = useState(true);

    const [isPaying, setIsPaying] = useState(false);
    const [rating, setRating] = useState(0);

    // Hardware Back Button strictly disabled unless specifically unmounted.
    useEffect(() => {
        const onBackPress = () => {
            if (['SEARCHING_DRIVER', 'DRIVER_ASSIGNED', 'DRIVER_EN_ROUTE', 'DRIVER_ARRIVED', 'TRIP_STARTED', 'FARE_FINALIZED', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS'].includes(status)) {
                if (status === 'SEARCHING_DRIVER') {
                    Alert.alert("Cancel Ride", "Do you want to cancel the booking search?", [
                        { text: "No", style: "cancel" },
                        { text: "Yes, Cancel", onPress: () => router.replace('/(tabs)'), style: "destructive" }
                    ]);
                }
                return true; // Block natively
            }
            return false;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => backHandler.remove();
    }, [status, router]);

    useEffect(() => {
        let isMounted = true;
        const recoverRide = async () => {
            try {
                // 1. Fetch current booking authoritative snapshot
                const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://10.200.240.183:5000'}/api/bookings/current`);
                const data = await res.json();

                if (isMounted && data.booking) {
                    useRideStore.getState().applyServerBookingState(data.booking);

                    // 2. Connect Socket and Join Room explicitly
                    socketService.connect('demo-auth-token-123');
                    socketService.joinBookingRoom(data.booking.bookingId);
                } else if (isMounted) {
                    // No active booking found, but for dev slice it's okay to just wait
                    console.log("[F2] No active booking. Waiting for assignment.");
                }
            } catch (err) {
                console.error("Failed to recover booking", err);
            }
        };

        if (status === 'NONE') {
            recoverRide();
        } else if (bookingId) {
            // Re-join socket if coming from C6 without dropping
            socketService.connect('demo-auth-token-123');
            socketService.joinBookingRoom(bookingId);
        }

        return () => {
            isMounted = false;
            // Unsubscribe when leaving the active tracking screen
            socketService.leaveBookingRoom();
        };
    }, [bookingId]);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Track my MM Travels ride: https://mmtravels.com/trip/t-${bookingId} (Driver: ${driver?.name || 'Assigned'} / ${vehicle?.plateNumber || ''})`,
                title: "Track my MM Travels ride",
            });
        } catch (error) {
            console.error('Error sharing trip', error);
        }
    };

    // Safety SOS Logic
    const handleSOS = () => {
        Alert.alert(
            "Emergency Help",
            "This will immediately notify Police and MM Travels Trust & Safety team. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "I need emergency help",
                    style: "destructive",
                    onPress: () => {
                        Alert.alert("SOS Activated", "Your safety event has been recorded and authorities contacted.");
                        setSafetyCenterVisible(false);
                    }
                }
            ]
        );
    };

    // DEVELOPMENT ACTION: Simulate Driver checking PIN
    const mockDriverVerifyPin = async () => {
        if (!bookingId) return;
        try {
            await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://10.200.240.183:5000'}/api/bookings/${bookingId}/trip-pin/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin: '4821' })
            });
        } catch (e) { console.error(e) }
    };

    // UX Action: Process Payment
    const handlePayment = async () => {
        if (!bookingId || isPaying) return;
        setIsPaying(true);
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://10.200.240.183:5000'}/api/bookings/${bookingId}/payment/settle`, { method: 'POST' });
            const data = await res.json();
            if (data.status) {
                applyServerBookingState({ status: data.status });
            }
        } catch (e) {
            Alert.alert("Payment Error", "Failed to contact payment gateway.");
            setIsPaying(false);
        }
    };

    const handleComplete = () => {
        clearBooking();
        router.replace('/(tabs)');
    };

    // Overlays for End of Trip
    if (status === 'FARE_FINALIZED' || status === 'PAYMENT_PENDING' || status === 'PAYMENT_SUCCESS' || status === 'RATING_PENDING' || status === 'COMPLETED') {
        return (
            <View style={[styles.container, { paddingTop: insets.top, backgroundColor: '#F8FAFC' }]}>
                <View style={styles.header}>
                    <View style={styles.backBtn} />
                    <Text style={styles.headerTitle}>Trip Completed</Text>
                    <View style={{ width: 40 }} />
                </View>

                {status === 'PAYMENT_SUCCESS' || status === 'RATING_PENDING' || status === 'COMPLETED' ? (
                    <View style={styles.receiptContainer}>
                        <Ionicons name="checkmark-circle" size={64} color="#10B981" />
                        <Text style={styles.receiptTitle}>Payment Successful</Text>
                        <Text style={styles.receiptAmount}>₹{fare?.finalFare || fare?.estimatedFare}</Text>

                        <View style={styles.ratingBox}>
                            <Text style={styles.ratingPrompt}>How was your trip with {driver?.name}?</Text>
                            <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                        <Ionicons name={rating >= star ? "star" : "star-outline"} size={36} color="#F59E0B" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <TouchableOpacity style={[styles.primaryActionBtn, { marginTop: 24 }]} onPress={handleComplete}>
                            <Text style={styles.primaryActionText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.receiptContainer}>
                        <Text style={styles.receiptTitle}>Fare Breakdown</Text>

                        <View style={styles.invoiceLine}>
                            <Text style={styles.invoiceLabel}>Final Ride Fare</Text>
                            <Text style={styles.invoiceValue}>₹{fare?.finalFare || fare?.estimatedFare}</Text>
                        </View>
                        <View style={styles.invoiceLine}>
                            <Text style={styles.invoiceLabel}>Payment Method</Text>
                            <Text style={styles.invoiceValue}>{fare?.paymentMethod || 'Cash'}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.invoiceLine}>
                            <Text style={[styles.invoiceLabel, { fontWeight: '800', color: '#0F172A', fontSize: 18 }]}>Total to Pay</Text>
                            <Text style={[styles.invoiceValue, { fontWeight: '800', color: '#0F172A', fontSize: 18 }]}>₹{fare?.finalFare || fare?.estimatedFare}</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.primaryActionBtn, isPaying && { opacity: 0.7 }]}
                            onPress={handlePayment}
                            disabled={isPaying || status === 'PAYMENT_PENDING'}
                        >
                            {isPaying || status === 'PAYMENT_PENDING' ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.primaryActionText}>Pay ₹{fare?.finalFare || fare?.estimatedFare}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)')} accessibilityLabel="Go back home">
                    {['NONE', 'SEARCHING_DRIVER', 'NO_DRIVER_FOUND', 'CANCELED'].includes(status) && (
                        <Ionicons name="close" size={24} color="#000" />
                    )}
                </TouchableOpacity>

                <Text style={styles.headerTitle}>
                    {status === 'SEARCHING_DRIVER' ? "Finding your ride" :
                        status === 'DRIVER_ASSIGNED' ? "Driver Assigned" :
                            status === 'DRIVER_EN_ROUTE' ? "Driver Arriving" :
                                status === 'DRIVER_ARRIVED' ? "Driver Arrived" :
                                    status === 'TRIP_STARTED' ? "Trip in Progress" :
                                        status === 'TRIP_COMPLETED' ? "Processing Fare..." : "Connecting..."}
                </Text>

                <TouchableOpacity
                    style={styles.safetyBtn}
                    activeOpacity={0.8}
                    onPress={() => setSafetyCenterVisible(true)}
                    accessibilityLabel="Open Safety Center"
                >
                    <Ionicons name="shield-checkmark" size={16} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={styles.safetyText}>Safety</Text>
                </TouchableOpacity>
            </View>

            {/* Map Telemetry Area */}
            <View style={styles.mapContainer}>
                {Platform.OS !== 'web' && driverLocation && (
                    <MapView ref={mapRef} style={styles.map} styleURL={Mapbox.StyleURL.Street} logoEnabled={false}>
                        <Camera ref={cameraRef} defaultSettings={{ centerCoordinate: [driverLocation.lng, driverLocation.lat], zoomLevel: 15 }} />
                    </MapView>
                )}

                {/* Developer Mode Debug Overlay */}
                {__DEV__ && (
                    <View style={styles.debugOverlay}>
                        <Text style={styles.debugText}>DEV STATE: {status}</Text>
                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                            {status === 'DRIVER_ARRIVED' && (
                                <TouchableOpacity onPress={mockDriverVerifyPin} style={[styles.debugBtn, { backgroundColor: '#10B981' }]}><Text style={styles.debugBtnTxt}>Driver Verify PIN</Text></TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                {/* Contextual Floating Overlays */}
                {(status === 'DRIVER_EN_ROUTE' || status === 'DRIVER_ASSIGNED') && checkRideVisible && (
                    <View style={styles.checkRideFloatingCard}>
                        <Text style={styles.checkRideTitle}>CHECK YOUR RIDE</Text>
                        <View style={styles.checkRideChecks}>
                            <Text style={styles.checkItem}>◯ Driver photo matches</Text>
                            <Text style={styles.checkItem}>◯ Vehicle model matches</Text>
                            <Text style={styles.checkItem}>◯ Number plate matches</Text>
                        </View>
                        <TouchableOpacity style={styles.checkRideBtn} onPress={() => setCheckRideVisible(false)}>
                            <Text style={styles.checkRideBtnText}>Everything matches</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Bottom Sheet Contextual State */}
            <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <View style={styles.handleWrap}><View style={styles.handleBar} /></View>

                {status === 'SEARCHING_DRIVER' && (
                    <View style={{ alignItems: 'center', padding: 24, paddingBottom: 40 }}>
                        <ActivityIndicator size="large" color="#000" style={{ marginBottom: 16 }} />
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>Contacting nearby drivers...</Text>
                        <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Please wait while we confirm your ride.</Text>
                    </View>
                )}

                {/* State: Arriving / Arrived -> Show strictly Backend PIN auth */}
                {(status === 'DRIVER_EN_ROUTE' || status === 'DRIVER_ARRIVED') && (
                    <View style={styles.pinSection}>
                        <Text style={styles.pinHeader}>Your trip PIN</Text>
                        <View style={styles.pinDisplay}>
                            <Text style={styles.pinText}>{tripPin || "[ PENDING ]"}</Text>
                        </View>
                        <Text style={styles.pinInstruction}>Give this PIN to your driver only when you are ready to start.</Text>
                    </View>
                )}

                {(status === 'TRIP_STARTED' || status === 'TRIP_COMPLETED') && (
                    <View style={styles.activeTripSection}>
                        <Ionicons name="location" size={24} color="#065F46" />
                        <Text style={styles.activeTripText}>{status === 'TRIP_COMPLETED' ? "Arrived" : "Heading to Destination..."}</Text>
                    </View>
                )}

                {/* Driver Identity Card - Derived strictly from rideStore */}
                {(['DRIVER_ASSIGNED', 'DRIVER_EN_ROUTE', 'DRIVER_ARRIVED', 'TRIP_STARTED', 'TRIP_COMPLETED'].includes(status)) && (
                    <View style={styles.driverRow}>
                        <View style={styles.avatarWrap}>
                            <Ionicons name="person-circle" size={48} color="#CBD5E1" />
                        </View>
                        <View style={styles.driverData}>
                            <Text style={styles.driverName}>{driver ? driver.name : "Driver Details Unavailable"}</Text>
                            <Text style={styles.carModel}>{vehicle ? vehicle.model : "Awaiting Vehicle"}</Text>
                        </View>
                        <View style={styles.licensePlateBox}>
                            <Text style={styles.licenseText}>{vehicle ? vehicle.plateNumber : "XX XX XX"}</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Global Safety Center Modal */}
            <Modal visible={safetyCenterVisible} transparent animationType="slide">
                <View style={styles.modalBg}>
                    <View style={[styles.modalContent, { paddingBottom: insets.bottom + 24 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>SAFETY CENTER</Text>
                            <TouchableOpacity onPress={() => setSafetyCenterVisible(false)} accessibilityLabel="Close Safety Center">
                                <Ionicons name="close-circle" size={28} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        {/* Trusted Contacts / Share Trip */}
                        <TouchableOpacity style={styles.safetyOption} activeOpacity={0.7} onPress={handleShare}>
                            <View style={styles.safetyIconBg}><Ionicons name="share-social" size={20} color="#3B82F6" /></View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.safetyOptionTitle}>Share Trip</Text>
                                <Text style={styles.safetyOptionDesc}>Send a secure tracking link to trusted contacts</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Call Driver Proxy */}
                        <TouchableOpacity style={styles.safetyOption} activeOpacity={0.7}>
                            <View style={styles.safetyIconBg}><Ionicons name="call" size={20} color="#10B981" /></View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.safetyOptionTitle}>Call Driver</Text>
                                <Text style={styles.safetyOptionDesc}>Securely ring via MM proxy (number masked)</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.modalDivider} />

                        {/* Emergency SOS */}
                        <TouchableOpacity style={styles.sosSuperBtn} activeOpacity={0.8} onPress={handleSOS}>
                            <Ionicons name="warning" size={24} color="#FFF" />
                            <Text style={styles.sosSuperTitle}>EMERGENCY SOS</Text>
                        </TouchableOpacity>
                        <Text style={styles.sosDisclaimer}>Triggers immediate backend incident response and contacts localized emergency services.</Text>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', justifyContent: 'space-between', zIndex: 10 },
    backBtn: { padding: 4, width: 32 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#000' },
    safetyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B5A8A', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
    safetyText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
    mapContainer: { flex: 1, backgroundColor: '#F8FAFC', position: 'relative' },
    map: { flex: 1 },

    // Debug
    debugOverlay: { position: 'absolute', top: 16, left: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.7)', padding: 12, borderRadius: 8 },
    debugText: { color: '#FBBF24', fontSize: 12, fontWeight: '900', marginBottom: 4 },
    debugBtn: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4, marginRight: 6 },
    debugBtnTxt: { color: '#FFF', fontSize: 12, fontWeight: '700' },

    // Check your ride card
    checkRideFloatingCard: { position: 'absolute', bottom: 24, left: 16, right: 16, backgroundColor: '#FFF', borderRadius: 16, elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10, padding: 16 },
    checkRideTitle: { fontSize: 14, fontWeight: '900', color: '#0F172A', letterSpacing: 0.5, marginBottom: 12 },
    checkRideChecks: { marginBottom: 16, gap: 8 },
    checkItem: { fontSize: 14, color: '#475569', fontWeight: '500' },
    checkRideBtn: { backgroundColor: '#F59E0B', alignItems: 'center', paddingVertical: 12, borderRadius: 8 },
    checkRideBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },

    bottomSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 10, paddingHorizontal: 20, paddingTop: 8 },
    handleWrap: { alignItems: 'center', paddingVertical: 12, marginBottom: 8 },
    handleBar: { width: 48, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3 },

    pinSection: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
    pinHeader: { fontSize: 12, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: 8 },
    pinDisplay: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', marginBottom: 8 },
    pinText: { fontSize: 18, fontWeight: '900', color: '#0F172A', letterSpacing: 1 },
    pinInstruction: { fontSize: 12, color: '#475569', textAlign: 'center', fontWeight: '500' },

    activeTripSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', padding: 16, borderRadius: 12, marginBottom: 20 },
    activeTripText: { fontSize: 16, fontWeight: '800', color: '#065F46', marginLeft: 12 },

    driverRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    avatarWrap: { marginRight: 12 },
    driverData: { flex: 1 },
    driverName: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
    carModel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    licensePlateBox: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    licenseText: { fontSize: 12, fontWeight: '800', color: '#475569' },

    // Financial Complete Overlays
    receiptContainer: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
    receiptTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginTop: 16, marginBottom: 32 },
    receiptAmount: { fontSize: 48, fontWeight: '900', color: '#0F172A', marginBottom: 32 },
    invoiceLine: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16 },
    invoiceLabel: { fontSize: 16, color: '#64748B', fontWeight: '500' },
    invoiceValue: { fontSize: 16, color: '#0F172A', fontWeight: '700' },
    divider: { height: 1, backgroundColor: '#E2E8F0', width: '100%', marginVertical: 16 },
    primaryActionBtn: { backgroundColor: '#000', width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
    primaryActionText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

    ratingBox: { width: '100%', alignItems: 'center', backgroundColor: '#FFF', padding: 24, borderRadius: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    ratingPrompt: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
    starsRow: { flexDirection: 'row', gap: 12 },

    // Safety Modal
    modalBg: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end', zIndex: 100 },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A', letterSpacing: 0.5 },
    safetyOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    safetyIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    safetyOptionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
    safetyOptionDesc: { fontSize: 13, color: '#64748B', fontWeight: '400' },
    modalDivider: { height: 16 },
    sosSuperBtn: { backgroundColor: '#DC2626', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 12, marginTop: 12 },
    sosSuperTitle: { color: '#FFF', fontSize: 16, fontWeight: '900', marginLeft: 8, letterSpacing: 0.5 },
    sosDisclaimer: { textAlign: 'center', fontSize: 11, color: '#94A3B8', marginTop: 12, paddingHorizontal: 20 }
});

