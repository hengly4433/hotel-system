I want to build a hotel management system with Next.js (admin panel + storefront) and Spring Boot + Gradle for (backend service) + PostgreSQL (database) with enterprise architecture (RBAC - Users → Roles → Menus/Sub-menus → Permissions).


- Below is a production-grade enhancement of the PDF’s hotel database proposal—focused on what’s missing in logic, operations, and database design, and then a Next.js + PostgreSQL enterprise architecture (backend service + admin panel + storefront) with RBAC (Users → Roles → Menus/Sub-menus → Permissions).

# What the PDF already covers—and what is missing for production-grade

## What exists in the PDF

The document models core hotel concepts: hotels, rooms, room types, room status, reservations, transactions, payment types, people/employees/customers, timesheets, memberships, and miscellaneous charges, plus some views/procedures/triggers and a high-level “security roles” idea.

### Key production gaps (critical)

1. Reservation lifecycle is incomplete

Missing: status flow (HOLD/CONFIRMED/CHECKED_IN/CHECKED_OUT/CANCELLED/NO_SHOW), cancellation rules, deposit rules, no-show fees, amendments, extensions, early check-in/late checkout.

2. Availability & inventory logic is not enforceable

The PDF has room status (vacant/booked/cleaning), but production needs nightly inventory logic to prevent double-booking across date ranges and support multi-room bookings.

3. Pricing is oversimplified

A single room_price_usd on room type is not enough.

Missing: rate plans, seasonal pricing, weekday/weekend pricing, promotions, corporate rates, taxes/fees, per-guest fees, children policies.

4. Financial model is not auditable

A production hotel needs folio/ledger style accounting: charges, payments, adjustments, refunds, voids, invoices/receipts, split payments, payment gateways references, and reconciliation.

5. Housekeeping & maintenance operations are missing

Room “being cleaned” is not a system.

Missing: housekeeping tasks per day/shift, inspector workflow, out-of-order/out-of-service tracking, maintenance tickets, room blocks.

6. Identity model is unsafe

The PDF’s membership concept includes username/password fields; production requires hashed passwords, MFA optional, session management, and strict auditing.

7. RBAC is described but not implemented

“Admin/Manager/Front Desk/Housekeepers” is not enterprise RBAC.

You explicitly require Users → Roles → Sub-menu → Permissions with menu visibility rules.

8. Data integrity & constraints

Triggers that “delete invalid records” are not production-safe; production should reject invalid writes with constraints or raise exceptions—never silently delete.

9. Multi-property future readiness

Even if you start with one hotel, production design should support multiple properties (hotel chain) without rewriting the system.


# Production-ready operational model (how the hotel actually runs)

## Core flows you must support

1. Booking

Search availability → quote price → hold inventory → confirm → take deposit/preauth → issue confirmation.

2. Check-in

Verify identity → assign room → collect deposit → activate stay → create/attach folio.

3. During stay

Post charges (mini bar, laundry, restaurant POS import, damage deposit adjustments) → housekeeping tasks daily → room moves.

4. Check-out

Finalize folio → settle payment (split tenders allowed) → issue invoice/receipt → mark room DIRTY → housekeeping cycle.

5. Housekeeping

Generate daily cleaning boards → mark clean/dirty/inspected → track linen/minibar checklist.

6. Maintenance

Create ticket → mark room OUT_OF_ORDER → block inventory → reopen after fix/inspection.

7. Back office

Cashier shifts, audit logs, reconciliation, reports: occupancy, ADR, RevPAR, revenue by department, payroll hours, etc.

# Enhanced PostgreSQL database design (production-grade)

## Design principles (strongly recommended)

- Use UUID primary keys (gen_random_uuid()).
- Add audit columns everywhere: created_at, updated_at, deleted_at (soft delete), created_by, updated_by.
- Add idempotency for payments/booking actions (critical in real systems).
- Use enums (Postgres enum or lookup tables) for statuses.
- Add partial unique indexes for soft-deleted rows.
- Add tenant/property scoping (organization_id, property_id) for future multi-hotel scaling.

# Proposed schema (core tables)

## RBAC (exactly matching your requirement)

### rbac_users

- id (uuid pk)
- email (unique where deleted_at is null)
- password_hash
- status (ACTIVE, SUSPENDED)
- audit fields

### rbac_roles

- id
- name (e.g., ADMIN, MANAGER, FRONT_DESK, HOUSEKEEPING)
- property_id (role can be property-scoped)
- audit fields

