import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const SUPPORT_TILES = [
    { id: 'faq', label: 'FAQs', icon: 'help-circle', bg: colors.blueTint, color: colors.blue, route: '/j2-faq' },
    { id: 'chat', label: 'Chat with us', icon: 'chatbubbles', bg: colors.greenTint, color: colors.greenInk, route: '/j3-tickets' },
    { id: 'call', label: 'Call helpline', icon: 'call', bg: colors.amberTint, color: colors.goldDark, route: null },
    { id: 'tickets', label: 'My tickets', icon: 'document-text', bg: colors.purpleTint, color: colors.purple, route: '/j3-tickets' },
];

const RECENT_TICKETS = [
    { id: 't1', subject: 'Driver did not arrive at pickup', status: 'In Progress', date: '23 Aug 2026', statusBg: colors.blueTint, statusColor: colors.blue },
    { id: 't2', subject: 'Wrong fare charged for trip', status: 'Resolved', date: '18 Aug 2026', statusBg: colors.greenTint, statusColor: colors.greenInk },
];

export default function HelpScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Help & safety</Text>
                </View>

                {/* Emergency SOS Card */}
                <View style={styles.px}>
                    <TouchableOpacity style={styles.sosCard} activeOpacity={0.85} onPress={() => router.push('/f5-sos' as any)}>
                        <View style={styles.sosIconWrap}>
                            <Ionicons name="warning" size={24} color={colors.danger} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.sosTitle}>Emergency SOS</Text>
                            <Text style={styles.sosSub}>Get immediate help, 24/7</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
                    </TouchableOpacity>
                </View>

                {/* Active-trip helper (mock) */}
                <View style={styles.px}>
                    <TouchableOpacity style={styles.tripShareCard} activeOpacity={0.85}>
                        <View style={[styles.tileIcon, { backgroundColor: colors.greenTint }]}>
                            <Ionicons name="share-social" size={20} color={colors.greenInk} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.tileLabel}>Share your live trip</Text>
                            <Text style={styles.tileSub}>Let trusted contacts track your journey</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={colors.inkFaint} />
                    </TouchableOpacity>
                </View>

                {/* Support Grid */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Support</Text>
                    <View style={styles.grid}>
                        {SUPPORT_TILES.map((tile) => (
                            <TouchableOpacity
                                key={tile.id}
                                style={styles.gridTile}
                                activeOpacity={0.8}
                                onPress={() => tile.route && router.push(tile.route as any)}
                            >
                                <View style={[styles.tileIconLg, { backgroundColor: tile.bg }]}>
                                    <Ionicons name={tile.icon as any} size={26} color={tile.color} />
                                </View>
                                <Text style={styles.tileLabelCenter}>{tile.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Helpline Banner */}
                <View style={styles.px}>
                    <View style={styles.helplineBanner}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.helplineTitle}>24/7 Helpline</Text>
                            <Text style={styles.helplineNum}>1800-MM-HELP</Text>
                        </View>
                        <TouchableOpacity style={styles.callBtn}>
                            <Ionicons name="call" size={18} color={colors.white} />
                            <Text style={styles.callBtnText}>Call now</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Tickets */}
                {RECENT_TICKETS.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionRow}>
                            <Text style={styles.sectionLabel}>Recent tickets</Text>
                            <TouchableOpacity onPress={() => router.push('/j3-tickets' as any)}>
                                <Text style={styles.seeAll}>See all</Text>
                            </TouchableOpacity>
                        </View>
                        {RECENT_TICKETS.map((ticket) => (
                            <TouchableOpacity
                                key={ticket.id}
                                style={styles.ticketRow}
                                activeOpacity={0.8}
                                onPress={() => router.push('/j3-tickets' as any)}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.ticketSubject} numberOfLines={1}>{ticket.subject}</Text>
                                    <Text style={styles.ticketDate}>{ticket.date}</Text>
                                </View>
                                <View style={[styles.statusTag, { backgroundColor: ticket.statusBg }]}>
                                    <Text style={[styles.statusText, { color: ticket.statusColor }]}>{ticket.status}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Safety Tips */}
                <View style={[styles.section, { marginBottom: 32 }]}>
                    <Text style={styles.sectionLabel}>Safety tips</Text>
                    {[
                        { icon: 'checkmark-circle', tip: "Always verify the driver\u2019s name & vehicle before boarding." },
                        { icon: 'location', tip: 'Share your live trip link with a trusted contact.' },
                        { icon: 'shield-checkmark', tip: 'Use the SOS button if you feel unsafe at any point.' },
                    ].map((item, i) => (
                        <View key={i} style={styles.tipRow}>
                            <Ionicons name={item.icon as any} size={18} color={colors.gold} />
                            <Text style={styles.tipText}>{item.tip}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    header: { paddingHorizontal: spacing.screenPadX, paddingTop: 16, paddingBottom: 12 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: colors.ink },
    px: { paddingHorizontal: spacing.screenPadX, marginBottom: 12 },
    section: { paddingHorizontal: spacing.screenPadX, paddingTop: 20 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionLabel: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 12 },
    seeAll: { fontSize: 12, fontWeight: '700', color: colors.goldDark },

    sosCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.danger + '40',
        borderRadius: radius.card,
        padding: 14,
    },
    sosIconWrap: {
        width: 44,
        height: 44,
        borderRadius: radius.iconSquare,
        backgroundColor: colors.roseTint,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sosTitle: { fontSize: 13, fontWeight: '700', color: colors.ink },
    sosSub: { fontSize: 10, fontWeight: '500', color: colors.inkFaint, marginTop: 2 },

    tripShareCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: colors.surface,
        borderRadius: radius.card,
        padding: 14,
    },
    tileIcon: { width: 40, height: 40, borderRadius: radius.iconSquare, justifyContent: 'center', alignItems: 'center' },
    tileLabel: { fontSize: 13, fontWeight: '700', color: colors.ink },
    tileSub: { fontSize: 10, fontWeight: '500', color: colors.inkFaint, marginTop: 2 },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    gridTile: {
        width: '47%',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: radius.card,
        padding: 16,
        alignItems: 'flex-start',
        gap: 10,
    },
    tileIconLg: { width: 48, height: 48, borderRadius: radius.iconSquare, justifyContent: 'center', alignItems: 'center' },
    tileLabelCenter: { fontSize: 13, fontWeight: '700', color: colors.ink },

    helplineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.navy900,
        borderRadius: radius.card,
        padding: 16,
        gap: 12,
    },
    helplineTitle: { fontSize: 11, fontWeight: '600', color: '#B9C2D4' },
    helplineNum: { fontSize: 18, fontWeight: '800', color: colors.white, marginTop: 2 },
    callBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.gold,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: radius.button,
    },
    callBtnText: { fontSize: 12, fontWeight: '700', color: '#3A2405' },

    ticketRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },
    ticketSubject: { fontSize: 12, fontWeight: '600', color: colors.ink },
    ticketDate: { fontSize: 10, fontWeight: '500', color: colors.inkFaint, marginTop: 2 },
    statusTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    statusText: { fontSize: 9.5, fontWeight: '700' },

    tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
    tipText: { flex: 1, fontSize: 12, fontWeight: '500', color: colors.inkSoft, lineHeight: 18 },
});