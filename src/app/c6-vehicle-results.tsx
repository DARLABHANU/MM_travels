import { Ionicons } from '@expo/vector-icons';
import Mapbox, { Camera, CircleLayer, LineLayer, MapView, ShapeSource } from '@rnmapbox/maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { reverseGeocode } from '../services/location/geocodingService';
import { getRoute, RouteResult } from '../services/location/routingService';
import { Coordinate } from '../types/location';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// Mock assets for vehicles since we need transparent backgrounds
const VEHICLE_MOCK_DATA = [
    {
        id: '1',
        type: 'Mini',
        capacity: 4,
        subtitle: '4 seats • AC hatchback',
        eta: '3 min away',
        price: '129',
        originalPrice: '145',
        image: 'https://cdn-icons-png.flaticon.com/512/3202/3202003.png' // generic car clip
    },
    {
        id: '2',
        type: 'Sedan',
        capacity: 4,
        subtitle: 'Comfy sedans',
        eta: '5 min away',
        price: '159',
        image: 'https://cdn-icons-png.flaticon.com/512/3202/3202003.png'
    },
    {
        id: '3',
        type: 'SUV',
        capacity: 6,
        subtitle: 'Spacious SUVs',
        eta: '8 min away',
        price: '249',
        image: 'https://cdn-icons-png.flaticon.com/512/3202/3202003.png'
    },
    {
        id: '4',
        type: 'Auto',
        capacity: 3,
        subtitle: 'Breezy rides',
        eta: '--',
        price: '--',
        image: 'https://cdn-icons-png.flaticon.com/512/3202/3202003.png'
    },
];

