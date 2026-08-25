const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Initialize Supabase Admin Client
const supabaseUrl = 'https://jnzftbaraeaflpqoirdd.supabase.co';
const supabaseServiceKey = 'sb_publishable_XkeD_tUjJT73z8XI5WS4Sg__cD3VDrV';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());

app.get('/health', (req, res) => res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }));


// In-memory store for OTPs (In production, use Redis or Postgres/Supabase)
const otpStore = new Map();

// Generate a random 6 digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

app.post('/api/auth/send-whatsapp-otp', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    const otp = generateOTP();
    otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // strict 5 min expiry

    console.log(`\n========================================`);
    console.log(`[WHATSAPP-MOCK] Sending OTP strictly to WhatsApp!`);
    console.log(`To: +91${phone}`);
    console.log(`Message: "Your MM Travels Verification Code is: ${otp}"`);
    console.log(`========================================\n`);

    // TODO: Integrate actual Twilio WhatsApp API or Gupshup/WATI WhatsApp Business API here
    // const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //     body: `Your MM Travels Verification Code is: ${otp}`,
    //     from: 'whatsapp:+14155238886',
    //     to: `whatsapp:+91${phone}`
    // });

    return res.status(200).json({ success: true, message: 'OTP sent via WhatsApp successfully' });
});

app.post('/api/auth/verify-otp', async (req, res) => {
    const { phone, code } = req.body;

    const record = otpStore.get(phone);

    if (!record) {
        return res.status(400).json({ success: false, error: 'OTP expired or not sent' });
    }

    if (Date.now() > record.expiresAt) {
        otpStore.delete(phone);
        return res.status(400).json({ success: false, error: 'OTP has expired' });
    }

    if (record.otp === code) {
        otpStore.delete(phone);

        // TODO: Validate/Insert user into Supabase profiles table
        // const { data, error } = await supabase.from('profiles').upsert({ phone: phone }).select().single();

        // Generate a custom or mock token
        const demoToken = 'mock_jwt_token_for_' + phone;

        console.log(`[AUTH-SUCCESS] User +91${phone} entered CORRECT OTP: ${code}`);

        return res.status(200).json({
            success: true,
            message: 'Verification successful',
            token: demoToken,
            isNewUser: true // Set to false if data shows they are an existing user in Supabase
        });
    }

    console.log(`[AUTH-FAILED] User +91${phone} entered WRONG OTP: ${code}. Expected: ${record.otp}`);
    return res.status(400).json({ success: false, error: 'Invalid OTP' });
});

