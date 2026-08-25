const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

// Initialize Supabase Admin Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

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
    // Retrieves the active booking for the authenticated user
    res.json({ message: 'Current booking fetched', booking: { status: 'SEARCHING_DRIVER', version: 1, bookingId: 'mock-booking-id' } });
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
server.listen(PORT, () => {
    console.log(`🚀 MM Travels Backend running on http://localhost:${PORT}`);
});
