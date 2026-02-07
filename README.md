# Hotel System

Full-stack hotel management and booking platform with a Spring Boot backend, a Next.js admin console, and a Next.js public storefront.

## Architecture

- backend: Spring Boot 3.5 + JPA + Flyway + PostgreSQL
- apps/admin: Next.js admin console (RBAC, operations)
- apps/storefront: Next.js public booking site
- db/migrations: Flyway SQL migrations
- db/seeds: Optional manual seed scripts

## Core business logic

### Domain model (high level)

- Organization / Property: Properties define hotel locations and address details.
- Room Types: Describes a sellable unit (name, capacity, description, bed type). Can have many images.
- Rooms: Physical inventory linked to a Room Type.
- Rate Plans: Pricing plans (refundability, breakfast, cancellation policy).
- Rate Plan Prices: Nightly prices per room type and date.
- Guests / People: Guest profile data; guests link to reservations.
- Customers: Public user accounts for booking (separate from admin RBAC).
- Reservations: Multi-room booking with nightly rate snapshots, folio posting, and status transitions.
- Finance (Folio): Reservation charges are posted into a folio for accounting.

### Availability

- Availability is calculated per room type using:
  - Total rooms inventory per room type
  - Reserved room nights (assigned rooms)
  - Reserved type nights (unassigned rooms)
- Availability returns per-date counts for each room type. Storefront shows unavailable rooms as visible but disabled cards.

### Reservation flow (public)

1. Guest browses properties and room types.
2. Search with check-in/out dates -> availability results.
3. If a room has inventory, user can proceed to booking.
4. Booking requires customer authentication (local email/password or Google OAuth code flow).
5. Reservation is created with nightly rate snapshots and posted charges in folio.
6. Customer can view "My Reservations" or manage booking by code + email.

### Admin operations

Admin app handles:

- Properties, rooms, room types
- Room availability and inventory
- Rate plans + nightly prices
- Reservations (create/update/check-in/check-out/cancel)
- Guests, employees, housekeeping, maintenance, timesheets
- RBAC users, roles, permissions, menus
- Reports and finance views

### Room images

- Admin uploads room type images to Supabase Storage and stores public URLs on the room type.
- Storefront consumes the stored URLs for room galleries and site-wide gallery.

## Authentication

### Admin (RBAC)

- `/api/v1/auth/login` issues JWT with RBAC permissions.
- Admin UI stores the token in a cookie (`AUTH_COOKIE_NAME`).

### Customer (public booking)

- `/api/v1/public/auth/register` and `/api/v1/public/auth/login` for local accounts.
- `/api/v1/public/auth/google/start` and `/api/v1/public/auth/google/callback` for server-side Google OAuth code flow.
- Customer JWTs include `customer.BOOK` authority.
- Booking endpoints require this authority.

## API overview (public)

- GET `/api/v1/public/properties`
- GET `/api/v1/public/room-types?propertyId=...`
- GET `/api/v1/public/rate-plans?propertyId=...&roomTypeId=...&from=...&to=...`
- GET `/api/v1/public/availability?propertyId=...&from=...&to=...`
- POST `/api/v1/public/reservations` (customer auth required)
- GET `/api/v1/public/reservations/me` (customer auth required)
- GET `/api/v1/public/reservations/{code}?email=...`
- POST `/api/v1/public/reservations/{code}/cancel?email=...`

## Installation

Prerequisites:

- Docker + Docker Compose
- Node.js 18+
- Java 21 (if running backend locally without Docker)

## Environment variables

Root `.env` (Docker Compose reads from here):

