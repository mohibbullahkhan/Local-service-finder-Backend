# LocalConnect Backend API

Production-ready TypeScript backend for **LocalConnect**, a local-services marketplace application connecting buyers with local service providers (electricians, plumbers, tutors, mechanics, cleaners, AC technicians).

Built with **Node.js, Express, Prisma ORM, PostgreSQL (Neon), Zod, JWT, and Multer**.

---

## 🚀 Quick Start & Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your Neon PostgreSQL database URLs (`DATABASE_URL` for pooled connection, `DIRECT_URL` for direct connection) and JWT secrets.

### 3. Database Migration & Seeding
```bash
# Push Prisma schema to PostgreSQL database
npx prisma db push
# Or run dev migrations:
# npx prisma migrate dev --name init

# Seed database with realistic test data
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```
The server will start at `http://localhost:5000`.

### 5. Run Automated Smoke Test Regression Suite
```bash
npm run test:smoke
```

---

## 🔑 Pre-Seeded Test Credentials

| Role | Phone Number | Password | Name / Details |
|---|---|---|---|
| **BUYER** | `+8801811111111` | `password123` | Rahim Chowdhury (Customer) |
| **PROVIDER** | `+8801911111111` | `password123` | Karim Electrical Solutions (Verified Pro) |
| **ADMIN** | `+8801700000000` | `password123` | System Administrator |

---

## 📡 API Routes & Authorization Reference

### Health & System
| Method | Path | Auth Requirement | Description |
|---|---|---|---|
| `GET` | `/` | Public | Welcome status API information |
| `GET` | `/api/health` | Public | System uptime & healthcheck |

### Authentication (`/api/auth`)
| Method | Path | Auth Requirement | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user (`BUYER` or `PROVIDER`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive access + refresh tokens |
| `POST` | `/api/auth/refresh` | Public | Rotate refresh token and obtain new access token |
| `POST` | `/api/auth/logout` | Public | Revoke refresh token |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user (+ provider profile if provider) |

### Users (`/api/users`)
| Method | Path | Auth Requirement | Description |
|---|---|---|---|
| `PATCH` | `/api/users/me` | Authenticated | Update user name, email, or avatar URL |

### Categories (`/api/categories`)
| Method | Path | Auth Requirement | Description |
|---|---|---|---|
| `GET` | `/api/categories` | Public | List all available service categories |

### Service Providers (`/api/providers`)
| Method | Path | Auth Requirement | Description |
|---|---|---|---|
| `GET` | `/api/providers` | Public | List active providers with city, area, category, q, page filters |
| `GET` | `/api/providers/:id` | Public | Get provider profile details, services, photos, and reviews |
| `GET` | `/api/providers/:id/reviews` | Public | Get paginated reviews for a provider |
| `POST` | `/api/providers/me` | `PROVIDER` role | Create caller's business profile |
| `GET` | `/api/providers/me` | `PROVIDER` role | Get caller's own provider profile |
| `PATCH` | `/api/providers/me` | `PROVIDER` role | Partial update of caller's own provider profile |
| `POST` | `/api/providers/me/services` | `PROVIDER` role | Add a new service offering |
| `PATCH` | `/api/providers/me/services/:id` | `PROVIDER` role | Update an owned service offering |
| `DELETE` | `/api/providers/me/services/:id` | `PROVIDER` role | Delete an owned service offering |
| `POST` | `/api/providers/me/photos` | `PROVIDER` role | Add a photo (direct URL or `multipart/form-data` upload) |
| `DELETE` | `/api/providers/me/photos/:id` | `PROVIDER` role | Delete an owned photo |
| `POST` | `/api/providers/me/verification` | `PROVIDER` role | Request provider account verification (`PENDING`) |

### Favorites (`/api/favorites`)
| Method | Path | Auth Requirement | Description |
|---|---|---|---|
| `GET` | `/api/favorites` | `BUYER` role | List caller's favorited service providers |
| `POST` | `/api/favorites/:providerId` | `BUYER` role | Favorite a provider |
| `DELETE` | `/api/favorites/:providerId` | `BUYER` role | Remove provider from favorites |

### Inquiries (`/api/inquiries`)
| Method | Path | Auth Requirement | Description |
|---|---|---|---|
| `POST` | `/api/inquiries` | `BUYER` role | Submit a service inquiry to a provider |
| `GET` | `/api/inquiries/sent` | `BUYER` role | List inquiries sent by caller |
| `GET` | `/api/inquiries/received` | `PROVIDER` role | List inquiries received by caller's provider profile |
| `PATCH` | `/api/inquiries/:id/status` | Authenticated | Update status (`PENDING` → `ACCEPTED`/`DECLINED`/`CANCELLED` → `COMPLETED`) |

### Reviews (`/api/reviews`)
| Method | Path | Auth Requirement | Description |
|---|---|---|---|
| `POST` | `/api/reviews` | `BUYER` role | Submit review for a `COMPLETED` inquiry (recalculates ratingAvg) |
| `GET` | `/api/reviews/providers/:id/reviews` | Public | Get paginated reviews for a provider |

### Administration (`/api/admin`)
| Method | Path | Auth Requirement | Description |
|---|---|---|---|
| `GET` | `/api/admin/verifications` | `ADMIN` role | List providers by verification status (`PENDING`, etc.) |
| `PATCH` | `/api/admin/verifications/:providerId` | `ADMIN` role | Approve (`VERIFIED`) or reject (`REJECTED`) provider verification |
| `GET` | `/api/admin/stats` | `ADMIN` role | Retrieve system user, profile, and inquiry metrics |
| `POST` | `/api/admin/categories` | `ADMIN` role | Create a new platform service category |
| `PATCH` | `/api/admin/categories/:id` | `ADMIN` role | Update an existing service category |
