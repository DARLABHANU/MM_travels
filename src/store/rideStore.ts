import { create } from 'zustand';

export type TripStateStatus =
    | 'NONE'
    | 'DRAFT'
    | 'QUOTE_REQUESTED'
    | 'QUOTE_READY'
    | 'BOOKING_CREATED'
    | 'SEARCHING_DRIVER'
    | 'DRIVER_ASSIGNED'
    | 'DRIVER_EN_ROUTE'
    | 'DRIVER_ARRIVED'
    | 'TRIP_STARTED'
    | 'TRIP_COMPLETED'
    | 'FARE_FINALIZED'
    | 'PAYMENT_PENDING'
    | 'PAYMENT_SUCCESS'
    | 'PAYMENT_FAILED'
    | 'RATING_PENDING'
    | 'COMPLETED'
    | 'RIDER_CANCELLED'
    | 'DRIVER_CANCELLED'
    | 'SYSTEM_CANCELLED'
    | 'NO_DRIVER_FOUND';

export interface DriverData {
    name: string;
    photoUrl?: string;
    rating?: number;
    phone?: string;
}

export interface VehicleData {
    model: string;
    color?: string;
    plateNumber: string;
}

export interface FareData {
    estimatedFare: number;
    finalFare?: number;
    currency: string;
    paymentMethod: string;
}

export interface RideState {
    bookingId: string | null;
    status: TripStateStatus;
    version: number;
    tripPin: string | null;
    driver: DriverData | null;
    vehicle: VehicleData | null;
    driverLocation: { lat: number, lng: number } | null;
    connectionState: 'DISCONNECTED' | 'RECONNECTING' | 'CONNECTED';
    fare: FareData | null;
    idempotencyKey: string | null; // Ensures re-booking fetches same state

    // Actions Server dictates
    applyServerBookingState: (payload: any) => void;
    setDriverLocation: (lat: number, lng: number) => void;
    setConnectionState: (state: 'DISCONNECTED' | 'RECONNECTING' | 'CONNECTED') => void;
    setIdempotencyKey: (key: string) => void;
    clearBooking: () => void;
}

export const useRideStore = create<RideState>((set, get) => ({
    bookingId: null,
    status: 'NONE',
    version: 0,
    tripPin: null,
    driver: null,
    vehicle: null,
    driverLocation: null,
    connectionState: 'DISCONNECTED',
    fare: null,
    idempotencyKey: null,

    applyServerBookingState: (payload: any) => {
        const current = get();

        // Idempotency / Versioning Check
        if (payload.version && payload.version <= current.version) {
            console.log(`[RIDE STORE] Ignoring stale event Version ${payload.version}. Current is ${current.version}`);
            return;
        }

        set({
            bookingId: payload.bookingId || current.bookingId,
            status: payload.status || current.status,
            version: payload.version || (current.version + 1), // If prototype backend missing version
            tripPin: payload.tripPin !== undefined ? payload.tripPin : current.tripPin,
            driver: payload.driverName ? { name: payload.driverName } : current.driver,
            vehicle: payload.vehicleModel ? { model: payload.vehicleModel, plateNumber: payload.vehiclePlate } : current.vehicle,
            fare: payload.fare || current.fare,
        });
    },

    setDriverLocation: (lat, lng) => set({ driverLocation: { lat, lng } }),
    setConnectionState: (state) => set({ connectionState: state }),
    setIdempotencyKey: (key) => set({ idempotencyKey: key }),
    clearBooking: () => set({
        bookingId: null,
        status: 'NONE',
        version: 0,
        tripPin: null,
        driver: null,
        vehicle: null,
        driverLocation: null,
        fare: null,
        idempotencyKey: null
    }),
}));
