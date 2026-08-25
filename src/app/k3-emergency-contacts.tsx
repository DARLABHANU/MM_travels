import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_CONTACTS = [
    { id: 'c1', name: 'Bhanusri (Mom)', phone: '+91 94405 12345' },
    { id: 'c2', name: 'Ravi (Brother)', phone: '+91 98800 67890' },
];

export default function EmergencyContactsScreen() {
    const router = useRouter();
    const [contacts, setContacts] = useState(MOCK_CONTACTS);
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [isAutoShare, setIsAutoShare] = useState(false);

    const addContact = () => {
        if (newName && newPhone) {
            setContacts([...contacts, { id: Date.now().toString(), name: newName, phone: newPhone }]);
            setNewName(''); setNewPhone(''); setShowAdd(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="chevron-back" size={20} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Emergency contacts</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.desc}>These contacts will be reachable in your SOS alerts and trip-sharing notifications.</Text>

                {/* Contact list */}
                <View style={styles.listCard}>
                    {contacts.map((c, i) => (
                        <View key={c.id} style={[styles.row, i < contacts.length - 1 && styles.rowBorder]}>
                            <View style={styles.contactIcon}>
                                <Ionicons name="person" size={18} color={colors.blue} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.contactName}>{c.name}</Text>
                                <Text style={styles.contactPhone}>{c.phone}</Text>
                            </View>
                            <TouchableOpacity style={styles.iconBtn}>
                                <Ionicons name="pencil" size={16} color={colors.inkFaint} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconBtn} onPress={() => setContacts(contacts.filter((x) => x.id !== c.id))}>
                                <Ionicons name="trash" size={16} color={colors.danger} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Add form */}
                {showAdd ? (
                    <View style={styles.addCard}>
                        <TextInput style={styles.input} placeholder="Contact name" placeholderTextColor={colors.inkFaint} value={newName} onChangeText={setNewName} />
                        <TextInput style={styles.input} placeholder="Phone number" placeholderTextColor={colors.inkFaint} value={newPhone} onChangeText={setNewPhone} keyboardType="phone-pad" />
                        <View style={styles.addBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                                <Text style={styles.cancelTxt}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={addContact}>
                                <Text style={styles.saveTxt}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.addPill} onPress={() => setShowAdd(true)}>
                        <Ionicons name="add-circle" size={18} color={colors.inkSoft} />
                        <Text style={styles.addPillText}>Add emergency contact</Text>
                    </TouchableOpacity>
                )}

                {contacts.length === 0 && (
                    <View style={styles.warnRow}>
                        <Ionicons name="warning" size={14} color={colors.goldDark} />
                        <Text style={styles.warnText}>Add a contact so we can reach someone if needed</Text>
                    </View>
                )}

                {contacts.length > 0 && (
                    <View style={styles.autoShareCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <Text style={styles.autoShareTitle}>Automatically share trips</Text>
                            <TouchableOpacity onPress={() => setIsAutoShare(!isAutoShare)}>
                                <Ionicons name={isAutoShare ? "checkbox" : "square-outline"} size={22} color={isAutoShare ? colors.blue : colors.inkSoft} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.autoShareDesc}>Your selected contacts will receive a secure tracking link automatically when your trip begins.</Text>
                    </View>
                )}
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
    desc: { fontSize: 12, fontWeight: '500', color: colors.inkSoft, lineHeight: 18 },
    listCard: { backgroundColor: colors.white, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
    contactIcon: { width: 36, height: 36, borderRadius: radius.iconSquare, backgroundColor: colors.blueTint, justifyContent: 'center', alignItems: 'center' },
    contactName: { fontSize: 13, fontWeight: '700', color: colors.ink },
    contactPhone: { fontSize: 11, fontWeight: '500', color: colors.inkFaint, marginTop: 2 },
    iconBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
    addPill: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.line, borderStyle: 'dashed', borderRadius: radius.pill, paddingVertical: 13, paddingHorizontal: 16, justifyContent: 'center' },
    addPillText: { fontSize: 13, fontWeight: '700', color: colors.inkSoft },
    addCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, gap: 12 },
    input: { backgroundColor: colors.white, borderRadius: radius.card, padding: 13, fontSize: 13, fontWeight: '600', color: colors.ink, borderWidth: 1, borderColor: colors.line },
    addBtns: { flexDirection: 'row', gap: 10 },
    cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.button, alignItems: 'center', borderWidth: 1, borderColor: colors.line },
    cancelTxt: { fontSize: 13, fontWeight: '700', color: colors.inkSoft },
    saveBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.button, alignItems: 'center', backgroundColor: colors.gold },
    saveTxt: { fontSize: 13, fontWeight: '700', color: '#3A2405' },
    warnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    warnText: { fontSize: 11, fontWeight: '600', color: colors.goldDark },
    autoShareCard: { marginTop: 8, padding: 16, backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line },
    autoShareTitle: { fontSize: 13, fontWeight: '800', color: colors.ink },
    autoShareDesc: { fontSize: 12, fontWeight: '500', color: colors.inkSoft, lineHeight: 16 },
});
