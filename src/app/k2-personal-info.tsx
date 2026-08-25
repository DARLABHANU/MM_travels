import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PersonalInfoScreen() {
    const router = useRouter();
    const [name, setName] = useState('Darla Bhanusri');
    const [email, setEmail] = useState('darla.bhanusri@gmail.com');
    const [dirty, setDirty] = useState(false);

    const fields = [
        { label: 'FULL NAME', value: name, onChange: (v: string) => { setName(v); setDirty(true); }, keyboardType: 'default' as const },
        { label: 'EMAIL ADDRESS', value: email, onChange: (v: string) => { setEmail(v); setDirty(true); }, keyboardType: 'email-address' as const },
    ];

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.back} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={20} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Personal info</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Avatar */}
                <View style={styles.avatarWrap}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarInit}>DB</Text>
                    </View>
                    <TouchableOpacity style={styles.cameraBtn}>
                        <Ionicons name="camera" size={14} color={colors.white} />
                    </TouchableOpacity>
                </View>

                {/* Fields */}
                {fields.map((f) => (
                    <View key={f.label} style={styles.fieldWrap}>
                        <Text style={styles.fieldLabel}>{f.label}</Text>
                        <TextInput
                            style={styles.fieldInput}
                            value={f.value}
                            onChangeText={f.onChange}
                            keyboardType={f.keyboardType}
                            autoCapitalize="none"
                        />
                    </View>
                ))}

                {/* Phone — read-only with Change */}
                <View style={styles.fieldWrap}>
                    <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
                    <View style={styles.phoneRow}>
                        <Text style={styles.phoneVal}>+91 98765 43210</Text>
                        <TouchableOpacity>
                            <Text style={styles.changeLink}>Change</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveBtn, !dirty && styles.saveBtnDisabled]}
                    disabled={!dirty}
                    activeOpacity={0.85}
                    onPress={() => { setDirty(false); router.back(); }}
                >
                    <Text style={styles.saveBtnText}>Save changes</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.screenPadX, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
    back: { marginRight: 10 },
    headerTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
    content: { padding: spacing.screenPadX, gap: 20, alignItems: 'center' },
    avatarWrap: { position: 'relative', marginBottom: 8, marginTop: 8 },
    avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.gold, justifyContent: 'center', alignItems: 'center' },
    avatarInit: { fontSize: 26, fontWeight: '800', color: '#3A2405' },
    cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.goldDark, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.white },
    fieldWrap: { width: '100%', gap: 6 },
    fieldLabel: { fontSize: 10.5, fontWeight: '700', color: colors.inkFaint, letterSpacing: 0.3 },
    fieldInput: { backgroundColor: colors.surface, borderRadius: radius.card, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, fontWeight: '600', color: colors.ink },
    phoneRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: radius.card, paddingHorizontal: 14, paddingVertical: 13 },
    phoneVal: { fontSize: 14, fontWeight: '600', color: colors.ink },
    changeLink: { fontSize: 12, fontWeight: '700', color: colors.goldDark },
    saveBtn: { width: '100%', backgroundColor: colors.gold, paddingVertical: 15, borderRadius: radius.button, alignItems: 'center', marginTop: 8 },
    saveBtnDisabled: { opacity: 0.4 },
    saveBtnText: { fontSize: 14, fontWeight: '700', color: '#3A2405' },
});
