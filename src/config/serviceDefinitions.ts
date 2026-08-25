export type LocationRole = 'pickup' | 'dropoff' | 'sender' | 'receiver' | 'origin' | 'destination' | 'rental_pickup' | 'boarding';

export interface LocationRequirement {
    role: LocationRole;
    label: string;
    placeholder: string;
    required: boolean;
    pinType: string;
    routeParamKeys: { lat: string, lng: string, title?: string, subtitle?: string };
    searchEnabled: boolean;
    currentLocationEnabled: boolean;
    savedPlacesEnabled: boolean;
    allowMapSelection: boolean;
}

export type FlowType = 'CITY_RIDE' | 'POOL' | 'RENTAL' | 'PARCEL' | 'OUTSTATION';

export interface ServiceDefinition {
    id: string; // The canonical Service Contract (e.g., 'city_ride', 'parcel')
    flowType: FlowType;
    category: string;
    targetRoute: any; // Where the destination file should forward to after collecting locations
    locationRequirements: LocationRequirement[];
    scheduleEnabled: boolean;
    stopsEnabled: boolean;
}

// Reusable Requirement Templates
const PICKUP_REQ: LocationRequirement = {
    role: 'pickup',
    label: 'Pickup location',
    placeholder: 'Where should we pick you up?',
    required: true,
    pinType: 'pickup',
    routeParamKeys: { lat: 'pickupLat', lng: 'pickupLng', title: 'pickupTitle', subtitle: 'pickupSubtitle' },
    searchEnabled: true,
    currentLocationEnabled: true,
    savedPlacesEnabled: true,
    allowMapSelection: true,
};

const DROPOFF_REQ: LocationRequirement = {
    role: 'dropoff',
    label: 'Drop location',
    placeholder: 'Where are you going?',
    required: true,
    pinType: 'dropoff',
    routeParamKeys: { lat: 'dropLat', lng: 'dropLng', title: 'dropTitle', subtitle: 'dropSubtitle' },
    searchEnabled: true,
    currentLocationEnabled: false,
    savedPlacesEnabled: true,
    allowMapSelection: true,
};

// MASTER REGISTRY: Authoritative Services (NOT VEHICLES)
export const SERVICE_DEFINITIONS: Record<string, ServiceDefinition> = {
    // ------------------------------------
    // CITY RIDE (Covers Bike, Auto, Cab, XL)
    // ------------------------------------
    'city_ride': {
        id: 'city_ride',
        flowType: 'CITY_RIDE',
        category: 'city_ride',
        targetRoute: '/city-ride/checkout', // P0.3 Unified Intent-Aware Checkout
        locationRequirements: [PICKUP_REQ, DROPOFF_REQ],
        scheduleEnabled: true,
        stopsEnabled: true
    },

    // ------------------------------------
    // POOL
    // ------------------------------------
    'pool': {
        id: 'pool',
        flowType: 'POOL',
        category: 'pool',
        targetRoute: '/pool/search',
        locationRequirements: [
            {
                role: 'boarding',
                label: 'Boarding stop',
                placeholder: 'Leaving from',
                required: true,
                pinType: 'boarding',
                routeParamKeys: { lat: 'originLat', lng: 'originLng', title: 'originTitle' },
                searchEnabled: true,
                currentLocationEnabled: true,
                savedPlacesEnabled: true,
                allowMapSelection: true
            },
            {
                ...DROPOFF_REQ,
                role: 'destination',
                label: 'Destination stop',
                placeholder: 'Going to',
                routeParamKeys: { lat: 'destLat', lng: 'destLng', title: 'destTitle' }
            }
        ],
        scheduleEnabled: true,
        stopsEnabled: false
    },

    // ------------------------------------
    // RENTAL
    // ------------------------------------
    'rental': {
        id: 'rental',
        flowType: 'RENTAL',
        category: 'rental',
        targetRoute: '/rental/checkout',
        locationRequirements: [
            {
                ...PICKUP_REQ,
                role: 'rental_pickup',
                label: 'Pickup point',
                placeholder: 'Where do you need the vehicle?',
            }
        ],
        scheduleEnabled: true,
        stopsEnabled: false
    },

    // ------------------------------------
    // OUTSTATION
    // ------------------------------------
    'outstation': {
        id: 'outstation',
        flowType: 'OUTSTATION',
        category: 'outstation',
        targetRoute: '/outstation/checkout',
        locationRequirements: [
            {
                ...PICKUP_REQ,
                role: 'origin',
                label: 'Starting point',
                placeholder: 'Where are you starting from?',
                routeParamKeys: { lat: 'originLat', lng: 'originLng' }
            },
            {
                ...DROPOFF_REQ,
                role: 'destination',
                label: 'Destination city',
                placeholder: 'Which city are you travelling to?',
                routeParamKeys: { lat: 'destLat', lng: 'destLng' }
            }
        ],
        scheduleEnabled: true,
        stopsEnabled: false
    },

    // ------------------------------------
    // PARCEL
    // ------------------------------------
    'parcel': {
        id: 'parcel',
        flowType: 'PARCEL',
        category: 'delivery',
        targetRoute: '/parcel/checkout',
        locationRequirements: [
            {
                ...PICKUP_REQ,
                role: 'sender',
                label: 'Sender location',
                placeholder: 'Pickup package from',
                pinType: 'sender',
                routeParamKeys: { lat: 'senderLat', lng: 'senderLng', title: 'senderTitle' }
            },
            {
                ...DROPOFF_REQ,
                role: 'receiver',
                label: 'Receiver location',
                placeholder: 'Deliver package to',
                pinType: 'receiver',
                routeParamKeys: { lat: 'receiverLat', lng: 'receiverLng', title: 'receiverTitle' },
                savedPlacesEnabled: false
            }
        ],
        scheduleEnabled: false,
        stopsEnabled: false
    }
};

export const getServiceDefinition = (serviceId: string): ServiceDefinition | undefined => {
    return SERVICE_DEFINITIONS[serviceId];
};
