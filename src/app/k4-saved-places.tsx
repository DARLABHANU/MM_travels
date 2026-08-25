import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SAVED_PLACES = [
    { id: 'home', label: 'Home', address: 'VUDA Colony, Maddilapalem, Vizag', icon: 'home', iconBg: colors.amberTint, iconColor: colors.goldDark },
    { id: 'work', label: 'Work', address: 'Rushikonda IT Park, Vizag — 530045', icon: 'briefcase', iconBg: colors.blueTint, iconColor: colors.blue },
    { id: 'gym', label: 'Gym', address: "Gold\u2019s Gym, Siripuram, Vizag", icon: 'fitness', iconBg: colors.purpleTint, iconColor: colors.purple },
];

export default function SavedPlacesScreen() {
    const router = useRouter();
    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="chevron-back" size={20} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Saved places</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.listCard}>
                    {SAVED_PLACES.map((place, i) => (
                        <TouchableOpacity
                            key={place.id}
                            style={[styles.row, i < SAVED_PLACES.length - 1 && styles.rowBorder]}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.icon, { backgroundColor: place.iconBg }]}>
                                <Ionicons name={place.icon as any} size={18} color={place.iconColor} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.placeLabel}>{place.label}</Text>
                                <Text style={styles.placeAddr} numberOfLines={1}>{place.address}</Text>
                            </View>
                            <TouchableOpacity style={styles.editBtn}>
                                <Ionicons name="pencil" size={16} color={colors.inkFaint} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.addPill}>
                    <Ionicons name="add-circle" size={18} color={colors.inkSoft} />
                    <Text style={styles.addPillText}>Add a place</Text>
                </TouchableOpacity>

                <Text style={styles.hint}>Saved places appear in your search for faster booking.</Text>
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
    listCard: { backgroundColor: colors.white, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
    icon: { width: 40, height: 40, borderRadius: radius.iconSquare, justifyContent: 'center', alignItems: 'center' },
    placeLabel: { fontSize: 13, fontWeight: '700', color: colors.ink },
    placeAddr: { fontSize: 11, fontWeight: '500', color: colors.inkFaint, marginTop: 2 },
    editBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
    addPill: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.line, borderStyle: 'dashed', borderRadius: radius.pill, paddingVertical: 13, justifyContent: 'center' },
    addPillText: { fontSize: 13, fontWeight: '700', color: colors.inkSoft },
    hint: { fontSize: 11, fontWeight: '500', color: colors.inkFaint, textAlign: 'center' },
});
