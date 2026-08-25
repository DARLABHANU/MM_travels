import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function F1DriverAssignmentScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Pulse animation logic for background radar rings
    const pulseAnim = useRef(new Animated.Value(0)).current;

    // Progress bar animation logic
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Multi-stage text updates to make it feel alive
    const [searchState, setSearchState] = useState(0);
    const MESSAGES = [
        "Searching nearby drivers...",
        "Contacting drivers...",
        "Confirming your ride..."
    ];

    useEffect(() => {
        // Continuous organic pulsing radar ring effect
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1, duration: 1500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0, duration: 1500, easing: Easing.in(Easing.ease), useNativeDriver: true })
            ])
        ).start();

        // Indeterminate smooth progress bar sweeping line
        Animated.loop(
            Animated.sequence([
                Animated.timing(progressAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
                Animated.timing(progressAnim, { toValue: 0, duration: 1200, useNativeDriver: false })
            ])
        ).start();

        // Sequential text updates
        const interval = setInterval(() => {
            setSearchState(prev => (prev + 1) % MESSAGES.length);
        }, 2500);

        // Note: In production you would hook up robust socket listeners here for driver dispatch
        // For development, we route to tracking after a brief delay
        const timer = setTimeout(() => {
            router.replace('/f2-live-tracking');
        }, 8000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    const handleCancel = () => {
        router.back();
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.contentWrap}>

                {/* Radar Mock Visualization Zone */}
                <View style={styles.radarContainer}>
                    <Animated.View style={[styles.radarRing, styles.ring1, {
                        transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) }],
                        opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] })
                    }]} />
                    <Animated.View style={[styles.radarRing, styles.ring2, {
                        transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.1] }) }],
                        opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.1] })
                    }]} />
                    <View style={styles.coreCircle}>
                        <Ionicons name="car-outline" size={36} color="#FFF" />
                    </View>
                </View>

                {/* Typography */}
                <Text style={styles.title}>Finding your driver</Text>
                <Text style={styles.subtitle}>{MESSAGES[searchState]}</Text>

                <View style={styles.etaChip}>
                    <Ionicons name="time-outline" size={14} color="#065F46" />
                    <Text style={styles.etaText}>Estimated pickup 4-7 min</Text>
                </View>

                {/* Animated Progress Bar */}
                <View style={styles.progressBarTrack}>
                    <Animated.View style={[styles.progressBarFill, {
                        width: '30%',
                        left: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '70%']
                        })
                    }]} />
                </View>

            </View>

            {/* Float Bottom Footer */}
            <TouchableOpacity
                style={[styles.cancelBtn, { bottom: Math.max(insets.bottom, 32) }]}
                onPress={handleCancel}
                activeOpacity={0.7}
            >
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAF9' },
    contentWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
    radarContainer: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
    radarRing: { position: 'absolute', backgroundColor: '#E2E8F0', borderRadius: 999 },
    ring1: { width: 160, height: 160 },
    ring2: { width: 120, height: 120 },
    coreCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10, zIndex: 10 },
    title: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 8, letterSpacing: -0.5 },
    subtitle: { fontSize: 15, color: '#475569', fontWeight: '500', marginBottom: 24 },
    etaChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E2FBE9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 32 },
    etaText: { fontSize: 13, fontWeight: '700', color: '#065F46', marginLeft: 6 },
    progressBarTrack: { width: 200, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#FBBF24', borderRadius: 2 },
    cancelBtn: { position: 'absolute', left: 0, right: 0, paddingVertical: 16, alignItems: 'center' },
    cancelText: { fontSize: 16, fontWeight: '700', color: '#475569' }
});
