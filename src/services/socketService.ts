import { io, Socket } from 'socket.io-client';
import { useRideStore } from '../store/rideStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

class SocketService {
    private socket: Socket | null = null;
    private currentBookingId: string | null = null;

    connect(authToken: string) {
        if (this.socket?.connected) return;

        console.log('[SOCKET SERVICE] Connecting to', BACKEND_URL);

        this.socket = io(BACKEND_URL, {
            auth: { token: authToken }, // Secure phase 3.1 auth payload
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('[SOCKET SERVICE] Connected.', this.socket?.id);
            useRideStore.getState().setConnectionState('CONNECTED');

            // If we reconnected, we need to rejoin the specific room implicitly
            if (this.currentBookingId) {
                this.joinBookingRoom(this.currentBookingId);
                // The frontend caller (f2-live-tracking) is responsible for querying GET /api/bookings/current over HTTP to resync snapshot.
            }
        });

        this.socket.on('disconnect', () => {
            console.warn('[SOCKET SERVICE] Disconnected.');
            useRideStore.getState().setConnectionState('DISCONNECTED');
        });

        this.socket.on('connect_error', (err) => {
            console.error('[SOCKET SERVICE] Connection error:', err.message);
            useRideStore.getState().setConnectionState('RECONNECTING');
        });

        // ==========================================
        // SINGLE SOURCE OF TRUTH EVENT LISTENER
        // ==========================================
        this.socket.on('booking_status', (payload: any) => {
            console.log('[SOCKET SERVICE] Received booking_status payload:', payload);

            // Only accept events for our current tracking booking
            if (this.currentBookingId && payload.bookingId && payload.bookingId !== this.currentBookingId) {
                return;
            }

            // Route standard state machine payload into the central rideStore
            useRideStore.getState().applyServerBookingState(payload);
        });

        this.socket.on('location_update', (payload: any) => {
            // High frequency location pipe
            useRideStore.getState().setDriverLocation(payload.lat, payload.lng);
        });
    }

    joinBookingRoom(bookingId: string) {
        this.currentBookingId = bookingId;
        if (this.socket && this.socket.connected) {
            console.log(`[SOCKET SERVICE] Subscribing room => booking_${bookingId}`);
            this.socket.emit('join_booking', bookingId);
        }
    }

    leaveBookingRoom() {
        if (this.currentBookingId && this.socket) {
            console.log(`[SOCKET SERVICE] Unsubscribing room => booking_${this.currentBookingId}`);
            this.socket.emit('leave_booking', this.currentBookingId);
            this.currentBookingId = null;
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.currentBookingId = null;
        }
    }
}

export const socketService = new SocketService();
