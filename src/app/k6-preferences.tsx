import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ThemeOption = 'Light' | 'Dark' | 'System';

const LANG_OPTIONS = ['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada'];
const NOTIF_CHANNELS = [
    { id: 'push', label: 'Push notifications', sub: 'Booking updates, driver alerts' },
    { id: 'sms', label: 'SMS', sub: 'OTPs and critical alerts' },
    { id: 'email', label: 'Email', sub: 'Invoices, offers' },
    { id: 'inapp', label: 'In-app', sub: 'Promotions, reminders' },
];

export default function PreferencesScreen() {
    const router = useRouter();
    const [theme, setTheme] = useState<ThemeOption>('System');
    const [lang, setLang] = useState('English');
    const [notifs, setNotifs] = useState<Record<string, boolean>>({ push: true, sms: true, email: false, inapp: true });

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="chevron-back" size={20} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Preferences</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

                {/* Theme */}
                <Text style={styles.sectionLabel}>THEME</Text>
                <View style={styles.themeRow}>
                    {(['Light', 'Dark', 'System'] as ThemeOption[]).map((opt) => (
                        <TouchableOpacity
                            key={opt}
                            style={[styles.themeTab, theme === opt && styles.themeTabActive]}
                            onPress={() => setTheme(opt)}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={opt === 'Light' ? 'sunny' : opt === 'Dark' ? 'moon' : 'phone-portrait'}
                                size={16}
                                color={theme === opt ? colors.white : colors.inkSoft}
                            />
                            <Text style={[styles.themeTabLabel, theme === opt && styles.themeTabLabelActive]}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Language */}
                <Text style={styles.sectionLabel}>LANGUAGE</Text>
                <View style={styles.listCard}>
                    {LANG_OPTIONS.map((l, i) => (
                        <TouchableOpacity
                            key={l}
                            style={[styles.langRow, i < LANG_OPTIONS.length - 1 && styles.rowBorder]}
                            onPress={() => setLang(l)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.langText}>{l}</Text>
                            {lang === l && <Ionicons name="checkmark-circle" size={20} color={colors.gold} />}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Notifications */}
                <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
                <View style={styles.listCard}>
                    {NOTIF_CHANNELS.map((ch, i) => (
                        <View key={ch.id} style={[styles.notifRow, i < NOTIF_CHANNELS.length - 1 && styles.rowBorder]}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.notifLabel}>{ch.label}</Text>
                                <Text style={styles.notifSub}>{ch.sub}</Text>
                            </View>
                            <Switch
                                value={notifs[ch.id]}
                                onValueChange={(v) => setNotifs((prev) => ({ ...prev, [ch.id]: v }))}
                                trackColor={{ false: colors.occupiedGrey, true: colors.gold }}
                                thumbColor={colors.white}
                            />
                        </View>
                    ))}
                </View>

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
    content: { padding: spacing.screenPadX, gap: 12 },
    sectionLabel: { fontSize: 10.5, fontWeight: '700', color: colors.inkFaint, letterSpacing: 0.5, marginTop: 8 },
    themeRow: { flexDirection: 'row', gap: 8 },
    themeTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: radius.button, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
    themeTabActive: { backgroundColor: colors.ink, borderColor: colors.ink },
    themeTabLabel: { fontSize: 12, fontWeight: '700', color: colors.inkSoft },
    themeTabLabelActive: { color: colors.white },
    listCard: { backgroundColor: colors.white, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
    langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 14 },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
    langText: { fontSize: 13, fontWeight: '600', color: colors.ink },
    notifRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14 },
    notifLabel: { fontSize: 13, fontWeight: '600', color: colors.ink },
    notifSub: { fontSize: 10, fontWeight: '500', color: colors.inkFaint, marginTop: 2 },
});
