import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STOPS = [
    { name: 'Visakhapatnam — VUDA Colony Pickup', time: '6:00 AM', type: 'pickup' },
    { name: 'Anakapalli', time: '7:10 AM', type: 'stop' },
    { name: 'Tuni', time: '8:30 AM', type: 'stop' },
    { name: 'Rajahmundry', time: '10:00 AM', type: 'stop' },
    { name: 'Eluru', time: '11:15 AM', type: 'stop' },
    { name: 'Vijayawada — Benz Circle Drop', time: '12:30 PM', type: 'drop' },
];

export default function PoolDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="chevron-back" size={20} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Route details</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <View>
                            <Text style={styles.summaryRoute}>Vizag → Vijayawada</Text>
                            <Text style={styles.summaryMeta}>Today, 6:00 AM · 6h 30m · Tempo Traveller</Text>
                        </View>
                        <View style={styles.priceBlock}>
                            <Text style={styles.price}>₹349</Text>
                            <Text style={styles.perSeat}>/ seat</Text>
                        </View>
                    </View>
                    <View style={styles.metaRow}>
                        <View style={styles.metaTag}><Ionicons name="star" size={12} color={colors.goldDark} /><Text style={styles.metaText}>4.7</Text></View>
                        <View style={styles.metaTag}><Ionicons name="people" size={12} color={colors.inkSoft} /><Text style={styles.metaText}>3 seats left</Text></View>
                        <View style={styles.metaTag}><Ionicons name="map" size={12} color={colors.inkSoft} /><Text style={styles.metaText}>4 stops</Text></View>
                    </View>
                </View>

                {/* Stop Timeline */}
                <Text style={styles.sectionLabel}>Stop timeline</Text>
                <View style={styles.timelineWrap}>
                    {STOPS.map((stop, i) => (
                        <View key={i} style={styles.timelineRow}>
                            <View style={styles.timelineLeft}>
                                <View style={[
                                    styles.timelineDot,
                                    stop.type === 'pickup' && styles.dotPickup,
                                    stop.type === 'drop' && styles.dotDrop,
                                ]} />
                                {i < STOPS.length - 1 && <View style={styles.timelineLine} />}
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.stopName}>{stop.name}</Text>
                                <Text style={styles.stopTime}>{stop.time}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Vehicle info */}
                <View style={styles.vehicleCard}>
                    <View style={[styles.vehicleIcon, { backgroundColor: colors.amberTint }]}>
                        <Ionicons name="bus" size={22} color={colors.goldDark} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.vehicleName}>Tempo Traveller 12-seater</Text>
                        <Text style={styles.vehicleSub}>TS16 KU 2345 · Air-conditioned</Text>
                    </View>
                </View>

                {/* Pickup/drop policy note */}
                <View style={styles.policyNote}>
                    <Ionicons name="information-circle" size={16} color={colors.blue} />
                    <Text style={styles.policyText}>Board from your nearest stop. You may board and exit only at designated locations.</Text>
                </View>

                {/* Bottom CTA */}
                <TouchableOpacity
                    style={styles.seatBtn}
                    onPress={() => router.push({ pathname: '/d3-pool-seat-map', params: { id } })}
                    activeOpacity={0.85}
                >
                    <Text style={styles.seatBtnText}>Select seats</Text>
                    <Ionicons name="arrow-forward" size={18} color={'#3A2405'} />
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
    content: { padding: spacing.screenPadX, gap: 14 },

    summaryCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, padding: 14 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    summaryRoute: { fontSize: 14, fontWeight: '700', color: colors.ink },
    summaryMeta: { fontSize: 11, fontWeight: '500', color: colors.inkSoft, marginTop: 2 },
    priceBlock: { alignItems: 'flex-end' },
    price: { fontSize: 22, fontWeight: '800', color: colors.ink },
    perSeat: { fontSize: 10, fontWeight: '500', color: colors.inkFaint },
    metaRow: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10 },
    metaTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 11, fontWeight: '600', color: colors.inkSoft },

    sectionLabel: { fontSize: 14, fontWeight: '700', color: colors.ink, marginTop: 4 },

    timelineWrap: {},
    timelineRow: { flexDirection: 'row', gap: 12 },
    timelineLeft: { width: 24, alignItems: 'center' },
    timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.occupiedGrey, marginTop: 3 },
    dotPickup: { backgroundColor: colors.green },
    dotDrop: { backgroundColor: colors.danger },
    timelineLine: { width: 2, flex: 1, backgroundColor: colors.line, marginVertical: 3 },
    timelineContent: { flex: 1, paddingBottom: 16 },
    stopName: { fontSize: 12, fontWeight: '600', color: colors.ink },
    stopTime: { fontSize: 10, fontWeight: '500', color: colors.inkFaint, marginTop: 2 },

    vehicleCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.card, padding: 14 },
    vehicleIcon: { width: 44, height: 44, borderRadius: radius.iconSquare, justifyContent: 'center', alignItems: 'center' },
    vehicleName: { fontSize: 13, fontWeight: '700', color: colors.ink },
    vehicleSub: { fontSize: 11, fontWeight: '500', color: colors.inkFaint, marginTop: 2 },

    policyNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: colors.blueTint, borderRadius: 10, padding: 12 },
    policyText: { flex: 1, fontSize: 11, fontWeight: '500', color: colors.blue, lineHeight: 16 },

    seatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.gold, paddingVertical: 15, borderRadius: radius.button },
    seatBtnText: { fontSize: 14, fontWeight: '700', color: '#3A2405' },
});
