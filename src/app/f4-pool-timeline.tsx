import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TIMELINE = [
    { id: '1', time: '4:30 PM', label: 'Trip Started', address: 'Vijayawada Hub', status: 'done' },
    { id: '2', time: '5:15 PM', label: 'Eluru Drop', address: 'Passenger: Ravi K.', status: 'done' },
    { id: '3', time: '6:30 PM', label: 'Rajahmundry Break', address: 'Rest Stop (15 mins)', status: 'active' },
    { id: '4', time: '8:00 PM', label: 'Tuni Drop', address: 'Passenger: Suresh', status: 'pending' },
    { id: '5', time: '9:45 PM', label: 'Destination Reached', address: 'Visakhapatnam', status: 'pending' },
];

export default function PoolTimelineScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="chevron-down" size={24} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Trip Timeline</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.summaryCard}>
                    <View style={styles.etaBox}>
                        <Text style={styles.etaLabel}>Est. Arrival</Text>
                        <Text style={styles.etaTime}>9:45 PM</Text>
                    </View>
                    <View style={styles.divLine} />
                    <View style={styles.delayBox}>
                        <Text style={styles.delayLabel}>Schedule</Text>
                        <Text style={styles.delayStat}>On Time</Text>
                    </View>
                </View>

                <View style={styles.timelineWrap}>
                    {TIMELINE.map((step, i) => {
                        const isDone = step.status === 'done';
                        const isActive = step.status === 'active';
                        return (
                            <View key={step.id} style={styles.timelineRow}>
                                <View style={styles.timelineLeft}>
                                    <View style={[
                                        styles.dot,
                                        isDone && styles.dotDone,
                                        isActive && styles.dotActive
                                    ]}>
                                        {isDone && <Ionicons name="checkmark" size={10} color={colors.white} />}
                                    </View>
                                    {i < TIMELINE.length - 1 && (
                                        <View style={[styles.line, isDone && styles.lineDone]} />
                                    )}
                                </View>
                                <View style={styles.timelineContent}>
                                    <View style={styles.contentRow}>
                                        <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{step.label}</Text>
                                        <Text style={styles.stepTime}>{step.time}</Text>
                                    </View>
                                    <Text style={styles.stepAddr}>{step.address}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.screenPadX, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
    back: { marginRight: 10 },
    headerTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
    content: { padding: spacing.screenPadX, gap: 20 },

    summaryCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, alignItems: 'center', justifyContent: 'space-between' },
    etaBox: { flex: 1 },
    etaLabel: { fontSize: 11, fontWeight: '700', color: colors.inkSoft, letterSpacing: 0.5 },
    etaTime: { fontSize: 20, fontWeight: '800', color: colors.ink, marginTop: 4 },
    divLine: { width: 1, height: 40, backgroundColor: colors.line, marginHorizontal: 20 },
    delayBox: { flex: 1, alignItems: 'flex-end' },
    delayLabel: { fontSize: 11, fontWeight: '700', color: colors.inkSoft, letterSpacing: 0.5 },
    delayStat: { fontSize: 15, fontWeight: '800', color: colors.greenInk, marginTop: 6 },

    timelineWrap: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, padding: 20 },
    timelineRow: { flexDirection: 'row', gap: 16 },
    timelineLeft: { width: 24, alignItems: 'center' },
    dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.line, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    dotDone: { backgroundColor: colors.ink, borderColor: colors.ink },
    dotActive: { borderColor: colors.goldDark, backgroundColor: colors.gold },
    line: { width: 2, flex: 1, backgroundColor: colors.line, marginVertical: 4 },
    lineDone: { backgroundColor: colors.ink },
    timelineContent: { flex: 1, paddingBottom: 24 },
    contentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    stepLabel: { fontSize: 14, fontWeight: '600', color: colors.inkSoft },
    stepLabelActive: { fontWeight: '800', color: colors.ink },
    stepTime: { fontSize: 12, fontWeight: '700', color: colors.ink },
    stepAddr: { fontSize: 12, fontWeight: '500', color: colors.inkFaint, marginTop: 4 },
});
