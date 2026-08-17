# LocalConnect - End-to-End Manual Testing Guide

This guide outlines step-by-step manual test cases covering both the **Customer (Buyer)** and **Service Provider** workflows against the live backend API (`https://local-service-finder-backend.vercel.app/api`).

---

## 🧪 Pre-Requisites & Test Credentials

Ensure the backend server is reachable (or live on Vercel). Pre-seeded credentials:

- **Customer / Buyer Account**:
  - Phone: `+8801811111111`
  - Password: `password123`
- **Service Provider Account**:
  - Phone: `+8801911111111`
  - Password: `password123`
- **Platform Admin Account**:
  - Phone: `+8801700000000`
  - Password: `password123`

---

## 📱 Suite 1: Customer (Buyer) Workflows

### Test Case 1.1: Registration & Login
1. Open app -> tap **Log In** / **Sign Up**.
2. Select **Customer / Buyer** role tab.
3. Register new account with name, phone (`+8801800000001`), password (`password123`).
4. **Expected Result**: Successfully registers and lands on **Home Screen** displaying active service categories.

### Test Case 1.2: Category Filtering & Provider Search
1. On Home Screen, tap **Electrician** category card (or search *wiring* in search bar).
2. Filter by location: City = `Dhaka`, Area = `Gulshan`.
3. **Expected Result**: Active providers in Gulshan, Dhaka are listed with ratings, location, and price ranges.

### Test Case 1.3: View Provider Details & Reviews
1. Tap a provider card (e.g. *Karim Electrical Solutions*).
2. Verify business description, offered services with pricing, and customer reviews.
3. Tap the **Heart** icon on AppBar to add to Favorites.
4. **Expected Result**: Provider is added to Favorites (`/favorites`).

### Test Case 1.4: Submit Service Inquiry
1. On the provider detail screen, tap **Send Inquiry**.
2. Type message: `"Need urgent electrical inspection tomorrow."`
3. Tap **Submit Inquiry**.
4. **Expected Result**: Success banner appears. Inquiry is listed under **My Inquiries** tab with status `PENDING`.

### Test Case 1.5: Cancel Pending Inquiry
1. Go to **My Inquiries** tab.
2. Filter by `Pending`.
3. Tap **Cancel** on a pending inquiry and confirm dialog.
4. **Expected Result**: Status updates to `CANCELLED`.

---

## 🛠️ Suite 2: Service Provider Workflows

### Test Case 2.1: Provider Login & Dashboard Access
1. Log out of buyer account.
2. Log in with provider credentials (`+8801911111111` / `password123`).
3. **Expected Result**: Routed directly to **Provider Dashboard** (`/provider_dashboard`).

### Test Case 2.2: Profile & Verification Management
1. On dashboard, tap **Edit Profile**.
2. Update business description or city/area and save.
3. Tap **Submit Verification**.
4. **Expected Result**: Verification badge transitions from `UNVERIFIED` to `PENDING`.

### Test Case 2.3: Manage Offered Services & Photos
1. Tap **Manage Services** -> tap **Add Service**.
2. Enter: Name = `"AC Gas Refill"`, Min Price = `2000`, Max Price = `3500`, Unit = `per unit`.
3. Save service.
4. Tap **Manage Photos** -> select photo from gallery or enter image URL.
5. **Expected Result**: Service and photo appear in provider profile list.

### Test Case 2.4: Receive & Process Client Inquiries
1. Tap **Inquiries Inbox**.
2. Filter by `Pending`.
3. Locate incoming buyer inquiry. Confirm Buyer Name & Phone Number are displayed.
4. Tap **Accept** -> status becomes `ACCEPTED`.
5. Tap **Mark Completed** -> status becomes `COMPLETED`.
6. **Expected Result**: Inquiry status updates to `COMPLETED` on both provider and buyer devices.

---

## 🌟 Suite 3: Review & Rating Synchronization

### Test Case 3.1: Submit Customer Review & Recalculate Rating
1. Switch back to Buyer account.
2. Go to **My Inquiries** -> filter by `Completed`.
3. Tap **Write Review**.
4. Select `5 Stars` and comment: `"Outstanding service! Solved problem quickly."`
5. Tap **Submit Review**.
6. Open provider's public detail page.
7. **Expected Result**: Rating average (`ratingAvg`) and total review count (`ratingCount`) update atomically. Review appears under Customer Reviews feed.

---

## 🔄 Suite 4: Offline & Session Persistence Check

### Test Case 4.1: Session Persistence Across App Restart
1. Log into any account.
2. Force close/kill the app completely.
3. Relaunch app.
4. **Expected Result**: Splash screen rehydrates JWT token from secure storage and opens dashboard directly without requiring re-login.

### Test Case 4.2: Offline Network Error Handling
1. Turn off device Wi-Fi/Mobile Data (or disconnect internet).
2. Perform search or category filter.
3. **Expected Result**: App displays clear **"Unable to connect to server"** message with a **Retry** button instead of crashing.
