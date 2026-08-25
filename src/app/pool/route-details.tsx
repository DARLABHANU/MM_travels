import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { useIntentStore } from '../../store/intentStore';

export default function PoolRouteDetailsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { intent } = useIntentStore();

    const [routeData, setRouteData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Validate domain context strictly
        if (!intent || intent.flowType !== 'POOL' || !intent.poolDetails?.routeId) {
            router.replace('/pool/search');
            return;
        }

        fetchRouteDetails();
    }, []);

    const fetchRouteDetails = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { routeId, fromStopSequence, toStopSequence } = intent!.poolDetails!;

            const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.200.240.183:5000';
            const endpoint = `${apiUrl}/api/pool/routes/${routeId}?fromStopSequence=${fromStopSequence}&toStopSequence=${toStopSequence}`;

            const response = await fetch(endpoint);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Route is no longer available.');
            }

            setRouteData(data);
        } catch (err: any) {
            console.error('Route details error:', err);
            setError(err.message || 'An error occurred while fetching route details.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChooseSeats = () => {
        // We will persist exact context, intentstore already holds routeId, from, to sequences securely!
        router.push('/pool/seat-map');
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.green} />
                <Text style={styles.loadingText}>Loading route details...</Text>
            </View>
        );
    }

    if (error || !routeData) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
                <Text style={styles.errorTitle}>Route unavailable</Text>
                <Text style={styles.errorText}>{error || 'This route is no longer available.'}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
                    <Text style={styles.retryText}>Back to Search</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Time formatting
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const boardingStop = routeData.stops[0];
    const destinationStop = routeData.stops[routeData.stops.length - 1];

    return (
        <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
            {/* Minimal Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
                    <Ionicons name="arrow-back" size={24} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Route Details</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* TIMELINE VISUALIZATION */}
                <View style={styles.card}>
                    {/* Departure Top Row */}
                    <View style={styles.timeRow}>
                        <Text style={styles.label}>Departure</Text>
                        <Text style={styles.timeVal}>{formatDate(boardingStop.time)}</Text>
                    </View>

                    <View style={styles.timelineContainer}>
                        {routeData.stops.map((stop: any, index: number) => {
                            const isFirst = index === 0;
                            const isLast = index === routeData.stops.length - 1;

                            return (
                                <View key={stop.sequence} style={styles.stopRow}>
                                    <View style={styles.timelineGraphic}>
                                        {/* Dot */}
                                        {isFirst ? (
                                            <View style={[styles.dot, { backgroundColor: colors.green }]} />
                                        ) : isLast ? (
                                            <View style={[styles.dot, { backgroundColor: colors.danger }]} />
                                        ) : (
                                            <View style={[styles.dotSmall, { backgroundColor: colors.inkSoft }]} />
                                        )}
                                        {/* Connecting Line (except on last item) */}
                                        {!isLast && <View style={[styles.line, !isFirst && styles.lineFaint]} />}
                                    </View>

                                    <View style={styles.stopInfo}>
                                        {isFirst && <Text style={styles.stopTypeLabel}>BOARDING</Text>}
                                        {isLast && <Text style={styles.stopTypeLabel}>DESTINATION</Text>}
                                        <Text style={[styles.stopName, (!isFirst && !isLast) && styles.stopNameMuted]}>
                                            {stop.name}
                                        </Text>
                                        <Text style={styles.stopTime}>{formatDate(stop.time)}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {/* Arrival Bottom Row */}
                    <View style={[styles.timeRow, styles.timeRowBottom]}>
                        <Text style={styles.label}>Arrival</Text>
                        <Text style={styles.timeVal}>{formatDate(destinationStop.time)}</Text>
                    </View>
                </View>

                {/* VEHICLE METADATA */}
                {routeData.vehicle && (
                    <View style={styles.card}>
                        <View style={styles.vehicleHeader}>
                            <Ionicons name="car-sport" size={20} color={colors.inkSoft} />
                            <Text style={styles.sectionTitle}>Vehicle Details</Text>
                        </View>
                        <View style={styles.vehicleRow}>
                            <View style={styles.vehicleCol}>
                                <Text style={styles.vehicleVal}>{routeData.vehicle.make} {routeData.vehicle.model}</Text>
                                <Text style={styles.vehicleLabel}>Model</Text>
                            </View>
                            <View style={styles.vehicleCol}>
                                <Text style={styles.vehicleVal}>{routeData.vehicle.type}</Text>
                                <Text style={styles.vehicleLabel}>Category</Text>
                            </View>
                            <View style={styles.vehicleCol}>
                                <View style={styles.plateBadge}>
                                    <Text style={styles.plateText}>{routeData.vehicle.plate}</Text>
                                </View>
                                <Text style={styles.vehicleLabel}>License</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* FARE PROXY GAP */}
                <View style={styles.card}>
                    <View style={styles.fareRow}>
                        <View style={styles.fareLeft}>
                            <Ionicons name="cash-outline" size={20} color={colors.inkSoft} />
                            <Text style={styles.sectionTitle}>Fare</Text>
                        </View>
                        <View style={styles.fareRight}>
                            {routeData.segmentFare ? (
                                <Text style={styles.farePrice}>₹{routeData.segmentFare} / seat</Text>
                            ) : (
                                <Text style={styles.fareGapText}>Calculated at checkout</Text>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* FIXED BOTTOM CTA */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9} onPress={handleChooseSeats}>
                    <Text style={styles.primaryButtonText}>Choose Seats</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.white} />
                </TouchableOpacity>
            </View>
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
        backgroundColor: colors.surface,
    },
    loadingText: {
        ...typography.body,
        color: colors.inkSoft,
        marginTop: spacing.sectionGap,
    },
    errorTitle: {
        ...typography.title,
        color: colors.ink,
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
        paddingBottom: 120, // Padding for fixed bottom CTA
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: radius.card,
        padding: spacing.sectionGap,
        marginBottom: spacing.gridGap,
        borderWidth: 1,
        borderColor: colors.line,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: spacing.gridGap,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
        marginBottom: spacing.sectionGap,
    },
    timeRowBottom: {
        borderBottomWidth: 0,
        marginBottom: 0,
        paddingBottom: 0,
        paddingTop: spacing.gridGap,
        borderTopWidth: 1,
        borderTopColor: colors.line,
        marginTop: spacing.sectionGap,
    },
    label: {
        ...typography.body,
        color: colors.inkSoft,
    },
    timeVal: {
        ...typography.title,
        color: colors.ink,
    },
    timelineContainer: {
        paddingLeft: spacing.gridGap,
    },
    stopRow: {
        flexDirection: 'row',
        minHeight: 50,
    },
    timelineGraphic: {
        width: 20,
        alignItems: 'center',
        marginRight: spacing.gridGap,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 4,
        zIndex: 2,
    },
    dotSmall: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
        zIndex: 2,
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: colors.ink,
        marginTop: -6,
        marginBottom: -6, // Connect dots cleanly
        zIndex: 1,
    },
    lineFaint: {
        backgroundColor: colors.line,
    },
    stopInfo: {
        flex: 1,
        paddingBottom: spacing.sectionGap,
        justifyContent: 'flex-start',
    },
    stopTypeLabel: {
        ...typography.micro,
        color: colors.inkFaint,
        marginBottom: 2,
    },
    stopName: {
        ...typography.bodyStrong,
        color: colors.ink,
    },
    stopNameMuted: {
        ...typography.body,
        color: colors.inkSoft,
    },
    stopTime: {
        ...typography.caption,
        color: colors.inkSoft,
        marginTop: 2,
    },
    vehicleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sectionGap,
        gap: 8,
    },
    sectionTitle: {
        ...typography.bodyStrong,
        color: colors.ink,
    },
    vehicleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    vehicleCol: {
        alignItems: 'center',
        flex: 1,
    },
    vehicleVal: {
        ...typography.bodyStrong,
        color: colors.ink,
        marginBottom: 4,
    },
    vehicleLabel: {
        ...typography.caption,
        color: colors.inkSoft,
    },
    plateBadge: {
        backgroundColor: colors.goldWash,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.gold,
        marginBottom: 4,
    },
    plateText: {
        ...typography.caption,
        color: colors.goldDark,
        fontWeight: '700',
    },
    fareRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fareLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    fareRight: {
        alignItems: 'flex-end',
    },
    farePrice: {
        ...typography.title,
        color: colors.green,
    },
    fareGapText: {
        ...typography.body,
        color: colors.inkSoft,
        fontStyle: 'italic',
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
    },
    primaryButton: {
        backgroundColor: colors.ink,
        borderRadius: radius.card,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    primaryButtonText: {
        ...typography.bodyStrong,
        color: colors.white,
        fontSize: 16,
    }
});

