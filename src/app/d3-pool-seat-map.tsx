import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SeatState = 'available' | 'occupied' | 'women_only' | 'selected';

// 3 rows × 4 seats (2+aisle+2), plus driver seat
const SEAT_LAYOUT: { id: string; state: SeatState }[][] = [
    [
        { id: '1A', state: 'occupied' },
        { id: '1B', state: 'available' },
        { id: '1C', state: 'women_only' },
        { id: '1D', state: 'available' },
    ],
    [
        { id: '2A', state: 'available' },
        { id: '2B', state: 'occupied' },
        { id: '2C', state: 'available' },
        { id: '2D', state: 'women_only' },
    ],
    [
        { id: '3A', state: 'available' },
        { id: '3B', state: 'available' },
        { id: '3C', state: 'occupied' },
        { id: '3D', state: 'occupied' },
    ],
];

function seatBg(state: SeatState, selected: boolean) {
    if (selected) return colors.gold;
    if (state === 'occupied') return colors.occupiedGrey;
    if (state === 'women_only') return colors.roseTint;
    return colors.greenTint;
}

function seatBorder(state: SeatState, selected: boolean) {
    if (selected) return colors.goldDark;
    if (state === 'occupied') return colors.occupiedGrey;
    if (state === 'women_only') return colors.rose;
    return colors.green;
}

export default function PoolSeatMapScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [selected, setSelected] = useState<string[]>([]);

    const toggle = (seatId: string, state: SeatState) => {
        if (state === 'occupied') return;
        setSelected((prev) =>
            prev.includes(seatId) ? prev.filter((s) => s !== seatId) : prev.length < 4 ? [...prev, seatId] : prev
        );
    };

    const totalFare = selected.length * 349;

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="chevron-back" size={20} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Choose seats</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Vehicle outline */}
                <View style={styles.vehicleOutline}>
                    {/* Driver */}
                    <View style={styles.driverRow}>
                        <View style={styles.driverSeat}>
                            <Ionicons name="person" size={14} color={colors.inkSoft} />
                            <Text style={styles.driverLabel}>Driver</Text>
                        </View>
                    </View>

                    {/* Seat rows */}
                    {SEAT_LAYOUT.map((row, ri) => (
                        <View key={ri} style={styles.seatRow}>
                            {row.map((seat, si) => {
                                const isSelected = selected.includes(seat.id);
                                return (
                                    <TouchableOpacity
                                        key={seat.id}
                                        style={[
                                            styles.seat,
                                            { backgroundColor: seatBg(seat.state, isSelected), borderColor: seatBorder(seat.state, isSelected) },
                                            si === 1 && { marginRight: 20 }, // aisle gap
                                        ]}
                                        onPress={() => toggle(seat.id, seat.state)}
                                        disabled={seat.state === 'occupied'}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.seatLabel, isSelected && { color: '#3A2405' }]}>{seat.id}</Text>
                                        {seat.state === 'women_only' && !isSelected && (
                                            <Ionicons name="female" size={10} color={colors.rose} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </View>

                {/* Legend */}
                <View style={styles.legend}>
                    {[
                        { color: colors.greenTint, label: 'Available', border: colors.green },
                        { color: colors.gold, label: 'Selected', border: colors.goldDark },
                        { color: colors.roseTint, label: 'Women-only', border: colors.rose },
                        { color: colors.occupiedGrey, label: 'Occupied', border: colors.occupiedGrey },
                    ].map((item) => (
                        <View key={item.label} style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: item.color, borderColor: item.border }]} />
                            <Text style={styles.legendLabel}>{item.label}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Fixed Bottom Bar */}
            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.selectedCount}>{selected.length > 0 ? `${selected.length} seat${selected.length > 1 ? 's' : ''} · ${selected.join(', ')}` : 'No seats selected'}</Text>
                    {selected.length > 0 && <Text style={styles.totalFare}>Total ₹{totalFare}</Text>}
                </View>
                <TouchableOpacity
                    style={[styles.continueBtn, selected.length === 0 && styles.continueBtnDisabled]}
                    disabled={selected.length === 0}
                    onPress={() => router.push({ pathname: '/d4-pool-checkout', params: { seats: selected.join(','), id } })}
                    activeOpacity={0.85}
                >
                    <Text style={styles.continueBtnText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.screenPadX, paddingVertical: 14, gap: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
    back: {},
    headerTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
    content: { padding: spacing.screenPadX, alignItems: 'center', gap: 20 },

    vehicleOutline: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: colors.line,
        padding: 20,
        alignSelf: 'stretch',
        gap: 14,
    },
    driverRow: { alignItems: 'flex-end' },
    driverSeat: {
        width: 56,
        height: 56,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.line,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
    },
    driverLabel: { fontSize: 9, fontWeight: '600', color: colors.inkFaint },
    seatRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
    seat: {
        width: 56,
        height: 56,
        borderRadius: radius.seatCell,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
    },
    seatLabel: { fontSize: 11, fontWeight: '700', color: colors.ink },

    legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 12, height: 12, borderRadius: 3, borderWidth: 1.5 },
    legendLabel: { fontSize: 10, fontWeight: '600', color: colors.inkSoft },

    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.line,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.screenPadX,
        paddingVertical: 14,
        paddingBottom: 24,
    },
    selectedCount: { fontSize: 12, fontWeight: '700', color: colors.ink },
    totalFare: { fontSize: 18, fontWeight: '800', color: colors.ink, marginTop: 2 },
    continueBtn: { backgroundColor: colors.gold, paddingHorizontal: 22, paddingVertical: 13, borderRadius: radius.button },
    continueBtnDisabled: { opacity: 0.4 },
    continueBtnText: { fontSize: 14, fontWeight: '700', color: '#3A2405' },
});
