import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// G1 — Digital Invoice (mock data)
const INVOICE = {
    ref: 'MMT-2024-6781',
    date: '24 Aug 2026, 4:30 PM',
    mode: 'City Ride',
    route: 'Koduru → Pedamusidivada',
    distance: '12.4 km',
    duration: '28 min',
    items: [
        { label: 'Base fare', amount: '₹80' },
        { label: 'Distance charges', amount: '₹35' },
        { label: 'Driver allowance', amount: '₹15' },
        { label: 'Platform fee', amount: '₹10' },
        { label: 'GST (5%)', amount: '₹7' },
        { label: 'Discount (MM20)', amount: '-₹18', green: true },
    ],
    total: '₹129',
    payMethod: 'UPI ••••',
    txnRef: 'TXN8821KDHB2',
};

export default function DigitalInvoiceScreen() {
    const router = useRouter();

    const handleShare = async () => {
        try {
            await Share.share({ message: `MM Travels Invoice ${INVOICE.ref} — Total: ${INVOICE.total}. Trip: ${INVOICE.route}` });
        } catch (_) { }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={20} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Invoice</Text>
                <TouchableOpacity onPress={handleShare}>
                    <Ionicons name="share-outline" size={22} color={colors.ink} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Booking meta */}
                <View style={styles.metaCard}>
                    <View style={[styles.modeIcon, { backgroundColor: colors.amberTint }]}>
                        <Ionicons name="car" size={22} color={colors.goldDark} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.metaRoute}>{INVOICE.route}</Text>
                        <Text style={styles.metaDetail}>{INVOICE.mode} · {INVOICE.distance} · {INVOICE.duration}</Text>
                        <Text style={styles.metaDate}>{INVOICE.date}</Text>
                    </View>
                </View>

                {/* Booking reference */}
                <View style={styles.refRow}>
                    <Text style={styles.refLabel}>Booking reference</Text>
                    <Text style={styles.refValue}>{INVOICE.ref}</Text>
                </View>

                {/* Fare breakdown */}
                <View style={styles.fareCard}>
                    <Text style={styles.fareCardTitle}>Fare breakdown</Text>
                    {INVOICE.items.map((item, i) => (
                        <View key={i} style={styles.fareRow}>
                            <Text style={styles.fareLabel}>{item.label}</Text>
                            <Text style={[styles.fareAmount, item.green && { color: colors.green }]}>{item.amount}</Text>
                        </View>
                    ))}
                    <View style={styles.fareDivider} />
                    <View style={styles.fareRow}>
                        <Text style={styles.totalLabel}>Total paid</Text>
                        <Text style={styles.totalAmount}>{INVOICE.total}</Text>
                    </View>
                </View>

                {/* Payment method */}
                <View style={styles.payCard}>
                    <Ionicons name="phone-portrait" size={18} color={colors.inkSoft} />
                    <Text style={styles.payLabel}>{INVOICE.payMethod}</Text>
                    <Text style={styles.txnRef}>{INVOICE.txnRef}</Text>
                </View>

                {/* Download button */}
                <TouchableOpacity style={styles.downloadBtn} onPress={handleShare}>
                    <Ionicons name="download-outline" size={18} color={'#3A2405'} />
                    <Text style={styles.downloadText}>Download / Share PDF</Text>
                </TouchableOpacity>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.screenPadX,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },
    backBtn: { marginRight: 10 },
    headerTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: colors.ink },
    content: { padding: spacing.screenPadX, gap: 14 },

    metaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: colors.surface,
        borderRadius: radius.card,
        padding: 14,
    },
    modeIcon: { width: 44, height: 44, borderRadius: radius.iconSquare, justifyContent: 'center', alignItems: 'center' },
    metaRoute: { fontSize: 13, fontWeight: '700', color: colors.ink },
    metaDetail: { fontSize: 11, fontWeight: '500', color: colors.inkSoft, marginTop: 2 },
    metaDate: { fontSize: 10, fontWeight: '500', color: colors.inkFaint, marginTop: 2 },

    refRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    refLabel: { fontSize: 11, fontWeight: '600', color: colors.inkSoft },
    refValue: { fontSize: 11, fontWeight: '700', color: colors.ink, fontVariant: ['tabular-nums'] },

    fareCard: {
        backgroundColor: colors.white,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.line,
        padding: 16,
        gap: 4,
    },
    fareCardTitle: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 8 },
    fareRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    fareLabel: { fontSize: 12, fontWeight: '500', color: colors.inkSoft },
    fareAmount: { fontSize: 12, fontWeight: '600', color: colors.ink },
    fareDivider: { height: 1, backgroundColor: colors.line, marginVertical: 8 },
    totalLabel: { fontSize: 14, fontWeight: '800', color: colors.ink },
    totalAmount: { fontSize: 14, fontWeight: '800', color: colors.ink },

    payCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: colors.surface,
        borderRadius: radius.card,
        padding: 12,
    },
    payLabel: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.inkSoft },
    txnRef: { fontSize: 10, fontWeight: '600', color: colors.inkFaint, fontVariant: ['tabular-nums'] },

    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.gold,
        paddingVertical: 14,
        borderRadius: radius.button,
        marginTop: 4,
    },
    downloadText: { fontSize: 14, fontWeight: '700', color: '#3A2405' },
});