### rbac_menus

- id
- key (e.g., "reservations")
- label
- sort_order
- audit fields

### rbac_submenus

- id
- menu_id (fk)
- key (e.g., "reservations.create")
- label
- route (e.g., "/admin/reservations/new")
- sort_order

### rbac_permissions

- id
- resource (e.g., "reservation")
- action (CREATE, READ, UPDATE, DELETE, APPROVE, CANCEL, CHECKIN, CHECKOUT, POST_CHARGE)
- scope (OWN, PROPERTY, ALL) — optional but highly useful

### rbac_role_permissions

- role_id
- permission_id

### rbac_role_submenus

- role_id
- submenu_id

### rbac_user_roles

- user_id
- role_id

## Menu visibility rule (your requirement)

- A Menu is visible if user has permission to at least one Sub-menu under it.

## Property / Hotel structure

### organizations

- id, name

### properties

- id, organization_id, name, timezone, currency, address fields

## Guests & profiles

### Replace the PDF “People + Customer/Employee” split with a safer model:

#### people

- id
- first_name, last_name, dob, phone, email
- address fields (or normalized address table)
- audit fields

#### guests

- id
- person_id (fk)
- loyalty_tier (NONE/SILVER/GOLD/PLATINUM)
- notes

#### employees

- id
- person_id (fk)
- property_id (fk)
- job_title, hire_date, hourly_rate
- employment_status

#### Membership/loyalty should not store passwords. Authentication belongs in rbac_users.

## Rooms, types, and operational states

### room_types

- id, property_id
- code (DLX, STD, STE)
- name
- max_adults, max_children, max_occupancy
- base_description
- default_bed_type
- audit fields

### rooms

- id, property_id, room_type_id
- room_number (unique per property)
- floor
- housekeeping_zone
- is_active
- audit fields

### room_operational_status

- id
- room_id (fk)
- status (VACANT_CLEAN, VACANT_DIRTY, OCCUPIED, OUT_OF_ORDER, OUT_OF_SERVICE)
- effective_from, effective_to
- reason

### Do not rely on a single status row; statuses are time-based in real ops.

## Pricing (rate plans + nightly rates)

### rate_plans

- id, property_id
- code, name
- cancellation_policy_id
- is_refundable
- includes_breakfast
- audit fields

### rate_plan_prices

- id
- rate_plan_id
- room_type_id
- date
- price (numeric)
- currency  
- Unique: (rate_plan_id, room_type_id, date) (where deleted_at is null)

### taxes_fees

- id, property_id
- name
- type (PERCENT, FIXED)
- value
- applies_to (ROOM, SERVICE, ALL)
- is_active

## Reservations (inventory-safe design)

### reservations

- id, property_id
- code (human-friendly reservation number)
- primary_guest_id
- status (HOLD, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED, NO_SHOW)
- channel (DIRECT, OTA, WALKIN, CORPORATE)
- check_in_date, check_out_date
- adults, children
- special_requests
- audit fields

### reservation_rooms

- id
- reservation_id
- room_type_id
- room_id (nullable until assigned)
- rate_plan_id
- guests_in_room
- nightly_rate_snapshot (jsonb) — optional but great for audit

### reservation_nights (this is what prevents double booking)

- id
- reservation_room_id
- date
- price
- Unique: (room_id, date) when room_id is not null AND status in active states
  - For unassigned bookings, you manage inventory by room_type capacity (optional “inventory by type” table).

### reservation_guests

- reservation_id
- guest_id
- role (PRIMARY, ADDITIONAL)

## Folio (financial truth)

### folios

- id
- reservation_id
- status (OPEN, CLOSED, VOID)
- currency

### folio_items

- id
- folio_id
- type (ROOM_CHARGE, TAX, FEE, SERVICE, DISCOUNT, ADJUSTMENT)
- description
- qty
- unit_price
- amount (computed or stored)
- posted_at
- posted_by

### payments

- id
- folio_id
- method (CASH, CARD, BANK_TRANSFER, QR)
- amount
- currency
- status (AUTHORIZED, CAPTURED, FAILED, REFUNDED, VOIDED)
- provider (e.g., Stripe)
- provider_ref (payment intent id)
- idempotency_key (unique)
- audit fields

### refunds

- id
- payment_id
- amount
- provider_ref
- status

## Housekeeping & maintenance

### housekeeping_tasks

