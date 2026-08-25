import { colors, radius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SOSScreen() {
    const router = useRouter();
    const [dispatched, setDispatched] = useState(false);
    const pressProgress = useRef(new Animated.Value(0)).current;
    const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const pressAnim = pressProgress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    const startHold = () => {
        holdTimer.current = setTimeout(() => { setDispatched(true); }, 2000);
        Animated.timing(pressProgress, { toValue: 1, duration: 2000, useNativeDriver: false }).start();
    };

    const endHold = () => {
        if (holdTimer.current) clearTimeout(holdTimer.current);
        if (!dispatched) {
            Animated.timing(pressProgress, { toValue: 0, duration: 300, useNativeDriver: false }).start();
        }
    };

    const ringColor = pressProgress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [colors.danger, '#FF6B6B', colors.white] });

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* Close */}
            {!dispatched && (
                <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
                    <Ionicons name="close" size={22} color={colors.ink} />
                </TouchableOpacity>
            )}

            {!dispatched ? (
                <View style={styles.content}>
                    <Text style={styles.title}>Emergency SOS</Text>
                    <Text style={styles.subtitle}>Hold the button for 2 seconds to alert MM Travels Safety team</Text>

                    {/* Context Card */}
                    <View style={styles.contextCard}>
                        <Ionicons name="location" size={16} color={colors.goldDark} />
                        <Text style={styles.contextText}>Rushikonda Beach Road, Vizag · Booking #MMT-2024-6781</Text>
                    </View>

                    {/* Hold Button */}
                    <View style={styles.holdWrap}>
                        <Animated.View style={[styles.holdRing, { borderColor: ringColor }]} />
                        <TouchableOpacity
                            style={styles.holdBtn}
                            onPressIn={startHold}
                            onPressOut={endHold}
                            activeOpacity={0.9}
                        >
                            <Ionicons name="warning" size={40} color={colors.white} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.holdLabel}>Hold to alert MM Travels Safety</Text>

                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.cancelLink}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.content}>
                    <View style={styles.dispatchedBanner}>
                        <Ionicons name="shield-checkmark" size={32} color={colors.white} />
                        <Text style={styles.dispatchedTitle}>Help is on the way</Text>
                        <Text style={styles.dispatchedSub}>Safety team notified at {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>

                    <TouchableOpacity style={styles.callSafetyBtn}>
                        <Ionicons name="call" size={18} color={colors.white} />
                        <Text style={styles.callSafetyText}>Call Safety Desk</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iAmSafeBtn} onPress={() => router.back()}>
                        <Text style={styles.iAmSafeText}>I'm safe now — cancel alert</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    closeBtn: {
        margin: 18,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 20 },
    title: { fontSize: 22, fontWeight: '800', color: colors.danger, textAlign: 'center' },
    subtitle: { fontSize: 13, fontWeight: '500', color: colors.inkSoft, textAlign: 'center', lineHeight: 20 },

    contextCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: colors.surface,
        borderRadius: radius.card,
        padding: 12,
        alignSelf: 'stretch',
    },
    contextText: { flex: 1, fontSize: 11, fontWeight: '500', color: colors.inkSoft, lineHeight: 16 },

    holdWrap: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
    holdRing: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: colors.danger,
    },
    holdBtn: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.danger,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: colors.danger,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    holdLabel: { fontSize: 12, fontWeight: '600', color: colors.ink, textAlign: 'center' },
    cancelLink: { fontSize: 12, fontWeight: '600', color: colors.inkSoft, marginTop: 8 },

    dispatchedBanner: {
        backgroundColor: colors.danger,
        borderRadius: radius.card,
        padding: 24,
        alignSelf: 'stretch',
        alignItems: 'center',
        gap: 8,
    },
    dispatchedTitle: { fontSize: 20, fontWeight: '800', color: colors.white },
    dispatchedSub: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
    callSafetyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.ink,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: radius.button,
        alignSelf: 'stretch',
        justifyContent: 'center',
    },
    callSafetyText: { fontSize: 14, fontWeight: '700', color: colors.white },
    iAmSafeBtn: { paddingVertical: 8 },
    iAmSafeText: { fontSize: 12, fontWeight: '600', color: colors.inkSoft },
});
