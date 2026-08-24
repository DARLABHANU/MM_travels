import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { reverseGeocode } from '../services/location/geocodingService';
import { Coordinate } from '../types/location';

export default function PlanRouteScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{
        pickupLat: string, pickupLng: string,
        dropLat: string, dropLng: string
    }>();

    const [tripType, setTripType] = useState<'One-way' | 'Round trip'>('One-way');
    const [pickupTitle, setPickupTitle] = useState('Fetching location...');
    const [dropTitle, setDropTitle] = useState('Fetching... or Enter destination');
    const [stops, setStops] = useState<{ id: string, name: string }[]>([]);

    const scheduleSheetRef = useRef<BottomSheet>(null);
    const [scheduleType, setScheduleType] = useState<'Now' | 'Schedule'>('Schedule');
    const [selectedDate, setSelectedDate] = useState<number>(8);

    // Manual Time Entry state
    const [inputHour, setInputHour] = useState('09');
    const [inputMinute, setInputMinute] = useState('00');
    const [inputAmPm, setInputAmPm] = useState<'AM' | 'PM'>('AM');

    const daysHeader = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const currentMonthDays = [27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

    useEffect(() => {
        const fetchNames = async () => {
            if (params.pickupLat && params.pickupLng) {
                const coord: Coordinate = { latitude: parseFloat(params.pickupLat), longitude: parseFloat(params.pickupLng) };
                const loc = await reverseGeocode(coord);
                if (loc && loc.name) {
                    setPickupTitle(loc.name);
                } else if (loc && loc.formattedAddress) {
                    setPickupTitle(loc.formattedAddress.split(',')[0]);
                } else {
                    setPickupTitle('Selected Pickup');
                }
            } else {
                setPickupTitle('Current Location');
            }

            if (params.dropLat && params.dropLng) {
                const coord: Coordinate = { latitude: parseFloat(params.dropLat), longitude: parseFloat(params.dropLng) };
                const loc = await reverseGeocode(coord);
                if (loc && loc.name) {
                    setDropTitle(loc.name);
                } else if (loc && loc.formattedAddress) {
                    setDropTitle(loc.formattedAddress.split(',')[0]);
                } else {
                    setDropTitle('Selected Destination');
                }
            } else {
                setDropTitle('Enter destination');
            }
        };

        fetchNames();
    }, [params]);

    const addStop = () => {
        if (stops.length >= 4) {
            alert('Maximum stops reached.');
            return;
        }
        setStops([...stops, { id: Math.random().toString(), name: 'Select location' }]);
    };

    const removeStop = (id: string) => {
        setStops(stops.filter(s => s.id !== id));
    };

    const handleContinue = () => {
        scheduleSheetRef.current?.expand();
    };

    const handleConfirmSchedule = () => {
        scheduleSheetRef.current?.close();
        router.push({
            pathname: '/c6-vehicle-results',
            params: {
                pickupLat: params.pickupLat,
                pickupLng: params.pickupLng,
                dropLat: params.dropLat,
                dropLng: params.dropLng
            }
        });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Native Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Plan your route</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Segmented Control */}
                <View style={styles.segmentedControl}>
                    <TouchableOpacity
                        style={[styles.segmentBtn, tripType === 'One-way' && styles.segmentBtnActive]}
                        onPress={() => setTripType('One-way')}
                    >
                        <Text style={[styles.segmentText, tripType === 'One-way' && styles.segmentTextActive]}>
                            One-way
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.segmentBtn, tripType === 'Round trip' && styles.segmentBtnActive]}
                        onPress={() => setTripType('Round trip')}
                    >
                        <Text style={[styles.segmentText, tripType === 'Round trip' && styles.segmentTextActive]}>
                            Round trip
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Waypoint Builder List */}
                <View style={styles.waypointContainer}>

                    {/* Pickup Row */}
                    <View style={[styles.waypointRow, styles.waypointRowBordered]}>
                        <View style={styles.iconColumn}>
                            <View style={styles.pickupIcon}>
                                <View style={styles.pickupIconInner} />
                            </View>
                            <View style={styles.connectingLine} />
                        </View>
                        <View style={styles.waypointDetails}>
                            <Text style={styles.waypointLabel}>PICKUP</Text>
                            <Text style={styles.waypointName} numberOfLines={1}>{pickupTitle}</Text>
                        </View>
                    </View>

                    {/* Intermediate Stops */}
                    {stops.map((stop, index) => (
                        <View key={stop.id} style={[styles.waypointRow, styles.waypointRowBordered]}>
                            <View style={styles.iconColumn}>
                                <View style={styles.stopIcon}>
                                    <View style={styles.stopIconInner} />
                                </View>
                                <View style={styles.connectingLine} />
                            </View>
                            <View style={[styles.waypointDetails, { flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.waypointLabel}>STOP {index + 1}</Text>
                                    <Text style={styles.waypointName} numberOfLines={1}>{stop.name}</Text>
                                </View>
                                <TouchableOpacity onPress={() => removeStop(stop.id)} style={{ padding: 8 }}>
                                    <Ionicons name="close" size={20} color="#64748B" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    {/* Destination Row */}
                    <View style={[styles.waypointRow, styles.waypointRowBordered]}>
                        <View style={styles.iconColumn}>
                            <View style={styles.destinationIcon}>
                                <Ionicons name="flag" size={12} color="#FFF" />
                            </View>
                        </View>
                        <View style={styles.waypointDetails}>
                            <Text style={styles.waypointLabel}>DESTINATION</Text>
                            <Text style={[styles.waypointName, { color: '#64748B' }]} numberOfLines={1}>{dropTitle}</Text>
                        </View>
                    </View>

                </View>

                {/* Add Stop Button */}
                <TouchableOpacity style={styles.addStopBtn} onPress={addStop}>
                    <Ionicons name="add" size={20} color="#0F172A" style={{ paddingTop: 2 }} />
                    <Text style={styles.addStopText}>Add a stop</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Bottom Continue Action */}
            <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
                    <Text style={styles.continueBtnText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* SCHEDULE/DATE-TIME BOTTOM SHEET */}
            <BottomSheet
                ref={scheduleSheetRef}
                index={-1}
                snapPoints={['85%']}
                enablePanDownToClose
                handleIndicatorStyle={styles.sheetHandle}
                backgroundStyle={styles.sheetBackground}
                style={{ zIndex: 999, elevation: 999 }}
            >
                <View style={styles.sheetHeaderRow}>
                    <Text style={styles.sheetTitle}>When do you need a ride?</Text>
                    <TouchableOpacity onPress={() => scheduleSheetRef.current?.close()}>
                        <Ionicons name="close" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                <View style={styles.sheetSegmentedControl}>
                    <TouchableOpacity
                        style={[styles.sheetSegmentBtn, scheduleType === 'Now' && styles.sheetSegmentBtnActive]}
                        onPress={() => setScheduleType('Now')}
                    >
                        <Text style={[styles.sheetSegmentText, scheduleType === 'Now' && styles.sheetSegmentTextActive]}>Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.sheetSegmentBtn, scheduleType === 'Schedule' && styles.sheetSegmentBtnActive]}
                        onPress={() => setScheduleType('Schedule')}
                    >
                        <Text style={[styles.sheetSegmentText, scheduleType === 'Schedule' && styles.sheetSegmentTextActive]}>Schedule</Text>
                    </TouchableOpacity>
                </View>

                <BottomSheetScrollView contentContainerStyle={styles.sheetScroll}>
                    {scheduleType === 'Schedule' && (
                        <>
                            {/* Calendar Header */}
                            <View style={styles.calendarHeaderRow}>
                                <Text style={styles.monthTitle}>September 2023</Text>
                                <View style={styles.monthNav}>
                                    <TouchableOpacity style={styles.monthNavBtn}><Ionicons name="chevron-back" size={16} color="#000" /></TouchableOpacity>
                                    <TouchableOpacity style={styles.monthNavBtn}><Ionicons name="chevron-forward" size={16} color="#000" /></TouchableOpacity>
                                </View>
                            </View>

                            {/* Days of week */}
                            <View style={styles.weekRow}>
                                {daysHeader.map((d, i) => <Text key={i} style={styles.weekDayText}>{d}</Text>)}
                            </View>

                            {/* Pseudo Grid */}
                            <View style={styles.daysGrid}>
                                {currentMonthDays.map((d, i) => {
                                    const isPrevMonth = i < 5;
                                    const isSelected = !isPrevMonth && d === selectedDate;
                                    return (
                                        <TouchableOpacity
                                            key={i}
                                            style={styles.dayCellContainer}
                                            onPress={() => !isPrevMonth && setSelectedDate(d)}
                                        >
                                            <View style={isSelected ? styles.dayCellSelected : styles.dayCellStandard}>
                                                <Text style={[
                                                    styles.dayText,
                                                    isPrevMonth && styles.dayTextGrey,
                                                    isSelected && styles.dayTextSelected
                                                ]}>{d}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Time Section Manual Entry */}
                            <View style={styles.timeSectionHeader}>
                                <Ionicons name="time-outline" size={20} color="#0F172A" />
                                <Text style={styles.timeTitle}>Enter Time</Text>
                            </View>

                            <View style={styles.timeInputBox}>
                                <View style={styles.timeFieldGroup}>
                                    <TextInput
                                        style={styles.timeInputNode}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        value={inputHour}
                                        onChangeText={setInputHour}
                                        placeholder="HH"
                                        placeholderTextColor="#94A3B8"
                                    />
                                    <Text style={styles.timeColon}>:</Text>
                                    <TextInput
                                        style={styles.timeInputNode}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        value={inputMinute}
                                        onChangeText={setInputMinute}
                                        placeholder="MM"
                                        placeholderTextColor="#94A3B8"
                                    />
                                </View>

                                <View style={styles.ampmSelector}>
                                    <TouchableOpacity
                                        style={[styles.ampmButton, inputAmPm === 'AM' && styles.ampmButtonActive]}
                                        onPress={() => setInputAmPm('AM')}
                                    >
                                        <Text style={[styles.ampmText, inputAmPm === 'AM' && styles.ampmTextActive]}>AM</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.ampmButton, inputAmPm === 'PM' && styles.ampmButtonActive]}
                                        onPress={() => setInputAmPm('PM')}
                                    >
                                        <Text style={[styles.ampmText, inputAmPm === 'PM' && styles.ampmTextActive]}>PM</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Summary Card */}
                            <View style={styles.summaryCard}>
                                <Ionicons name="calendar-outline" size={24} color="#92400E" />
                                <View style={styles.summaryTextCol}>
                                    <Text style={styles.summaryTitle}>Pick-up scheduled</Text>
                                    <Text style={styles.summaryDetail}>Friday, Sep {selectedDate} at {inputHour.padStart(2, '0')}:{inputMinute.padStart(2, '0')} {inputAmPm}</Text>
                                </View>
                            </View>
                        </>
                    )}
                </BottomSheetScrollView>

                {/* Footer confirm */}
                <View style={[styles.bottomApplyZone, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                    <TouchableOpacity style={styles.applyBtn} onPress={handleConfirmSchedule}>
                        <Text style={styles.applyBtnText}>Confirm Schedule</Text>
                        <Ionicons name="arrow-forward" size={20} color="#92400E" />
                    </TouchableOpacity>
                </View>
            </BottomSheet>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC', // slightly softer background to highlight cards
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        height: 60,
        backgroundColor: '#F8FAFC',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        marginLeft: 8,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#E2E8F0',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    segmentBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    segmentBtnActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    segmentText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748B',
    },
    segmentTextActive: {
        color: '#0F172A',
    },
    waypointContainer: {
        marginBottom: 16,
    },
    waypointRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        backgroundColor: '#FFF',
        minHeight: 76,
    },
    waypointRowBordered: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        marginBottom: 8,
        elevation: 1, // slight shadow for crisp UI
    },
    iconColumn: {
        width: 50,
        alignItems: 'center',
        paddingTop: 16,
    },
    connectingLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#CBD5E1', // solid line linking them down
        marginTop: 6,
        marginBottom: -10,
        zIndex: -1,
    },
    pickupIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickupIconInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#0F172A',
    },
    stopIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stopIconInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#64748B', // grey
    },
    destinationIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    waypointDetails: {
        flex: 1,
        paddingVertical: 14,
        paddingRight: 16,
        justifyContent: 'center',
    },
    waypointLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    waypointName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    addStopBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#94A3B8',
        borderStyle: 'dashed',
        backgroundColor: '#FFF',
    },
    addStopText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginLeft: 8,
    },
    bottomContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: '#F8FAFC',
    },
    continueBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        paddingVertical: 16,
        borderRadius: 14,
    },
    continueBtnText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginRight: 8,
    },
    // ---- Bottom Sheet C5 Styles ----
    sheetBackground: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    sheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#CBD5E1',
        borderRadius: 2.5,
        marginTop: 10,
    },
    sheetHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 12,
        marginBottom: 16,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
    },
    sheetSegmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
        marginHorizontal: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    sheetSegmentBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    sheetSegmentBtnActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sheetSegmentText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#475569',
    },
    sheetSegmentTextActive: {
        color: '#0F172A',
        fontWeight: '600',
    },
    sheetScroll: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    calendarHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    monthNavBtn: {
        padding: 8,
        marginLeft: 8,
    },
    weekRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    weekDayText: {
        width: '14.28%',
        textAlign: 'center',
        fontSize: 14,
        color: '#475569',
        fontWeight: '500',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
    },
    dayCellContainer: {
        width: '14.28%',
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    dayCellStandard: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayCellSelected: {
        width: 42,
        height: 42,
        backgroundColor: '#000',
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayText: {
        fontSize: 16,
        color: '#0F172A',
        fontWeight: '500',
    },
    dayTextGrey: {
        color: '#CBD5E1',
    },
    dayTextSelected: {
        color: '#FFF',
        fontWeight: '700',
    },
    timeSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    timeTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        marginLeft: 8,
    },
    timeScroll: {
        paddingRight: 20,
        marginBottom: 24,
    },
    timeInputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 12,
        marginBottom: 24,
    },
    timeFieldGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeInputNode: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        width: 50,
        height: 48,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    timeColon: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        marginHorizontal: 8,
    },
    ampmSelector: {
        flexDirection: 'row',
        backgroundColor: '#E2E8F0',
        borderRadius: 8,
        padding: 4,
    },
    ampmButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    ampmButtonActive: {
        backgroundColor: '#FFF',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    ampmText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
    },
    ampmTextActive: {
        color: '#0F172A',
    },
    summaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    summaryTextCol: {
        marginLeft: 12,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0F172A',
    },
    summaryDetail: {
        fontSize: 14,
        color: '#475569',
        marginTop: 2,
    },
    bottomApplyZone: {
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    applyBtn: {
        backgroundColor: '#FBBF24',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    applyBtnText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#92400E',
        marginRight: 8,
    }
});
