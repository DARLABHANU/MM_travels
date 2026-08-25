import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CHECKLIST = [
    { id: '1', label: 'Verify vehicle exterior for new damages', checked: false },
    { id: '2', label: 'Confirm fuel level matches starting (80%)', checked: false },
    { id: '3', label: 'Record final odometer reading', checked: false },
    { id: '4', label: 'Ensure all personal belongings are removed', checked: false },
    { id: '5', label: 'Handover physical keys to hub manager', checked: false },
];

export default function ReturnChecklistScreen() {
    const router = useRouter();
    const [checklist, setChecklist] = useState(CHECKLIST);

    const toggle = (id: string) => {
        setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    };

    const allChecked = checklist.every(i => i.checked);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="chevron-back" size={20} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vehicle Return</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.summaryCard}>
                    <View style={styles.carIconBox}>
                        <Ionicons name="car-sport" size={24} color={colors.goldDark} />
                    </View>
                    <View style={styles.carText}>
                        <Text style={styles.carName}>Mahindra Thar 4x4</Text>
                        <Text style={styles.carSub}>Trip ended · 152 km driven</Text>
                    </View>
                </View>

                <View style={styles.photoUpload}>
                    <View style={styles.uploadHeader}>
                        <Ionicons name="camera" size={20} color={colors.ink} />
                        <Text style={styles.uploadTitle}>End Trip Photos</Text>
                    </View>
                    <Text style={styles.uploadSub}>Take photos of all four sides and the dashboard to finalize return.</Text>
                    <View style={styles.photoGrid}>
                        {[1, 2, 3, 4].map((i) => (
                            <TouchableOpacity key={i} style={styles.photoSlot}>
                                <Ionicons name="add" size={24} color={colors.inkFaint} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Text style={styles.sectionLabel}>RETURN CHECKLIST</Text>
                <View style={styles.checkCard}>
                    {checklist.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.checkRow, index < checklist.length - 1 && styles.checkBorder]}
                            onPress={() => toggle(item.id)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.checkbox, item.checked && styles.checkboxActive]}>
                                {item.checked && <Ionicons name="checkmark" size={14} color={colors.white} />}
                            </View>
                            <Text style={[styles.checkLabel, item.checked && styles.checkLabelDone]}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.endBtn, !allChecked && styles.endBtnDisabled]}
                    disabled={!allChecked}
                    onPress={() => router.replace('/g1-invoice')}
                    activeOpacity={0.85}
                >
                    <Ionicons name="flag" size={18} color={'#3A2405'} />
                    <Text style={styles.endBtnText}>End Trip & Generate Invoice</Text>
                </TouchableOpacity>

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

    summaryCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, padding: 14, borderRadius: radius.card },
    carIconBox: { width: 44, height: 44, borderRadius: radius.iconSquare, backgroundColor: colors.amberTint, justifyContent: 'center', alignItems: 'center' },
    carText: { flex: 1 },
    carName: { fontSize: 14, fontWeight: '700', color: colors.ink },
    carSub: { fontSize: 11, fontWeight: '500', color: colors.inkFaint, marginTop: 2 },

    photoUpload: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, padding: 14 },
    uploadHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    uploadTitle: { fontSize: 13, fontWeight: '700', color: colors.ink },
    uploadSub: { fontSize: 11, color: colors.inkFaint, marginBottom: 12 },
    photoGrid: { flexDirection: 'row', gap: 10 },
    photoSlot: { width: 64, height: 64, borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },

    sectionLabel: { fontSize: 10.5, fontWeight: '700', color: colors.inkFaint, letterSpacing: 0.5, marginTop: 8 },
    checkCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, overflow: 'hidden' },
    checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
    checkBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.inkFaint, justifyContent: 'center', alignItems: 'center' },
    checkboxActive: { backgroundColor: colors.green, borderColor: colors.green },
    checkLabel: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.ink },
    checkLabelDone: { color: colors.inkSoft, textDecorationLine: 'line-through' },

    endBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.gold, paddingVertical: 15, borderRadius: radius.button, marginTop: 8 },
    endBtnDisabled: { opacity: 0.4 },
    endBtnText: { fontSize: 14, fontWeight: '700', color: '#3A2405' },
});
