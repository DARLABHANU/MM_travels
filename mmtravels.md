# MM Travels – Complete Application System Requirements & Design Specification (SRS)

## 1. Overview and Main Aim
**MM Travels** is a state-of-the-art "Super App" ride-hailing and travel platform designed to unify local and intercity transport. The primary objective is to replicate the low-friction, high-trust user experience of industry giants like Uber, Gojek, Rapido, and Ola, while maintaining localized features specific to the operating region.

The platform targets solving cognitive overload during ride booking by adopting **context-aware routing** (changing app terminology based on whether you are booking a City Ride, a Package delivery, or an Outstation rental). It heavily utilizes advanced algorithmic UI sorting (reordering services based on time/day) and precise physical interactions (Rapido-style map dragging).

---

## 2. Core Architecture
- **Framework:** React Native + Expo (TypeScript).
- **Navigation Engine:** `expo-router` using declarative file-based routing and deep-linking schemas.
- **Mapping Backend:** MapLibre GL (`@rnmapbox/maps`) rendering raw ShapeSource and CircleLayers for 60FPS fluid mapping, deprecating buggy React Native Maps.
- **Design System:** Unified UI with strict color tokenization (Navy, Gold, Ink, Rose) powered by a central `theme.ts` file.

---

## 3. Screen-by-Screen Detailed Specifications

### Phase 1: Authentication & Onboarding Flow
**Aim:** Convert a first-time downloader into a verified user securely and safely.

*   **`index.tsx` (App Root)**
    *   **Features:** Boots the Expo Router. Evaluates local storage hooks to determine if the user is authenticated. 
    *   **Connectivity:** Redirects unauthenticated users to `/onboarding`, authenticated to `/(tabs)/index`.

*   **`onboarding.tsx`**
    *   **Aim:** Value proposition presentation.
    *   **Features:** Horizontal carousel detailing the safety, speed, and variety of MM Travels.
    *   **Connectivity:** Outbound -> `mobile-number.tsx`.

*   **`mobile-number.tsx`**
    *   **Features:** Numeric keypad entry with regional country prefixing. Sends async request to backend for verification.
    *   **Connectivity:** Outbound -> `otp.tsx`.

*   **`otp.tsx`**
    *   **Features:** Secure 4-6 digit pin entry matrix. Auto-reads SMS if OS permissions allow.
    *   **Connectivity:** Outbound -> `profile-registration.tsx`.

*   **`profile-registration.tsx` & `kyc.tsx`**
    *   **Features:** Collects basic metadata (Name, Email). Drops user into an advanced KYC form (ID capture) specifically mandatory for intercity or drive-yourself services.
    *   **Connectivity:** Outbound -> `permissions.tsx`.

*   **`permissions.tsx`**
    *   **Features:** Triggers iOS/Android native popups for "Always-On Location" and "Push Notifications" crucial for tracking rides in the background.

---

### Phase 2: The Core Application (Bottom Tabs)
**Aim:** Providing a fast, non-cluttered hub for ride discovery.

*   **`(tabs)/index.tsx` (Home Screen)**
    *   **Main Aim:** The heart of the app. Where users initiate transport.
    *   **Features:** 
        *   **Ghost Vehicles:** Pulls an algorithm locally injecting faux-vehicles around the user GPS pin to artificially demonstrate fleet density.
        *   **Dynamic Intelligence Array:** The service grid detects the current local time. If morning (7-10 AM), it pushes "City Ride" and "Pool Ride" to the front. If a weekend, it pushes "Outstation" to slot #1.
    *   **Connectivity:** Triggers `destination.tsx` OR the `AllServicesModal`.

*   **`(tabs)/services.tsx` & `AllServicesModal.tsx`**
    *   **Features:** A comprehensive dictionary of every vertical (Bike, Cab, XL, Travel, Parcels, Rentals) organized categorically.

*   **`(tabs)/explore.tsx`**
    *   **Features:** Marketing hub. Promo banners ("First auto ride free") and cross-selling intercity travel packages.

*   **`(tabs)/trips.tsx` & `(tabs)/profile.tsx`**
    *   **Features:** Historical ledger of receipts. Account governance and settings portal.

---

### Phase 3: The Optimized Booking Engine 
**Aim:** Converting a user's intent to a booked ride in under 3 taps (Uber convention).

