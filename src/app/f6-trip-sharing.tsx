import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Share,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SHARE_LINK = 'https://mmtravels.app/track/MMT-2024-6781';

export default function TripSharingScreen() {
    const router = useRouter();
    const [autoShare, setAutoShare] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleShare = async () => {
        try {
            await Share.share({ message: `Track my live trip on MM Travels: ${SHARE_LINK}`, url: SHARE_LINK });
        } catch (_) { }
    };

    const CHANNELS = [
        { icon: 'logo-whatsapp', label: 'WhatsApp', color: '#25D366' },
        { icon: 'chatbubbles', label: 'Messages', color: colors.blue },
        { icon: 'share-social', label: 'More', color: colors.inkSoft },
    ];

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* Handle + Header */}
            <View style={styles.handle} />
            <View style={styles.headerRow}>
                <Text style={styles.title}>Share your trip</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={22} color={colors.inkSoft} />
                </TouchableOpacity>
            </View>

            {/* Link card */}
            <View style={styles.linkCard}>
                <Ionicons name="link" size={18} color={colors.inkSoft} />
                <Text style={styles.linkText} numberOfLines={1}>{SHARE_LINK}</Text>
                <TouchableOpacity onPress={handleCopy}>
                    <Text style={[styles.copyText, copied && { color: colors.green }]}>
                        {copied ? 'Copied ✓' : 'Copy'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Channel shortcuts */}
            <View style={styles.channelRow}>
                {CHANNELS.map((ch) => (
                    <TouchableOpacity key={ch.icon} style={styles.channelBtn} onPress={handleShare} activeOpacity={0.8}>
                        <View style={[styles.channelIcon, { backgroundColor: ch.color + '20' }]}>
                            <Ionicons name={ch.icon as any} size={26} color={ch.color} />
                        </View>
                        <Text style={styles.channelLabel}>{ch.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Share All button */}
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                <Ionicons name="share-social" size={18} color={'#3A2405'} />
                <Text style={styles.shareBtnText}>Share via any app</Text>
            </TouchableOpacity>

            {/* Auto-share toggle */}
            <View style={styles.autoRow}>
                <Text style={styles.autoLabel}>Always share trips with my emergency contact</Text>
                <Switch
                    value={autoShare}
                    onValueChange={setAutoShare}
                    trackColor={{ false: colors.occupiedGrey, true: colors.gold }}
                    thumbColor={colors.white}
                />
            </View>

            <Text style={styles.note}>Link is valid only while your trip is active.</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white, paddingHorizontal: spacing.screenPadX },
    handle: { width: 34, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: 'center', marginTop: 14, marginBottom: 18 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 16, fontWeight: '800', color: colors.ink },
    linkCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: radius.card,
        padding: 14,
        marginBottom: 20,
    },
    linkText: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.inkSoft },
    copyText: { fontSize: 12, fontWeight: '700', color: colors.goldDark },
    channelRow: { flexDirection: 'row', justifyContent: 'center', gap: 32, marginBottom: 24 },
    channelBtn: { alignItems: 'center', gap: 8 },
    channelIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
    channelLabel: { fontSize: 11, fontWeight: '600', color: colors.inkSoft },
    shareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.gold,
        paddingVertical: 14,
        borderRadius: radius.button,
        marginBottom: 20,
    },
    shareBtnText: { fontSize: 14, fontWeight: '700', color: '#3A2405' },
    autoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: colors.line,
    },
    autoLabel: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.ink, lineHeight: 18 },
    note: { fontSize: 10, fontWeight: '500', color: colors.inkFaint, textAlign: 'center', marginTop: 12 },
});
