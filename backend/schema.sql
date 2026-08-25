-- MM Travels Phase 3 Schema Definition
-- Run this in your Supabase SQL Editor

-- ENUMS
CREATE TYPE booking_status AS ENUM (
    'BOOKING_CREATED',
    'SEARCHING_DRIVER',
    'DRIVER_ASSIGNED',
    'DRIVER_EN_ROUTE',
    'DRIVER_ARRIVED',
    'TRIP_STARTED',
    'TRIP_IN_PROGRESS',
    'TRIP_COMPLETED',
    'NO_DRIVER_AVAILABLE',
    'DRIVER_CANCELLED',
    'RIDER_CANCELLED'
);

CREATE TYPE safety_event_type AS ENUM (
    'SOS_TRIGGERED',
    'SAFETY_REPORT',
    'ROUTE_DEVIATION',
    'DRIVER_BEHAVIOR',
    'ACCIDENT',
    'OTHER'
);

-- TABLES

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(255),
    gender VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    auto_share_trips BOOLEAN DEFAULT FALSE
);

CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    license_number VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    rating NUMERIC(3, 2) DEFAULT 5.00
);

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id),
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    make VARCHAR(50),
    model VARCHAR(50),
    vehicle_type VARCHAR(20), -- 'Bike', 'Auto', 'Cab', 'XL'
    color VARCHAR(30)
);

CREATE TABLE fare_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimated_price NUMERIC(10, 2) NOT NULL,
    distance_meters INT,
    duration_seconds INT,
    service_type VARCHAR(50),
    pickup_lat DOUBLE PRECISION,
    pickup_lng DOUBLE PRECISION,
    drop_lat DOUBLE PRECISION,
    drop_lng DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID REFERENCES users(id) NOT NULL,
    driver_id UUID REFERENCES drivers(id),
    vehicle_id UUID REFERENCES vehicles(id),
    fare_quote_id UUID REFERENCES fare_quotes(id),
    status booking_status DEFAULT 'BOOKING_CREATED' NOT NULL,
    trip_pin VARCHAR(4),
    pickup_lat DOUBLE PRECISION NOT NULL,
    pickup_lng DOUBLE PRECISION NOT NULL,
    drop_lat DOUBLE PRECISION NOT NULL,
    drop_lng DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE booking_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) NOT NULL,
    status booking_status NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE safety_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id),
    rider_id UUID REFERENCES users(id),
    driver_id UUID REFERENCES drivers(id),
    type safety_event_type NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

CREATE TABLE trusted_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE trip_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) NOT NULL,
    share_token VARCHAR(100) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) NOT NULL,
    reviewer_id UUID REFERENCES users(id) NOT NULL,
    reviewee_id UUID REFERENCES users(id) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PHASE P1: POOL & RIDE-SHARING DOMAIN
-- ============================================================================

CREATE TYPE pool_route_status AS ENUM (
    'PUBLISHED',
    'BOARDING',
    'IN_TRANSIT',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE pool_booking_status AS ENUM (
    'SEARCHING_ROUTES',
    'ROUTE_SELECTED',
    'SEATS_HELD',
    'PAYMENT_PENDING',
    'CONFIRMED',
    'AWAITING_DEPARTURE',
    'DRIVER_EN_ROUTE_TO_BOARDING',
    'BOARDING',
    'BOARDED',
    'IN_TRANSIT',
    'COMPLETED',
    'NO_ROUTE_FOUND',
    'SEAT_HOLD_EXPIRED',
    'PAYMENT_FAILED',
    'RIDER_CANCELLED',
    'DRIVER_CANCELLED',
    'ROUTE_CANCELLED',
    'BOARDING_MISSED',
    'SYSTEM_CANCELLED'
);

CREATE TYPE pool_seat_status AS ENUM (
    'AVAILABLE',
    'HELD',
    'CONFIRMED',
    'RELEASED'
);

CREATE TABLE pool_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    origin_name VARCHAR(255) NOT NULL,
    destination_name VARCHAR(255) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    total_seats INT NOT NULL,
    status pool_route_status DEFAULT 'PUBLISHED' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pool_route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_route_id UUID REFERENCES pool_routes(id) NOT NULL,
    sequence INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    estimated_arrival TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(pool_route_id, sequence)
);

CREATE TABLE pool_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID REFERENCES users(id) NOT NULL,
    pool_route_id UUID REFERENCES pool_routes(id) NOT NULL,
    boarding_stop_id UUID REFERENCES pool_route_stops(id) NOT NULL,
    destination_stop_id UUID REFERENCES pool_route_stops(id) NOT NULL,
    idempotency_key UUID UNIQUE NOT NULL,
    status pool_booking_status DEFAULT 'SEATS_HELD' NOT NULL,
    fare NUMERIC(10, 2) NOT NULL,
    boarding_pass_qr VARCHAR(255),
    boarding_pin VARCHAR(6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Segment-aware inventory allocation
CREATE TABLE pool_seat_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_route_id UUID REFERENCES pool_routes(id) NOT NULL,
    seat_label VARCHAR(10) NOT NULL, 
    pool_booking_id UUID REFERENCES pool_bookings(id),
    from_stop_sequence INT NOT NULL,
    to_stop_sequence INT NOT NULL,
    status pool_seat_status DEFAULT 'HELD' NOT NULL,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CHECK (from_stop_sequence < to_stop_sequence)
);

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE pool_seat_allocations 
ADD CONSTRAINT prevent_seat_double_booking 
EXCLUDE USING gist (
    pool_route_id WITH =,
    seat_label WITH =,
    int4range(from_stop_sequence, to_stop_sequence) WITH &&
) WHERE (status IN ('HELD', 'CONFIRMED'));

