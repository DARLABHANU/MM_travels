import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SessionRecoveryScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.iconCircle}>
                    <Ionicons name="lock-closed" size={48} color={colors.goldDark} />
                </View>
                <Text style={styles.title}>Session Locked</Text>
                <Text style={styles.subtitle}>For your security, we lock your session after 30 days of inactivity. Please verify it's you to continue.</Text>

                <View style={styles.profileBox}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarInit}>DB</Text>
                    </View>
                    <View style={styles.profileText}>
                        <Text style={styles.name}>Darla Bhanusri</Text>
                        <Text style={styles.phone}>+91 94405 *****</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/otp')} activeOpacity={0.85}>
                    <Text style={styles.primaryBtnText}>Send Verify OTP</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/mobile-number')} activeOpacity={0.85}>
                    <Text style={styles.secondaryBtnText}>Switch account</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    content: { flexGrow: 1, padding: spacing.screenPadX, justifyContent: 'center', alignItems: 'center' },
    iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.amberTint, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '800', color: colors.ink, marginBottom: 12 },
    subtitle: { fontSize: 13, fontWeight: '500', color: colors.inkSoft, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20, marginBottom: 32 },

    profileBox: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, padding: 16, borderRadius: radius.card, width: '100%' },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.gold, justifyContent: 'center', alignItems: 'center' },
    avatarInit: { fontSize: 16, fontWeight: '800', color: '#3A2405' },
    profileText: { flex: 1 },
    name: { fontSize: 15, fontWeight: '700', color: colors.ink },
    phone: { fontSize: 13, fontWeight: '500', color: colors.inkFaint, marginTop: 2 },

    footer: { padding: spacing.screenPadX, gap: 12, paddingBottom: 32 },
    primaryBtn: { backgroundColor: colors.ink, paddingVertical: 16, borderRadius: radius.button, alignItems: 'center' },
    primaryBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
    secondaryBtn: { alignItems: 'center', paddingVertical: 12 },
    secondaryBtnText: { fontSize: 14, fontWeight: '700', color: colors.inkSoft },
});
