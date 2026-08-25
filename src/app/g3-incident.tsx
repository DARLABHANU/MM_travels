import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IncidentReportScreen() {
    const router = useRouter();
    const [issue, setIssue] = useState('driver');
    const [desc, setDesc] = useState('');

    const ISSUES = [
        { id: 'driver', label: 'Driver behavior' },
        { id: 'clean', label: 'Vehicle cleanliness' },
        { id: 'accident', label: 'Accident / Safety issue' },
        { id: 'route', label: 'Wrong route taken' },
        { id: 'fare', label: 'Fare dispute' },
        { id: 'other', label: 'Other' },
    ];

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="close" size={24} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Report Issue</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.contextText}>Regarding booking <Text style={{ fontWeight: '700' }}>MMT-2024-6781</Text></Text>

                <Text style={styles.sectionLabel}>WHAT WENT WRONG?</Text>
                <View style={styles.issuesGrid}>
                    {ISSUES.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[styles.issuePill, issue === option.id && styles.issuePillActive]}
                            onPress={() => setIssue(option.id)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.issuePillText, issue === option.id && styles.issuePillTextActive]}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionLabel}>DETAILS</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Provide more context so we can help faster..."
                    placeholderTextColor={colors.inkFaint}
                    multiline
                    numberOfLines={6}
                    value={desc}
                    onChangeText={setDesc}
                    textAlignVertical="top"
                />

                {/* Photo Evidence */}
                <TouchableOpacity style={styles.photoBtn} activeOpacity={0.8}>
                    <Ionicons name="camera-outline" size={20} color={colors.inkSoft} />
                    <Text style={styles.photoText}>Attach photos / video proof</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.submitBtn} onPress={() => router.back()}>
                    <Text style={styles.submitBtnText}>Submit Report</Text>
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
    contextText: { fontSize: 13, color: colors.inkSoft, backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start' },

    sectionLabel: { fontSize: 10.5, fontWeight: '700', color: colors.inkFaint, letterSpacing: 0.5, marginTop: 4 },
    issuesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    issuePill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white },
    issuePillActive: { backgroundColor: colors.ink, borderColor: colors.ink },
    issuePillText: { fontSize: 13, fontWeight: '600', color: colors.inkSoft },
    issuePillTextActive: { color: colors.white },

    textArea: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 14, fontSize: 14, fontWeight: '500', color: colors.ink, minHeight: 120 },

    photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: colors.line, borderStyle: 'dashed', padding: 16, borderRadius: radius.card, justifyContent: 'center' },
    photoText: { fontSize: 13, fontWeight: '700', color: colors.inkSoft },

    submitBtn: { backgroundColor: colors.danger, paddingVertical: 15, borderRadius: radius.button, alignItems: 'center', marginTop: 12 },
    submitBtnText: { fontSize: 14, fontWeight: '700', color: colors.white },
});
