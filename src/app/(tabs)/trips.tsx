import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_TRIPS = {
    upcoming: [
        {
            id: 'u1',
            mode: 'City Ride',
            icon: 'car',
            iconBg: colors.amberTint,
            iconColor: colors.goldDark,
            route: 'Koduru → Pedamusidivada',
            date: 'Today, 4:30 PM',
            fare: '₹129',
            status: 'Upcoming',
        },
        {
            id: 'u2',
            mode: 'Outstation',
            icon: 'car-sport',
            iconBg: colors.blueTint,
            iconColor: colors.blue,
            route: 'Visakhapatnam → Vijayawada',
            date: 'Tomorrow, 9:00 AM',
            fare: '₹1,450',
            status: 'Upcoming',
        },
    ],
    active: [
        {
            id: 'a1',
            mode: 'City Ride',
            icon: 'car',
            iconBg: colors.amberTint,
            iconColor: colors.goldDark,
            route: 'Maddilapalem → Rushikonda',
            date: 'Now · ETA 8 min',
            fare: '₹89',
            status: 'Active',
        },
    ],
    past: [
        {
            id: 'p1',
            mode: 'Pool Ride',
            icon: 'people',
            iconBg: colors.roseTint,
            iconColor: colors.rose,
            route: 'Mantripalem → Lankelapalem',
            date: '24 Aug 2026, 4:30 PM',
            fare: '₹149',
            status: 'Completed',
        },
        {
            id: 'p2',
            mode: 'Local Hourly',
            icon: 'time',
            iconBg: colors.greenTint,
            iconColor: colors.greenInk,
            route: 'Vizag City Tour · 4 hrs',
            date: '22 Aug 2026, 10:00 AM',
            fare: '₹649',
            status: 'Completed',
        },
        {
            id: 'p3',
            mode: 'Self-Drive',
            icon: 'key',
            iconBg: colors.purpleTint,
            iconColor: colors.purple,
            route: 'Vizag → Araku Valley',
            date: '20 Aug 2026, 8:00 AM',
            fare: '₹2,100',
            status: 'Completed',
        },
    ],
    cancelled: [
        {
            id: 'c1',
            mode: 'City Ride',
            icon: 'car',
            iconBg: colors.amberTint,
            iconColor: colors.goldDark,
            route: 'VUDA Colony → Airport',
            date: '18 Aug 2026, 6:00 AM',
            fare: '₹210',
            status: 'Cancelled',
        },
    ],
};

const SEGMENTS = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'active', label: 'Active' },
    { key: 'past', label: 'Past' },
    { key: 'cancelled', label: 'Cancelled' },
];

type Segment = 'upcoming' | 'active' | 'past' | 'cancelled';

function statusColor(status: string) {
    if (status === 'Active') return colors.green;
    if (status === 'Cancelled') return colors.danger;
    return colors.inkFaint;
}

function TripCard({ item, onPress }: { item: any; onPress: () => void }) {
    const isActive = item.status === 'Active';
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <View style={[styles.iconSq, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon as any} size={22} color={item.iconColor} />
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.cardRoute} numberOfLines={1}>{item.route}</Text>
                <View style={styles.cardMeta}>
                    {isActive && <View style={styles.activeDot} />}
                    <Text style={[styles.cardDate, { color: statusColor(item.status) }]}>{item.date}</Text>
                </View>
            </View>
            <View style={styles.cardRight}>
                <Text style={styles.cardFare}>{item.fare}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.inkFaint} />
            </View>
        </TouchableOpacity>
    );
}

function EmptyState({ segment }: { segment: Segment }) {
    const router = useRouter();
    const labels: Record<Segment, string> = {
        upcoming: 'No upcoming trips',
        active: 'No active trips',
        past: 'No past trips',
        cancelled: 'No cancelled trips',
    };
    return (
        <View style={styles.emptyWrap}>
            <View style={styles.emptyIllus}>
                <Ionicons name="receipt-outline" size={36} color={colors.inkFaint} />
                <View style={styles.emptyDotGold} />
                <View style={styles.emptyDotGold2} />
            </View>
            <Text style={styles.emptyHeadline}>{labels[segment]}</Text>
            <Text style={styles.emptyBody}>
                Book a ride and it'll show up here with live tracking and your boarding details.
            </Text>
            {(segment === 'upcoming' || segment === 'past') && (
                <TouchableOpacity
                    style={styles.bookBtn}
                    onPress={() => router.push('/destination')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.bookBtnText}>Book a ride</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

export default function TripsScreen() {
    const router = useRouter();
    const [segment, setSegment] = useState<Segment>('upcoming');
    const data = MOCK_TRIPS[segment];

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My trips</Text>
            </View>

            {/* Segment tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.segRow}
            >
                {SEGMENTS.map((s) => (
                    <TouchableOpacity
                        key={s.key}
                        style={[styles.segTab, segment === s.key && styles.segTabActive]}
                        onPress={() => setSegment(s.key as Segment)}
                        activeOpacity={0.75}
                    >
                        <Text style={[styles.segLabel, segment === s.key && styles.segLabelActive]}>
                            {s.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* List */}
            {data.length === 0 ? (
                <EmptyState segment={segment} />
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TripCard item={item} onPress={() => router.push('/f2-live-tracking' as any)} />
                    )}
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    header: {
        paddingHorizontal: spacing.screenPadX,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.ink,
    },
    segRow: {
        paddingHorizontal: spacing.screenPadX,
        paddingBottom: 12,
        gap: 8,
        flexDirection: 'row',
    },
    segTab: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 12,
        backgroundColor: colors.surface,
    },
    segTabActive: {
        backgroundColor: colors.ink,
    },
    segLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.inkFaint,
    },
    segLabelActive: {
        color: colors.white,
    },
    listContent: {
        paddingHorizontal: spacing.screenPadX,
        paddingBottom: 32,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: radius.card,
        padding: 13,
        gap: 12,
    },
    iconSq: {
        width: 44,
        height: 44,
        borderRadius: radius.iconSquare,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardBody: { flex: 1 },
    cardRoute: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.ink,
        marginBottom: 3,
    },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    activeDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: colors.green,
    },
    cardDate: {
        fontSize: 10,
        fontWeight: '600',
    },
    cardRight: { alignItems: 'flex-end', gap: 4 },
    cardFare: {
        fontSize: 13,
        fontWeight: '800',
        color: colors.ink,
    },
    // Empty state
    emptyWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyIllus: {
        width: 86,
        height: 86,
        borderRadius: 43,
        borderWidth: 1.5,
        borderColor: colors.line,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    emptyDotGold: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.gold,
    },
    emptyDotGold2: {
        position: 'absolute',
        bottom: 14,
        left: 14,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.gold,
        opacity: 0.6,
    },
    emptyHeadline: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.ink,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyBody: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.inkSoft,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 24,
    },
    bookBtn: {
        backgroundColor: colors.gold,
        paddingHorizontal: 22,
        paddingVertical: 12,
        borderRadius: radius.button,
    },
    bookBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#3A2405',
    },
});