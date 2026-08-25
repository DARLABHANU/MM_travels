import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const REASONS = [
    'Driver delayed',
    'Wrong pickup location',
    'Changed my plans',
    'Driver not responding',
    'Found a better option',
    'Other',
];

export default function CancellationScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState<string | null>(null);
    const [otherText, setOtherText] = useState('');
    const [confirming, setConfirming] = useState(false);

    const refundAmount = '₹129';
    const refundPolicy = 'Cancellation within 5 min of booking is fully refundable.';

    const handleConfirm = () => {
        setConfirming(true);
        setTimeout(() => router.replace('/(tabs)/trips' as any), 1500);
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* Handle */}
            <View style={styles.handle} />

            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Cancel this trip?</Text>

                {/* Trip context */}
                <View style={styles.tripCard}>
                    <View style={[styles.tripIcon, { backgroundColor: colors.amberTint }]}>
                        <Ionicons name="car" size={20} color={colors.goldDark} />
                    </View>
                    <View>
                        <Text style={styles.tripRoute}>Koduru → Pedamusidivada</Text>
                        <Text style={styles.tripDate}>Today, 4:30 PM · Mini</Text>
                    </View>
                </View>

                {/* Reason list */}
                <Text style={styles.subLabel}>Why are you cancelling?</Text>
                {REASONS.map((reason) => (
                    <TouchableOpacity
                        key={reason}
                        style={styles.reasonRow}
                        onPress={() => setSelected(reason)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.radio, selected === reason && styles.radioActive]}>
                            {selected === reason && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.reasonText}>{reason}</Text>
                    </TouchableOpacity>
                ))}

                {selected === 'Other' && (
                    <TextInput
                        style={styles.otherInput}
                        placeholder="Tell us more..."
                        placeholderTextColor={colors.inkFaint}
                        value={otherText}
                        onChangeText={setOtherText}
                        multiline
                        numberOfLines={3}
                    />
                )}

                {/* Refund estimate */}
                <View style={styles.refundCard}>
                    <View style={styles.refundRow}>
                        <Text style={styles.refundLabel}>Refund estimate</Text>
                        <Text style={styles.refundAmount}>{refundAmount}</Text>
                    </View>
                    <Text style={styles.refundPolicy}>{refundPolicy}</Text>
                </View>

                {/* CTAs */}
                <TouchableOpacity
                    style={[styles.confirmBtn, (!selected || confirming) && styles.btnDisabled]}
                    onPress={handleConfirm}
                    disabled={!selected || confirming}
                    activeOpacity={0.85}
                >
                    <Text style={styles.confirmText}>
                        {confirming ? 'Cancelling...' : 'Confirm cancellation'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.keepBtn} onPress={() => router.back()}>
                    <Text style={styles.keepText}>Never mind, keep my trip</Text>
                </TouchableOpacity>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white, paddingHorizontal: spacing.screenPadX },
    handle: { width: 34, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: 'center', marginTop: 14, marginBottom: 20 },
    title: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 16 },

    tripCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: colors.surface,
        borderRadius: radius.card,
        padding: 14,
        marginBottom: 20,
    },
    tripIcon: { width: 42, height: 42, borderRadius: radius.iconSquare, justifyContent: 'center', alignItems: 'center' },
    tripRoute: { fontSize: 13, fontWeight: '700', color: colors.ink },
    tripDate: { fontSize: 11, fontWeight: '500', color: colors.inkFaint, marginTop: 2 },

    subLabel: { fontSize: 12, fontWeight: '700', color: colors.inkSoft, marginBottom: 12 },
    reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.line, justifyContent: 'center', alignItems: 'center' },
    radioActive: { borderColor: colors.gold },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gold },
    reasonText: { fontSize: 13, fontWeight: '600', color: colors.ink },
    otherInput: {
        backgroundColor: colors.surface,
        borderRadius: radius.card,
        padding: 13,
        fontSize: 13,
        fontWeight: '500',
        color: colors.ink,
        marginTop: 12,
        textAlignVertical: 'top',
        minHeight: 80,
    },

    refundCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.card,
        padding: 14,
        marginVertical: 20,
    },
    refundRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    refundLabel: { fontSize: 12, fontWeight: '600', color: colors.inkSoft },
    refundAmount: { fontSize: 18, fontWeight: '800', color: colors.ink },
    refundPolicy: { fontSize: 10, fontWeight: '500', color: colors.inkFaint, lineHeight: 15 },

    confirmBtn: {
        backgroundColor: colors.danger,
        paddingVertical: 15,
        borderRadius: radius.button,
        alignItems: 'center',
        marginBottom: 12,
    },
    btnDisabled: { opacity: 0.5 },
    confirmText: { fontSize: 14, fontWeight: '700', color: colors.white },
    keepBtn: { alignItems: 'center', paddingVertical: 8 },
    keepText: { fontSize: 12, fontWeight: '600', color: colors.inkSoft },
});
