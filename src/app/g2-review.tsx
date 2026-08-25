import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DIMENSIONS = [
    { id: 'cleanliness', label: 'Cleanliness', icon: 'sparkles' },
    { id: 'safety', label: 'Driver safety & behaviour', icon: 'shield-checkmark' },
    { id: 'agency', label: 'Agency service', icon: 'business' },
];

const QUICK_TAGS = ['Clean vehicle', 'Safe driving', 'On time', 'Professional', 'Smooth ride', 'Polite driver'];

function StarRow({ label, icon, rating, onRate }: { label: string; icon: string; rating: number; onRate: (r: number) => void }) {
    return (
        <View style={styles.dimRow}>
            <View style={styles.dimLabelRow}>
                <Ionicons name={icon as any} size={16} color={colors.goldDark} />
                <Text style={styles.dimLabel}>{label}</Text>
            </View>
            <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => onRate(star)} activeOpacity={0.8}>
                        <Ionicons
                            name={star <= rating ? 'star' : 'star-outline'}
                            size={28}
                            color={star <= rating ? colors.gold : colors.occupiedGrey}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

export default function ReviewRatingScreen() {
    const router = useRouter();
    const [ratings, setRatings] = useState<Record<string, number>>({ cleanliness: 0, safety: 0, agency: 0 });
    const [comment, setComment] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);

    const setRating = (id: string, val: number) => setRatings((prev) => ({ ...prev, [id]: val }));
    const toggleTag = (tag: string) => {
        setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
    };

    const canSubmit = ratings.safety > 0;

    const handleSubmit = () => {
        setSubmitted(true);
        setTimeout(() => router.replace('/(tabs)/trips' as any), 1500);
    };

    if (submitted) {
        return (
            <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]} edges={['top', 'bottom']}>
                <View style={styles.successIcon}>
                    <Ionicons name="checkmark-circle" size={52} color={colors.green} />
                </View>
                <Text style={styles.successTitle}>Thanks for your feedback!</Text>
                <Text style={styles.successSub}>Your review helps improve MM Travels for everyone.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={20} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rate your trip</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Trip summary */}
                <View style={styles.tripCard}>
                    <View style={[styles.driverAvatar]}>
                        <Text style={styles.avatarInit}>RK</Text>
                    </View>
                    <View>
                        <Text style={styles.tripHeadline}>How was your trip?</Text>
                        <Text style={styles.tripSub}>Ramesh K. · Koduru → Pedamusidivada</Text>
                    </View>
                </View>

                {/* Rating dimensions */}
                {DIMENSIONS.map((dim) => (
                    <StarRow
                        key={dim.id}
                        label={dim.label}
                        icon={dim.icon}
                        rating={ratings[dim.id]}
                        onRate={(r) => setRating(dim.id, r)}
                    />
                ))}

                {/* Quick tags (shown when safety is rated) */}
                {ratings.safety > 0 && (
                    <View style={styles.tagsWrap}>
                        <Text style={styles.tagsLabel}>What stood out?</Text>
                        <View style={styles.tagsRow}>
                            {QUICK_TAGS.map((tag) => (
                                <TouchableOpacity
                                    key={tag}
                                    style={[styles.tagChip, selectedTags.includes(tag) && styles.tagChipActive]}
                                    onPress={() => toggleTag(tag)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>
                                        {tag}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Comment */}
                <TextInput
                    style={styles.commentInput}
                    placeholder="Tell us more (optional)"
                    placeholderTextColor={colors.inkFaint}
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />

                {/* Submit */}
                <TouchableOpacity
                    style={[styles.submitBtn, !canSubmit && styles.submitDisabled]}
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    activeOpacity={0.85}
                >
                    <Text style={styles.submitText}>Submit review</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/(tabs)/trips' as any)}>
                    <Text style={styles.skipText}>Skip for now</Text>
                </TouchableOpacity>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.screenPadX,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },
    backBtn: { marginRight: 10 },
    headerTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
    content: { padding: spacing.screenPadX, gap: 20 },

    tripCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: colors.surface,
        borderRadius: radius.card,
        padding: 14,
    },
    driverAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.navy900,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInit: { fontSize: 16, fontWeight: '800', color: colors.white },
    tripHeadline: { fontSize: 13, fontWeight: '700', color: colors.ink },
    tripSub: { fontSize: 11, fontWeight: '500', color: colors.inkSoft, marginTop: 2 },

    dimRow: {
        gap: 10,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },
    dimLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dimLabel: { fontSize: 13, fontWeight: '700', color: colors.ink },
    stars: { flexDirection: 'row', gap: 6 },

    tagsWrap: { gap: 10 },
    tagsLabel: { fontSize: 12, fontWeight: '700', color: colors.inkSoft },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tagChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
    },
    tagChipActive: { backgroundColor: colors.goldWash, borderColor: colors.gold },
    tagText: { fontSize: 11, fontWeight: '600', color: colors.inkSoft },
    tagTextActive: { color: colors.goldDark },

    commentInput: {
        backgroundColor: colors.surface,
        borderRadius: radius.card,
        padding: 14,
        fontSize: 13,
        fontWeight: '500',
        color: colors.ink,
        minHeight: 100,
    },

    submitBtn: {
        backgroundColor: colors.gold,
        paddingVertical: 15,
        borderRadius: radius.button,
        alignItems: 'center',
    },
    submitDisabled: { opacity: 0.4 },
    submitText: { fontSize: 14, fontWeight: '700', color: '#3A2405' },
    skipBtn: { alignItems: 'center', paddingVertical: 6 },
    skipText: { fontSize: 12, fontWeight: '600', color: colors.inkSoft },

    successIcon: { marginBottom: 16 },
    successTitle: { fontSize: 18, fontWeight: '800', color: colors.ink, marginBottom: 8 },
    successSub: { fontSize: 13, fontWeight: '500', color: colors.inkSoft, textAlign: 'center', paddingHorizontal: 32 },
});
