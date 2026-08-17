# LocalConnect Ecosystem - Complete Workflow & Architecture Guide

This document explains the end-to-end business logic, user flows, authorization roles, and system architecture for **LocalConnect**.

---

## 🎭 User Roles & Permissions Matrix

| Capability | Buyer (Customer) | Provider (Pro) | Admin |
|---|:---:|:---:|:---:|
| Browse Categories & Providers | ✅ | ✅ | ✅ |
| Filter by City, Area, Keyword | ✅ | ✅ | ✅ |
| Register / Login Account | ✅ | ✅ | ✅ |
| Create & Manage Provider Profile | ❌ | ✅ | ❌ |
| Add / Edit / Delete Services & Photos | ❌ | ✅ | ❌ |
| Submit Profile Verification Request | ❌ | ✅ | ❌ |
| Approve / Reject Verification Requests | ❌ | ❌ | ✅ |
| Save Favorite Providers | ✅ | ❌ | ❌ |
| Send Service Inquiries | ✅ | ❌ | ❌ |
| Accept / Decline / Complete Inquiries | ❌ | ✅ | ❌ |
| Submit Ratings & Reviews | ✅ (Completed only) | ❌ | ❌ |
| View System Metrics & Platform Stats | ❌ | ❌ | ✅ |

---

## 🔄 End-to-End System Workflows

```
  +-----------------------+           +-----------------------+           +-----------------------+
  |    1. PROVIDER FLOW   |           |     2. ADMIN FLOW     |           |    3. BUYER FLOW      |
  +-----------------------+           +-----------------------+           +-----------------------+
  | Register as PROVIDER  |           | Login as ADMIN        |           | Register / Login      |
  |                       |           |                       |           |                       |
  | Complete Business     |           | View Pending          |           | Browse Categories &   |
  | Profile & Services    |           | Verifications         |           | Active Providers      |
  |                       |           |                       |           |                       |
  | Request Verification  | --------> | Approve Profile       | --------> | See "Verified Pro"    |
  | (Status: PENDING)     |           | (Status: VERIFIED)    |           | Badge & Service Offer |
  +-----------------------+           +-----------------------+           +-----------+-----------+
                                                                                      |
                                                                                      v
  +-----------------------+           +-----------------------+           +-----------+-----------+
  |  5. RATING & REVIEWS  |           |   4. INQUIRY FLOW     |           |   Send Service Inquiry|
  +-----------------------+           +-----------------------+           |   (Status: PENDING)   |
  | Buyer submits Review  | <-------- | Provider Accepts &    | <---------+                       |
  | for COMPLETED service |           | Marks COMPLETED       |                                   |
  |                       |           +-----------------------+                                   |
  | RatingAvg & Count     |                                                                       |
  | Recalculated in DB    |                                                                       |
  +-----------------------+                                                                       |
```

---

## 🛠️ Detailed Step-by-Step Journeys

### Step 1: Service Provider Onboarding & Verification

1. **Registration**:
   - Provider signs up via `POST /api/auth/register` with `role: PROVIDER`.
2. **Profile Completion**:
   - Provider fills in business profile (`POST /api/providers/me`):
     - Business Name (e.g. *Karim Electrical Solutions*)
     - Description, City (e.g. *Dhaka*), Area (e.g. *Gulshan*)
     - Selects Categories (e.g. *Electrician*)
     - WhatsApp / Contact details
   - Adds service offerings with min/max price and unit (e.g. *Full House Wiring Check*, ৳1500 - ৳3000, *per visit*).
   - Uploads business photos/portfolio (`POST /api/providers/me/photos`).
3. **Verification Request**:
   - Provider clicks **Request Verification** (`POST /api/providers/me/verification`).
   - Profile `verificationStatus` changes from `UNVERIFIED` to `PENDING`.

---

### Step 2: Administrator Verification & Review

1. **Review Dashboard**:
   - Platform Admin logs in and calls `GET /api/admin/verifications?status=PENDING`.
   - Admin views all pending provider applications, checking business details and categories.
2. **Approval Action**:
   - Admin approves the provider (`PATCH /api/admin/verifications/:providerId` with `{ status: "VERIFIED" }`).
   - The provider profile status updates to `VERIFIED`.
3. **Live Status**:
   - Provider is now live in public search results (`GET /api/providers`) with a prominent **"Verified Pro"** badge.

---

### Step 3: Customer (Buyer) Discovery & Search

1. **Login & Rehydration**:
   - Buyer logs into account (`POST /api/auth/login` with `role: BUYER`).
2. **Browsing Services**:
   - Buyer views categories (*Electricians, Plumbers, Tutors, Mechanics, Cleaners, AC Technicians*).
   - Buyer filters by location (*City = Dhaka, Area = Gulshan*) or searches by keyword.
3. **Provider Details**:
   - Buyer inspects provider details (`GET /api/providers/:id`), reading description, offered services & pricing, photos, rating average, and previous customer reviews.
4. **Favorites**:
   - Buyer taps heart icon to save favorite providers (`POST /api/favorites/:providerId`).

---

### Step 4: Inquiry & Service Execution Lifecycle

1. **Send Inquiry**:
   - Buyer sends a booking request/inquiry (`POST /api/inquiries`) with message details.
   - Status initialized to `PENDING`.
2. **Provider Action**:
   - Provider views received inquiries (`GET /api/inquiries/received`).
   - Provider accepts request (`PATCH /api/inquiries/:id/status` with `{ status: "ACCEPTED" }`).
3. **Service Delivery & Completion**:
   - Provider delivers the service and marks inquiry as `COMPLETED` (`PATCH /api/inquiries/:id/status` with `{ status: "COMPLETED" }`).

---

### Step 5: Customer Review & Rating Calculation

1. **Review Submission**:
   - Buyer views sent inquiries (`GET /api/inquiries/sent`).
   - For `COMPLETED` inquiries, buyer submits a rating (1 to 5 stars) and optional comment (`POST /api/reviews`).
2. **Atomic DB Recalculation**:
   - The backend validates inquiry status is `COMPLETED` and that no prior review exists for this inquiry.
   - **In a single PostgreSQL transaction**, the backend creates the review record and recalculates the provider's `ratingAvg` and `ratingCount`.
3. **Public Score Update**:
   - Future buyers immediately see the updated average rating score and new customer review on the provider's profile.

---

## 🔑 Seeded Quick-Start Test Accounts

You can test every single step of this workflow immediately using these pre-seeded accounts:

| Role | Phone | Password | Name / Details |
|---|---|---|---|
| **BUYER** | `+8801811111111` | `password123` | Rahim Chowdhury (Customer) |
| **PROVIDER** | `+8801911111111` | `password123` | Karim Electrical Solutions (Verified Pro) |
| **ADMIN** | `+8801700000000` | `password123` | System Administrator |

---

## 🌐 API Base URLs

- **Vercel Production API**: `https://local-service-finder-backend.vercel.app/api`
- **Local Dev API**: `http://localhost:5000/api`
