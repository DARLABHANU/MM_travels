import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FAQS = [
    { id: 'f1', q: 'How do I cancel a booking?', a: 'Go to My Trips, select the booking, and tap Cancel booking. Refunds are processed within 3–5 business days.', category: 'Bookings' },
    { id: 'f2', q: "What if my driver doesn't arrive?", a: 'Wait 5 minutes, then use Driver Contact. If unresolved, the ride auto-cancels with a full refund.', category: 'Driver' },
    { id: 'f3', q: 'How does KYC verification work?', a: 'Upload your Aadhaar or PAN. Verification usually takes 24 hours.', category: 'Account' },
    { id: 'f4', q: 'Can I book a pool ride for multiple passengers?', a: 'Yes, up to 4 seats per booking. Each seat needs individual passenger details.', category: 'Pool' },
    { id: 'f5', q: 'Is my payment information secure?', a: 'All payment data is tokenized via RBI-compliant gateways. We do not store raw card data.', category: 'Payments' },
    { id: 'f6', q: 'How do I share my live trip?', a: 'During an active trip, tap the Share icon in Live Tracking screen. A tracking link is generated.', category: 'Safety' },
];

const CATEGORIES = ['All', 'Bookings', 'Driver', 'Account', 'Pool', 'Payments', 'Safety'];

export default function FAQScreen() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<string | null>(null);
    const [cat, setCat] = useState('All');

    const filtered = FAQS.filter((f) =>
        (cat === 'All' || f.category === cat) &&
        (query === '' || f.q.toLowerCase().includes(query.toLowerCase()))
    );

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="chevron-back" size={20} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help Centre</Text>
            </View>
            <View style={styles.searchWrap}>
                <Ionicons name="search" size={16} color={colors.inkFaint} />
                <TextInput style={styles.searchInput} placeholder="Search FAQs..." placeholderTextColor={colors.inkFaint} value={query} onChangeText={setQuery} />
                {query.length > 0 && <TouchableOpacity onPress={() => setQuery('')}><Ionicons name="close-circle" size={16} color={colors.inkFaint} /></TouchableOpacity>}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
                {CATEGORIES.map((c) => (
                    <TouchableOpacity key={c} style={[styles.catChip, cat === c && styles.catActive]} onPress={() => setCat(c)} activeOpacity={0.8}>
                        <Text style={[styles.catLabel, cat === c && styles.catLabelActive]}>{c}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
                {filtered.map((faq) => (
                    <TouchableOpacity key={faq.id} style={styles.faqCard} onPress={() => setSelected(selected === faq.id ? null : faq.id)} activeOpacity={0.8}>
                        <View style={styles.faqRow}>
                            <Text style={styles.faqQ}>{faq.q}</Text>
                            <Ionicons name={selected === faq.id ? 'chevron-up' : 'chevron-down'} size={16} color={colors.inkFaint} />
                        </View>
                        {selected === faq.id && <Text style={styles.faqA}>{faq.a}</Text>}
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.ticketCta} onPress={() => router.push('/j3-tickets' as any)}>
                    <Ionicons name="chatbubbles" size={18} color={colors.white} />
                    <Text style={styles.ticketCtaText}>Didn't find your answer? Raise a ticket</Text>
                </TouchableOpacity>
                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.screenPadX, paddingVertical: 14, gap: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
    back: {},
    headerTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
    searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: spacing.screenPadX, backgroundColor: colors.surface, borderRadius: radius.card, paddingHorizontal: 14, paddingVertical: 12 },
    searchInput: { flex: 1, fontSize: 13, fontWeight: '500', color: colors.ink },
    catRow: { paddingHorizontal: spacing.screenPadX, paddingBottom: 12, gap: 8, flexDirection: 'row' },
    catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.surface },
    catActive: { backgroundColor: colors.ink },
    catLabel: { fontSize: 12, fontWeight: '600', color: colors.inkSoft },
    catLabelActive: { color: colors.white },
    list: { paddingHorizontal: spacing.screenPadX, gap: 10 },
    faqCard: { backgroundColor: colors.white, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, padding: 14 },
    faqRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    faqQ: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.ink },
    faqA: { fontSize: 12, fontWeight: '500', color: colors.inkSoft, lineHeight: 18, marginTop: 10 },
    ticketCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.ink, paddingVertical: 14, borderRadius: radius.button, marginTop: 8 },
    ticketCtaText: { fontSize: 13, fontWeight: '700', color: colors.white },
});
