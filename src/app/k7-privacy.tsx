import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LEGAL_LINKS = [
    { id: 'privacy', label: 'Privacy Policy', icon: 'shield' },
    { id: 'terms', label: 'Terms of Service', icon: 'document-text' },
    { id: 'data', label: 'Data & permissions', icon: 'information-circle' },
];

export default function PrivacyScreen() {
    const router = useRouter();
    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="chevron-back" size={20} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy & terms</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.listCard}>
                    {LEGAL_LINKS.map((link, i) => (
                        <TouchableOpacity key={link.id} style={[styles.row, i < LEGAL_LINKS.length - 1 && styles.rowBorder]} activeOpacity={0.8}>
                            <View style={[styles.icon, { backgroundColor: colors.surface }]}>
                                <Ionicons name={link.icon as any} size={18} color={colors.inkSoft} />
                            </View>
                            <Text style={styles.rowLabel}>{link.label}</Text>
                            <Ionicons name="chevron-forward" size={16} color={colors.inkFaint} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Danger zone */}
                <View style={styles.dangerZone}>
                    <TouchableOpacity style={styles.deleteRow} onPress={() => router.push('/a9-logout' as any)} activeOpacity={0.8}>
                        <Text style={styles.deleteText}>Delete my account</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.danger} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.note}>
                    MM Travels collects only the data necessary to provide the service. We do not sell your data to third parties. For data deletion requests, use "Delete my account" above.
                </Text>
                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.screenPadX, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
    back: { marginRight: 10 },
    headerTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
    content: { padding: spacing.screenPadX, gap: 16 },
    listCard: { backgroundColor: colors.white, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
    icon: { width: 36, height: 36, borderRadius: radius.iconSquare, justifyContent: 'center', alignItems: 'center' },
    rowLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.ink },
    dangerZone: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 16, marginTop: 4 },
    deleteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
    deleteText: { fontSize: 13, fontWeight: '700', color: colors.danger },
    note: { fontSize: 11, fontWeight: '500', color: colors.inkFaint, lineHeight: 17, textAlign: 'center' },
});