*   **`destination.tsx`** (Context-Aware Search)
    *   **Aim:** Determining A to B optimally.
    *   **Features:** 
        *   Contextual Language (if mode=parcel, it says "Sender address", not "Pickup").
        *   Debounced API reverse-geocoding (waits 300ms while typing to save backend hits).
        *   In-line embedded "Schedule Time" and "Add Multiple Stops" UI primitives on the front layer.
        *   Saved Places (Home/Work) cache array.
    *   **Connectivity:** Inbound from Home. Outbound -> `select-location-map.tsx` OR directly skips to `c6-vehicle-results.tsx`.

*   **`select-location-map.tsx`** (The Rapido Engine)
    *   **Aim:** High-precision map pointing for vague address zones.
    *   **Features:** Fixed center-pin crosshair. The user pans the MapLibre map underneath the pin. Emits throttled camera-idle updates converting map coordinates back to street strings. Color-codes Pin based on Pickup (Green) vs Dropoff (Red).
    *   **Connectivity:** Inbounds from `/destination`. Re-injects the selected lat/long parameters dynamically back into `/destination` seamlessly.

*   **`c6-vehicle-results.tsx`**
    *   **Aim:** Presenting pricing securely.
    *   **Features:** Calls OSRM (Open Source Routing Machine) to plot high-resolution neon-blue polylines between A and B on the map. Queries the fare estimations Matrix. Renders a bottom sheet displaying vehicle cards (Auto, Sedan, SUV) with capacity identifiers. Quick-selectors for Cash/Promo.
    *   **Connectivity:** Outbound -> `c7-vehicle-details.tsx`.

*   **`c7-vehicle-details.tsx` & `c8-confirm-pay.tsx`**
    *   **Features:** Final pre-flight confirmations. Validating user payment logic (Wallet deficit triggers).

---

### Phase 4: Driver Match & Active Journey
**Aim:** Establishing absolute trust through safety features and real-time WebSockets.

*   **`f1-driver-assignment.tsx`**
    *   **Features:** The Loading Terminal. A loop polling the backend waiting for a driver to accept the algorithmic broadcast.

*   **`f2-live-tracking.tsx`**
    *   **Features:** The Active Ride Screen. Real-time mapping rendering the Driver's car creeping toward the destination via continuous coordinate streams. Contains quick-escape triggers for Support.
    *   **Connectivity:** Exposes Modal overlays -> `f5-sos.tsx` (Triggering emergency endpoints) and `f6-trip-sharing.tsx` (Generating hash-URLs for relatives to follow the ride).

*   **`e1-payment-result.tsx` -> `g1-invoice.tsx` -> `g2-review.tsx`**
    *   **Features:** Trip completion teardown. Renders financial breakdowns of toll/surge pricing. Allows tip addition, followed by a unified feedback/star-rating matrix pushing to the driver's KPI database.

---

### Phase 5: The Specialized Ride-Pooling Flow
**Aim:** Grouping commuters along massive intercity arteries efficiently.

*   **`d1-pool-search.tsx`**
    *   **Features:** Displays horizontal, actionable "Timeline" strips (e.g. Departures in 5mins, 15mins). Employs psychological color highlighting (Rose Red) when seats are "< 2 left". Segments data by "Women Only" verification filters.

*   **`d2-pool-details.tsx` & `f4-pool-timeline.tsx`**
    *   **Features:** Micro-management interfaces plotting exactly where inter-city vans pull over to pick up secondary passengers so users understand minor route time deviations.

---

## 4. Services & Internal Logistics Engine (Hidden Architecture)
While the UI is robust, the internal math is isolated in `src/services/` micro-classes:

*   **`locationSearchService.ts`**: Handles typing text and retrieving Google Places/Mapbox Geostrings.
*   **`geocodingService.ts`**: The reverse side. Translates a dropped GPS Pin (Lat/Lng) back into a street address (e.g. 17.68N, 83.21E -> "Vizag Central").
*   **`routingService.ts`**: The backbone of the app. Computes the geometric polyline string arrays allowing us to draw the literal path the car will take on the map.
*   **`fareService.ts`**: Employs distance/duration multiplication against base rate scalars, modified by demand (surge metrics).

## 5. Master Summary
MM Travels' architecture eliminates user decision-fatigue by adopting unified, 2-click pathfinding directly borrowed from Tier-1 Silicon Valley ride-hailing systems. By compressing messy route-planners and leveraging high-performance MapLibre Map overlays with dynamic Pin interactions, the application yields an ultra-premium, trust-building experience.
