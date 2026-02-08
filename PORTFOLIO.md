# Hotel Management & Booking System

A full-stack hotel management platform that streamlines property operations and enables seamless online bookings for guests.

---

## Overview

This system provides two distinct interfaces:

- **Admin Console** — For hotel staff to manage reservations, rooms, pricing, housekeeping, and operations
- **Public Storefront** — For guests to search availability, book rooms, and manage their reservations

---

## How It Works

### For Guests (Public Storefront)

#### 1. Search & Browse

Guests can explore available properties and rooms without creating an account:

- Browse hotel properties and view details
- Search room availability by check-in and check-out dates
- View room types with photos, descriptions, and amenities
- See real-time availability and pricing

#### 2. Book a Room

When ready to book:

1. Select desired dates and room type
2. Choose a rate plan (pricing option)
3. Sign in or create an account (email or Google login)
4. Enter guest details
5. Confirm the reservation

The system automatically:

- Calculates total cost based on nightly rates
- Creates a reservation with a unique confirmation code
- Sets up a billing folio for the stay

#### 3. Manage Reservations

After booking, guests can:

- View all their reservations in "My Reservations"
- Look up any reservation using confirmation code + email
- Cancel bookings when needed

---

### For Hotel Staff (Admin Console)

#### Reservations Management

| Action        | Description                             |
| ------------- | --------------------------------------- |
| **Create**    | Book rooms for walk-in or phone guests  |
| **View**      | See all reservation details and history |
| **Check-in**  | Process guest arrival                   |
| **Check-out** | Complete guest departure                |
| **Cancel**    | Cancel and release room inventory       |

**Reservation Status Flow:**

```
Confirmed → Checked-In → Checked-Out
     ↓
  Cancelled
```

#### Room & Inventory Management

- **Room Types** — Define sellable room categories (Deluxe, Suite, etc.) with capacity and photos
- **Physical Rooms** — Manage actual room inventory linked to room types
- **Availability** — Real-time tracking of which rooms are available on any given date

#### Pricing Management

- **Rate Plans** — Create pricing tiers (e.g., Standard Rate, Non-Refundable, Breakfast Included)
- **Daily Rates** — Set specific prices for each room type by date
- **Cancellation Policies** — Configure refund rules per rate plan

#### Finance & Billing

Each reservation has a **folio** (bill) that tracks:

- Room charges (calculated from nightly rates)
- Additional charges (minibar, room service, etc.)
- Payments received
- Outstanding balance

#### Housekeeping

- Assign cleaning tasks to rooms
- Track task status (Pending → In Progress → Completed)
- View daily task board by shift

#### Maintenance

- Log maintenance requests for rooms
- Track repair status and resolution

#### Reports & Analytics

- Occupancy rates
- Revenue reports
- Reservation statistics
- Housekeeping performance

---

## Key Features

### Real-Time Availability Engine

The system calculates availability by tracking:

- Total room inventory per room type
- Rooms already booked (assigned or unassigned)
- Result: Available rooms = Total − Booked

Unavailable rooms appear as disabled options in search results.

### Multi-Room Reservations

A single reservation can include multiple rooms:

- Each room can have a different room type and rate plan
- Nightly rates are captured at booking time (rate snapshot)
- All charges roll up to a single folio

### Flexible Pricing

Prices can vary by:

- Room type
- Rate plan
- Date (weekends, holidays, seasons)

### Dual Authentication

| User Type   | Login Options                                 |
| ----------- | --------------------------------------------- |
| Admin Staff | Username/password with role-based permissions |
| Guests      | Email/password or Google account              |

### Guest Profiles

The system maintains guest profiles that:

- Store contact information
- Link to booking history
- Auto-populate for returning guests

---

## User Workflows

### Guest Booking Journey

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browse    │────▶│   Search    │────▶│   Select    │
│  Properties │     │  Dates      │     │   Room      │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Confirmed! │◀────│   Enter     │◀────│   Sign In   │
│             │     │   Details   │     │  or Create  │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Staff Check-In Process

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Find      │────▶│   Verify    │────▶│  Check-In   │
│ Reservation │     │   Guest     │     │   Guest     │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Staff Check-Out Process

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Review    │────▶│   Process   │────▶│  Check-Out  │
│   Folio     │     │   Payment   │     │   Guest     │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## Content Management

The admin console also provides:

- **Blog Management** — Publish news and updates
- **Gallery** — Manage property photos
- **Page Content** — Edit static pages (About, Contact, etc.)

---

## Access Points

| Interface         | Purpose          | Authentication                  |
| ----------------- | ---------------- | ------------------------------- |
| **Admin Console** | Hotel operations | Staff login with permissions    |
| **Storefront**    | Guest bookings   | Optional (required for booking) |

---

## Summary

This hotel management system provides:

✅ **Seamless Guest Experience** — Easy search, booking, and reservation management  
✅ **Efficient Operations** — Streamlined check-in, check-out, and housekeeping  
✅ **Flexible Pricing** — Dynamic rates by date, room type, and rate plan  
✅ **Complete Billing** — Automated folio management and payment tracking  
✅ **Real-Time Inventory** — Accurate availability across all booking channels  
✅ **Content Control** — Blog, gallery, and page management built-in

---

## Tech Stack

- **Frontend**: Next.js (React)
- **Backend**: Spring Boot (Java)
- **Database**: PostgreSQL
- **Storage**: Supabase (images)
- **Authentication**: JWT + OAuth 2.0 (Google)
