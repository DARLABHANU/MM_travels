import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// I2 — Booking Details (mock data, status-aware action list)
const MOCK_BOOKING = {
    id: 'u1',
    ref: 'MMT-2024-6781',
    mode: 'City Ride',
    icon: 'car',
    iconBg: colors.amberTint,
    iconColor: colors.goldDark,
    route: 'Koduru → Pedamusidivada',
    date: 'Today, 4:30 PM',
    vehicle: 'Mini · Swift Dzire · TS09 AB 4521',
    passengers: 2,
    fare: '₹129',
    status: 'Upcoming' as 'Upcoming' | 'Active' | 'Completed' | 'Cancelled',
};

const STATUS_COLOR: Record<string, string> = {
    Upcoming: colors.inkFaint,
    Active: colors.green,
    Completed: colors.greenInk,
    Cancelled: colors.danger,
};

const STATUS_BG: Record<string, string> = {
    Upcoming: colors.surface,
    Active: colors.greenTint,
    Completed: colors.greenTint,
    Cancelled: colors.roseTint,
};

export default function BookingDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const booking = MOCK_BOOKING;

    const actions = [
        booking.status === 'Active' && { id: 'track', label: 'Track live', icon: 'navigate', route: '/f2-live-tracking' },
        (booking.status === 'Active' || booking.status === 'Upcoming') && { id: 'cancel', label: 'Cancel booking', icon: 'close-circle', route: '/f7-cancellation', danger: true },
        booking.status === 'Completed' && { id: 'invoice', label: 'View invoice', icon: 'receipt', route: '/g1-invoice' },
        booking.status === 'Completed' && { id: 'rate', label: 'Rate this trip', icon: 'star', route: '/g2-review' },
        { id: 'report', label: 'Report an issue', icon: 'flag', route: '/g3-incident' },
    ].filter(Boolean) as { id: string; label: string; icon: string; route: string; danger?: boolean }[];

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="chevron-back" size={20} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{booking.route}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Status banner */}
                <View style={[styles.statusBanner, { backgroundColor: STATUS_BG[booking.status] }]}>
                    {booking.status === 'Active' && <View style={styles.activeDot} />}
                    <Text style={[styles.statusText, { color: STATUS_COLOR[booking.status] }]}>{booking.status}</Text>
                </View>

                {/* Summary card */}
                <View style={styles.summaryCard}>
                    <View style={[styles.modeIcon, { backgroundColor: booking.iconBg }]}>
                        <Ionicons name={booking.icon as any} size={22} color={booking.iconColor} />
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                        <Text style={styles.summaryRoute}>{booking.route}</Text>
                        <Text style={styles.summaryMeta}>{booking.vehicle}</Text>
                        <Text style={styles.summaryMeta}>{booking.date} · {booking.passengers} passenger{booking.passengers > 1 ? 's' : ''}</Text>
                        <Text style={styles.summaryRef}>Ref: {booking.ref}</Text>
                    </View>
                    <Text style={styles.summaryFare}>{booking.fare}</Text>
                </View>

                {/* Action list */}
                <Text style={styles.actionsLabel}>ACTIONS</Text>
                <View style={styles.actionsCard}>
                    {actions.map((action, i) => (
                        <TouchableOpacity
                            key={action.id}
                            style={[styles.actionRow, i < actions.length - 1 && styles.actionBorder]}
                            onPress={() => router.push(action.route as any)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: action.danger ? colors.roseTint : colors.surface }]}>
                                <Ionicons name={action.icon as any} size={18} color={action.danger ? colors.danger : colors.inkSoft} />
                            </View>
                            <Text style={[styles.actionLabel, action.danger && { color: colors.danger }]}>{action.label}</Text>
                            <Ionicons name="chevron-forward" size={16} color={colors.inkFaint} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.screenPadX, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
    back: { marginRight: 10 },
    headerTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: colors.ink },
    content: { padding: spacing.screenPadX, gap: 14 },
    statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
    activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
    statusText: { fontSize: 12, fontWeight: '700' },
    summaryCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, padding: 14 },
    modeIcon: { width: 44, height: 44, borderRadius: radius.iconSquare, justifyContent: 'center', alignItems: 'center' },
    summaryRoute: { fontSize: 14, fontWeight: '700', color: colors.ink },
    summaryMeta: { fontSize: 11, fontWeight: '500', color: colors.inkSoft },
    summaryRef: { fontSize: 10, fontWeight: '600', color: colors.inkFaint, marginTop: 2 },
    summaryFare: { fontSize: 14, fontWeight: '800', color: colors.ink },
    actionsLabel: { fontSize: 10.5, fontWeight: '700', color: colors.inkFaint, letterSpacing: 0.5, marginTop: 4 },
    actionsCard: { backgroundColor: colors.white, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
    actionBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
    actionIcon: { width: 36, height: 36, borderRadius: radius.iconSquare, justifyContent: 'center', alignItems: 'center' },
    actionLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.ink },
});
