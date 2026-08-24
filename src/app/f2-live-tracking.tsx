import { Ionicons } from '@expo/vector-icons';
import Mapbox, { Camera, MapView } from '@rnmapbox/maps';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function F2LiveTrackingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const mapRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);

    // Example Coordinates for Driver & User
    const [mockDriverCoord] = useState([77.5946, 12.9716]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>MM Travels</Text>

                <TouchableOpacity style={styles.sosBtn} activeOpacity={0.8}>
                    <Text style={styles.sosText}>SOS</Text>
                </TouchableOpacity>
            </View>

            {/* Map Telemetry Area */}
            <View style={styles.mapContainer}>
                {Platform.OS !== 'web' && (
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        styleURL={Mapbox.StyleURL.Street}
                        logoEnabled={false}
                    >
                        <Camera
                            ref={cameraRef}
                            defaultSettings={{
                                centerCoordinate: mockDriverCoord,
                                zoomLevel: 15,
                            }}
                        />
                        {/* You would inject dynamic driver puck markers and live route lines here */}
                    </MapView>
                )}

                {/* Floating Recenter Map Button */}
                <TouchableOpacity style={styles.recenterBtn} activeOpacity={0.9}>
                    <Ionicons name="locate" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Bottom Sheet Modal Zone */}
            <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>

                {/* Drag Handle */}
                <View style={styles.handleWrap}>
                    <View style={styles.handleBar} />
                </View>

                {/* Arriving & PIN Block */}
                <View style={styles.topStatusRow}>
                    <View style={styles.statusLeft}>
                        <Text style={styles.statusLabel}>ARRIVING IN</Text>
                        <Text style={styles.statusTextPrimary}>4 mins</Text>
                    </View>
                    <View style={styles.statusRight}>
                        <Text style={styles.pinLabel}>PIN</Text>
                        <View style={styles.pinBox}>
                            <Text style={styles.pinText}>4 8 2 1</Text>
                        </View>
                    </View>
                </View>

                {/* Driver Profile Array */}
                <View style={styles.driverRow}>
                    <View style={styles.avatarWrap}>
                        <View style={styles.avatarDummy} />
                        <View style={styles.ratingBadge}>
                            <Text style={styles.ratingText}>4.9</Text>
                            <Ionicons name="star" size={10} color="#000" />
                        </View>
                    </View>

                    <View style={styles.driverData}>
                        <Text style={styles.driverName}>Ramesh K.</Text>
                        <Text style={styles.carModel}>Swift Dzire • White</Text>
                    </View>

                    <View style={styles.licensePlateBox}>
                        <Text style={styles.licenseText}>KA 01 AB 1234</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Actions Grid */}
                <View style={styles.actionsGrid}>
                    <TouchableOpacity style={styles.actionBlockBtn}>
                        <Ionicons name="share-social-outline" size={22} color="#000" style={{ marginBottom: 4 }} />
                        <Text style={styles.actionBlockText}>Share trip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBlockBtn}>
                        <Ionicons name="headset-outline" size={22} color="#000" style={{ marginBottom: 4 }} />
                        <Text style={styles.actionBlockText}>Help</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionBlockBtn, styles.cancelBlock]}>
                        <Ionicons name="close-outline" size={24} color="#DC2626" style={{ marginBottom: 2 }} />
                        <Text style={styles.actionBlockCancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        justifyContent: 'space-between',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#000',
    },
    sosBtn: {
        backgroundColor: '#DC2626', // Deep red
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    sosText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 13,
        letterSpacing: 0.5,
    },
    mapContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        position: 'relative',
    },
    map: {
        flex: 1,
    },
    recenterBtn: {
        position: 'absolute',
        right: 16,
        bottom: 24,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    bottomSheet: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        elevation: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    handleWrap: {
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 8,
    },
    handleBar: {
        width: 48,
        height: 5,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
    },
    topStatusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    statusLeft: {},
    statusLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#475569',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    statusTextPrimary: {
        fontSize: 22,
        fontWeight: '900',
        color: '#000',
    },
    statusRight: {
        alignItems: 'flex-end',
    },
    pinLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#475569',
        letterSpacing: 0.5,
        marginBottom: 4,
        marginRight: 4,
    },
    pinBox: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    pinText: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 2,
        color: '#000',
    },
    driverRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarWrap: {
        position: 'relative',
        marginRight: 16,
    },
    avatarDummy: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E2E8F0',
    },
    ratingBadge: {
        position: 'absolute',
        bottom: -6,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: '#FBBF24',
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    ratingText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#000',
        marginRight: 2,
    },
    driverData: {
        flex: 1,
    },
    driverName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000',
        marginBottom: 2,
    },
    carModel: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '500',
    },
    licensePlateBox: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    licenseText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#000',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 20,
    },
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    actionBlockBtn: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBlockText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#000',
    },
    cancelBlock: {
        backgroundColor: '#FEF2F2',
    },
    actionBlockCancelText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#DC2626',
    }
});
