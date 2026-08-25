import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PickupPinScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="arrow-back" size={24} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Set Pickup Location</Text>
            </View>

            <View style={styles.mapMock}>
                <Ionicons name="pin" size={48} color={colors.ink} style={styles.pin} />
                <Text style={styles.mapText}>Drag Map to Set Pickup</Text>
            </View>

            <View style={styles.sheet}>
                <View style={styles.addressBox}>
                    <Text style={styles.addressTitle} numberOfLines={1}>VUDA Colony</Text>
                    <Text style={styles.addressSub} numberOfLines={1}>Maddilapalem, Visakhapatnam, Andhra Pradesh</Text>
                </View>
                <TouchableOpacity style={styles.confirmBtn} onPress={() => router.push('/c5-drop-pin')}>
                    <Text style={styles.confirmText}>Confirm Pickup Location</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface },
    header: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: spacing.screenPadX, elevation: 2 },
    back: { marginRight: 12 },
    headerTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
    mapMock: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e8f0' },
    pin: { marginBottom: -10 },
    mapText: { fontSize: 14, fontWeight: '600', color: colors.inkSoft, marginTop: 12 },
    sheet: { padding: 20, backgroundColor: colors.white, elevation: 15, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    addressBox: { backgroundColor: colors.surface, padding: 16, borderRadius: radius.card, marginBottom: 16 },
    addressTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
    addressSub: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
    confirmBtn: { backgroundColor: colors.ink, paddingVertical: 16, borderRadius: radius.button, alignItems: 'center' },
    confirmText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
