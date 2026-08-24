import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function E2BookingConfirmationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleBackHome = () => {
        router.dismissAll();
        router.replace('/(tabs)');
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.scrollContent,
                { paddingTop: Math.max(insets.top + 40, 60), paddingBottom: Math.max(insets.bottom + 20, 40) }
            ]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header / Success Icon */}
            <View style={styles.headerArea}>
                <View style={styles.iconRing}>
                    <Ionicons name="checkmark-circle-outline" size={48} color="#92400E" />
                </View>
                <Text style={styles.title}>Booking Confirmed!</Text>
                <Text style={styles.subTitle}>Your ride is scheduled and ready to go.</Text>
            </View>

            {/* Booking Details Card */}
            <View style={styles.card}>

                {/* Vehicle & Price Row */}
                <View style={styles.vehicleRow}>
                    <View style={styles.vehicleInfoCol}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=200' }}
                            style={styles.carThumb}
                            resizeMode="cover"
                        />
                        <View style={styles.vehicleTextNode}>
                            <Text style={styles.vehicleName}>Premium Sedan</Text>
                            <Text style={styles.vehicleSub}>License: XYZ-1234</Text>
                        </View>
                    </View>
                    <View style={styles.paymentCol}>
                        <Text style={styles.priceText}>₹129.00</Text>
                        <Text style={styles.paymentSub}>Paid via UPI</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Route Line Block */}
                <View style={styles.routeBlock}>
                    <View style={styles.routeLineCol}>
                        <View style={styles.dotPickup} />
                        <View style={styles.verticalLink} />
                        <View style={styles.dotDropoff} />
                    </View>

                    <View style={styles.routeTextCol}>
                        <View style={styles.routeNode}>
                            <Text style={styles.nodeLabel}>PICKUP</Text>
                            <Text style={styles.nodeTitle}>123 Market Street</Text>
                            <Text style={styles.nodeTime}>Today, 2:30 PM</Text>
                        </View>

                        <View style={styles.routeNode}>
                            <Text style={styles.nodeLabel}>DROPOFF</Text>
                            <Text style={styles.nodeTitle}>San Francisco International Airport</Text>
                            <Text style={styles.nodeTime}>Est. Arrival 3:15 PM</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Footer / Invoice Row */}
                <View style={styles.invoiceRow}>
                    <Text style={styles.bookingIdText}>Booking ID: <Text style={{ color: '#475569' }}>#MM-8924</Text></Text>
                    <TouchableOpacity style={styles.invoiceBtn}>
                        <Ionicons name="document-text-outline" size={16} color="#92400E" />
                        <Text style={styles.invoiceBtnText}>Invoice</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionBlock}>
                <TouchableOpacity
                    style={styles.trackBtn}
                    activeOpacity={0.9}
                    onPress={() => router.push('/f1-driver-assignment')}
                >
                    <Text style={styles.trackBtnText}>Track your trip</Text>
                    <Ionicons name="map-outline" size={20} color="#92400E" style={{ marginLeft: 8 }} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.homeBtn} activeOpacity={0.8} onPress={handleBackHome}>
                    <Text style={styles.homeBtnText}>Back to Home</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAF9', // very light gray backdrop mirroring image
    },
    scrollContent: {
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    headerArea: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconRing: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FBBF24', // deep amber circle
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 8,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#000',
        marginBottom: 8,
    },
    subTitle: {
        fontSize: 15,
        color: '#475569',
        fontWeight: '500',
    },
    card: {
        width: '100%',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    vehicleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    vehicleInfoCol: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    carThumb: {
        width: 60,
        height: 40,
        backgroundColor: '#F1F5F9',
        borderRadius: 6,
    },
    vehicleTextNode: {
        marginLeft: 12,
        flex: 1,
    },
    vehicleName: {
        fontSize: 15,
        fontWeight: '800',
        color: '#000',
    },
    vehicleSub: {
        fontSize: 12,
        color: '#475569',
        marginTop: 2,
        fontWeight: '600',
    },
    paymentCol: {
        alignItems: 'flex-end',
    },
    priceText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000',
    },
    paymentSub: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 20,
    },
    routeBlock: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    routeLineCol: {
        width: 20,
        alignItems: 'center',
        paddingTop: 6,
        paddingBottom: 22,
    },
    dotPickup: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#D97706',
    },
    verticalLink: {
        width: 2,
        flex: 1,
        backgroundColor: '#FDE68A',
        marginVertical: 4,
    },
    dotDropoff: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#0F172A', // Dark navy dot
    },
    routeTextCol: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'space-between',
    },
    routeNode: {
        marginBottom: 24,
    },
    nodeLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#475569',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    nodeTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#000',
        marginBottom: 2,
    },
    nodeTime: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    invoiceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bookingIdText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    invoiceBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    invoiceBtnText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#92400E',
        marginLeft: 4,
    },
    actionBlock: {
        width: '100%',
        gap: 16,
    },
    trackBtn: {
        width: '100%',
        backgroundColor: '#FBBF24',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 12,
    },
    trackBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#92400E',
    },
    homeBtn: {
        width: '100%',
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 12,
    },
    homeBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000',
    }
});
