import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PassengerSelectorScreen() {
    const router = useRouter();
    const [passengers, setPassengers] = useState(1);
    const [luggage, setLuggage] = useState(0);

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="close" size={24} color={colors.ink} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Passengers & Luggage</Text>
                <Text style={styles.subtitle}>Select the number of travelers and bags.</Text>

                <View style={styles.row}>
                    <View style={styles.iconBox}><Ionicons name="people" size={24} color={colors.white} /></View>
                    <View style={styles.infoBox}>
                        <Text style={styles.label}>Passengers</Text>
                        <Text style={styles.subtext}>Max 8 per ride</Text>
                    </View>
                    <View style={styles.stepper}>
                        <TouchableOpacity style={styles.stepBtn} onPress={() => setPassengers(Math.max(1, passengers - 1))}><Ionicons name="remove" size={20} color={colors.ink} /></TouchableOpacity>
                        <Text style={styles.stepVal}>{passengers}</Text>
                        <TouchableOpacity style={styles.stepBtn} onPress={() => setPassengers(Math.min(8, passengers + 1))}><Ionicons name="add" size={20} color={colors.ink} /></TouchableOpacity>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <View style={styles.iconBox}><Ionicons name="briefcase" size={24} color={colors.white} /></View>
                    <View style={styles.infoBox}>
                        <Text style={styles.label}>Luggage</Text>
                        <Text style={styles.subtext}>Large suitcases (Max 4)</Text>
                    </View>
                    <View style={styles.stepper}>
                        <TouchableOpacity style={styles.stepBtn} onPress={() => setLuggage(Math.max(0, luggage - 1))}><Ionicons name="remove" size={20} color={colors.ink} /></TouchableOpacity>
                        <Text style={styles.stepVal}>{luggage}</Text>
                        <TouchableOpacity style={styles.stepBtn} onPress={() => setLuggage(Math.min(4, luggage + 1))}><Ionicons name="add" size={20} color={colors.ink} /></TouchableOpacity>
                    </View>
                </View>

                <View style={{ flex: 1 }} />

                <TouchableOpacity style={styles.applyBtn} activeOpacity={0.85} onPress={() => router.push('/city-ride/checkout')}>
                    <Text style={styles.applyText}>Confirm & Apply</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface },
    header: { alignItems: 'flex-end', padding: spacing.screenPadX },
    back: { padding: 8, backgroundColor: colors.white, borderRadius: 20 },
    content: { flex: 1, backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, marginTop: 10 },
    title: { fontSize: 24, fontWeight: '800', color: colors.ink },
    subtitle: { fontSize: 13, color: colors.inkSoft, marginTop: 4, marginBottom: 32 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    iconBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: colors.navy900, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    infoBox: { flex: 1 },
    label: { fontSize: 16, fontWeight: '700', color: colors.ink },
    subtext: { fontSize: 12, color: colors.inkSoft },
    stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 10, padding: 4 },
    stepBtn: { padding: 6 },
    stepVal: { fontSize: 16, fontWeight: '700', width: 24, textAlign: 'center' },
    divider: { height: 1, backgroundColor: colors.line, marginVertical: 12 },
    applyBtn: { backgroundColor: colors.gold, paddingVertical: 16, borderRadius: radius.button, alignItems: 'center' },
    applyText: { fontSize: 16, fontWeight: '800', color: '#3A2405' },
});
