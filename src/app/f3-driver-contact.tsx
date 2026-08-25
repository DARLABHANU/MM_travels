import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// F3 — Driver Contact Sheet (renders as a bottom sheet / modal)
export default function DriverContactScreen() {
    const router = useRouter();
    return (
        <View style={styles.overlay}>
            <TouchableOpacity style={styles.scrim} onPress={() => router.back()} />
            <View style={styles.sheet}>
                <View style={styles.handle} />

                {/* Driver identity */}
                <View style={styles.driverRow}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>RK</Text>
                    </View>
                    <View>
                        <Text style={styles.driverName}>Ramesh K.</Text>
                        <Text style={styles.driverMeta}>★ 4.9 · Swift Dzire · TS09 AB 4521</Text>
                    </View>
                </View>

                {/* Action Grid */}
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionTile} activeOpacity={0.8}>
                        <View style={styles.actionIcon}>
                            <Ionicons name="call" size={28} color={colors.white} />
                        </View>
                        <Text style={styles.actionLabel}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionTile, styles.actionTileLight]} activeOpacity={0.8}>
                        <View style={[styles.actionIcon, styles.actionIconLight]}>
                            <Ionicons name="chatbubbles" size={28} color={colors.ink} />
                        </View>
                        <Text style={styles.actionLabel}>Message</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.privacyNote}>
                    Your number stays private — calls are routed securely.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(16,27,48,0.4)' },
    sheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingHorizontal: spacing.screenPadX,
        paddingBottom: 32,
    },
    handle: { width: 34, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: 'center', marginTop: 14, marginBottom: 24 },
    driverRow: { flexDirection: 'row', alignItems: 'center', gap: 14, justifyContent: 'center', marginBottom: 28 },
    avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.navy900, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 18, fontWeight: '800', color: colors.white },
    driverName: { fontSize: 14, fontWeight: '700', color: colors.ink, textAlign: 'center' },
    driverMeta: { fontSize: 11, fontWeight: '500', color: colors.inkSoft, marginTop: 2 },
    actionGrid: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginBottom: 20 },
    actionTile: { alignItems: 'center', gap: 8, width: 100 },
    actionTileLight: {},
    actionIcon: {
        width: 80,
        height: 80,
        borderRadius: radius.card,
        backgroundColor: colors.ink,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionIconLight: { backgroundColor: colors.surface },
    actionLabel: { fontSize: 12, fontWeight: '700', color: colors.ink },
    privacyNote: { fontSize: 10, fontWeight: '500', color: colors.inkFaint, textAlign: 'center' },
});
