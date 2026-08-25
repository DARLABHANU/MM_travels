# MM Travels: Service Domain Architecture Specification

## 1. Pool & Ride-Sharing Domain
**Concept**: Drivers/Agencies publish scheduled routes with specific stops and seat capacity. Riders search for routes and book specific seats (partial inventory reservation).

### Frontend Screens
* `/pool/checkout` (Entry) -> Resolves search parameters (Boarding/Destination).
* `/pool/search` -> Live list of upcoming departures matching route.
* `/pool/details` -> Route stops timeline, vehicle info, driver rating, passenger manifest.
* `/pool/seat-map` -> Visual seat selector (1x2, 2x2 layouts) with real-time locking.
* `/pool/payment` -> Fare summary per seat.
* `/pool/boarding-pass` -> QR code, trip pin, boarding point walking directions.
* `/pool/live-tracking` -> Shared timeline for the vehicle.

### Backend & Database (Required Additions)
* `pool_routes`: (id, driver_id, vehicle_id, start_time, base_price, status)
* `pool_stops`: (id, route_id, lat, lng, name, estimated_arrival, stop_order)
* `pool_seats`: (id, route_id, seat_number, status [AVAILABLE, LOCKED, BOOKED], booking_id)
* `pool_bookings`: References `bookings` but adds `seat_ids`, `boarding_stop_id`, `drop_stop_id`.

### APIs & WebSockets
* `GET /api/pool/search`: (originLat, originLng, destLat, destLng, date, seats)
* `GET /api/pool/route/:id/seats`: Returns seat matrix.
* `POST /api/pool/seat/lock`: Temporary Redis lock on a seat for 3 minutes during checkout.
* Socket `pool:seat_update`: Broadcasts when someone locks/books a seat so other users see it turn grey instantly.
* Socket `pool:live_location`: Broadcasts driver location to all manifested riders.

---

## 2. Parcel Delivery Domain
**Concept**: Dedicated pickup and dropoff of physical goods requiring sender/receiver isolation and OTP-secured handover.

### Frontend Screens
* `/parcel/checkout` (Entry) -> Collects Sender/Receiver coords.
* `/parcel/details` -> Package Weight (0-5kg, 5-15kg), Dimensions, Fragile Toggle, Category (Documents, Electronics).
* `/parcel/receiver-info` -> Receiver Name & Phone Number.
* `/parcel/vehicle` -> Bike vs Mini-Truck selector based on weight.
* `/parcel/payment` -> Quote and payment.
* `/parcel/tracking` -> Sender tracking view (shows driver to pickup, then driver to dropoff).
* `/parcel/shared-tracking` -> Web-link / App view for the Receiver to track inbound package.

### Backend & Database (Required Additions)
* `parcel_bookings`: Inherits `bookings`, adds `package_weight`, `package_category`, `is_fragile`, `receiver_phone`, `receiver_name`, `pickup_otp`, `delivery_otp`.

### APIs & WebSockets
* `POST /api/parcel/quote`: Calculates fare based on distance + weight multiplier.
* `POST /api/parcel/verify_delivery`: Driver calls this with the Receiver's OTP to transition to DELIVERED.
* Socket `parcel:status`: Updates sender app when status moves from PICKUP -> IN_TRANSIT -> DELIVERED.

---

## 3. Outstation Domain
**Concept**: Long-distance intercity booking (One-way or Round-trip) requiring advance scheduling, driver allowance processing, and toll/tax exclusion transparency.

### Frontend Screens
* `/outstation/checkout` (Entry) -> Origin/Destination.
* `/outstation/trip-type` -> Select `One-Way` vs `Round-Trip`.
* `/outstation/dates` -> Departure Date/Time, Return Date/Time (calendar).
* `/outstation/vehicles` -> Sedan, SUV, Traveller.
* `/outstation/fare-breakdown` -> Detailed view showing Base Fare (x km included), Driver Allowance (per day), State Tax (estimated/excluded), Tolls.
* `/outstation/booking-active` -> Long-running trip management screen.

### Backend & Database (Required Additions)
* `outstation_bookings`: Inherits `bookings`, adds `is_round_trip`, `departure_time`, `return_time`, `included_km`, `driver_allowance_per_day`, `overage_rate_per_km`.

### APIs & WebSockets
* `POST /api/outstation/quote`: Calculates multi-day pricing. Need backend logic to sum driver beta (allowance) for X days.
* `POST /api/outstation/settle`: Calculates final odometer readings to bill overages/tolls.
* Websocket: Standard live tracking (low frequency to save battery on long trips).

---

## 4. Rental Domain
**Concept**: Hourly/Kilometer based packages for local self-drive or driver-included rentals. Fixed start/end locations.

### Frontend Screens
* `/rental/checkout` (Entry) -> Only requires `rental_pickup`.
* `/rental/packages` -> 2 Hrs / 20 km, 4 Hrs / 40 km, 8 Hrs / 80 km.
* `/rental/vehicles` -> Fleet selection.
* `/rental/deposit` -> Pre-authorization payment hold (if self-drive).
* `/rental/active` -> Timer showing time remaining, current KM consumed via GPS vs allowance.
* `/rental/completion` -> Final settlement calculation for overages.

### Backend & Database (Required Additions)
* `rental_packages`: (id, duration_hours, included_km, base_price, extra_km_rate, extra_hour_rate).
* `rental_bookings`: Inherits `bookings`, adds `package_id`, `start_odometer`, `end_odometer`, `overage_fee`.

### APIs & WebSockets
* `GET /api/rental/catalog`: Fetches dynamic packages.
* `POST /api/rental/start`: Driver logs starting odometer.
* `POST /api/rental/end`: Driver logs ending odometer, backend calculates overages.

---

## Infrastructure Matrix (Shared vs Specific)

| Feature | City Ride | Pool | Parcel | Outstation | Rental |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Store (intentStore)** | `pickup`, `dropoff` | `boarding`, `destination` | `sender`, `receiver` | `origin`, `destination` | `rental_pickup` |
| **Pricing Engine** | `Base + Distance*Rate` | `Fixed per seat` | `Distance*Rate + WeightFee` | `(Daily Base*Days) + Beta` | `Package Base + Overage` |
| **Driver Assignment** | Broadcast (Fastest) | Pre-Published by Driver | Broadcast / Manual | Agency Dispatched | Agency Dispatched |
| **Payment Trigger** | Post-Ride | Pre-Paid (Seat Lock) | Pre-Paid / Cash on Delivery | Advance + Settlement | Deposit + Settlement |
| **State Machine** | Trip Started -> End | Route Started -> Stops | Pickup -> Transit -> Drop | Dispatch -> Trip -> End | Handover -> Return |
| **OTP Mechanism**| Ride Start OTP | Boarding Pass QR / Pin | Pickup OTP + Drop OTP | Ride Start OTP | Key Handover OTP |

## Recommended Implementation Order

1. **Pool & Ride-Sharing** (highest complexity, forces immediate establishment of the multi-stop & inventory architecture).
2. **Parcel Delivery** (introduces asynchronous receiver concepts and item metadata).
3. **Outstation** (introduces multi-day scheduling and complex fare breakdowns).
4. **Rental** (easiest to adapt once Outstation's time/distance overage logic is built).
