import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RoutePreviewScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <Ionicons name="arrow-back" size={24} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Route Preview</Text>
            </View>

            <View style={styles.mapMock}>
                <Ionicons name="map" size={64} color={colors.inkFaint} />
                <Text style={styles.mapText}>Map Route Preview area.</Text>
                <Text style={styles.mapSub}>Displays Polyline between Pickup and Drop.</Text>
            </View>

            <View style={styles.bottomSheet}>
                <View style={styles.timeInfo}>
                    <Text style={styles.distanceText}>12.4 km <Text style={styles.durationText}>· 28 min</Text></Text>
                    <Text style={styles.subtitleText}>Fastest route currently available</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.routeBlock}>
                    <View style={styles.routeLineCol}>
                        <View style={styles.dotPickup} />
                        <View style={styles.verticalLink} />
                        <View style={styles.dotDropoff} />
                    </View>
                    <View style={styles.routeTextCol}>
                        <View style={styles.routeLocation}>
                            <Text style={styles.label}>PICKUP</Text>
                            <Text style={styles.name} numberOfLines={1}>VUDA Colony, Maddilapalem</Text>
                        </View>
                        <View style={{ height: 16 }} />
                        <View style={styles.routeLocation}>
                            <Text style={styles.label}>DROPOFF</Text>
                            <Text style={styles.name} numberOfLines={1}>Rushikonda IT Park</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.continueBtn} activeOpacity={0.85} onPress={() => router.push('/c3-passenger-selector')}>
                    <Text style={styles.continueBtnText}>Continue to Passengers</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.white} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface },
    header: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, paddingHorizontal: spacing.screenPadX, paddingVertical: 14, elevation: 4 },
    back: { marginRight: 12 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },

    mapMock: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e5e7eb' },
    mapText: { fontSize: 16, fontWeight: '700', color: colors.inkSoft, marginTop: 12 },
    mapSub: { fontSize: 13, color: colors.inkFaint },

    bottomSheet: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, elevation: 20 },
    timeInfo: { marginBottom: 16 },
    distanceText: { fontSize: 22, fontWeight: '900', color: colors.ink },
    durationText: { fontSize: 16, fontWeight: '500', color: colors.inkSoft },
    subtitleText: { fontSize: 13, color: colors.inkSoft, marginTop: 4 },
    divider: { height: 1, backgroundColor: colors.line, marginBottom: 16 },

    routeBlock: { flexDirection: 'row', alignItems: 'stretch', marginBottom: 24 },
    routeLineCol: { width: 30, alignItems: 'center' },
    dotPickup: { width: 16, height: 16, borderRadius: 8, borderWidth: 4, borderColor: colors.ink, backgroundColor: colors.white },
    verticalLink: { width: 2, flex: 1, backgroundColor: colors.line, marginVertical: 4 },
    dotDropoff: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.danger },
    routeTextCol: { flex: 1 },
    routeLocation: {},
    label: { fontSize: 10, fontWeight: '700', color: colors.inkFaint, letterSpacing: 0.5 },
    name: { fontSize: 15, fontWeight: '700', color: colors.ink, marginTop: 2 },

    continueBtn: { backgroundColor: colors.goldDark, paddingVertical: 16, borderRadius: radius.button, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    continueBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
});
