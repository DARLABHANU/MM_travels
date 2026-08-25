import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LogoutScreen() {
    const router = useRouter();
    const [confirmed, setConfirmed] = useState(false);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="close" size={24} color={colors.ink} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.iconBox}>
                    <Ionicons name="warning" size={32} color={colors.danger} />
                </View>
                <Text style={styles.title}>Delete Account?</Text>
                <Text style={styles.subtitle}>Are you sure you want to delete your account? This action cannot be undone and you will lose all your booking history, saved places, and loyalty points.</Text>

                <View style={styles.warnCard}>
                    <Ionicons name="information-circle" size={20} color={colors.danger} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.warnTitle}>Active bookings</Text>
                        <Text style={styles.warnDesc}>You have no active bookings. Account deletion will proceed immediately.</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setConfirmed(!confirmed)}
                    activeOpacity={0.8}
                >
                    <View style={[styles.checkbox, confirmed && styles.checkboxActive]}>
                        {confirmed && <Ionicons name="checkmark" size={14} color={colors.white} />}
                    </View>
                    <Text style={styles.checkboxLabel}>I understand that this action is permanent and my data will be erased according to the privacy policy.</Text>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} activeOpacity={0.8}>
                    <Text style={styles.cancelBtnText}>Keep Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.deleteBtn, !confirmed && styles.deleteBtnDisabled]}
                    disabled={!confirmed}
                    onPress={() => router.replace('/')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.deleteBtnText}>Delete Forever</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    header: { padding: spacing.screenPadX, alignItems: 'flex-start' },
    back: {},
    content: { padding: spacing.screenPadX, gap: 16 },
    iconBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: colors.roseTint, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    title: { fontSize: 24, fontWeight: '800', color: colors.ink },
    subtitle: { fontSize: 13, fontWeight: '500', color: colors.inkSoft, lineHeight: 20 },

    warnCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: colors.surface, padding: 14, borderRadius: radius.card, marginTop: 12 },
    warnTitle: { fontSize: 13, fontWeight: '700', color: colors.ink },
    warnDesc: { fontSize: 12, fontWeight: '500', color: colors.inkSoft, marginTop: 4, lineHeight: 16 },

    checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 20 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.inkFaint, justifyContent: 'center', alignItems: 'center' },
    checkboxActive: { backgroundColor: colors.danger, borderColor: colors.danger },
    checkboxLabel: { flex: 1, fontSize: 12, fontWeight: '500', color: colors.inkFaint, lineHeight: 18 },

    footer: { padding: spacing.screenPadX, paddingBottom: 32, gap: 12 },
    cancelBtn: { paddingVertical: 16, borderRadius: radius.button, alignItems: 'center', backgroundColor: colors.surface },
    cancelBtnText: { fontSize: 15, fontWeight: '700', color: colors.ink },
    deleteBtn: { backgroundColor: colors.danger, paddingVertical: 16, borderRadius: radius.button, alignItems: 'center' },
    deleteBtnDisabled: { opacity: 0.4 },
    deleteBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
});
