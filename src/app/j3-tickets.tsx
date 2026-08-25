import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_TICKETS = [
    { id: 't1', subject: 'Driver did not arrive at pickup', status: 'In Progress', date: '23 Aug 2026', statusBg: colors.blueTint, statusColor: colors.blue },
    { id: 't2', subject: 'Wrong fare charged for my trip', status: 'Resolved', date: '18 Aug 2026', statusBg: colors.greenTint, statusColor: colors.greenInk },
    { id: 't3', subject: 'App crashed during booking', status: 'Closed', date: '10 Aug 2026', statusBg: colors.surface, statusColor: colors.inkFaint },
];

const CATEGORIES = ['General', 'Booking issue', 'Payment', 'Driver complaint', 'Safety', 'App bug', 'Other'];

export default function SupportTicketScreen() {
    const router = useRouter();
    const [tab, setTab] = useState<'tickets' | 'new'>('tickets');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('General');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (subject && description) { setSubmitted(true); setTimeout(() => { setTab('tickets'); setSubmitted(false); setSubject(''); setDescription(''); }, 1200); }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="chevron-back" size={20} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Support</Text>
            </View>

            {/* Tab bar */}
            <View style={styles.tabBar}>
                <TouchableOpacity style={[styles.tabBtn, tab === 'tickets' && styles.tabBtnActive]} onPress={() => setTab('tickets')} activeOpacity={0.8}>
                    <Text style={[styles.tabLabel, tab === 'tickets' && styles.tabLabelActive]}>My tickets</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tabBtn, tab === 'new' && styles.tabBtnActive]} onPress={() => setTab('new')} activeOpacity={0.8}>
                    <Text style={[styles.tabLabel, tab === 'new' && styles.tabLabelActive]}>New ticket</Text>
                </TouchableOpacity>
            </View>

            {tab === 'tickets' ? (
                <FlatList
                    data={MOCK_TICKETS}
                    keyExtractor={(t) => t.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.ticketCard} activeOpacity={0.8}>
                            <View style={styles.ticketBody}>
                                <Text style={styles.ticketSubject} numberOfLines={2}>{item.subject}</Text>
                                <Text style={styles.ticketDate}>{item.date}</Text>
                            </View>
                            <View style={[styles.statusTag, { backgroundColor: item.statusBg }]}>
                                <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyWrap}>
                            <Ionicons name="document-text-outline" size={32} color={colors.inkFaint} />
                            <Text style={styles.emptyText}>No tickets yet</Text>
                        </View>
                    )}
                />
            ) : (
                <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
                    {submitted ? (
                        <View style={styles.successWrap}>
                            <Ionicons name="checkmark-circle" size={48} color={colors.green} />
                            <Text style={styles.successTitle}>Ticket raised!</Text>
                            <Text style={styles.successSub}>Our team will get back to you within 24 hours.</Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.formLabel}>CATEGORY</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
                                {CATEGORIES.map((c) => (
                                    <TouchableOpacity key={c} style={[styles.catChip, category === c && styles.catActive]} onPress={() => setCategory(c)} activeOpacity={0.8}>
                                        <Text style={[styles.catLabel, category === c && styles.catLabelActive]}>{c}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <Text style={styles.formLabel}>SUBJECT</Text>
                            <TextInput style={styles.input} placeholder="Briefly describe your issue" placeholderTextColor={colors.inkFaint} value={subject} onChangeText={setSubject} />
                            <Text style={styles.formLabel}>DESCRIPTION</Text>
                            <TextInput style={[styles.input, styles.textArea]} placeholder="Provide as much detail as possible..." placeholderTextColor={colors.inkFaint} value={description} onChangeText={setDescription} multiline numberOfLines={5} textAlignVertical="top" />
                            <TouchableOpacity style={[styles.submitBtn, (!subject || !description) && styles.submitDisabled]} onPress={handleSubmit} disabled={!subject || !description} activeOpacity={0.85}>
                                <Text style={styles.submitText}>Submit ticket</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    <View style={{ height: 32 }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.screenPadX, paddingVertical: 14, gap: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
    back: {},
    headerTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
    tabBar: { flexDirection: 'row', paddingHorizontal: spacing.screenPadX, paddingTop: 14, gap: 10 },
    tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center' },
    tabBtnActive: { backgroundColor: colors.ink },
    tabLabel: { fontSize: 13, fontWeight: '700', color: colors.inkSoft },
    tabLabelActive: { color: colors.white },
    list: { padding: spacing.screenPadX, gap: 10 },
    ticketCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, padding: 14 },
    ticketBody: { flex: 1 },
    ticketSubject: { fontSize: 13, fontWeight: '600', color: colors.ink },
    ticketDate: { fontSize: 10, fontWeight: '500', color: colors.inkFaint, marginTop: 3 },
    statusTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    statusText: { fontSize: 9.5, fontWeight: '700' },
    emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 8 },
    emptyText: { fontSize: 12, fontWeight: '600', color: colors.inkFaint },
    form: { padding: spacing.screenPadX, gap: 12 },
    formLabel: { fontSize: 10.5, fontWeight: '700', color: colors.inkFaint, letterSpacing: 0.5 },
    catRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
    catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.surface },
    catActive: { backgroundColor: colors.ink },
    catLabel: { fontSize: 12, fontWeight: '600', color: colors.inkSoft },
    catLabelActive: { color: colors.white },
    input: { backgroundColor: colors.surface, borderRadius: radius.card, paddingHorizontal: 14, paddingVertical: 13, fontSize: 13, fontWeight: '500', color: colors.ink },
    textArea: { minHeight: 110 },
    submitBtn: { backgroundColor: colors.gold, paddingVertical: 15, borderRadius: radius.button, alignItems: 'center' },
    submitDisabled: { opacity: 0.4 },
    submitText: { fontSize: 14, fontWeight: '700', color: '#3A2405' },
    successWrap: { alignItems: 'center', paddingTop: 60, gap: 10 },
    successTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
    successSub: { fontSize: 12, fontWeight: '500', color: colors.inkSoft, textAlign: 'center' },
});
