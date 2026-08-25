import { create } from 'zustand';
import { Address, Coordinate } from '../types/location';

export type FlowType = 'CITY_RIDE' | 'POOL' | 'RENTAL' | 'PARCEL' | 'OUTSTATION';

export interface BookingIntent {
    serviceId: string; // e.g., 'city_ride', 'parcel', 'pool'
    flowType: FlowType;
    vehicleCategory?: string; // e.g., 'bike', 'cab', 'mini_truck'
    poolDetails?: {
        routeId: string;
        boardingStopId: string;
        destinationStopId: string;
        fromStopSequence: number;
        toStopSequence: number;
        fare: number | null;
        scheduledDeparture: string;
        vehicle: any;
        selectedSeats?: string[];
        holdId?: string;
        lockedUntil?: string;
    };
}

interface LocationState {
    pickup?: { coord: Coordinate; address: Address | null };
    dropoff?: { coord: Coordinate; address: Address | null };
    sender?: { coord: Coordinate; address: Address | null };
    receiver?: { coord: Coordinate; address: Address | null };
    origin?: { coord: Coordinate; address: Address | null };
    destination?: { coord: Coordinate; address: Address | null };
    rental_pickup?: { coord: Coordinate; address: Address | null };
    boarding?: { coord: Coordinate; address: Address | null };
}

interface IntentStoreState {
    intent: BookingIntent | null;
    locations: LocationState;
    setIntent: (intent: BookingIntent) => void;
    setLocation: (role: keyof LocationState, coord: Coordinate, address: Address | null) => void;
    clearIntent: () => void;
}

export const useIntentStore = create<IntentStoreState>((set) => ({
    intent: null,
    locations: {},

    setIntent: (intent) => set({ intent, locations: {} }), // Reset locations on new intent

    setLocation: (role, coord, address) => set((state) => ({
        locations: {
            ...state.locations,
            [role]: { coord, address }
        }
    })),

    clearIntent: () => set({ intent: null, locations: {} })
}));
