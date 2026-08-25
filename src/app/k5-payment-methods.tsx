import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const METHODS = [
    { id: 'upi', label: 'UPI — darla@okaxis', sub: 'Default', icon: 'phone-portrait', iconBg: colors.greenTint, iconColor: colors.greenInk, isDefault: true },
    { id: 'card', label: 'Card •••• 4412', sub: 'Visa · Exp 08/28', icon: 'card', iconBg: colors.blueTint, iconColor: colors.blue, isDefault: false },
    { id: 'nb', label: 'Net Banking', sub: 'SBI', icon: 'business', iconBg: colors.purpleTint, iconColor: colors.purple, isDefault: false },
];

export default function PaymentMethodsScreen() {
    const router = useRouter();
    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="chevron-back" size={20} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment methods</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.hint}>Your saved payment methods are tokenized and never stored as raw card data.</Text>
                <View style={styles.listCard}>
                    {METHODS.map((m, i) => (
                        <TouchableOpacity key={m.id} style={[styles.row, i < METHODS.length - 1 && styles.rowBorder]} activeOpacity={0.8}>
                            <View style={[styles.icon, { backgroundColor: m.iconBg }]}>
                                <Ionicons name={m.icon as any} size={18} color={m.iconColor} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.methodLabel}>{m.label}</Text>
                                <Text style={styles.methodSub}>{m.sub}</Text>
                            </View>
                            {m.isDefault && (
                                <View style={styles.defaultTag}>
                                    <Text style={styles.defaultText}>Default</Text>
                                </View>
                            )}
                            {!m.isDefault && (
                                <TouchableOpacity>
                                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.addBtn} activeOpacity={0.85}>
                    <Ionicons name="add" size={20} color={colors.white} />
                    <Text style={styles.addBtnText}>Add payment method</Text>
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
    hint: { fontSize: 11, fontWeight: '500', color: colors.inkFaint, lineHeight: 16 },
    listCard: { backgroundColor: colors.white, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
    icon: { width: 40, height: 40, borderRadius: radius.iconSquare, justifyContent: 'center', alignItems: 'center' },
    methodLabel: { fontSize: 13, fontWeight: '700', color: colors.ink },
    methodSub: { fontSize: 11, fontWeight: '500', color: colors.inkFaint, marginTop: 2 },
    defaultTag: { backgroundColor: colors.goldWash, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    defaultText: { fontSize: 9.5, fontWeight: '700', color: colors.goldDark },
    addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.ink, paddingVertical: 14, borderRadius: radius.button },
    addBtnText: { fontSize: 14, fontWeight: '700', color: colors.white },
});