- APP_AUTH_GOOGLE_CLIENT_ID
- APP_AUTH_GOOGLE_CLIENT_SECRET
- APP_AUTH_GOOGLE_REDIRECT_URI (e.g. http://localhost:8080/api/v1/public/auth/google/callback)
- APP_STOREFRONT_BASE_URL (e.g. http://localhost:3001)
- NEXT_PUBLIC_GOOGLE_CLIENT_ID

Backend `backend/.env`:

- APP_AUTH_GOOGLE_CLIENT_ID
- APP_AUTH_GOOGLE_CLIENT_SECRET
- APP_AUTH_GOOGLE_REDIRECT_URI
- APP_STOREFRONT_BASE_URL

Storefront `apps/storefront/.env`:

- BACKEND_BASE_URL (default http://localhost:8080)
- BACKEND_API_PREFIX (default /api/v1)
- NEXT_PUBLIC_GOOGLE_CLIENT_ID

Admin `apps/admin/.env`:

- BACKEND_BASE_URL
- BACKEND_API_PREFIX
- AUTH_COOKIE_NAME
- AUTH_COOKIE_SECURE
- APP_STORAGE_TYPE
- APP_STORAGE_SUPABASE_URL
- APP_STORAGE_SUPABASE_KEY
- APP_STORAGE_SUPABASE_BUCKET
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_KEY
- NEXT_PUBLIC_SUPABASE_BUCKET

Template files exist:

- `.env.example`
- `backend/.env.example`
- `apps/storefront/.env.example`
- `apps/admin/.env.example`

## Google OAuth (server-side code flow)

In Google Cloud Console, create a Web OAuth client and set:

- Authorized JavaScript origin: http://localhost:3001
- Authorized redirect URI: http://localhost:8080/api/v1/public/auth/google/callback

Then set the env variables listed above.

## Running the project

### Docker (recommended)

1. Start services:
   - `docker compose up -d`
2. Admin: http://localhost:3000
3. Storefront: http://localhost:3001
4. Backend API: http://localhost:8080

### Local (without Docker)

#### Prerequisites

- **Java 21** – Required for the Spring Boot backend
- **Node.js 18+** – Required for the Next.js apps
- **PostgreSQL 15+** – Running locally or accessible via network

#### 1. Database Setup

Create the database and user (if not already done):

```bash
# Connect to Postgres
psql -U postgres

# Create database and user
CREATE DATABASE hotel_system;
CREATE USER blockcode WITH PASSWORD 'Password@123';
GRANT ALL PRIVILEGES ON DATABASE hotel_system TO blockcode;
\q
```

#### 2. Run the Backend

```bash
cd backend
./gradlew bootRun
```

- The backend will start on **http://localhost:8080**
- Flyway migrations run automatically on startup from `db/migrations`
- Default config in `src/main/resources/application.yml` connects to `localhost:5432/hotel_system`

#### 3. Run the Admin App

Open a **new terminal**:

```bash
# From project root
npm install                          # Install all workspace dependencies (first time only)
npm run dev --workspace=apps/admin   # Or: npm run dev:admin
```

- Admin UI runs on **http://localhost:3000**
- Requires `apps/admin/.env` (copy from `.env.example`)

#### 4. Run the Storefront App

Open a **new terminal**:

```bash
# From project root
npm run dev --workspace=apps/storefront   # Or: npm run dev:storefront
```

- Storefront runs on **http://localhost:3001**
- Requires `apps/storefront/.env` (copy from `.env.example`)

#### Quick Start (All Services)

Run all three in separate terminals:

```bash
# Terminal 1 - Backend
cd backend && ./gradlew bootRun

# Terminal 2 - Admin
npm run dev:admin

# Terminal 3 - Storefront
npm run dev:storefront
```

## Implementation details and extension guide

- Flyway migrations live in `db/migrations`. Add new migrations with the next version number; never edit applied migrations.
- Spring Boot uses JPA repositories and service-layer logic under `backend/src/main/java/com/yourorg/hotel`.
- Public booking logic is in `publicapi` and `customer` packages.
- Admin RBAC logic lives under `rbac`.
- Storefront fetches public data via `apps/storefront/src/app/api/public/[...path]/route.ts` proxy.
- Room type images are stored as URLs; the backend does not store files.

## Notes

- Booking requires customer authentication. Browsing and availability search are public.
- Unavailable rooms appear as disabled cards in the storefront search results.
- The booking page resumes the prior search parameters via the `redirect` query string.

## Verification checklist

Use these quick checks after setup or major changes:

1. Services

- `docker compose ps` shows `backend`, `storefront`, `admin`, `postgres` running.

2. Backend health

- `curl http://localhost:8080/actuator/health` returns `{"status":"UP"}`.

3. Public data

- `curl http://localhost:8080/api/v1/public/properties` returns a list of properties.
- `curl "http://localhost:8080/api/v1/public/room-types?propertyId=<PROPERTY_ID>"`

4. Admin

- Open `http://localhost:3000` and sign in.
- Create a room type and upload images (Supabase).
- Set nightly prices for the room type.

5. Storefront (public)

- Open `http://localhost:3001` and search availability.
- Unavailable rooms show as disabled cards.
- Gallery loads with pagination + lightbox + thumbnail carousel.

6. Customer auth + booking

- Register or sign in (email or Google).
- Booking page should auto-resume with search params.
- Create a reservation and confirm it appears under “My Reservations”.

## Optional sample data

Additional sample inventory and rate plans are available in:

- `db/seeds/additional_sample_data.sql` (adds two properties with room types, rooms, images, rate plans, and 60 days of prices)

Run it against the database (Docker):

```bash
cat db/seeds/additional_sample_data.sql | docker compose exec -T postgres psql -U blockcode -d hotel_system
```
