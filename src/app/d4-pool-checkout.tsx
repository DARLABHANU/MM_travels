import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PoolCheckoutScreen() {
    const router = useRouter();
    const { seats, id } = useLocalSearchParams<{ seats: string; id: string }>();
    const seatList = seats ? seats.split(',') : ['2A'];
    const pricePerSeat = 349;
    const total = seatList.length * pricePerSeat;

    const PAYMENT_OPTIONS = [
        { id: 'upi', label: 'UPI — darla@okaxis', icon: 'phone-portrait', iconColor: colors.greenInk, iconBg: colors.greenTint },
        { id: 'card', label: 'Card •••• 4412', icon: 'card', iconColor: colors.blue, iconBg: colors.blueTint },
        { id: 'cash', label: 'Cash on board', icon: 'cash', iconColor: colors.goldDark, iconBg: colors.amberTint },
    ];

    const [payMethod, setPayMethod] = useState('upi');

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="chevron-back" size={20} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Booking summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryRoute}>Visakhapatnam → Vijayawada</Text>
                    <Text style={styles.summaryMeta}>Today, 6:00 AM · Seats: {seatList.join(', ')}</Text>
                    <View style={styles.summaryDivider} />
                    <View style={styles.fareRow}>
                        <Text style={styles.fareLabel}>{seatList.length} seat × ₹{pricePerSeat}</Text>
                        <Text style={styles.fareAmt}>₹{total}</Text>
                    </View>
                    <View style={styles.fareRow}>
                        <Text style={styles.fareLabel}>Platform fee</Text>
                        <Text style={styles.fareAmt}>₹10</Text>
                    </View>
                    <View style={styles.fareRow}>
                        <Text style={[styles.fareLabel, { fontWeight: '800', color: colors.ink }]}>Total</Text>
                        <Text style={[styles.fareAmt, { fontSize: 18, fontWeight: '800' }]}>₹{total + 10}</Text>
                    </View>
                </View>

                {/* Passenger details for each seat */}
                {seatList.map((seat, i) => (
                    <View key={seat} style={styles.passengerCard}>
                        <Text style={styles.passengerLabel}>Passenger {i + 1} — Seat {seat}</Text>
                        <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={colors.inkFaint} />
                        <TextInput style={styles.input} placeholder="Age" placeholderTextColor={colors.inkFaint} keyboardType="number-pad" />
                        <View style={styles.genderRow}>
                            {['Male', 'Female', 'Other'].map((g) => (
                                <TouchableOpacity key={g} style={styles.genderChip}><Text style={styles.genderText}>{g}</Text></TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Payment picker */}
                <Text style={styles.sectionLabel}>PAYMENT METHOD</Text>
                <View style={styles.paymentCard}>
                    {PAYMENT_OPTIONS.map((opt, i) => (
                        <TouchableOpacity key={opt.id} style={[styles.payRow, i < PAYMENT_OPTIONS.length - 1 && styles.payBorder]} onPress={() => setPayMethod(opt.id)} activeOpacity={0.8}>
                            <View style={[styles.payIcon, { backgroundColor: opt.iconBg }]}>
                                <Ionicons name={opt.icon as any} size={16} color={opt.iconColor} />
                            </View>
                            <Text style={styles.payLabel}>{opt.label}</Text>
                            <View style={[styles.radio, payMethod === opt.id && styles.radioActive]}>
                                {payMethod === opt.id && <View style={styles.radioDot} />}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.payBtn}
                    onPress={() => router.push({ pathname: '/d5-boarding-pass', params: { id, seats } })}
                    activeOpacity={0.85}
                >
                    <Text style={styles.payBtnText}>Pay ₹{total + 10}</Text>
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
    summaryRoute: { fontSize: 14, fontWeight: '700', color: colors.ink },
    summaryMeta: { fontSize: 11, fontWeight: '500', color: colors.inkFaint, marginTop: 2, marginBottom: 12 },
    summaryDivider: { height: 1, backgroundColor: colors.line, marginBottom: 10 },
    fareRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    fareLabel: { fontSize: 12, fontWeight: '500', color: colors.inkSoft },
    fareAmt: { fontSize: 12, fontWeight: '700', color: colors.ink },
    passengerCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 14, gap: 10 },
    passengerLabel: { fontSize: 12, fontWeight: '700', color: colors.ink },
    input: { backgroundColor: colors.white, borderRadius: radius.button, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, fontWeight: '600', color: colors.ink, borderWidth: 1, borderColor: colors.line },
    genderRow: { flexDirection: 'row', gap: 8 },
    genderChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
    genderText: { fontSize: 11, fontWeight: '600', color: colors.inkSoft },
    sectionLabel: { fontSize: 10.5, fontWeight: '700', color: colors.inkFaint, letterSpacing: 0.5, marginTop: 4 },
    paymentCard: { backgroundColor: colors.white, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
    payRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
    payBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
    payIcon: { width: 36, height: 36, borderRadius: radius.iconSquare, justifyContent: 'center', alignItems: 'center' },
    payLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.ink },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.line, justifyContent: 'center', alignItems: 'center' },
    radioActive: { borderColor: colors.gold },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gold },
    payBtn: { backgroundColor: colors.gold, paddingVertical: 15, borderRadius: radius.button, alignItems: 'center' },
    payBtnText: { fontSize: 14, fontWeight: '700', color: '#3A2405' },
});
