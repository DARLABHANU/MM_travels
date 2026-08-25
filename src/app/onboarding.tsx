import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SLIDES = [
    {
        id: '1',
        title: 'Discover',
        subtitle: 'Find the best routes and vehicle options for your journey.',
        illustrationType: 'map',
        image: require('../../assets/images/onboarding_1.png'),
    },
    {
        id: '2',
        title: 'Compare Verified Fleets',
        subtitle: 'Choose from a variety of trusted and verified vehicles.',
        illustrationType: 'car',
        image: require('../../assets/images/onboarding_2.png'),
    },
    {
        id: '3',
        title: 'Book With Confidence',
        subtitle: 'Secure payments, live tracking, and dedicated support.',
        illustrationType: 'shield',
        image: require('../../assets/images/onboarding_3.png'),
    },
];

const IllustrationPlaceholder = ({ slide }: { slide: typeof SLIDES[0] }) => {
    return (
        <View style={styles.illustrationWrapper}>
            <Image
                source={slide.image}
                style={styles.illustrationImage}
                resizeMode="contain"
            />
        </View>
    );
};

export default function OnboardingScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleSkip = async () => {
        // Navigate to Mobile Number Entry and persist completed onboarding flag
        try {
            await AsyncStorage.setItem('hasOnboarded', 'true');
        } catch (e) {
            console.warn('Failed to save onboarding status', e);
        }
        router.replace('/mobile-number');
    };

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            handleSkip();
        }
    };

    const onMomentumScrollEnd = (e: any) => {
        const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
        setCurrentIndex(newIndex);
    };

    const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
        return (
            <View style={[styles.slide, { width }]}>
                <IllustrationPlaceholder slide={item} />
            </View>
        );
    };

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            {/* Top Utility */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>

            {/* Illustration & Progress Zone */}
            <View style={styles.stageZone}>
                <FlatList
                    ref={flatListRef}
                    data={SLIDES}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    renderItem={renderItem}
                />
            </View>

            {/* Copy Sheet */}
            <View style={styles.copySheet}>
                {/* Progress Dots moved inside/above sheet based strictly on spec: "progress dots... copy sheet" */}
                {/* Actually spec says: Progress dots 3 pill/dot indicators centered... Copy sheet White rounded-top panel */}
                <View style={styles.paginationContainer}>
                    {SLIDES.map((_, index) => (
                        <TouchableOpacity
                            key={index.toString()}
                            onPress={() => flatListRef.current?.scrollToIndex({ index })}
                            style={[
                                styles.dot,
                                currentIndex === index ? styles.activeDot : styles.inactiveDot
                            ]}
                        />
                    ))}
                </View>

                <Text style={styles.titleText}>{SLIDES[currentIndex].title}</Text>
                <Text style={styles.subtitleText}>{SLIDES[currentIndex].subtitle}</Text>

                <View style={styles.ctaContainer}>
                    <Button
                        label={currentIndex === SLIDES.length - 1 ? "Get Started" : "Continue"}
                        onPress={handleNext}
                        variant="gold"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.navy900,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: spacing.screenPadX,
        paddingTop: 10,
    },
    skipButton: {
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    skipText: {
        color: '#B9C2D4',
        fontSize: 12,
        fontWeight: '600',
    },
    stageZone: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    illustrationWrapper: {
        width: 150,
        height: 130,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    illustrationImage: {
        width: '100%',
        height: '100%',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 26,
        gap: 5,
    },
    dot: {
        height: 4,
        borderRadius: 2,
    },
    activeDot: {
        width: 16,
        backgroundColor: colors.gold,
    },
    inactiveDot: {
        width: 6,
        backgroundColor: '#3A4459',
    },
    copySheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        paddingTop: 26,
        paddingHorizontal: 22,
        paddingBottom: 40,
    },
    titleText: {
        fontSize: 19,
        fontWeight: '800',
        color: colors.ink,
        marginBottom: 8,
    },
    subtitleText: {
        fontSize: 12.5,
        color: colors.inkSoft,
        lineHeight: 18.75, // 12.5 * 1.5
        marginBottom: 18,
    },
    ctaContainer: {
        marginTop: 18,
    }
});
