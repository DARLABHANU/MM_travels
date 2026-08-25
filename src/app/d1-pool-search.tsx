import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_ROUTES = [
    { id: 'r1', from: 'Visakhapatnam', to: 'Vijayawada', date: 'Today, 6:00 AM', seats: 3, price: '₹349', duration: '6h 30m', vehicle: 'Tempo Traveller', womenOnly: false, rating: '4.7', stops: 4 },
    { id: 'r2', from: 'Visakhapatnam', to: 'Vijayawada', date: 'Today, 9:00 AM', seats: 1, price: '₹329', duration: '6h 45m', vehicle: 'Innova Crysta', womenOnly: true, rating: '4.9', stops: 3 },
    { id: 'r3', from: 'Visakhapatnam', to: 'Vijayawada', date: 'Today, 12:00 PM', seats: 5, price: '₹299', duration: '7h 00m', vehicle: 'Tempo Traveller', womenOnly: false, rating: '4.6', stops: 5 },
    { id: 'r4', from: 'Visakhapatnam', to: 'Hyderabad', date: 'Today, 7:00 AM', seats: 2, price: '₹499', duration: '9h 30m', vehicle: 'Innova', womenOnly: false, rating: '4.8', stops: 3 },
];

type FilterKey = 'all' | 'women' | 'fast' | 'cheap';

export default function PoolSearchScreen() {
    const router = useRouter();
    const [filter, setFilter] = useState<FilterKey>('all');

    const FILTERS = [
        { key: 'all', label: 'All' },
        { key: 'women', label: '🩷 Women only', icon: 'female' },
        { key: 'fast', label: '⚡ Fastest' },
        { key: 'cheap', label: '💰 Cheapest' },
    ];

    const filtered = filter === 'women' ? MOCK_ROUTES.filter((r) => r.womenOnly) : MOCK_ROUTES;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="chevron-back" size={20} color={colors.ink} />
                </TouchableOpacity>
                <View style={styles.headerTexts}>
                    <Text style={styles.headerTitle}>Pool Rides</Text>
                    <Text style={styles.headerSub}>Vizag → Vijayawada · 1 seat</Text>
                </View>
            </View>

            {/* Filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {FILTERS.map((f) => (
                    <TouchableOpacity
                        key={f.key}
                        style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                        onPress={() => setFilter(f.key as FilterKey)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Results */}
            <FlatList
                data={filtered}
                keyExtractor={(r) => r.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => router.push({ pathname: '/d2-pool-details', params: { id: item.id } })}
                        activeOpacity={0.8}
                    >
                        {item.womenOnly && (
                            <View style={styles.womenBadge}>
                                <Text style={styles.womenBadgeText}>Women only</Text>
                            </View>
                        )}
                        <View style={styles.cardTop}>
                            <View>
                                <View style={styles.routeRow}>
                                    <View style={styles.routeDot} />
                                    <Text style={styles.routeFrom}>{item.from}</Text>
                                </View>
                                <View style={styles.routeLine} />
                                <View style={styles.routeRow}>
                                    <View style={[styles.routeDot, styles.routeDotDest]} />
                                    <Text style={styles.routeTo}>{item.to}</Text>
                                </View>
                            </View>
                            <View style={styles.priceBlock}>
                                <Text style={styles.price}>{item.price}</Text>
                                <Text style={styles.perSeat}>/ seat</Text>
                            </View>
                        </View>
                        <View style={styles.cardMeta}>
                            <MetaTag icon="time" label={item.date} />
                            <MetaTag icon="speedometer" label={item.duration} />
                            <MetaTag icon="star" label={item.rating} />
                            <MetaTag icon="people" label={`${item.seats} left`} color={item.seats === 1 ? colors.danger : undefined} />
                        </View>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

function MetaTag({ icon, label, color }: { icon: string; label: string; color?: string }) {
    return (
        <View style={styles.metaTag}>
            <Ionicons name={icon as any} size={12} color={color || colors.inkSoft} />
            <Text style={[styles.metaLabel, color ? { color } : {}]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.screenPadX, paddingVertical: 14, gap: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
    back: {},
    headerTexts: {},
    headerTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
    headerSub: { fontSize: 11, fontWeight: '500', color: colors.inkFaint, marginTop: 1 },
    filterRow: { paddingHorizontal: spacing.screenPadX, paddingVertical: 12, gap: 8, flexDirection: 'row' },
    filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.surface },
    filterChipActive: { backgroundColor: colors.ink },
    filterText: { fontSize: 12, fontWeight: '600', color: colors.inkSoft },
    filterTextActive: { color: colors.white },
    list: { paddingHorizontal: spacing.screenPadX, paddingBottom: 32 },
    card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, padding: 14 },
    womenBadge: { backgroundColor: colors.roseTint, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 10 },
    womenBadgeText: { fontSize: 9.5, fontWeight: '700', color: colors.rose },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    routeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
    routeDotDest: { backgroundColor: colors.danger },
    routeLine: { width: 1, height: 16, backgroundColor: colors.line, marginLeft: 3.5, marginVertical: 3 },
    routeFrom: { fontSize: 13, fontWeight: '700', color: colors.ink },
    routeTo: { fontSize: 13, fontWeight: '700', color: colors.ink },
    priceBlock: { alignItems: 'flex-end' },
    price: { fontSize: 18, fontWeight: '800', color: colors.ink },
    perSeat: { fontSize: 10, fontWeight: '500', color: colors.inkFaint },
    cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10 },
    metaTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaLabel: { fontSize: 11, fontWeight: '600', color: colors.inkSoft },
});
