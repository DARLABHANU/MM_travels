import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OTP = '7842'; // mock boarding OTP

export default function BoardingPassScreen() {
    const router = useRouter();
    const { seats, id } = useLocalSearchParams<{ seats: string; id: string }>();
    const seatList = seats ? seats.split(',') : ['2A'];

    return (
        <SafeAreaView style={[styles.safe]} edges={['top', 'bottom']}>
            <LinearGradient colors={[colors.navy800, colors.navy900]} style={styles.header}>
                <Text style={styles.headerTitle}>MM Travels</Text>
                <Text style={styles.headerSub}>Pool Boarding Pass</Text>
            </LinearGradient>

            {/* Ticket Card */}
            <View style={styles.ticket}>
                {/* Top section */}
                <View style={styles.ticketTop}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.ticketLabel}>FROM</Text>
                        <Text style={styles.ticketCity}>Visakhapatnam</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color={colors.inkFaint} />
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={styles.ticketLabel}>TO</Text>
                        <Text style={styles.ticketCity}>Vijayawada</Text>
                    </View>
                </View>

                {/* Divider (zigzag strip) */}
                <View style={styles.ticketDivider}>
                    <View style={styles.divCircleLeft} />
                    <View style={styles.divDash} />
                    <View style={styles.divCircleRight} />
                </View>

                {/* Details */}
                <View style={styles.ticketDetails}>
                    <View style={styles.detailCol}>
                        <Text style={styles.detailLabel}>DATE & TIME</Text>
                        <Text style={styles.detailValue}>25 Aug 2026, 6:00 AM</Text>
                    </View>
                    <View style={styles.detailCol}>
                        <Text style={styles.detailLabel}>SEAT{seatList.length > 1 ? 'S' : ''}</Text>
                        <Text style={styles.detailValue}>{seatList.join(', ')}</Text>
                    </View>
                    <View style={styles.detailCol}>
                        <Text style={styles.detailLabel}>BOOKING REF</Text>
                        <Text style={styles.detailValue}>MMT-2024-{id || '6781'}</Text>
                    </View>
                </View>

                {/* Boarding OTP */}
                <View style={styles.otpWrap}>
                    <Text style={styles.otpLabel}>Boarding OTP</Text>
                    <Text style={styles.otpCode}>{OTP}</Text>
                    <Text style={styles.otpNote}>Show this to the driver when boarding</Text>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.shareBtn} activeOpacity={0.85}>
                    <Ionicons name="share-outline" size={18} color={'#3A2405'} />
                    <Text style={styles.shareBtnText}>Share pass</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')} activeOpacity={0.85}>
                    <Text style={styles.homeBtnText}>Back to home</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface },
    header: { paddingTop: 24, paddingBottom: 28, paddingHorizontal: spacing.screenPadX, alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: colors.gold },
    headerSub: { fontSize: 12, fontWeight: '600', color: '#B9C2D4', marginTop: 4 },

    ticket: {
        marginHorizontal: spacing.screenPadX,
        marginTop: -16,
        backgroundColor: colors.white,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
    },
    ticketTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingBottom: 16,
    },
    ticketLabel: { fontSize: 10, fontWeight: '700', color: colors.inkFaint, letterSpacing: 1 },
    ticketCity: { fontSize: 17, fontWeight: '800', color: colors.ink, marginTop: 3 },

    ticketDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: -1,
    },
    divCircleLeft: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.surface, marginLeft: -10 },
    divDash: { flex: 1, height: 2, borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed', marginHorizontal: 4 },
    divCircleRight: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.surface, marginRight: -10 },

    ticketDetails: { flexDirection: 'row', padding: 20, paddingTop: 14, gap: 10, flexWrap: 'wrap' },
    detailCol: { minWidth: '30%' },
    detailLabel: { fontSize: 9, fontWeight: '700', color: colors.inkFaint, letterSpacing: 0.5 },
    detailValue: { fontSize: 12, fontWeight: '700', color: colors.ink, marginTop: 3 },

    otpWrap: {
        margin: 16,
        backgroundColor: colors.navy900,
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
    },
    otpLabel: { fontSize: 10, fontWeight: '700', color: '#B9C2D4', letterSpacing: 1 },
    otpCode: { fontSize: 40, fontWeight: '800', color: colors.gold, letterSpacing: 8, marginVertical: 4, fontVariant: ['tabular-nums'] },
    otpNote: { fontSize: 10, fontWeight: '500', color: '#B9C2D4' },

    actions: { padding: spacing.screenPadX, gap: 12, marginTop: 20 },
    shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: radius.button },
    shareBtnText: { fontSize: 14, fontWeight: '700', color: '#3A2405' },
    homeBtn: { alignItems: 'center', paddingVertical: 10 },
    homeBtnText: { fontSize: 13, fontWeight: '700', color: colors.inkSoft },
});
