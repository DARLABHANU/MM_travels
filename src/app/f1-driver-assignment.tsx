import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function F1DriverAssignmentScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Pulse animation logic for background radar rings
    const pulseAnim = useRef(new Animated.Value(0)).current;

    // Progress bar animation logic
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Continuous organic pulsing radar ring effect
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 1500,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                })
            ])
        ).start();

        // Indeterminate smooth progress bar sweeping line
        Animated.loop(
            Animated.sequence([
                Animated.timing(progressAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: false,
                }),
                Animated.timing(progressAnim, {
                    toValue: 0,
                    duration: 1200,
                    useNativeDriver: false,
                })
            ])
        ).start();

        // Note: In production you would hook up robust socket listeners here for driver dispatch
        // Let's dynamically mock a 1 second wait and redirect to F2
        const timer = setTimeout(() => {
            router.replace('/f2-live-tracking');
        }, 1200);

        return () => clearTimeout(timer);

    }, []);

    const handleCancel = () => {
        router.back();
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.contentWrap}>

                {/* Radar Mock Visualization Zone */}
                <View style={styles.radarContainer}>
                    {/* Ring 1 (largest) */}
                    <Animated.View style={[styles.radarRing, styles.ring1, {
                        transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) }],
                        opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] })
                    }]} />
                    {/* Ring 2 (medium) */}
                    <Animated.View style={[styles.radarRing, styles.ring2, {
                        transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.1] }) }],
                        opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.1] })
                    }]} />

                    {/* Core deep navy circle block */}
                    <View style={styles.coreCircle}>
                        <Ionicons name="car-outline" size={36} color="#FFF" />
                    </View>
                </View>

                {/* Typography */}
                <Text style={styles.title}>Finding your driver...</Text>
                <Text style={styles.subtitle}>This usually takes under a minute.</Text>

                {/* Animated Progress Bar */}
                <View style={styles.progressBarTrack}>
                    <Animated.View style={[styles.progressBarFill, {
                        width: '30%',
                        left: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '70%'] // Slide across 100% boundary minus own width
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
    container: {
        flex: 1,
        backgroundColor: '#FAFAF9', // matching beautiful crisp minimal slate background
    },
    contentWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    radarContainer: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 60,
    },
    radarRing: {
        position: 'absolute',
        backgroundColor: '#E2E8F0', // slate light
        borderRadius: 999, // pure circle
    },
    ring1: {
        width: 160,
        height: 160,
    },
    ring2: {
        width: 120,
        height: 120,
    },
    coreCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#0F172A', // Deep navy blackish matching design
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        zIndex: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0F172A',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: '#475569',
        fontWeight: '500',
        marginBottom: 24,
    },
    progressBarTrack: {
        width: 200, // Matching text width scale approx
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        overflow: 'hidden', // constrain slider block inside
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FBBF24', // Golden amber
        borderRadius: 2,
    },
    cancelBtn: {
        position: 'absolute',
        left: 0,
        right: 0,
        paddingVertical: 16,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#475569',
    }
});