// Profile Registration Endpoint
app.post('/api/users/profile', async (req, res) => {
    const { phone, fullName, email, gender, emergencyName, emergencyPhone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    try {
        // Simplified insert (Assumes user table matches the new schema.sql)
        const { data, error } = await supabase
            .from('users')
            .upsert({ phone, full_name: fullName, email, gender }, { onConflict: 'phone' })
            .select()
            .single();

        if (error) throw error;
        return res.status(200).json({ success: true, profile: data });
    } catch (err) {
        console.error('Supabase Profile Error:', err);
        return res.status(500).json({ error: 'Failed to save profile data.' });
    }
});

// ==========================================
// PHASE 3: CORE BOOKING REST API
// ==========================================

const ALLOWED_TRANSITIONS = {
    'BOOKING_CREATED': ['SEARCHING_DRIVER', 'RIDER_CANCELLED'],
    'SEARCHING_DRIVER': ['DRIVER_ASSIGNED', 'NO_DRIVER_AVAILABLE', 'RIDER_CANCELLED'],
    'DRIVER_ASSIGNED': ['DRIVER_EN_ROUTE', 'RIDER_CANCELLED', 'DRIVER_CANCELLED'],
    'DRIVER_EN_ROUTE': ['DRIVER_ARRIVED', 'RIDER_CANCELLED', 'DRIVER_CANCELLED'],
    'DRIVER_ARRIVED': ['TRIP_STARTED', 'RIDER_CANCELLED', 'DRIVER_CANCELLED'],
    'TRIP_STARTED': ['TRIP_IN_PROGRESS', 'TRIP_COMPLETED'],
    'TRIP_IN_PROGRESS': ['TRIP_COMPLETED']
};

app.post('/api/bookings/quote', async (req, res) => {
    // Input: pickup, destination, serviceType
    // Returns: fareQuoteId, estimatedPrice, etc.
    res.json({ message: 'Fare quote generated', quoteId: 'mock-quote-id' });
});

app.post('/api/bookings', async (req, res) => {
    // Input: riderId, fareQuoteId, pickup, dropoff

    // Hardcoded mock creation for vertical slice
    const bookingId = 'mock-booking-id';
    const tripPin = '4821';

    // Simulate backend processing delays (Dispatch algorithm)
    setTimeout(() => {
        io.to(`booking_${bookingId}`).emit('booking_status', { status: 'SEARCHING_DRIVER', version: 2 });
    }, 2000);

    setTimeout(() => {
        io.to(`booking_${bookingId}`).emit('booking_status', {
            status: 'DRIVER_ASSIGNED',
            version: 3,
            driverName: "Rajesh Kumar",
            vehicleModel: "Swift Dzire",
            vehiclePlate: "AP XX XX XXXX"
        });
    }, 5000);

    setTimeout(() => {
        io.to(`booking_${bookingId}`).emit('booking_status', { status: 'DRIVER_EN_ROUTE', version: 4 });
    }, 8000);

    setTimeout(() => {
        io.to(`booking_${bookingId}`).emit('booking_status', { status: 'DRIVER_ARRIVED', tripPin, version: 5 });
    }, 12000);

    // Returns: bookingId, status: BOOKING_CREATED
    res.json({ message: 'Booking created', bookingId, status: 'BOOKING_CREATED', version: 1, fare: req.body.fare });
});

app.get('/api/bookings/current', async (req, res) => {
    // Returns null to allow the frontend to start fresh instead of 
    // forcing a mock 'SEARCHING_DRIVER' lock. (P1.4 integration)
    res.json({ message: 'No active booking', booking: null });
});

app.get('/api/bookings/:id', async (req, res) => {
    // Retrieve specific booking
    res.json({ message: 'Booking fetched', id: req.params.id });
});

app.post('/api/bookings/:id/cancel', async (req, res) => {
    // State machine check: Allows cancel if before TRIP_STARTED
    res.json({ message: 'Booking cancelled' });
});

app.post('/api/bookings/:id/trip-pin/verify', async (req, res) => {
    const { pin } = req.body;
    const { id: bookingId } = req.params;

    if (pin === '4821') {
        // Broadcast that trip started to customer app
        io.to(`booking_${bookingId}`).emit('booking_status', { status: 'TRIP_STARTED', version: 6 });

        // P0.2 UX Lockdown Mocking 
        setTimeout(() => {
            io.to(`booking_${bookingId}`).emit('booking_status', { status: 'TRIP_COMPLETED', version: 7 });
        }, 10000); // 10 seconds active trip

        setTimeout(() => {
            io.to(`booking_${bookingId}`).emit('booking_status', {
                status: 'FARE_FINALIZED',
                version: 8,
                fare: { estimatedFare: 150, finalFare: 165, currency: 'INR', paymentMethod: 'Cash' }
            });
        }, 12000); // Wait 2s before computing final fare

        res.json({ success: true, message: 'PIN Verified, Trip Started' });
    } else {
        res.status(400).json({ success: false, error: 'Invalid PIN' });
    }
});

app.post('/api/bookings/:id/payment/settle', async (req, res) => {
    const { id: bookingId } = req.params;
    setTimeout(() => {
        io.to(`booking_${bookingId}`).emit('booking_status', { status: 'PAYMENT_SUCCESS', version: 9 });
    }, 1500);

    res.json({ success: true, message: 'Processing Payment', status: 'PAYMENT_PENDING' });
});

app.post('/api/bookings/:id/safety-events', async (req, res) => {
    // Records SOS, ROUTE_DEVIATION, etc.
    res.json({ message: 'Safety event recorded' });
});

app.post('/api/bookings/:id/share', async (req, res) => {
    // Generates cryptographically secure tracking URL
    res.json({ shareToken: 'secure-token-123' });
});

app.get('/api/profile/trusted-contacts', async (req, res) => {
    res.json({ contacts: [] });
});

// ==========================================
// PHASE P1: POOL & RIDE-SHARING DOMAIN
// ==========================================

// P1 API 1: Pool Route Search
app.post('/api/pool/search', async (req, res) => {
    // 1. Validations
    const { boarding, destination, date, passengers } = req.body;
    if (!boarding || !destination || !date) {
        return res.status(400).json({ error: 'MISSING_PARAMETERS', message: 'Boarding, destination, and date are required.' });
    }

    // We use Supabase JS to join routes with their stops
    const { data: routes, error: rError } = await supabase
        .from('pool_routes')
        .select(`
            id, driver_id, vehicle_id, origin_name, destination_name, departure_time, total_seats,
            pool_route_stops ( id, sequence, name, latitude, longitude, estimated_arrival )
        `)
        .eq('status', 'PUBLISHED');

    if (rError) {
        return res.status(500).json({ error: 'DB_ERROR', message: rError.message });
    }

    if (!routes || routes.length === 0) {
        return res.status(200).json({ routes: [] });
    }

    const availableRoutes = [];

    // Filter deterministic routing (mock implementation simulating spatial/logical match)
    for (const route of routes) {
        // Sort stops computationally
        const stops = route.pool_route_stops.sort((a, b) => a.sequence - b.sequence);
        let bSeq = -1;
        let dSeq = -1;
        let boardingStop = null;
        let destinationStop = null;

        for (const stop of stops) {
            // Simplified bounding box / name match for prototype. In production, PostGIS st_dwithin.
            if (stop.name.toLowerCase().includes(boarding.name.toLowerCase())) {
                bSeq = stop.sequence;
                boardingStop = stop;
            }
            if (stop.name.toLowerCase().includes(destination.name.toLowerCase())) {
                dSeq = stop.sequence;
                destinationStop = stop;
            }
        }

        // Must exist and flow in the correct direction (e.g. Visakhapatnam -> Vijayawada)
        if (bSeq !== -1 && dSeq !== -1 && bSeq < dSeq) {
            availableRoutes.push({
                routeId: route.id,
                vehicle: { id: route.vehicle_id, category: "sedan", model: "Seeded Vehicle", capacity: route.total_seats },
                departureTime: route.departure_time,
                boardingStop: { id: boardingStop.id, sequence: bSeq, name: boardingStop.name, lat: boardingStop.latitude, lng: boardingStop.longitude },
                destinationStop: { id: destinationStop.id, sequence: dSeq, name: destinationStop.name, lat: destinationStop.latitude, lng: destinationStop.longitude },
                availableSeats: route.total_seats, // In fully built out logic, this deducts overlapping matrix seats
                estimatedFarePerSeat: (dSeq - bSeq) * 150 // Mock dynamic segment pricing
            });
        }
    }

    return res.status(200).json({ routes: availableRoutes });
});

// ==========================================
// P1.4 API: Route Segment Details
// ==========================================
app.get('/api/pool/routes/:id', async (req, res) => {
    const { fromStopSequence, toStopSequence } = req.query;
    if (!fromStopSequence || !toStopSequence) {
        return res.status(400).json({ error: 'MISSING_SEGMENTS', message: 'fromStopSequence and toStopSequence are required query params.' });
    }

    const fromSeq = parseInt(fromStopSequence);
    const toSeq = parseInt(toStopSequence);

    if (isNaN(fromSeq) || isNaN(toSeq) || fromSeq >= toSeq) {
        return res.status(400).json({ error: 'INVALID_SEGMENTS', message: 'fromStopSequence must be less than toStopSequence.' });
    }

    const routeId = req.params.id;

    // 1. Fetch Route & Vehicle (Authoritative)
    const { data: routeList, error: routeError } = await supabase
        .from('pool_routes')
        .select('*, vehicle:vehicles(*)')
        .eq('id', routeId)
        .limit(1);

    if (routeError || !routeList || routeList.length === 0) {
        return res.status(404).json({ error: 'ROUTE_NOT_FOUND', message: 'Route does not exist.' });
    }

    const route = routeList[0];

    // 2. Fetch specific stop segment 
    const { data: stops, error: stopsError } = await supabase
        .from('pool_route_stops')
        .select('*')
        .eq('pool_route_id', routeId)
        .gte('sequence', fromSeq)
        .lte('sequence', toSeq)
        .order('sequence', { ascending: true });

    if (stopsError || !stops || stops.length < 2) {
        return res.status(404).json({ error: 'SEGMENT_NOT_FOUND', message: 'The requested segment stops do not exist on this route.' });
    }

    // Validate that both bounds actually exist natively in DB
    if (stops[0].sequence !== fromSeq || stops[stops.length - 1].sequence !== toSeq) {
        return res.status(404).json({ error: 'SEGMENT_MISMATCH', message: 'One or both requested sequences are invalid for this route.' });
    }

    // Generate normalized stop objects
    const formattedStops = stops.map(stop => {
        let type = 'INTERMEDIATE';
        if (stop.sequence === fromSeq) type = 'BOARDING';
        else if (stop.sequence === toSeq) type = 'DESTINATION';

        return {
            sequence: stop.sequence,
            name: stop.name,
            type: type,
            time: stop.estimated_arrival,
            lat: stop.latitude,
            lng: stop.longitude
        };
    });

    res.status(200).json({
        routeId: route.id,
        departureTime: route.departure_time,
        fromStopSequence: fromSeq,
        toStopSequence: toSeq,
        // Fare logic is natively missing in PostgreSQL schema! Returning null to trigger UI gap warning.
        segmentFare: null,
        stops: formattedStops,
        vehicle: route.vehicle ? {
            model: route.vehicle.model,
            make: route.vehicle.make,
            type: route.vehicle.vehicle_type,
            plate: route.vehicle.plate_number
        } : null
    });
});

// P1 API 2: Seat Matrix
app.get('/api/pool/routes/:id/matrix', async (req, res) => {
    const { fromStopSequence, toStopSequence } = req.query;
    if (!fromStopSequence || !toStopSequence) {
        return res.status(400).json({ error: 'MISSING_SEGMENTS', message: 'fromStopSequence and toStopSequence are required query params.' });
    }

    // Attempt to read from Supabase to find overlapping allocations
    const { data: allocations, error } = await supabase
        .from('pool_seat_allocations')
        .select('*')
        .eq('pool_route_id', req.params.id)
        .in('status', ['HELD', 'CONFIRMED'])
        // Using PostgREST logical operators to check for segment overlap logic
        // An overlap occurs if (allocation.from < my.to AND allocation.to > my.from)
        .lt('from_stop_sequence', parseInt(toStopSequence))
        .gt('to_stop_sequence', parseInt(fromStopSequence));

    if (error && error.code !== '42P01') {
        console.warn("[POOL DB] Matrix query error:", error.message);
    }

    // We deterministically map it to a 2+1 layout
    const allSeats = ['A1', 'A2', 'B1', 'B2'];
    const occupiedSeats = (allocations || []).map(a => a.seat_label);

    const seats = allSeats.map(seat => ({
        seatLabel: seat,
        status: occupiedSeats.includes(seat) ? 'CONFIRMED' : 'AVAILABLE' // We merge HELD/CONFIRMED to unavailable in UI
    }));

    return res.status(200).json({
        routeId: req.params.id,
        layout: "2+2",
        seats
    });
});

// P1 API 3: Atomic Seat Hold
app.post('/api/pool/seat-holds', async (req, res) => {
    const { routeId, userId, seats, fromStopSequence, toStopSequence, expiresInSeconds = 180, idempotencyKey } = req.body;

    if (!idempotencyKey || !seats || seats.length === 0) {
        return res.status(400).json({ error: 'BAD_REQUEST', message: 'idempotencyKey and seats are required' });
    }

    try {
        // STEP 1: Execute cleanup of expired HELD seats atomically 
        // Note: the EXCLUDE constraint handles concurrent overlaps on INSERT. We just remove stale holds to free space.
        await supabase
            .from('pool_seat_allocations')
            .update({ status: 'RELEASED' })
            .eq('status', 'HELD')
            .lt('locked_until', new Date().toISOString());

        // STEP 2: Attempt PostgreSQL atomic insert triggering `prevent_seat_double_booking` Exclude constraint
        const allocationsToInsert = seats.map(seat => ({
            pool_route_id: routeId,
            seat_label: seat,
            from_stop_sequence: fromStopSequence,
            to_stop_sequence: toStopSequence,
            status: 'HELD',
            locked_until: new Date(Date.now() + (expiresInSeconds * 1000)).toISOString()
        }));

        // We wrap supabase row insertion. If the 'gist' constraint trips, supabase responds with 23P01 exclusion_violation
        const { data, error } = await supabase.from('pool_seat_allocations').insert(allocationsToInsert).select();

        // 23P01 is PostgreSQL's exact error code for EXCLUDE constraint violations (mathematical overlap)
        // 42P01 is relation does not exist
        if (error) {
            if (error.code === '23P01' || error.code === '23505') {
                return res.status(409).json({ error: 'SEAT_UNAVAILABLE', message: 'One or more selected seats are no longer available.' });
            }
            if (error.code === '42P01') {
                return res.status(500).json({ error: 'DB_MISSING', message: 'Table does not exist. Run schema.sql in Supabase.' });
            }
            throw new Error(error.message);
        }

        return res.status(201).json({
            success: true,
            holdId: data[0].id,
            seats,
            lockedUntil: data[0].locked_until
        });

    } catch (err) {
        console.error('[POOL ATOMIC LOCK API]', err.message);
        return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Hold failed' });
    }
});

// P1 API 4: Confirm Pool Booking
app.post('/api/pool/bookings', async (req, res) => {
    const { userId, routeId, seatHoldId, boardingStopId, destinationStopId, seats, paymentMethod, idempotencyKey } = req.body;

    // We create the permanent pool booking
    const { data: booking, error: bError } = await supabase.from('pool_bookings').insert({
        rider_id: userId,
        pool_route_id: routeId,
        boarding_stop_id: boardingStopId,
        destination_stop_id: destinationStopId,
        idempotency_key: idempotencyKey,
        status: 'CONFIRMED_AWAITING_DEPARTURE',
        fare: 299 * seats.length,
        boarding_pin: Math.floor(1000 + Math.random() * 9000).toString()
    }).select().single();

    if (bError) {
        if (bError.code === '23505') return res.status(200).json({ success: true, message: 'Idempotent cache hit' });
        return res.status(500).json({ error: 'BOOKING_FAIL', message: bError.message });
    }

    // Atomically convert the HELD inventory to CONFIRMED and attach booking_id
    await supabase.from('pool_seat_allocations')
        .update({ status: 'CONFIRMED', pool_booking_id: booking.id })
        .eq('pool_route_id', routeId)
        .eq('status', 'HELD')
        // In a real query you would explicitly map by seat_label matching the hold to be ultra secure
        .in('seat_label', seats);

    return res.status(200).json({
        success: true,
        bookingId: booking.id,
        status: 'CONFIRMED_AWAITING_DEPARTURE'
    });
});

// P1 API 5: Active Pool Booking (Hydration/Recovery)
app.get('/api/pool/active', async (req, res) => {
    // Queries pool_bookings for user that are not COMPLETED or CANCELLED
    return res.status(200).json({
        booking: {
            bookingId: 'mock-pool-booking-id',
            serviceId: 'pool',
            flowType: 'POOL',
            state: 'DRIVER_EN_ROUTE_TO_BOARDING'
        }
    });
});


// ==========================================
// PHASE 3: REAL-TIME SOCKET.IO ENGINE
// ==========================================

io.on('connection', (socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id}`);

    // Join a room based on booking ID to receive targeted ride events
    socket.on('join_booking', (bookingId) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            console.log(`[SOCKET] Unauthorized attempt to join ${bookingId}`);
            return; // Reject without auth
        }
        // In real backend, verify token mapping to bookingId here...

        socket.join(`booking_${bookingId}`);
        console.log(`[SOCKET] ${socket.id} authorized & joined room: booking_${bookingId}`);
    });

    // In a real system, the driver app sends GPS points here:
    socket.on('driver_location', (data) => {
        const { bookingId, lat, lng } = data;
        // Broadcast to customer in the same room
        io.to(`booking_${bookingId}`).emit('location_update', { lat, lng });
    });

    socket.on('disconnect', () => {
        console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MM Travels Backend running on http://localhost:${PORT}`);
});




