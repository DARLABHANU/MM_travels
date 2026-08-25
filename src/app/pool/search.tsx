import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { useIntentStore } from '../../store/intentStore';

export default function PoolSearchScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { intent, locations } = useIntentStore();

    const [routes, setRoutes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!intent || intent.flowType !== 'POOL' || !locations.boarding || !locations.destination) {
            router.replace('/'); // Invalid state
            return;
        }

        searchRoutes();
    }, []);

    const searchRoutes = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const boarding = locations.boarding;
            const destination = locations.destination;

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://10.200.240.183:5000'}/api/pool/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    boarding: {
                        lat: boarding?.coord.latitude,
                        lng: boarding?.coord.longitude,
                        name: boarding?.address?.name || 'Unknown'
                    },
                    destination: {
                        lat: destination?.coord.latitude,
                        lng: destination?.coord.longitude,
                        name: destination?.address?.name || 'Unknown'
                    },
                    date: new Date().toISOString().split('T')[0],
                    passengers: 1
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to search routes');
            }

            setRoutes(data.routes || []);
        } catch (err: any) {
            console.error('Pool search error:', err);
            setError(err.message || 'An error occurred while communicating with the backend.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectRoute = (route: any) => {
        // Here we could persist selected route to intentStore, but the prompt says:
        // "Persist: poolRouteId, boardingStopId, destinationStopId, fromStopSequence, toStopSequence, fare, scheduledDeparture alongside existing pool intent."
        // We will push them as router params to keep UI component stateless, or store them in a persistent module! Let's use useIntentStore!
        // We'll update intentStore directly in a future refactor, but for now we can pass them in params or add it to intentStore state.

        // Let's add them to intent store dynamically:
        useIntentStore.setState(state => ({
            intent: {
                ...state.intent!,
                poolDetails: {
                    routeId: route.routeId,
                    boardingStopId: route.boardingStop.id,
                    destinationStopId: route.destinationStop.id,
                    fromStopSequence: route.boardingStop.sequence,
                    toStopSequence: route.destinationStop.sequence,
                    fare: route.estimatedFarePerSeat,
                    scheduledDeparture: route.departureTime,
                    vehicle: route.vehicle
                }
            }
        }));

        router.push('/pool/route-details' as any);
    };

    const renderRouteCard = ({ item }: { item: any }) => {
        const d = new Date(item.departureTime);
        const timeString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => item.availableSeats > 0 && handleSelectRoute(item)}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.timeText}>{timeString}</Text>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>₹{item.estimatedFarePerSeat}</Text>
                    </View>
                </View>

                <View style={styles.routeContainer}>
                    <View style={styles.routeTimeline}>
                        <View style={styles.dot} />
                        <View style={styles.line} />
                        <View style={[styles.dot, styles.dotEnd]} />
                    </View>
                    <View style={styles.routeDetails}>
                        <Text style={styles.stopName}>{item.boardingStop.name}</Text>
                        <Text style={[styles.stopName, { marginTop: 16 }]}>{item.destinationStop.name}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.vehicleInfo}>
                        <Ionicons name="car-sport" size={16} color={colors.inkSoft} />
                        <Text style={styles.vehicleText}>{item.vehicle.model}</Text>
                    </View>
                    <View style={styles.seatInfo}>
                        {item.availableSeats > 0 ? (
                            <>
                                <Ionicons name="person" size={14} color={colors.green} />
                                <Text style={styles.seatsAvailable}>{item.availableSeats} seats left</Text>
                            </>
                        ) : (
                            <Text style={styles.seatsFull}>Sold Out</Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select a Route</Text>
            </View>

            {/* List */}
            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.green} />
                    <Text style={styles.loadingText}>Searching available routes...</Text>
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={searchRoutes}>
                        <Text style={styles.retryText}>Retry Search</Text>
                    </TouchableOpacity>
                </View>
            ) : routes.length > 0 ? (
                <FlatList
                    data={routes}
                    keyExtractor={(i) => i.routeId}
                    renderItem={renderRouteCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.centerContainer}>
                    <Ionicons name="car-sport-outline" size={48} color={colors.inkSoft} />
                    <Text style={styles.emptyTitle}>No Routes Found</Text>
                    <Text style={styles.emptyText}>There are no carpool routes available for the selected stops on this date.</Text>
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
        color: colors.danger,
        marginTop: spacing.sectionGap,
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
        color: colors.green,
    },
    emptyTitle: {
        ...typography.title,
        color: colors.ink,
        marginTop: spacing.sectionGap,
    },
    emptyText: {
        ...typography.body,
        color: colors.inkSoft,
        textAlign: 'center',
        marginTop: spacing.cardPad,
    },
    listContent: {
        padding: spacing.screenPadX,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: radius.card,
        padding: spacing.sectionGap,
        marginBottom: spacing.sectionGap,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sectionGap,
    },
    timeText: {
        ...typography.title,
        color: colors.ink,
    },
    priceContainer: {
        backgroundColor: colors.greenTint,
        paddingHorizontal: spacing.cardPad,
        paddingVertical: 5,
        borderRadius: radius.pill,
    },
    priceText: {
        ...typography.title,
        color: colors.green,
    },
    routeContainer: {
        flexDirection: 'row',
        marginBottom: spacing.sectionGap,
    },
    routeTimeline: {
        alignItems: 'center',
        marginRight: spacing.gridGap,
        paddingTop: 6,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.green,
    },
    dotEnd: {
        backgroundColor: colors.danger,
    },
    line: {
        width: 2,
        height: 24,
        backgroundColor: colors.line,
        marginVertical: 2,
    },
    routeDetails: {
        flex: 1,
    },
    stopName: {
        ...typography.body,
        color: colors.ink,
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.sectionGap,
        borderTopWidth: 1,
        borderTopColor: colors.line,
    },
    vehicleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    vehicleText: {
        ...typography.body,
        color: colors.inkSoft,
    },
    seatInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    seatsAvailable: {
        ...typography.bodyStrong,
        color: colors.green,
    },
    seatsFull: {
        ...typography.bodyStrong,
        color: colors.danger,
    }
});

