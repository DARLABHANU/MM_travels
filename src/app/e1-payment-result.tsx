import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function E1PaymentResultScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleViewBooking = () => {
        router.push('/e2-booking-confirmation');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.contentWrap}>

                <View style={styles.iconRing}>
                    <Ionicons name="checkmark-circle-outline" size={56} color="#000" />
                </View>

                <Text style={styles.title}>Payment successful</Text>

                <Text style={styles.subtext}>
                    Your booking is confirmed. We've sent{'\n'}the details to your phone.
                </Text>

                <View style={styles.referenceBox}>
                    <Text style={styles.referenceLabel}>PAYMENT REFERENCE ID</Text>
                    <Text style={styles.referenceValue}>MMT-8472-X9L</Text>
                </View>

                <TouchableOpacity
                    style={styles.actionBtn}
                    activeOpacity={0.9}
                    onPress={handleViewBooking}
                >
                    <Text style={styles.actionBtnText}>View booking</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    contentWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    iconRing: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F1F5F9', // light gray/lavender tint matching design
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#000',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtext: {
        fontSize: 15,
        color: '#475569',
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
        marginBottom: 32,
    },
    referenceBox: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingVertical: 20,
        alignItems: 'center',
        marginBottom: 40,
    },
    referenceLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#475569',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    referenceValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#000',
        letterSpacing: 0.5,
    },
    actionBtn: {
        width: '100%',
        backgroundColor: '#FBBF24', // Golden orange from reference
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#92400E',
    }
});
