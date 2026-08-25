-- ============================================================================
-- ONLY RUN THIS FILE: POOL & RIDE-SHARING DOMAIN
-- ============================================================================

DROP TYPE IF EXISTS pool_route_status CASCADE;
CREATE TYPE pool_route_status AS ENUM (
    'PUBLISHED',
    'BOARDING',
    'IN_TRANSIT',
    'COMPLETED',
    'CANCELLED'
);

DROP TYPE IF EXISTS pool_booking_status CASCADE;
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

DROP TYPE IF EXISTS pool_seat_status CASCADE;
CREATE TYPE pool_seat_status AS ENUM (
    'AVAILABLE',
    'HELD',
    'CONFIRMED',
    'RELEASED'
);

-- Note: We assume users, drivers, and vehicles exist in your schema already.
DROP TABLE IF EXISTS pool_seat_allocations CASCADE;
DROP TABLE IF EXISTS pool_bookings CASCADE;
DROP TABLE IF EXISTS pool_route_stops CASCADE;
DROP TABLE IF EXISTS pool_routes CASCADE;

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


-- ============================================================================
-- SEED DETERMINISTIC MOCK DATA FOR POOL TESTING
-- ============================================================================
-- Since this relies on foreign keys to drivers/vehicles, we insert a mock driver/vehicle first:
DO $$
DECLARE
    mock_user_id UUID;
    mock_driver_id UUID;
    mock_vehicle_id UUID;
    mock_route_id UUID;
BEGIN
    -- 1. Create a mock user
    INSERT INTO users (phone, full_name, email) 
    VALUES ('+919999999999', 'Pool Mock Driver', 'poolmock@mmtravels.com')
    ON CONFLICT (phone) DO UPDATE SET phone=EXCLUDED.phone
    RETURNING id INTO mock_user_id;

    -- 2. Create the mock driver
    INSERT INTO drivers (user_id, license_number) 
    VALUES (mock_user_id, 'AP-MOCK-POOL-DR')
    ON CONFLICT (license_number) DO UPDATE SET license_number=EXCLUDED.license_number
    RETURNING id INTO mock_driver_id;

    -- 3. Create the mock vehicle
    INSERT INTO vehicles (driver_id, plate_number, make, model, vehicle_type) 
    VALUES (mock_driver_id, 'AP-31-MOCK', 'Toyota', 'Innova', 'XL')
    ON CONFLICT (plate_number) DO UPDATE SET plate_number=EXCLUDED.plate_number
    RETURNING id INTO mock_vehicle_id;

    -- 4. Create the deterministic Route
    INSERT INTO pool_routes (driver_id, vehicle_id, origin_name, destination_name, departure_time, total_seats)
    VALUES (mock_driver_id, mock_vehicle_id, 'Visakhapatnam', 'Vijayawada', NOW() + INTERVAL '1 day', 4)
    RETURNING id INTO mock_route_id;

    -- 5. Seed the sequence of stops
    INSERT INTO pool_route_stops (pool_route_id, sequence, name, latitude, longitude, estimated_arrival) VALUES 
    (mock_route_id, 1, 'Visakhapatnam', 17.6868, 83.2185, NOW() + INTERVAL '1 day'),
    (mock_route_id, 2, 'Anakapalle', 17.6896, 83.0024, NOW() + INTERVAL '1 day 1 hour'),
    (mock_route_id, 3, 'Rajahmundry', 17.0005, 81.8040, NOW() + INTERVAL '1 day 4 hours'),
    (mock_route_id, 4, 'Vijayawada', 16.5062, 80.6480, NOW() + INTERVAL '1 day 7 hours');
END $$;
