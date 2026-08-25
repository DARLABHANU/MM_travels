import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIntentStore } from '../../store/intentStore';

export default function RentalCheckout() {
    const router = useRouter();
    const intent = useIntentStore(state => state.intent);
    const locations = useIntentStore(state => state.locations);

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={24} color="#000" /></TouchableOpacity>
            <Text style={styles.title}>Rental Service Checkout</Text>
            <Text>Intent: {intent?.serviceId}</Text>
            <Text>Rental Pickup: {locations.rental_pickup?.address?.name || 'Missing'}</Text>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff', paddingTop: 60 },
    title: { fontSize: 24, fontWeight: 'bold', marginVertical: 10 },
    back: { marginBottom: 20 }
});
