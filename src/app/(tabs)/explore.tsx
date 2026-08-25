import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIntentStore } from '../../store/intentStore';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - 36 * 2;

// ─── Mock Data ───────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Road Trips', 'Getaways', 'Local Packages', 'Self-Drive', 'Pooled Routes'];

const FEATURED = [
    { id: 'f1', title: 'Araku Valley Escape', subtitle: 'Visakhapatnam · 2 days', colors: ['#6B4226', '#A0522D'] as [string, string], icon: 'mountain' },
    { id: 'f2', title: 'Vizag Coastal Drive', subtitle: 'Beach road · 4 hrs', colors: ['#1a5276', '#2E86C1'] as [string, string], icon: 'water' },
    { id: 'f3', title: 'Lambasingi Weekend', subtitle: '3 days · Misty hills', colors: ['#1B5E20', '#388E3C'] as [string, string], icon: 'leaf' },
];

const PACKAGES = [
    { id: 'p1', title: 'Golconda Fort', subtitle: 'Heritage · 1 day', colors: ['#D9A66B', '#8C5A34'] as [string, string], icon: 'business' },
    { id: 'p2', title: 'Borra Caves', subtitle: 'Nature · Day trip', colors: ['#4A4E69', '#22223B'] as [string, string], icon: 'aperture' },
    { id: 'p3', title: 'Rushikonda Beach', subtitle: 'Vizag · 2 hrs', colors: ['#0077B6', '#00B4D8'] as [string, string], icon: 'sunny' },
    { id: 'p4', title: 'Kailas Giri', subtitle: 'City view · 3 hrs', colors: ['#C77DFF', '#9B5DE5'] as [string, string], icon: 'radio-button-on' },
];

const SELF_DRIVE = [
    { id: 's1', name: 'Swift Dzire', sub: 'Sedan · Manual', price: '₹799/day', icon: 'car', bg: colors.amberTint, color: colors.goldDark },
    { id: 's2', name: 'Creta', sub: 'SUV · Automatic', price: '₹1,299/day', icon: 'car-sport', bg: colors.blueTint, color: colors.blue },
    { id: 's3', name: 'Nexon EV', sub: 'Electric · Auto', price: '₹1,099/day', icon: 'flash', bg: colors.greenTint, color: colors.greenInk },
];

