import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function C8ConfirmPayScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ price: string }>();

    const [selectedPayment, setSelectedPayment] = useState<'UPI' | 'CARD'>('UPI');
    const [couponCode, setCouponCode] = useState('');

    const price = params.price || '129';

    const handlePay = () => {
        router.push('/e1-payment-result');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Confirm & pay</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Hold Timer Banner */}
                <View style={styles.timerBanner}>
                    <Ionicons name="timer-outline" size={20} color="#000" />
                    <Text style={styles.timerText}>
                        Vehicle held for  <Text style={styles.timerCountdown}>09:42</Text>
                    </Text>
                </View>

                {/* Trip Summary Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Trip Summary</Text>

                    <View style={styles.carRow}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=200' }}
                            style={styles.carThumb}
                        />
                        <View style={styles.carInfo}>
                            <Text style={styles.carName}>Premium Sedan</Text>
                            <Text style={styles.carDesc}>AC, 4 Seats • Today, 14:30</Text>
                        </View>
                    </View>

                    {/* Route Line visual */}
                    <View style={styles.routeBlock}>
                        <View style={styles.routeLineCol}>
                            <View style={styles.dotPickup}></View>
                            <View style={styles.verticalLink}></View>
                            <View style={styles.dotDropoff}></View>
                        </View>

                        <View style={styles.routeTextCol}>
                            <View style={styles.routeNode}>
                                <Text style={styles.locationTitle}>Downtown Terminal</Text>
                                <Text style={styles.locationSub}>123 Business Ave, City Center</Text>
                            </View>
                            <View style={{ height: 20 }} />
                            <View style={styles.routeNode}>
                                <Text style={styles.locationTitle}>International Airport</Text>
                                <Text style={styles.locationSub}>Terminal 2, Departures</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Fare Details Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Fare Details</Text>

                    <View style={styles.fareRowContainer}>
                        <View style={styles.fareRow}>
                            <Text style={styles.fareLabel}>Base Fare</Text>
                            <Text style={styles.fareValue}>₹95</Text>
                        </View>
                        <View style={styles.fareRow}>
                            <Text style={styles.fareLabel}>Taxes & Fees</Text>
                            <Text style={styles.fareValue}>₹14</Text>
                        </View>
                        <View style={styles.fareRow}>
                            <Text style={styles.fareLabel}>Priority Booking</Text>
                            <Text style={styles.fareValue}>₹20</Text>
                        </View>
                    </View>

                    <View style={styles.dashedDivider}>
                        {/* CSS trick to render a pseudo dashed line block */}
                    </View>

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>₹{price}</Text>
                    </View>
                </View>

                {/* Coupon Input */}
                <View style={styles.couponRow}>
                    <View style={styles.couponInputWrapper}>
                        <TextInput
                            style={styles.couponInput}
                            placeholder="Enter coupon code"
                            placeholderTextColor="#94A3B8"
                            value={couponCode}
                            onChangeText={setCouponCode}
                        />
                    </View>
                    <TouchableOpacity style={styles.applyBtn} activeOpacity={0.8}>
                        <Text style={styles.applyBtnText}>Apply</Text>
                    </TouchableOpacity>
                </View>

                {/* Payment Method Section */}
                <Text style={styles.paymentSectionTitle}>Payment Method</Text>

                {/* UPI Card */}
                <TouchableOpacity
                    style={[styles.paymentCard, selectedPayment === 'UPI' && styles.paymentCardSelected]}
                    onPress={() => setSelectedPayment('UPI')}
                    activeOpacity={0.9}
                >
                    <Ionicons name="business-outline" size={24} color="#000" />
                    <View style={styles.paymentInfo}>
                        <Text style={styles.paymentTitle}>UPI</Text>
                        <Text style={styles.paymentDesc}>Google Pay, PhonePe, Paytm</Text>
                    </View>
                    <View style={[styles.radioCircle, selectedPayment === 'UPI' && styles.radioCircleSelected]}>
                        {selectedPayment === 'UPI' && <View style={styles.radioInner} />}
                    </View>
                </TouchableOpacity>

                {/* Credit Card Card */}
                <TouchableOpacity
                    style={[styles.paymentCard, selectedPayment === 'CARD' && styles.paymentCardSelected]}
                    onPress={() => setSelectedPayment('CARD')}
                    activeOpacity={0.9}
                >
                    <Ionicons name="card-outline" size={24} color="#000" />
                    <View style={styles.paymentInfo}>
                        <Text style={styles.paymentTitle}>•••• 4242</Text>
                        <Text style={styles.paymentDesc}>HDFC Bank Credit Card</Text>
                    </View>
                    <View style={[styles.radioCircle, selectedPayment === 'CARD' && styles.radioCircleSelected]}>
                        {selectedPayment === 'CARD' && <View style={styles.radioInner} />}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.addPaymentBtn}>
                    <Ionicons name="add" size={22} color="#000" />
                    <Text style={styles.addPaymentText}>Add new payment method</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Bottom Fixed Pay Bar */}
            <View style={[styles.footerBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <TouchableOpacity style={styles.payBtn} activeOpacity={0.9} onPress={handlePay}>
                    <Text style={styles.payBtnText}>Pay ₹{price}</Text>
                    <Ionicons name="arrow-forward" size={20} color="#92400E" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAF9', // extremely light gray/off-white background matching the image
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FCFCFC',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 100,
    },
    timerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDE68A', // soft peach/orange
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 20,
    },
    timerText: {
        fontSize: 15,
        color: '#000',
        marginLeft: 8,
        fontWeight: '500',
    },
    timerCountdown: {
        fontWeight: '800',
        fontSize: 16,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000',
        marginBottom: 16,
    },
    carRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    carThumb: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#E2E8F0',
        resizeMode: 'cover',
    },
    carInfo: {
        marginLeft: 12,
    },
    carName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000',
    },
    carDesc: {
        fontSize: 13,
        color: '#475569',
        marginTop: 2,
        fontWeight: '500',
    },
    routeBlock: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    routeLineCol: {
        width: 24,
        alignItems: 'center',
        paddingTop: 4,
        paddingBottom: 4,
    },
    dotPickup: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#000',
    },
    verticalLink: {
        width: 1,
        flex: 1,
        backgroundColor: '#CBD5E1',
        marginVertical: 4,
    },
    dotDropoff: {
        width: 10,
        height: 10,
        backgroundColor: '#92400E',
        borderRadius: 2,
    },
    routeTextCol: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    routeNode: {},
    locationTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },
    locationSub: {
        fontSize: 12,
        color: '#475569',
        marginTop: 2,
    },
    fareRowContainer: {
        gap: 12,
        marginBottom: 16,
    },
    fareRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fareLabel: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '500',
    },
    fareValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    dashedDivider: {
        height: 1,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 16,
        marginHorizontal: -2,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000',
    },
    totalValue: {
        fontSize: 22,
        fontWeight: '900',
        color: '#000',
    },
    couponRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    couponInputWrapper: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        backgroundColor: '#FFF',
        borderRadius: 8,
        height: 48,
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    couponInput: {
        fontSize: 15,
        color: '#000',
    },
    applyBtn: {
        backgroundColor: '#E2E8F0',
        height: 48,
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderRadius: 8,
        marginLeft: 12,
    },
    applyBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000',
    },
    paymentSectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000',
        marginBottom: 12,
    },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 12,
    },
    paymentCardSelected: {
        borderColor: '#000',
        borderWidth: 1.5,
    },
    paymentInfo: {
        flex: 1,
        marginLeft: 16,
    },
    paymentTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#000',
    },
    paymentDesc: {
        fontSize: 13,
        color: '#475569',
        marginTop: 2,
        fontWeight: '500',
    },
    radioCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioCircleSelected: {
        borderColor: '#000',
        borderWidth: 3,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#000',
    },
    addPaymentBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 4,
    },
    addPaymentText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000',
        marginLeft: 8,
    },
    footerBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FCFCFC',
        paddingHorizontal: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    payBtn: {
        backgroundColor: '#FBBF24', // golden orange
        flexDirection: 'row',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payBtnText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#92400E',
        marginRight: 8,
    }
});
