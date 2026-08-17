# LocalConnect Backend (Express + Prisma + PostgreSQL)

This backend serves **LocalConnect**, a local-services marketplace application connecting buyers with local service providers (electricians, plumbers, tutors, mechanics, cleaners, AC technicians).

## Tech Stack
- **Node.js & Express**: High-performance RESTful API server using TypeScript throughout.
- **Prisma ORM**: Strongly typed database interactions with PostgreSQL.
- **PostgreSQL (Neon)**: Cloud-native PostgreSQL with support for connection pooling and direct migration access.
- **Zod**: Robust request body, query, and parameter validation.
- **JWT & Bcrypt**: Secure 15-minute access token & 30-day refresh token rotation.
- **Multer & Storage**: Modular file upload utility serving images via static routes `/uploads` or `/tmp` on serverless platforms.
- **Security**: Helmet, CORS, global and auth rate limiting (`express-rate-limit`).

---

## Getting Started

### 1. Installation

```bash
git clone https://github.com/mohibbullahkhan/Local-service-finder-Backend.git
cd Local-service-finder-Backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your PostgreSQL database connection strings in `.env`:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=*

DATABASE_URL="postgresql://user:password@ep-xxxx-pooler.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxxx.neon.tech/neondb?sslmode=require"

JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

### 3. Database Migration & Seed

Synchronize your schema and populate realistic test data:

```bash
npx prisma db push
npm run prisma:seed
```

### 4. Running the Application

```bash
# Development mode with hot reload
npm run dev

# Production build and run
npm run build
npm start
```

---

## Seeded Test Accounts

| Role | Phone | Password | Name |
|---|---|---|---|
| **BUYER** | `+8801811111111` | `password123` | Rahim Chowdhury |
| **PROVIDER** | `+8801911111111` | `password123` | Karim Electrical Solutions |
| **ADMIN** | `+8801700000000` | `password123` | System Admin |

---

## API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a buyer or provider account
- `POST /api/auth/login` — Authenticate and receive access & refresh tokens
- `POST /api/auth/refresh` — Rotate refresh token & obtain new access token
- `POST /api/auth/logout` — Revoke refresh token
- `GET /api/auth/me` — Get current authenticated user profile

### Categories (`/api/categories`)
- `GET /api/categories` — List all service categories

### Providers (`/api/providers`)
- `GET /api/providers` — Search/filter active providers by city, area, category, keyword (paginated)
- `GET /api/providers/:id` — Get detailed provider profile with services, photos, reviews
- `POST /api/providers/me` — Create provider profile (Provider role)
- `GET /api/providers/me` — Get own provider profile
- `PATCH /api/providers/me` — Update own provider profile
- `POST / PATCH / DELETE /api/providers/me/services/:id?` — Manage services under provider profile
- `POST / DELETE /api/providers/me/photos/:id?` — Upload/delete photos
- `POST /api/providers/me/verification` — Request account verification (`PENDING`)

### Favorites (`/api/favorites`)
- `GET /api/favorites` — List buyer's favorited providers
- `POST /api/favorites/:providerId` — Favorite a provider
- `DELETE /api/favorites/:providerId` — Unfavorite a provider

### Inquiries (`/api/inquiries`)
- `POST /api/inquiries` — Send service inquiry (Buyer)
- `GET /api/inquiries/sent` — View buyer's sent inquiries
- `GET /api/inquiries/received` — View provider's received inquiries
- `PATCH /api/inquiries/:id/status` — Update status (`PENDING` → `ACCEPTED`/`DECLINED`/`CANCELLED` → `COMPLETED`)

### Reviews (`/api/reviews`)
- `POST /api/reviews` — Submit review for a `COMPLETED` inquiry (atomic rating recalculation)
- `GET /api/reviews/providers/:id/reviews` — Get paginated reviews for a provider

### Admin (`/api/admin`)
- `GET /api/admin/verifications` — List providers by verification status
- `PATCH /api/admin/verifications/:providerId` — Approve or reject provider verification
- `GET /api/admin/stats` — System user, profile, and inquiry metrics
- `POST / PATCH /api/admin/categories/:id?` — Manage platform categories

---

## Deployment on Vercel

This repository is ready for serverless deployment on Vercel:

1. Import the repository in [Vercel](https://vercel.com).
2. Set environment variables (`DATABASE_URL`, `DIRECT_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`).
3. Deploy! Vercel automatically runs `prisma generate && tsc` via the `vercel-build` script.
