import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { useIntentStore } from '../../store/intentStore';

// Types
type SeatStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'SELECTED';

interface Seat {
    seatLabel: string;
    status: SeatStatus;
}

export default function PoolSeatMapScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { intent } = useIntentStore();

    // UI States
    const [seats, setSeats] = useState<Seat[]>([]);
    const [layout, setLayout] = useState<string>('2+2');
    const [isLoading, setIsLoading] = useState(true);
    const [isHolding, setIsHolding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Context from Intent
    const routeDetails = intent?.poolDetails;

    useEffect(() => {
        if (!intent || intent.flowType !== 'POOL' || !routeDetails?.routeId) {
            router.replace('/pool/search');
            return;
        }

        fetchMatrix();

        // Handle android back press
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => backHandler.remove();
    }, []);

    const fetchMatrix = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { routeId, fromStopSequence, toStopSequence } = routeDetails!;

            const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.200.240.183:5000';
            const endpoint = `${apiUrl}/api/pool/routes/${routeId}/matrix?fromStopSequence=${fromStopSequence}&toStopSequence=${toStopSequence}`;

            const response = await fetch(endpoint);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Unable to load seat availability.');
            }

            setLayout(data.layout || '2+2');

            // Map backend 'CONFIRMED/HELD' native states into 'UNAVAILABLE'. 
            // Also preserve local 'SELECTED' state if it remains 'AVAILABLE' on backend refresh
            setSeats(prevSeats => {
                const locallySelected = new Set(prevSeats.filter(s => s.status === 'SELECTED').map(s => s.seatLabel));

                return data.seats.map((s: any) => {
                    const status = s.status === 'AVAILABLE' ? 'AVAILABLE' : 'UNAVAILABLE';

                    return {
                        seatLabel: s.seatLabel,
                        status: (status === 'AVAILABLE' && locallySelected.has(s.seatLabel)) ? 'SELECTED' : status
                    };
                });
            });

        } catch (err: any) {
            setError(err.message || 'An error occurred fetching the seat matrix.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSeatPress = (seatLabel: string) => {
        setSeats(prev => prev.map(s => {
            if (s.seatLabel === seatLabel) {
                if (s.status === 'AVAILABLE') return { ...s, status: 'SELECTED' };
                if (s.status === 'SELECTED') return { ...s, status: 'AVAILABLE' };
            }
            return s;
        }));
    };

    const handleBackPress = () => {
        // Check if there is an active hold
        if (routeDetails?.lockedUntil && new Date(routeDetails.lockedUntil) > new Date()) {
            Alert.alert(
                'Seat hold active',
                'Since you have an active seat hold, releasing it requires a backend API interaction.',
                [
                    { text: 'Continue booking', style: 'cancel' },
                    {
                        text: 'Leave and release seats',
                        style: 'destructive',
                        onPress: () => {
                            Alert.alert('Backend Contract Gap', 'Release hold API endpoint does not exist. (DELETE /api/pool/seat-holds). Cannot safely release seats yet.');
                        }
                    }
                ]
            );
            return true; // Prevent default
        }

        router.back();
        return true;
    };

    const acquireHold = async () => {
        const selectedSeats = seats.filter(s => s.status === 'SELECTED').map(s => s.seatLabel);
        if (selectedSeats.length === 0) return;

        setIsHolding(true);

        try {
            const { routeId, fromStopSequence, toStopSequence } = routeDetails!;
            const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.200.240.183:5000';

            const uuid = Crypto.randomUUID();

            const response = await fetch(`${apiUrl}/api/pool/seat-holds`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    routeId,
                    userId: 'mock-user-123', // Hardcoded mock user ID until Auth integration
                    seats: selectedSeats,
                    fromStopSequence,
                    toStopSequence,
                    idempotencyKey: uuid
                })
            });

            const data = await response.json();

            if (response.status === 409) {
                // Conflict
                Alert.alert('Seat unavailable', 'One or more selected seats are no longer available.', [
                    { text: 'OK', onPress: () => fetchMatrix() }
                ]);
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || 'Failed to acquire seat hold.');
            }

            // Successfully Acquired! 
            // Update Intent
            useIntentStore.setState(state => ({
                intent: {
                    ...state.intent!,
                    poolDetails: {
                        ...state.intent!.poolDetails!,
                        selectedSeats: selectedSeats,
                        holdId: data.hold_id,
                        lockedUntil: data.locked_until
                    }
                }
            }));

            Alert.alert("Success", "Hold acquired! Routing to checkout...", [
                { text: 'OK', onPress: () => router.push('/pool/checkout' as any) }
            ]);

        } catch (err: any) {
            Alert.alert('Error', err.message || 'An error occurred.');
        } finally {
            setIsHolding(false);
        }
    };

    // Render Seat Utilities
    const renderSeat = (seat: Seat | undefined) => {
        if (!seat) return <View style={styles.seatPlaceholder} />;

        let bgColor = colors.white;
        let borderColor = colors.line;
        let iconColor = colors.inkFaint;

        if (seat.status === 'UNAVAILABLE') {
            bgColor = colors.line;
            borderColor = colors.line;
            iconColor = colors.inkSoft;
        } else if (seat.status === 'SELECTED') {
            bgColor = colors.greenTint;
            borderColor = colors.green;
            iconColor = colors.green;
        }

        return (
            <TouchableOpacity
                key={seat.seatLabel}
                style={[styles.seatBox, { backgroundColor: bgColor, borderColor }]}
                disabled={seat.status === 'UNAVAILABLE' || isHolding || isLoading}
                onPress={() => handleSeatPress(seat.seatLabel)}
                activeOpacity={0.7}
            >
                <Ionicons name="person" size={24} color={iconColor} style={{ opacity: seat.status === 'UNAVAILABLE' ? 0.3 : 1 }} />
                <Text style={[styles.seatText, { color: iconColor }]}>{seat.seatLabel}</Text>
            </TouchableOpacity>
        );
    };

    const renderLayout = () => {
        let seatsPerRow = 2; // basic 2+2 layout
        if (layout === "2+1") seatsPerRow = 3; 
        const chunkedSeats = [];
        for (let i = 0; i < seats.length; i += seatsPerRow) {
            chunkedSeats.push(seats.slice(i, i + seatsPerRow));
        }
        return (
            <View style={styles.layoutContainer}>
                <View style={styles.driverSection}>
                     <View style={styles.driverSteering} />
                     <Text style={styles.driverText}>DRIVER</Text>
                </View>
                <View style={styles.seatGrid}>
                    {chunkedSeats.map((row, rIndex) => (
                        <View key={`row-${rIndex}`} style={styles.seatRow}>
                            {row.map(seat => renderSeat(seat))}
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const selectedCount = seats.filter(s => s.status === 'SELECTED').length;

    return (
        <View style={styles.container}>
            {/* Minimal Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton} activeOpacity={0.8}>
                    <Ionicons name="arrow-back" size={24} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Seats</Text>
            </View>

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.green} />
                    <Text style={styles.loadingText}>Loading seat map...</Text>
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={fetchMatrix}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendBox, { borderColor: colors.line, backgroundColor: colors.white }]} />
                            <Text style={styles.legendText}>Available</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendBox, { borderColor: colors.green, backgroundColor: colors.greenTint }]} />
                            <Text style={styles.legendText}>Selected</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendBox, { borderColor: colors.line, backgroundColor: colors.line }]} />
                            <Text style={styles.legendText}>Unavailable</Text>
                        </View>
                    </View>

                    <View style={styles.vehicleCanvas}>
                        {renderLayout()}
                    </View>
                </ScrollView>
            )}

            {/* FIXED BOTTOM CTA */}
            {!isLoading && !error && (
                <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                    <View style={styles.bottomSummary}>
                        <Text style={styles.summaryTitle}>
                            {selectedCount > 0 ? `${selectedCount} Seat${selectedCount > 1 ? 's' : ''} Selected` : 'No Seats Selected'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.primaryButton, (selectedCount === 0 || isHolding) && styles.primaryButtonDisabled]}
                        disabled={selectedCount === 0 || isHolding}
                        activeOpacity={0.9}
                        onPress={acquireHold}
                    >
                        {isHolding ? (
                            <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                            <>
                                <Text style={styles.primaryButtonText}>Continue</Text>
                                <Ionicons name="arrow-forward" size={20} color={colors.white} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.screenPadX,
        paddingBottom: spacing.sectionGap,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },
    backButton: {
        paddingRight: spacing.sectionGap,
    },
    headerTitle: {
        ...typography.display,
        color: colors.ink,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.screenPadX,
    },
    loadingText: {
        ...typography.body,
        color: colors.inkSoft,
        marginTop: spacing.sectionGap,
    },
    errorText: {
        ...typography.body,
        color: colors.inkSoft,
        marginTop: spacing.gridGap,
        textAlign: 'center',
    },
    retryBtn: {
        marginTop: spacing.sectionGap,
        paddingVertical: spacing.cardPad,
        paddingHorizontal: spacing.sectionGap,
        backgroundColor: colors.white,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.line,
    },
    retryText: {
        ...typography.bodyStrong,
        color: colors.ink,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.screenPadX,
        paddingBottom: 160,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.sectionGap,
        marginBottom: spacing.sectionGap * 2,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendBox: {
        width: 16,
        height: 16,
        borderRadius: 4,
        borderWidth: 1,
    },
    legendText: {
        ...typography.caption,
        color: colors.inkSoft,
    },
    vehicleCanvas: {
        alignItems: 'center',
    },
    layoutContainer: {
        width: 200,
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.line,
        borderRadius: 40,
        padding: spacing.sectionGap,
        paddingVertical: 40,
        alignItems: 'center',
    },
    driverSection: {
        width: '100%',
        alignItems: 'flex-end',
        paddingRight: spacing.sectionGap,
        marginBottom: 40,
    },
    driverSteering: {
        width: 40,
        height: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderWidth: 4,
        borderBottomWidth: 0,
        borderColor: colors.inkSoft,
    },
    driverText: {
        ...typography.micro,
        color: colors.inkSoft,
        marginTop: 4,
        marginRight: 4,
    },
    seatGrid: {
        gap: spacing.sectionGap,
    },
    seatRow: {
        flexDirection: 'row',
        gap: spacing.sectionGap,
    },
    seatBox: {
        width: 50,
        height: 50,
        borderRadius: radius.seatCell,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    seatPlaceholder: {
        width: 50,
        height: 50,
    },
    seatText: {
        ...typography.micro,
        marginTop: 2,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        padding: spacing.screenPadX,
        borderTopWidth: 1,
        borderTopColor: colors.line,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomSummary: {
        flex: 1,
    },
    summaryTitle: {
        ...typography.title,
        color: colors.ink,
    },
    primaryButton: {
        backgroundColor: colors.ink,
        borderRadius: radius.card,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: spacing.sectionGap,
        gap: 8,
        minWidth: 140,
    },
    primaryButtonDisabled: {
        backgroundColor: colors.inkFaint,
    },
    primaryButtonText: {
        ...typography.bodyStrong,
        color: colors.white,
        fontSize: 16,
    }
});


