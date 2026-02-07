# Hotel System - Operations & Process Documentation

This document provides a comprehensive overview of all operations, logic flows, and processes in the Hotel Management and Booking System.

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Domain Model](#domain-model)
3. [Core Business Processes](#core-business-processes)
   - [Availability Calculation](#availability-calculation)
   - [Reservation Lifecycle](#reservation-lifecycle)
   - [Public Booking Flow](#public-booking-flow)
   - [Finance & Folio Management](#finance--folio-management)
4. [Authentication Flows](#authentication-flows)
   - [Admin RBAC Authentication](#admin-rbac-authentication)
   - [Customer Authentication](#customer-authentication)
5. [Operations Modules](#operations-modules)
   - [Room Management](#room-management)
   - [Pricing & Rate Plans](#pricing--rate-plans)
   - [Housekeeping](#housekeeping)
   - [Maintenance](#maintenance)
   - [Employee & Timesheet Management](#employee--timesheet-management)
6. [Content Management](#content-management)
7. [Reporting](#reporting)
8. [API Endpoints Reference](#api-endpoints-reference)

---

## System Architecture Overview

The hotel system follows a **three-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  apps/admin (Next.js)      │     apps/storefront (Next.js)      │
│  - RBAC-protected admin    │     - Public booking site           │
│  - Hotel operations        │     - Customer auth (local/Google) │
│  - Port: 3000              │     - Port: 3001                    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Spring Boot 3.5 + JPA                                          │
│  - Clean Architecture (api/application/domain/infra)            │
│  - JWT-based authentication                                      │
│  - Port: 8080                                                    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL                 │     Supabase Storage               │
│  - Flyway migrations        │     - Room type images             │
│  - Port: 5432               │     - Gallery assets               │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Module Structure

Each domain module follows **Clean Architecture**:

| Layer          | Purpose                                      |
| -------------- | -------------------------------------------- |
| `api/`         | REST controllers, DTOs (request/response)    |
| `application/` | Business logic services                      |
| `domain/`      | JPA entities, enums, value objects           |
| `infra/`       | Repository interfaces, external integrations |

### Backend Modules

| Module         | Description                                                   |
| -------------- | ------------------------------------------------------------- |
| `auth`         | RBAC authentication (users, roles, permissions, menus)        |
| `customer`     | Public customer accounts and authentication                   |
| `reservation`  | Reservation management and availability                       |
| `room`         | Room types, physical rooms, room images                       |
| `pricing`      | Rate plans, nightly prices, taxes/fees, cancellation policies |
| `finance`      | Folio, charges, payments                                      |
| `guest`        | Guest profiles (people)                                       |
| `property`     | Hotel property/organization management                        |
| `housekeeping` | Housekeeping task management                                  |
| `maintenance`  | Maintenance requests                                          |
| `employee`     | Employee profiles                                             |
| `timesheet`    | Employee time tracking                                        |
| `report`       | Reporting services                                            |
| `blog`         | Blog post management                                          |
| `content`      | Static page content management                                |
| `audit`        | Audit logging                                                 |
| `publicapi`    | Public-facing API endpoints                                   |

---

## Domain Model

### Core Entities Relationship

```
Organization / Property
        │
        ├──► Room Types ──► Rooms (Physical Inventory)
        │         │
        │         └──► Room Type Images
        │
        ├──► Rate Plans ──► Rate Plan Prices (per room type, per date)
        │         │
        │         └──► Cancellation Policies
        │
        └──► Reservations
                  │
                  ├──► Reservation Rooms
                  │         │
                  │         ├──► Reservation Nights (assigned rooms)
                  │         └──► Reservation Type Nights (unassigned rooms)
                  │
                  └──► Folio ──► Folio Items (charges)
                           └──► Payments
```

### Key Entities

| Entity                         | Description                                                      |
| ------------------------------ | ---------------------------------------------------------------- |
| **PropertyEntity**             | Hotel property with address details                              |
| **RoomTypeEntity**             | Sellable unit definition (name, capacity, bed type, description) |
| **RoomEntity**                 | Physical room inventory linked to room type                      |
| **RatePlanEntity**             | Pricing plan (refundability, breakfast, cancellation policy)     |
| **RatePlanPriceEntity**        | Nightly price per room type and date                             |
| **ReservationEntity**          | Multi-room booking with status, dates, guest count               |
| **ReservationRoomEntity**      | Individual room within a reservation                             |
| **ReservationNightEntity**     | Night-level booking for assigned rooms                           |
| **ReservationTypeNightEntity** | Night-level booking for unassigned rooms                         |
| **FolioEntity**                | Financial record for a reservation                               |
| **PersonEntity**               | Individual person profile                                        |
| **GuestEntity**                | Guest profile (links to Person)                                  |
| **CustomerEntity**             | Public user account for booking                                  |

### Reservation Status Flow

```
                    ┌───────────────┐
                    │   CONFIRMED   │◄──── Initial state
                    └───────┬───────┘
                            │
                   Check-in │
                            ▼
                    ┌───────────────┐
                    │  CHECKED_IN   │
                    └───────┬───────┘
                            │
                  Check-out │
                            ▼
                    ┌───────────────┐
                    │  CHECKED_OUT  │
                    └───────────────┘

                    ┌───────────────┐
                    │   CANCELLED   │◄──── Can occur from any pre-checkout state
                    └───────────────┘
```

---

## Core Business Processes

### Availability Calculation

The availability engine (`AvailabilityService`) calculates real-time room availability per room type and date.

#### Calculation Logic

```
Available Rooms = Total Rooms - (Assigned Nights + Unassigned Type Nights)
```

1. **Total Rooms**: Count of active rooms per room type for the property
2. **Assigned Nights**: Rooms with specific room assignments (`ReservationNightEntity`)
3. **Unassigned Type Nights**: Rooms booked by type only (`ReservationTypeNightEntity`)

#### Process Flow

```
1. Fetch all room types for property
2. Count total rooms by room type (active, non-deleted)
3. Query reservation nights by room type and date range
4. Query reservation type nights by room type and date range
5. For each date in range:
   - Reserved = assigned nights + unassigned type nights
   - Available = max(0, total rooms - reserved)
6. Return availability per room type per date
```

#### Code Reference

```java
// AvailabilityService.getRoomTypeAvailability()
for (LocalDate date : dates) {
    int reserved = reservedDates.getOrDefault(date, 0);
    int available = Math.max(totalRooms - reserved, 0);
    dateResponses.add(new RoomTypeAvailabilityDateResponse(date, reserved, available));
}
```

---

### Reservation Lifecycle

The `ReservationService` manages the complete reservation lifecycle from creation to checkout.

#### Creation Process

```
┌─────────────────────────────────────────────────────────────┐
│                    Reservation Creation                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Validate Input                                           │
│    - Check-out must be after check-in                       │
│    - Primary guest must exist                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Create Reservation Entity                                │
│    - Generate unique code (RES-{timestamp})                 │
│    - Set status = CONFIRMED                                 │
│    - Set channel type (DIRECT, OTA, etc.)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. For Each Room Request:                                   │
│    a. Validate room type, rate plan, property match         │
│    b. Create ReservationRoomEntity                          │
│    c. Calculate nightly charges                             │
│    d. If room assigned: create ReservationNights            │
│    e. If unassigned: create ReservationTypeNights           │
│    f. Store nightly rate snapshot as JSON                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Create Folio                                             │
│    - Status = OPEN                                          │
│    - Currency = USD                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Post Charges to Folio                                    │
│    - Room charges with nightly breakdown                    │
│    - Apply taxes/fees                                       │
│    - Calculate totals                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Log Audit Event                                          │
│    - Action = CREATE                                        │
│    - Record before/after state                              │
└─────────────────────────────────────────────────────────────┘
```

#### Nightly Charges Calculation

```java
// If no custom rates provided, fetch from rate plan prices
Map<LocalDate, RatePlanPriceEntity> planPrices = ratePlanPriceService.findPricesByRange(
    ratePlanId, roomTypeId, fromDate, toDate
);

// For each night in the stay
for (LocalDate date : dates) {
    RatePlanPriceEntity price = planPrices.get(date);
    if (price == null) {
        throw new AppException("RATE_PLAN_PRICE_MISSING", "Missing price for " + date);
    }
    charges.add(new NightlyCharge(date, price.getPrice(), price.getCurrency()));
}
```

#### Room Assignment vs Type Assignment

| Scenario                          | Entity Used                  | Availability Impact          |
| --------------------------------- | ---------------------------- | ---------------------------- |
| Specific room assigned            | `ReservationNightEntity`     | Room blocked by ID           |
| Room type only (no specific room) | `ReservationTypeNightEntity` | Decrements type availability |

#### Check-in Process

```java
public ReservationResponse checkIn(UUID id) {
    ReservationEntity reservation = findReservation(id);
    Object before = snapshot(reservation);
    reservation.setStatus(ReservationStatus.CHECKED_IN);
    save(reservation);
    auditService.log("reservation", id, "CHECKIN", before, reservation, propertyId);
    return get(id);
}
```

#### Check-out Process

```java
public ReservationResponse checkOut(UUID id) {
    ReservationEntity reservation = findReservation(id);
    Object before = snapshot(reservation);
    reservation.setStatus(ReservationStatus.CHECKED_OUT);
    save(reservation);
    auditService.log("reservation", id, "CHECKOUT", before, reservation, propertyId);
    return get(id);
}
```

#### Cancellation Process

```java
public ReservationResponse cancel(UUID id) {
    ReservationEntity reservation = findReservation(id);
    reservation.setStatus(ReservationStatus.CANCELLED);
    save(reservation);

    // Soft-delete all nights to release inventory
    List<UUID> roomIds = getRoomIds(reservation);
    reservationNightRepository.softDeleteByReservationRoomIds(roomIds, now);
    reservationTypeNightRepository.softDeleteByReservationRoomIds(roomIds, now);

    auditService.log("reservation", id, "CANCEL", before, reservation, propertyId);
    return get(id);
}
```

---

### Public Booking Flow

The `PublicReservationService` handles guest-facing bookings on the storefront.

#### Booking Process

```
┌─────────────────────────────────────────────────────────────┐
│                   Storefront Booking Flow                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  1. Browse      │───►│  2. Search      │───►│  3. Select      │
│  Properties     │    │  Availability   │    │  Room & Rate    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                                                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  6. Confirm     │◄───│  5. Review      │◄───│  4. Authenticate│
│  Booking        │    │  Details        │    │  (Login/OAuth)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### Step-by-Step Process

1. **Browse Properties** (`/api/v1/public/properties`)
   - List all available hotel properties
   - No authentication required

2. **Search Availability** (`/api/v1/public/availability`)
   - Input: property ID, check-in date, check-out date
   - Returns per-date availability for each room type
   - Unavailable rooms shown as disabled cards

3. **Get Rate Plans** (`/api/v1/public/rate-plans`)
   - Fetch available rate plans for selected room type
   - Returns pricing for the date range

4. **Authenticate Customer**
   - Option A: Local login/register
   - Option B: Google OAuth (server-side code flow)
   - Customer JWT includes `customer.BOOK` authority

5. **Create Reservation** (`POST /api/v1/public/reservations`)
   - Requires customer authentication
   - Validates property, room type, rate plan ownership
   - Creates/updates guest profile from customer
   - Delegates to `ReservationService.create()`

6. **View Reservations** (`/api/v1/public/reservations/me`)
   - Customer can view their bookings
   - Or lookup by code + email

---

### Finance & Folio Management

The `FolioService` manages reservation billing and payments.

#### Folio Lifecycle

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    OPEN     │────►│   CLOSED    │     │   VOIDED    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    ▲
      │                    │
      ▼                    │
┌─────────────────────────────────────┐
│  Add Items   │   Add Payments       │
│  (Charges)   │   (Cash, Card, etc)  │
└─────────────────────────────────────┘
```

#### Charge Posting Process

When a reservation is created, the system automatically posts charges:

```java
public void postReservationCharges(UUID reservationId, UUID propertyId, List<NightlyCharge> charges) {
    FolioEntity folio = getActiveFolio(reservationId);

    // Group charges by date and calculate totals
    for (NightlyCharge charge : charges) {
        // Create folio item for room charge
        FolioItemEntity item = new FolioItemEntity();
        item.setFolioId(folio.getId());
        item.setItemType("ROOM");
        item.setDescription("Room - " + charge.date());
        item.setUnitPrice(charge.price());
        item.setQuantity(BigDecimal.ONE);
        item.setTaxAmount(calculateTax(charge));
        folioItemRepository.save(item);
    }

    // Apply property-level taxes/fees
    applyTaxesAndFees(folio, propertyId, charges);
}
```

#### Payment Types

| Type     | Description           |
| -------- | --------------------- |
| CASH     | Cash payment          |
| CARD     | Credit/debit card     |
| TRANSFER | Bank transfer         |
| OTHER    | Other payment methods |

#### Payment Status

| Status    | Description        |
| --------- | ------------------ |
| PENDING   | Payment initiated  |
| COMPLETED | Payment successful |
| REFUNDED  | Payment refunded   |
| FAILED    | Payment failed     |

---

## Authentication Flows

### Admin RBAC Authentication

#### Login Flow

```
POST /api/v1/auth/login
{
  "username": "admin@hotel.com",
  "password": "password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": { ... },
  "permissions": ["reservations.CREATE", "rooms.READ", ...],
  "menus": [...]
}
```

#### RBAC Model

```
Users ◄──► Roles ◄──► Permissions
              │
              ▼
           Menus (UI navigation)
```

| Entity          | Description                                                |
| --------------- | ---------------------------------------------------------- |
| **Users**       | Admin user accounts                                        |
| **Roles**       | Named permission groups (Admin, Manager, Front Desk, etc.) |
| **Permissions** | Granular actions (module.ACTION format)                    |
| **Menus**       | Navigation items tied to permissions                       |

### Customer Authentication

#### Local Registration

```
POST /api/v1/public/auth/register
{
  "email": "guest@example.com",
  "password": "password",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Process:**

1. Validate email uniqueness
2. Create PersonEntity (profile)
3. Create CustomerEntity (linked to person)
4. Hash password
5. Issue JWT with `customer.BOOK` authority

#### Google OAuth (Server-Side Code Flow)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Storefront │───►│   Backend   │───►│   Google    │
│  (Browser)  │    │   Server    │    │   OAuth     │
└─────────────┘    └─────────────┘    └─────────────┘

1. GET /api/v1/public/auth/google/start
   - Returns Google auth URL with state parameter

2. User redirected to Google login

3. Google redirects to /api/v1/public/auth/google/callback?code=...
   - Backend exchanges code for tokens
   - Fetches user profile from Google
   - Creates/updates customer account
   - Issues JWT
   - Redirects to storefront with token
```

---

## Operations Modules

### Room Management

#### Room Type Management

- Create/update room type definitions
- Set capacity (adults/children)
- Configure bed types
- Upload images to Supabase Storage

#### Physical Room Management

- Create rooms linked to room types
- Assign room numbers/codes
- Set room status (active/inactive)
- Track room assignments

### Pricing & Rate Plans

#### Rate Plan Configuration

| Field               | Description                                  |
| ------------------- | -------------------------------------------- |
| Name                | Rate plan name (e.g., "Best Available Rate") |
| Refundable          | Whether bookings can be refunded             |
| Breakfast Included  | Meal plan inclusion                          |
| Cancellation Policy | Linked cancellation rules                    |

#### Nightly Price Management

```
┌───────────────────────────────────────────────────────────┐
│ Rate Plan: "Standard Rate"                                │
├───────────────────────────────────────────────────────────┤
│ Room Type    │ Date       │ Price  │ Currency            │
├───────────────────────────────────────────────────────────┤
│ Deluxe King  │ 2024-01-15 │ 150.00 │ USD                 │
│ Deluxe King  │ 2024-01-16 │ 175.00 │ USD                 │
│ Deluxe King  │ 2024-01-17 │ 200.00 │ USD (weekend)       │
└───────────────────────────────────────────────────────────┘
```

### Housekeeping

The `HousekeepingTaskService` manages room cleaning tasks.

#### Task Status Flow

```
PENDING ──► IN_PROGRESS ──► COMPLETED
    │                           │
    └───────► SKIPPED ◄─────────┘
```

#### Task Board View

- Filter by property, date, work shift
- Group tasks by room
- Assign to employees
- Track status events

#### Work Shifts

| Shift     | Description                               |
| --------- | ----------------------------------------- |
| MORNING   | Morning shift (typical checkout cleaning) |
| AFTERNOON | Afternoon shift                           |
| EVENING   | Evening shift                             |

### Maintenance

Maintenance request management for property issues.

#### Request Status Flow

```
OPEN ──► IN_PROGRESS ──► RESOLVED
  │                          │
  └──► CLOSED ◄──────────────┘
```

### Employee & Timesheet Management

#### Employee Profiles

- Link to person records
- Department assignment
- Role/position tracking

#### Timesheet Tracking

- Clock in/out functionality
- Shift hours calculation
- Pay period management

---

## Content Management

### Blog Management

The `BlogEntity` supports rich content publishing:

| Field       | Description                                         |
| ----------- | --------------------------------------------------- |
| title       | Blog post title                                     |
| slug        | URL-friendly identifier (auto-generated from title) |
| content     | Rich markdown content                               |
| author      | Author name                                         |
| publishedAt | Publication timestamp                               |

### Static Page Content

The `PageContentEntity` enables editable static pages:

| Field   | Description                                  |
| ------- | -------------------------------------------- |
| pageKey | Unique identifier (e.g., "about", "contact") |
| title   | Page title                                   |
| content | Page content (markdown)                      |

---

## Reporting

The admin panel includes the following report modules:

| Report       | Description                               |
| ------------ | ----------------------------------------- |
| Occupancy    | Room occupancy rates by date range        |
| Revenue      | Revenue breakdown by room type, rate plan |
| Reservations | Reservation statistics and trends         |
| Guest        | Guest demographics and staying patterns   |
| Housekeeping | Task completion rates                     |
| Financial    | Folio and payment summaries               |
| Audit        | Action audit trail                        |

---

## API Endpoints Reference

### Public API (No Auth Required)

| Method | Endpoint                      | Description                 |
| ------ | ----------------------------- | --------------------------- |
| GET    | `/api/v1/public/properties`   | List properties             |
| GET    | `/api/v1/public/room-types`   | List room types             |
| GET    | `/api/v1/public/rate-plans`   | List rate plans with prices |
| GET    | `/api/v1/public/availability` | Check availability          |

### Public API (Customer Auth Required)

| Method | Endpoint                                    | Description            |
| ------ | ------------------------------------------- | ---------------------- |
| POST   | `/api/v1/public/reservations`               | Create reservation     |
| GET    | `/api/v1/public/reservations/me`            | List my reservations   |
| GET    | `/api/v1/public/reservations/{code}`        | Get by code + email    |
| POST   | `/api/v1/public/reservations/{code}/cancel` | Cancel by code + email |

### Customer Auth API

| Method | Endpoint                              | Description           |
| ------ | ------------------------------------- | --------------------- |
| POST   | `/api/v1/public/auth/register`        | Register new customer |
| POST   | `/api/v1/public/auth/login`           | Customer login        |
| GET    | `/api/v1/public/auth/google/start`    | Start Google OAuth    |
| GET    | `/api/v1/public/auth/google/callback` | Google OAuth callback |

### Admin API (RBAC Protected)

All admin endpoints require valid JWT with appropriate permissions.

| Module       | Base Path                      | Operations                 |
| ------------ | ------------------------------ | -------------------------- |
| Reservations | `/api/v1/reservations`         | CRUD + check-in/out/cancel |
| Rooms        | `/api/v1/rooms`                | CRUD                       |
| Room Types   | `/api/v1/room-types`           | CRUD + images              |
| Rate Plans   | `/api/v1/rate-plans`           | CRUD                       |
| Rate Prices  | `/api/v1/rate-plan-prices`     | Bulk update                |
| Guests       | `/api/v1/guests`               | CRUD                       |
| Folios       | `/api/v1/folios`               | View + add items/payments  |
| Housekeeping | `/api/v1/housekeeping-tasks`   | CRUD + board view          |
| Maintenance  | `/api/v1/maintenance-requests` | CRUD                       |
| Employees    | `/api/v1/employees`            | CRUD                       |
| Timesheets   | `/api/v1/timesheets`           | CRUD                       |

---

## Database Migrations

The system uses Flyway for database versioning. Key migrations:

| Version   | Description                          |
| --------- | ------------------------------------ |
| V001      | Baseline schema (all core tables)    |
| V002-V011 | RBAC setup and permissions           |
| V012-V013 | Room type images, customer accounts  |
| V014-V016 | Reports permissions                  |
| V017-V019 | Seed data (RBAC, admin, sample data) |
| V021-V022 | Blog and page content tables         |
| V023-V024 | Room images and blog slug            |

---

## Deployment Architecture

For production deployment details, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Recommended Stack

| Component | Service             |
| --------- | ------------------- |
| Backend   | Render, Railway     |
| Frontend  | Vercel              |
| Database  | Supabase PostgreSQL |
| Storage   | Supabase Storage    |

---

## Summary

This hotel management system provides:

1. **Complete Reservation Management** - From booking to checkout with multi-room support
2. **Real-time Availability** - Per-date, per-room-type availability calculation
3. **Flexible Pricing** - Rate plans with daily price configuration
4. **Dual Authentication** - RBAC for admin, local/OAuth for customers
5. **Financial Tracking** - Folio-based charge and payment management
6. **Operations Support** - Housekeeping and maintenance task management
7. **Content Management** - Blog and static page editing
8. **Comprehensive Reporting** - Occupancy, revenue, and operational reports