export default function C6VehicleResultsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{
        pickupLat: string, pickupLng: string,
        dropLat: string, dropLng: string
    }>();

    const mapRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);

    const [mapReady, setMapReady] = useState(false);
    const [pickupCoord, setPickupCoord] = useState<Coordinate | null>(null);
    const [dropCoord, setDropCoord] = useState<Coordinate | null>(null);
    const [pickupAddress, setPickupAddress] = useState('Resolving...');
    const [dropAddress, setDropAddress] = useState('Resolving...');

    const [route, setRoute] = useState<RouteResult | null>(null);
    const [isCalculating, setIsCalculating] = useState(true);
    const [routeError, setRouteError] = useState(false);

    const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_MOCK_DATA[0]);

    // Initial Processing
    useEffect(() => {
        if (params.pickupLat && params.pickupLng && params.dropLat && params.dropLng) {
            const pCoord = { latitude: parseFloat(params.pickupLat), longitude: parseFloat(params.pickupLng) };
            const dCoord = { latitude: parseFloat(params.dropLat), longitude: parseFloat(params.dropLng) };

            setPickupCoord(pCoord);
            setDropCoord(dCoord);
            fetchRoute(pCoord, dCoord);
        } else {
            console.error("Missing coordinates");
            setRouteError(true);
            setIsCalculating(false);
        }
    }, [params.pickupLat, params.pickupLng, params.dropLat, params.dropLng]);

    const fetchRoute = async (pickup: Coordinate, drop: Coordinate) => {
        setIsCalculating(true);
        setRouteError(false);
        try {
            const calculatedRoute = await getRoute(pickup, drop, []);
            setRoute(calculatedRoute);

            // Fetch short location names
            reverseGeocode(pickup).then(loc => {
                setPickupAddress(loc?.name ? loc.name : (loc?.formattedAddress ? loc.formattedAddress.split(',')[0] : 'Origin'));
            });
            reverseGeocode(drop).then(loc => {
                setDropAddress(loc?.name ? loc.name : (loc?.formattedAddress ? loc.formattedAddress.split(',')[0] : 'Destination'));
            });
        } catch (e) {
            setRouteError(true);
        } finally {
            setIsCalculating(false);
        }
    };

    const fitMapToBounds = (coords: Coordinate[]) => {
        if (cameraRef.current?.setCamera && coords.length >= 2) {
            const lats = coords.map(c => c.latitude);
            const lngs = coords.map(c => c.longitude);
            const sw = [Math.min(...lngs), Math.min(...lats)];
            const ne = [Math.max(...lngs), Math.max(...lats)];

            cameraRef.current.setCamera({
                bounds: { ne, sw, paddingTop: 40, paddingLeft: 40, paddingBottom: 40, paddingRight: 40 },
                animationDuration: 1200
            });
        }
    };

    useEffect(() => {
        if (mapReady && route && !isCalculating && pickupCoord && dropCoord) {
            const boundsCoords = route.coordinates.length > 0 ? [...route.coordinates, pickupCoord, dropCoord] : [pickupCoord, dropCoord];
            fitMapToBounds(boundsCoords);
        }
    }, [mapReady, route, isCalculating]);

    const geoJSONRoute = {
        type: 'FeatureCollection',
        features: route && route.coordinates.length > 0 ? [{
            type: 'Feature', PROPERTIES: {},
            geometry: {
                type: 'LineString',
                coordinates: route.coordinates.map(c => [c.longitude, c.latitude])
            }
        }] : []
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Choose a ride</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Subheader */}
            <View style={styles.subheader}>
                <View style={styles.addressRow}>
                    <Ionicons name="locate" size={16} color="#0F172A" />
                    <Text style={styles.addressText} numberOfLines={1}>{pickupAddress}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#475569" style={{ marginHorizontal: 8 }} />
                    <Text style={styles.addressText} numberOfLines={1}>{dropAddress}</Text>
                </View>
                <TouchableOpacity style={styles.nowBtn}>
                    <Ionicons name="time-outline" size={14} color="#000" />
                    <Text style={styles.nowBtnText}>Now</Text>
                </TouchableOpacity>
            </View>

            {/* Map Area */}
            <View style={styles.mapContainer}>
                {Platform.OS !== 'web' && (pickupCoord || dropCoord) && (
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        styleURL={Mapbox.StyleURL.Street}
                        logoEnabled={false}
                        onDidFinishLoadingMap={() => setMapReady(true)}
                    >
                        <Camera
                            ref={cameraRef}
                            defaultSettings={{
                                centerCoordinate: [(pickupCoord || dropCoord!).longitude, (pickupCoord || dropCoord!).latitude],
                                zoomLevel: 12,
                            }}
                        />

                        {route && mapReady && (
                            <ShapeSource id="routeSource" shape={geoJSONRoute as any}>
                                <LineLayer
                                    id="routeLayer"
                                    style={{ lineColor: '#3B82F6', lineWidth: 4, lineJoin: 'round', lineCap: 'round' }}
                                />
                            </ShapeSource>
                        )}
                        {/* Markers */}
                        {pickupCoord && mapReady && (
                            <ShapeSource id="pickupSource" shape={{ type: 'Feature', geometry: { type: 'Point', coordinates: [pickupCoord.longitude, pickupCoord.latitude] }, properties: {} } as any}>
                                <CircleLayer id="pickupLayerRing" style={{ circleColor: '#000000', circleRadius: 6, circleStrokeWidth: 2, circleStrokeColor: '#FFF' }} />
                            </ShapeSource>
                        )}
                        {dropCoord && mapReady && (
                            <ShapeSource id="dropSource" shape={{ type: 'Feature', geometry: { type: 'Point', coordinates: [dropCoord.longitude, dropCoord.latitude] }, properties: {} } as any}>
                                <CircleLayer id="dropLayerRing" style={{ circleColor: '#F59E0B', circleRadius: 6, circleStrokeWidth: 2, circleStrokeColor: '#FFF' }} />
                            </ShapeSource>
                        )}
                    </MapView>
                )}
            </View>

            {/* Vehicles Bottom View */}
            <View style={styles.bottomSheet}>
                <View style={styles.sheetHandleWrap}>
                    <View style={styles.sheetHandle} />
                </View>

                {isCalculating ? (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                ) : (
                    <ScrollView style={styles.carList} contentContainerStyle={{ paddingBottom: 100 }}>
                        {VEHICLE_MOCK_DATA.map((v) => {
                            const isSelected = selectedVehicle.id === v.id;
                            return (
                                <TouchableOpacity
                                    key={v.id}
                                    style={[styles.carCard, isSelected && styles.carCardSelected]}
                                    onPress={() => setSelectedVehicle(v)}
                                    activeOpacity={0.9}
                                >
                                    {isSelected && <View style={styles.selectedLeftStrip} />}

                                    <View style={styles.carImageBox}>
                                        <Image source={{ uri: v.image }} style={styles.carImage} resizeMode="contain" />
                                    </View>

                                    <View style={styles.carDetails}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={styles.carType}>{v.type}</Text>
                                            <Ionicons name="person" size={12} color="#000" style={{ marginLeft: 8, marginRight: 2 }} />
                                            <Text style={styles.carCapacity}>{v.capacity}</Text>
                                        </View>
                                        <Text style={styles.carSubtitle}>{v.subtitle}</Text>
                                        <Text style={styles.carEta}>{v.eta}</Text>
                                    </View>

                                    <View style={styles.carPriceZone}>
                                        <Text style={styles.carPrice}>{v.price !== '--' ? `₹${v.price}` : v.price}</Text>
                                        {v.originalPrice && (
                                            <Text style={styles.carOldPrice}>₹{v.originalPrice}</Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}

                {/* Footer Action Bar */}
                <View style={[styles.footerBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                    <View style={styles.footerTopRow}>
                        <TouchableOpacity style={styles.paymentBtn}>
                            <Ionicons name="cash" size={20} color="#000" />
                            <Text style={styles.paymentText}>Cash</Text>
                            <Ionicons name="chevron-down" size={16} color="#000" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.promoBtn}>
                            <Ionicons name="pricetag-outline" size={20} color="#000" />
                            <Text style={styles.promoText}>Promo</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.confirmBtn}
                        activeOpacity={0.9}
                        onPress={() => {
                            router.push({
                                pathname: '/c7-vehicle-details',
                                params: { type: selectedVehicle.type, price: selectedVehicle.price }
                            });
                        }}
                    >
                        <Text style={styles.confirmBtnText}>
                            Choose {selectedVehicle.type} · ₹{selectedVehicle.price}
                        </Text>
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
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    subheader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    addressText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#334155',
        marginLeft: 6,
        flexShrink: 1,
    },
    nowBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    nowBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginLeft: 4,
    },
    mapContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    map: {
        flex: 1,
    },
    centerBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomSheet: {
        backgroundColor: '#FFF',
        height: '55%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        elevation: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        position: 'relative',
    },
    sheetHandleWrap: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    sheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#E2E8F0',
        borderRadius: 2.5,
    },
    carList: {
        paddingHorizontal: 16,
    },
    carCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    carCardSelected: {
        borderColor: '#F59E0B',
        backgroundColor: '#FAFAF9',
    },
    selectedLeftStrip: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: '#F59E0B',
    },
    carImageBox: {
        width: 60,
        height: 40,
        backgroundColor: '#E2E8F0', // placeholder backdrop
        borderRadius: 8,
        marginRight: 16,
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    carImage: {
        width: '100%',
        height: '100%',
    },
    carDetails: {
        flex: 1,
    },
    carType: {
        fontSize: 17,
        fontWeight: '700',
        color: '#000',
    },
    carCapacity: {
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
    },
    carSubtitle: {
        fontSize: 13,
        color: '#475569',
        marginTop: 2,
    },
    carEta: {
        fontSize: 13,
        fontWeight: '600',
        color: '#000',
        marginTop: 2,
    },
    carPriceZone: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    carPrice: {
        fontSize: 18,
        fontWeight: '800',
        color: '#000',
    },
    carOldPrice: {
        fontSize: 14,
        color: '#94A3B8',
        textDecorationLine: 'line-through',
        marginTop: 2,
        fontWeight: '500',
    },
    footerBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    footerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    paymentBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
        marginHorizontal: 8,
    },
    promoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    promoText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
        marginLeft: 6,
    },
    confirmBtn: {
        backgroundColor: '#000',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmBtnText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    }
});
