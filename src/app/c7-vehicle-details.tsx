import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CAR_IMAGES = [
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2001',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2002'
];

export default function C7VehicleDetailsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ type: string, price: string }>();

    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const vehicleType = params.type || 'Sedan';
    const price = params.price || '129';

    const onScroll = (e: any) => {
        const scrollPos = e.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPos / SCREEN_WIDTH);
        setActiveImageIndex(index);
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Header Image Carousel */}
                <View style={styles.carouselContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                    >
                        {CAR_IMAGES.map((img, index) => (
                            <Image key={index} source={{ uri: img }} style={styles.carImage} />
                        ))}
                    </ScrollView>

                    {/* Floating Back Button */}
                    <TouchableOpacity
                        style={[styles.backBtn, { top: Math.max(insets.top, 20) }]}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={24} color="#000" />
                    </TouchableOpacity>

                    {/* Pagination Dots */}
                    <View style={styles.paginationBox}>
                        {CAR_IMAGES.map((_, i) => (
                            <View key={i} style={[styles.dot, activeImageIndex === i && styles.dotActive]} />
                        ))}
                    </View>
                </View>

                <View style={styles.contentWrap}>
                    {/* Title & Badge */}
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.mainTitle}>Honda City ZX</Text>
                            <Text style={styles.subTitle}>Premium {vehicleType} • 2023 Model</Text>
                        </View>
                        <View style={styles.topRatedBadge}>
                            <Text style={styles.topRatedText}>Top Rated</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Driver Card */}
                    <TouchableOpacity style={styles.driverCard} activeOpacity={0.9}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=100&h=100' }}
                            style={styles.driverAvatar}
                        />
                        <View style={styles.driverInfo}>
                            <View style={styles.driverNameRow}>
                                <Text style={styles.driverName}>Ramesh K.</Text>
                                <Ionicons name="checkmark-circle" size={16} color="#F59E0B" style={{ marginLeft: 4 }} />
                            </View>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={14} color="#F59E0B" />
                                <Text style={styles.ratingText}>4.9 (124 trips)</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                    </TouchableOpacity>

                    {/* Features 2x2 Grid */}
                    <View style={styles.featuresGrid}>
                        <View style={styles.featureTile}>
                            <Ionicons name="car-outline" size={24} color="#0F172A" />
                            <Text style={styles.featureLabel}>CATEGORY</Text>
                            <Text style={styles.featureValue}>{vehicleType}</Text>
                        </View>
                        <View style={styles.featureTile}>
                            <Ionicons name="water-outline" size={24} color="#0F172A" />
                            <Text style={styles.featureLabel}>FUEL</Text>
                            <Text style={styles.featureValue}>Petrol</Text>
                        </View>
                        <View style={styles.featureTile}>
                            <Ionicons name="settings-outline" size={24} color="#0F172A" />
                            <Text style={styles.featureLabel}>TRANSMISSION</Text>
                            <Text style={styles.featureValue}>Automatic</Text>
                        </View>
                        <View style={styles.featureTile}>
                            <Ionicons name="people-outline" size={24} color="#0F172A" />
                            <Text style={styles.featureLabel}>CAPACITY</Text>
                            <Text style={styles.featureValue}>4 Seats</Text>
                        </View>
                    </View>

                    {/* Included Amenities */}
                    <View style={styles.sectionBlock}>
                        <Text style={styles.sectionTitle}>Included Amenities</Text>
                        <View style={styles.amenitiesWrap}>
                            <View style={styles.amenityPill}>
                                <Ionicons name="snow-outline" size={16} color="#0F172A" />
                                <Text style={styles.amenityText}>AC</Text>
                            </View>
                            <View style={styles.amenityPill}>
                                <Ionicons name="battery-charging-outline" size={16} color="#0F172A" />
                                <Text style={styles.amenityText}>Charging</Text>
                            </View>
                            <View style={styles.amenityPill}>
                                <Ionicons name="bluetooth-outline" size={16} color="#0F172A" />
                                <Text style={styles.amenityText}>Bluetooth</Text>
                            </View>
                            <View style={styles.amenityPill}>
                                <Ionicons name="briefcase-outline" size={16} color="#0F172A" />
                                <Text style={styles.amenityText}>Boot Space</Text>
                            </View>
                        </View>
                    </View>

                    {/* About this ride */}
                    <View style={styles.sectionBlock}>
                        <Text style={styles.sectionTitle}>About this ride</Text>
                        <Text style={styles.aboutText}>
                            Experience comfort and reliability with this well-maintained Honda City. Perfect for city commutes or weekend getaways, offering smooth automatic transmission, excellent legroom, and premium sound system for your journey.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Fixed Booking Bar */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <View style={styles.bottomPriceCol}>
                    <Text style={styles.estFareLabel}>ESTIMATED FARE</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text style={styles.totalPrice}>₹{price}</Text>
                        <Text style={styles.perHrText}>/hr</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.bookBtn}
                    activeOpacity={0.9}
                    onPress={() => router.push({
                        pathname: '/c8-confirm-pay',
                        params: { price }
                    })}
                >
                    <Text style={styles.bookBtnText}>Book now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    carouselContainer: {
        width: SCREEN_WIDTH,
        height: 320,
        position: 'relative',
    },
    carImage: {
        width: SCREEN_WIDTH,
        height: 320,
        resizeMode: 'cover',
    },
    backBtn: {
        position: 'absolute',
        left: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    paginationBox: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: '#FFF',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    contentWrap: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    mainTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#000',
    },
    subTitle: {
        fontSize: 15,
        color: '#475569',
        marginTop: 4,
        fontWeight: '500',
    },
    topRatedBadge: {
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    topRatedText: {
        color: '#92400E',
        fontSize: 12,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 20,
    },
    driverCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    driverAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    driverInfo: {
        flex: 1,
    },
    driverNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    ratingText: {
        fontSize: 13,
        color: '#475569',
        marginLeft: 4,
        fontWeight: '600',
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    featureTile: {
        width: '48%',
        backgroundColor: '#F1F5F9', // light lavender/gray tint
        paddingVertical: 20,
        paddingHorizontal: 12,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    featureLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#475569',
        marginTop: 12,
        letterSpacing: 1,
    },
    featureValue: {
        fontSize: 15,
        fontWeight: '800',
        color: '#000',
        marginTop: 4,
    },
    sectionBlock: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#000',
        marginBottom: 16,
    },
    amenitiesWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    amenityPill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
    },
    amenityText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginLeft: 8,
    },
    aboutText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#334155',
        fontWeight: '500',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    bottomPriceCol: {},
    estFareLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    totalPrice: {
        fontSize: 28,
        fontWeight: '900',
        color: '#000',
    },
    perHrText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
        marginLeft: 2,
    },
    bookBtn: {
        backgroundColor: '#000',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 14,
    },
    bookBtnText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    }
});
