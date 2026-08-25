import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Mock user data ───────────────────────────────────────────────────────────
const USER = {
    name: 'Darla Bhanusri',
    initials: 'DB',
    phone: '+91 98765 43210',
    rating: '4.8',
    wallet: '₹240',
    kycStatus: 'Verified' as 'Verified' | 'Pending' | 'Rejected',
};

const STAT_TILES = [
    { label: 'Rating', value: USER.rating, icon: 'star', iconColor: colors.goldDark, bg: colors.amberTint },
    { label: 'Wallet', value: USER.wallet, icon: 'wallet', iconColor: colors.greenInk, bg: colors.greenTint },
    { label: 'KYC', value: USER.kycStatus, icon: 'shield-checkmark', iconColor: colors.blue, bg: colors.blueTint },
];

type SettingsRow = {
    id: string;
    label: string;
    icon: string;
    iconBg: string;
    iconColor: string;
    route?: string;
    danger?: boolean;
};

const SECTIONS: { title: string; rows: SettingsRow[] }[] = [
    {
        title: 'BOOKINGS',
        rows: [
            { id: 'trips', label: 'My trips', icon: 'receipt', iconBg: colors.amberTint, iconColor: colors.goldDark, route: '/(tabs)/trips' },
            { id: 'saved', label: 'Saved places', icon: 'bookmark', iconBg: colors.greenTint, iconColor: colors.greenInk, route: '/k4-saved-places' },
        ],
    },
    {
        title: 'ACCOUNT',
        rows: [
            { id: 'notifications', label: 'Notifications', icon: 'notifications', iconBg: colors.amberTint, iconColor: colors.goldDark, route: '/k6-preferences' },
            { id: 'language', label: 'Language', icon: 'language', iconBg: colors.purpleTint, iconColor: colors.purple, route: '/k6-preferences' },
            { id: 'refer', label: 'Refer and earn', icon: 'gift', iconBg: colors.greenTint, iconColor: colors.greenInk, route: undefined },
        ],
    },
    {
        title: 'SETTINGS',
        rows: [
            { id: 'personal', label: 'Personal info', icon: 'person', iconBg: colors.blueTint, iconColor: colors.blue, route: '/k2-personal-info' },
            { id: 'emergency', label: 'Emergency contacts', icon: 'call', iconBg: colors.roseTint, iconColor: colors.rose, route: '/k3-emergency-contacts' },
            { id: 'kyc', label: 'KYC documents', icon: 'shield-checkmark', iconBg: colors.blueTint, iconColor: colors.blue, route: '/kyc' },
            { id: 'payment', label: 'Payment methods', icon: 'card', iconBg: colors.greenTint, iconColor: colors.greenInk, route: '/k5-payment-methods' },
            { id: 'theme', label: 'Theme', icon: 'moon', iconBg: colors.purpleTint, iconColor: colors.purple, route: '/k6-preferences' },
            { id: 'privacy', label: 'Privacy & terms', icon: 'lock-closed', iconBg: colors.surface, iconColor: colors.inkSoft, route: '/k7-privacy' },
        ],
    },
    {
        title: 'SESSION',
        rows: [
            { id: 'logout', label: 'Log out', icon: 'log-out', iconBg: colors.roseTint, iconColor: colors.danger, danger: true },
        ],
    },
];

function SettingsListRow({ row, isLast }: { row: SettingsRow; isLast: boolean }) {
    const router = useRouter();
    return (
        <TouchableOpacity
            style={[styles.listRow, !isLast && styles.listRowBorder]}
            onPress={() => row.route && router.push(row.route as any)}
            activeOpacity={0.7}
        >
            <View style={[styles.listIcon, { backgroundColor: row.iconBg }]}>
                <Ionicons name={row.icon as any} size={18} color={row.iconColor} />
            </View>
            <Text style={[styles.listLabel, row.danger && { color: colors.danger }]}>{row.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.inkFaint} />
        </TouchableOpacity>
    );
}

export default function ProfileScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Navy Gradient Header */}
                <LinearGradient colors={[colors.navy800, colors.navy900]} style={styles.headerGrad}>
                    {/* Avatar */}
                    <View style={styles.avatarWrap}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarInitials}>{USER.initials}</Text>
                        </View>
                        <TouchableOpacity style={styles.avatarEdit}>
                            <Ionicons name="camera" size={13} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{USER.name}</Text>
                    <Text style={styles.userPhone}>{USER.phone}</Text>
                </LinearGradient>

                {/* Quick-stat tiles (overlap header) */}
                <View style={styles.statRow}>
                    {STAT_TILES.map((tile) => (
                        <View key={tile.label} style={styles.statTile}>
                            <View style={[styles.statIcon, { backgroundColor: tile.bg }]}>
                                <Ionicons name={tile.icon as any} size={18} color={tile.iconColor} />
                            </View>
                            <Text style={styles.statValue}>{tile.value}</Text>
                            <Text style={styles.statLabel}>{tile.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Settings Sections */}
                <View style={styles.sectionsWrap}>
                    {SECTIONS.map((section) => (
                        <View key={section.title} style={styles.sectionBlock}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            <View style={styles.listCard}>
                                {section.rows.map((row, i) => (
                                    <SettingsListRow key={row.id} row={row} isLast={i === section.rows.length - 1} />
                                ))}
                            </View>
                        </View>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface },

    headerGrad: {
        paddingTop: 24,
        paddingBottom: 50,
        paddingHorizontal: spacing.screenPadX,
        alignItems: 'center',
    },
    avatarWrap: { position: 'relative', marginBottom: 12 },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.gold,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    avatarInitials: { fontSize: 24, fontWeight: '800', color: '#3A2405' },
    avatarEdit: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.goldDark,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.navy900,
    },
    userName: { fontSize: 16, fontWeight: '800', color: colors.white, marginBottom: 3 },
    userPhone: { fontSize: 12, fontWeight: '500', color: '#B9C2D4' },

    statRow: {
        flexDirection: 'row',
        marginHorizontal: spacing.screenPadX,
        marginTop: -28,
        gap: 10,
        marginBottom: 20,
    },
    statTile: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: radius.card,
        padding: 10,
        alignItems: 'center',
        gap: 4,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    statIcon: { width: 36, height: 36, borderRadius: radius.iconSquare, justifyContent: 'center', alignItems: 'center' },
    statValue: { fontSize: 13, fontWeight: '800', color: colors.ink },
    statLabel: { fontSize: 8.5, fontWeight: '700', color: colors.inkFaint },

    sectionsWrap: { paddingHorizontal: spacing.screenPadX, gap: 16 },
    sectionBlock: {},
    sectionTitle: {
        fontSize: 10.5,
        fontWeight: '700',
        color: colors.inkFaint,
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    listCard: {
        backgroundColor: colors.white,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.line,
        overflow: 'hidden',
    },
    listRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 13,
    },
    listRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
    listIcon: { width: 34, height: 34, borderRadius: radius.iconSquare, justifyContent: 'center', alignItems: 'center' },
    listLabel: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.ink },
});