- id, property_id
- room_id
- task_date
- shift (AM/PM/NIGHT)
- status (PENDING, IN_PROGRESS, DONE, INSPECTED)
- assigned_to_employee_id
- checklist jsonb

### maintenance_tickets

- id, property_id
- room_id
- priority (LOW/MED/HIGH/URGENT)
- status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- description
- reported_by, assigned_to
- opened_at, closed_at

## Audit & observability (non-negotiable)

### audit_logs

- id
- actor_user_id
- entity_type (reservation, payment, room, etc.)
- entity_id
- action
- before jsonb
- after jsonb
- created_at
- ip, user_agent, request_id

## Constraints & correctness (how we prevent bad data)

### Avoid “delete triggers”

#### In the PDF, invalid inserts are sometimes deleted via triggers (age, max occupants). Production should:

- Reject the transaction with an error (raise exception), not delete silently.
- Enforce via:
  - service validation (Zod + business rules)
  - database constraints where possible
  - trigger/function only when cross-table validation is needed

### Indexing essentials (PostgreSQL)

- reservations(property_id, check_in_date, check_out_date, status)
- reservation_rooms(reservation_id)
- reservation_nights(room_id, date) (critical)
- payments(folio_id, status, created_at)
- RBAC:
  - rbac_user_roles(user_id)
  - rbac_role_permissions(role_id)
  - rbac_role_submenus(role_id)
  - rbac_submenus(menu_id)

## Enterprise architecture (backend + admin + storefront)

### Recommended monorepo layout (Turborepo)

- apps/admin → Admin Panel (Spring Boot)
- apps/storefront → Public website (Next.js)
- apps/api → Backend service (Spring Boot)
- packages/db → Prisma schema + migrations
- packages/shared → DTOs, validation schemas (Zod), shared types
- packages/auth → Auth config + RBAC helpers
- packages/logger → Pino logger + request context
- packages/ui → Shared UI components (admin/storefront)

### Backend service layering in Spring Boot (enterprise style)

#### Even with Spring Boot route handlers, keep strict layers:

- Route Handler
  - parses request, sets request_id, calls Controller
- Controller
  - maps HTTP → DTO → Service call
- Service
  - business logic, transactions, validation, emits audit logs
- Repository
  - interacts with database
- DTO + Mapper
  - map domain models to API responses
- Policies
  - RBAC checks: authorize(user, permission)
- Observability
  - structured logs, audit logs, error normalization

## RBAC enforcement in API + Menu visibility

### Permission check

- Each API endpoint maps to a permission:
  - POST /reservations → reservation.CREATE
  - POST /reservations/{id}/checkin → reservation.CHECKIN
  - POST /payments → payment.CAPTURE

- Menu visibility (your rule)
  - At login:
    - Load user roles
    - Load role_submenus
    - Build a set of allowed submenus
    - Load menus for those submenus
    - Return UI navigation tree: menus[] -> submenus[]
  - Admin panel displays only menus with at least 1 visible submenu.

### Admin Panel pages (minimum production set)

1. Dashboard (occupancy, arrivals, departures, revenue today)
2. Reservations (search, create, amend, cancel, check-in/out)
3. Availability calendar (room type & room assignment)
4. Rooms (status board, out-of-order)
5. Housekeeping (daily boards, inspections)
6. Maintenance (tickets, room blocks)
7. Folios & Payments (post charges, settle, receipts)
8. Guests (profiles, stay history)
9. Staff & Timesheets
10. Rate Plans & Pricing (nightly rates, promos, taxes/fees)
11. RBAC (users/roles/menus/submenus/permissions)
12. Audit Logs

## Storefront website (public)

- Room browsing (room types + amenities)
- Availability search (date range + guests)
- Booking flow (hold → guest info → payment/deposit → confirmation)
- Manage booking (modify/cancel based on policy)
- Optional: loyalty account (separate from staff RBAC)

## What I recommend you implement first (to reach “production-ready” fastest)

1. Foundation
   - organizations/properties, RBAC, audit_logs, baseline tables, Prisma migrations
2. Reservation + inventory safety
   - reservations + reservation_rooms + reservation_nights, availability endpoints
3. Folio + payments
   - folios, folio_items, payments, idempotency
4. Admin MVP
   - reservations, check-in/out, room assignment, folio settlement
5. Housekeeping + maintenance
6. Pricing engine
   - rate_plans + nightly pricing + taxes/fees