function DestCard({ item }: { item: typeof PACKAGES[0] }) {
    const router = useRouter();
    const setIntent = useIntentStore(state => state.setIntent);
    return (
        <TouchableOpacity style={styles.destCard} activeOpacity={0.8} onPress={() => {
            setIntent({ serviceId: 'outstation', flowType: 'OUTSTATION' });
            router.push('/destination');
        }}>
            <LinearGradient colors={item.colors} style={styles.destGradient}>
                <Ionicons name={item.icon as any} size={28} color="rgba(255,255,255,0.7)" style={styles.destBgIcon} />
                <View style={styles.destCaption}>
                    <Text style={styles.destTitle}>{item.title}</Text>
                    <Text style={styles.destSub}>{item.subtitle}</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

export default function ExploreScreen() {
    const router = useRouter();
    const setIntent = useIntentStore(state => state.setIntent);
    const [activeCategory, setActiveCategory] = useState('All');

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Explore</Text>
                    <Text style={styles.headerSub}>Weekend trips, curated packages & more</Text>
                </View>

                {/* Category Filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.catRow}
                >
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
                            onPress={() => setActiveCategory(cat)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.catLabel, activeCategory === cat && styles.catLabelActive]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Featured Carousel */}
                <FlatList
                    data={FEATURED}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(i) => i.id}
                    contentContainerStyle={{ paddingLeft: spacing.screenPadX, paddingRight: 8 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={[styles.featCard, { width: CARD_W }]} activeOpacity={0.85} onPress={() => router.push('/destination')}>
                            <LinearGradient colors={item.colors} style={styles.featGradient}>
                                <Ionicons name={item.icon as any} size={60} color="rgba(255,255,255,0.15)" style={styles.featBgIcon} />
                                <View style={styles.featTextWrap}>
                                    <Text style={styles.featTitle}>{item.title}</Text>
                                    <Text style={styles.featSub}>{item.subtitle}</Text>
                                </View>
                                <View style={styles.planBtn}>
                                    <Text style={styles.planBtnText}>Plan trip</Text>
                                    <Ionicons name="arrow-forward" size={12} color={colors.ink} />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                />

                {/* Destinations */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Popular destinations</Text>
                    <View style={styles.destGrid}>
                        {PACKAGES.map((p) => <DestCard key={p.id} item={p} />)}
                    </View>
                </View>

                {/* Self-Drive Fleet */}
                <View style={styles.section}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionLabel}>Self-drive fleet</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    {SELF_DRIVE.map((car) => (
                        <TouchableOpacity key={car.id} style={styles.fleetCard} activeOpacity={0.8} onPress={() => {
                            setIntent({ serviceId: 'rental', flowType: 'RENTAL' });
                            router.push('/destination');
                        }}>
                            <View style={[styles.fleetIcon, { backgroundColor: car.bg }]}>
                                <Ionicons name={car.icon as any} size={24} color={car.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fleetName}>{car.name}</Text>
                                <Text style={styles.fleetSub}>{car.sub}</Text>
                            </View>
                            <View style={styles.fleetPricePill}>
                                <Text style={styles.fleetPrice}>{car.price}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Pooled Routes Teaser */}
                <View style={[styles.section, { marginBottom: 32 }]}>
                    <Text style={styles.sectionLabel}>Shared routes near you</Text>
                    <TouchableOpacity style={styles.poolTeaser} activeOpacity={0.85} onPress={() => {
                        setIntent({ serviceId: 'pool', flowType: 'POOL' });
                        router.push('/destination');
                    }}>
                        <LinearGradient colors={[colors.roseTint, '#fce8ef']} style={styles.poolGradient}>
                            <View style={[styles.poolIcon, { backgroundColor: colors.rose + '20' }]}>
                                <Ionicons name="people" size={28} color={colors.rose} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.poolTitle}>Vehicle Pooling</Text>
                                <Text style={styles.poolSub}>Book a single seat, by the segment</Text>
                            </View>
                            <View style={styles.poolTag}>
                                <Text style={styles.poolTagText}>From ₹129</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    header: {
        paddingHorizontal: spacing.screenPadX,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: colors.ink },
    headerSub: { fontSize: 12, fontWeight: '500', color: colors.inkFaint, marginTop: 2 },

    catRow: {
        paddingHorizontal: spacing.screenPadX,
        paddingBottom: 16,
        gap: 8,
        flexDirection: 'row',
    },
    catChip: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: radius.pill,
        backgroundColor: colors.surface,
    },
    catChipActive: { backgroundColor: colors.ink },
    catLabel: { fontSize: 12, fontWeight: '600', color: colors.inkSoft },
    catLabelActive: { color: colors.white },

    featCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginRight: 12,
        height: 170,
    },
    featGradient: { flex: 1, padding: 20, justifyContent: 'flex-end' },
    featBgIcon: { position: 'absolute', top: 16, right: 16 },
    featTextWrap: { marginBottom: 10 },
    featTitle: { fontSize: 18, fontWeight: '800', color: colors.white },
    featSub: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.75)', marginTop: 2 },
    planBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 10,
    },
    planBtnText: { fontSize: 11, fontWeight: '700', color: colors.ink },

    section: { paddingHorizontal: spacing.screenPadX, paddingTop: 24 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionLabel: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 12 },
    seeAll: { fontSize: 12, fontWeight: '700', color: colors.goldDark },

    destGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    destCard: {
        width: (SCREEN_W - spacing.screenPadX * 2 - 10) / 2,
        height: 110,
        borderRadius: 14,
        overflow: 'hidden',
    },
    destGradient: { flex: 1, padding: 12, justifyContent: 'flex-end' },
    destBgIcon: { position: 'absolute', top: 10, right: 10, opacity: 0.5 },
    destCaption: {},
    destTitle: { fontSize: 13, fontWeight: '700', color: colors.white, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
    destSub: { fontSize: 10, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },

    fleetCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },
    fleetIcon: { width: 48, height: 48, borderRadius: radius.iconSquare, justifyContent: 'center', alignItems: 'center' },
    fleetName: { fontSize: 13, fontWeight: '700', color: colors.ink },
    fleetSub: { fontSize: 11, fontWeight: '500', color: colors.inkFaint, marginTop: 2 },
    fleetPricePill: {
        backgroundColor: colors.goldWash,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    fleetPrice: { fontSize: 11, fontWeight: '700', color: colors.goldDark },

    poolTeaser: {
        borderRadius: radius.card,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.line,
    },
    poolGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    poolIcon: { width: 44, height: 44, borderRadius: radius.iconSquare, justifyContent: 'center', alignItems: 'center' },
    poolTitle: { fontSize: 13, fontWeight: '700', color: colors.ink },
    poolSub: { fontSize: 10, fontWeight: '500', color: colors.inkSoft, marginTop: 2 },
    poolTag: {
        backgroundColor: colors.roseTint,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    poolTagText: { fontSize: 9.5, fontWeight: '700', color: colors.rose },
});