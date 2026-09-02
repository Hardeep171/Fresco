# FRESCO Backend — Developer Guide & Architecture Manual

> **FRESCO** is an on-demand laundry, dry cleaning, and garment care platform engineered with a mobile-first architecture. This repository contains the core **REST API backend** built with Node.js, Express 5, TypeScript, MongoDB, and Mongoose.

---

## 🚦 Project Status & Verification

```
Backend Development Status: ✅ Functionally Complete & Certified for Frontend Integration
Target Mobile Frontend:     React Native (TypeScript) + Redux Toolkit
Active Git Branch:          main
Integrated Merge Commit:    0f9ca19 ("merge: integrate order module into main")
Integrated Feature Branches: feature/authentication, feature/user-module, feature/catalog-module, feature/cart-module, feature/order-module
Total Domain Modules:       15 Modules (14 Domain Modules + Health Probe)
Total REST API Endpoints:   84 Verified Endpoints
TypeScript Compiler:        ✅ 0 Errors (Strict ES2022 / NodeNext via `npx tsc --noEmit`)
Production Build:           ✅ Clean Compilation (via `npm run build`)
Automated E2E Test Suites:  ✅ 284 / 284 Tests Passed (100% Pass Rate)
  • Security & Auth E2E:    36 / 36 PASSED
  • Inspection Workflow E2E: 171 / 171 PASSED
  • Payment & Refund E2E:   77 / 77 PASSED
```

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Current Backend Status](#2-current-backend-status)
3. [Technology Stack](#3-technology-stack)
4. [Prerequisites](#4-prerequisites)
5. [Installation & Setup](#5-installation--setup)
6. [Environment Configuration](#6-environment-configuration)
7. [Development & Build Commands](#7-development--build-commands)
8. [Automated Testing & Quality Verification](#8-automated-testing--quality-verification)
9. [Backend Architecture & Folder Structure](#9-backend-architecture--folder-structure)
10. [User Roles & Authorization Matrix](#10-user-roles--authorization-matrix)
11. [Core Business Workflows & State Machines](#11-core-business-workflows--state-machines)
    - [11.1 Customer Cart → Checkout → Order Flow](#111-customer-cart--checkout--order-flow)
    - [11.2 Order Lifecycle State Machine](#112-order-lifecycle-state-machine)
    - [11.3 Workshop Inspection Lifecycle](#113-workshop-inspection-lifecycle)
    - [11.4 Assignment & Delivery Task Flow](#114-assignment--delivery-task-flow)
    - [11.5 Payment & Refund Engine](#115-payment--refund-engine)
12. [Complete API Endpoint Catalog (84 Endpoints)](#12-complete-api-endpoint-catalog-84-endpoints)
13. [API Response & Error Standards](#13-api-response--error-standards)
14. [API Testing & Quickstart with cURL](#14-api-testing--quickstart-with-curl)
15. [React Native & Redux Toolkit Integration Guide](#15-react-native--redux-toolkit-integration-guide)
16. [Security & Protection Mechanisms](#16-security--protection-mechanisms)
17. [Database Indexes & Performance](#17-database-indexes--performance)
18. [Future Enhancements & Roadmap](#18-future-enhancements--roadmap)

---

## 1. Project Overview

FRESCO provides an end-to-end digital infrastructure for urban garment care operations.

### User Personas & Ecosystem
1. **Customers (Mobile App):**
   - Browse catalog by categories (Dry Clean, Wash & Iron, Steam Press, Premium Wash).
   - Select garments and add care services to cart.
   - Place scheduled orders with custom pickup and delivery addresses.
   - Real-time order progress tracking through all 9 lifecycle stages.
   - Pay at doorstep via Cash or UPI, retry failed payments, or cancel orders when eligible.
2. **Delivery Partners (Mobile App):**
   - Access active pickup and delivery assignments.
   - Accept assignments, collect garments from customers, and deliver processed orders.
   - Collect and verify doorstep payments (Cash or UPI).
3. **Workshop Inspectors & Branch Managers (Operations / Admin):**
   - Conduct thorough physical garment inspections upon arrival at the facility.
   - Record item condition issues (`NORMAL`, `STAINED`, `DAMAGED`, `TORN`, `COLOR_BLEED_RISK`).
   - Add required extra services or apply adjustments with server-verified recalculations.
   - Manage regional catalog pricing, oversee dispatch assignments, and issue refunds.
4. **Administrators & City Managers (System / Governance):**
   - Manage staff roles, categories, garments, services, and base pricing matrices.

---

## 2. Current Backend Status

The backend has passed all milestone audits, feature integrations, and end-to-end tests:

| Module / Layer | Status | Verification Summary |
|---|:---:|---|
| **Health Probe** | ✅ Complete | Returns uptime, ISO timestamp, and server health status |
| **Authentication** | ✅ Complete | Dual-token JWT (Access 15m, Refresh 7d) with token rotation |
| **User Management** | ✅ Complete | Profile CRUD, password change, reset token flow, email verify |
| **Address Management** | ✅ Complete | Saved address book with atomic single-default address selection |
| **Catalog System** | ✅ Complete | Category, Garment, Service, and Pricing matrix + Soft Delete |
| **Cart Management** | ✅ Complete | Server-side pricing verification, item quantity recalculation |
| **Order Processing** | ✅ Complete | Snapshot freeze (items, pricing, address), 9-stage state machine |
| **Partner Assignment** | ✅ Complete | Pickup & delivery partner assignment linked to order lifecycle |
| **Delivery Task** | ✅ Complete | Dispatch task tracking and state transitions |
| **Order Inspection** | ✅ Complete | DRAFT → SUBMITTED workflow, garment condition log, dynamic pricing |
| **Payment & Refund** | ✅ Complete | Cash/UPI collection, customer retry, over-refund protection |
| **Security Hardening** | ✅ Complete | Helmet, CORS origin control, bcryptjs (12 rounds), IDOR checks |
| **TypeScript & Build** | ✅ Complete | 0 compiler errors (`strict: true`), clean `dist/` compilation |
| **Automated Tests** | ✅ Complete | 284 / 284 E2E tests passing (100% pass rate) |

---

## 3. Technology Stack

Verified from `package.json`, `package-lock.json`, and project configuration files:

### Production Runtime & Frameworks
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | `>= 16.20.2` (v20 / v22 supported) | Asynchronous non-blocking runtime environment |
| **Express** | `^5.2.1` | Modern HTTP server framework with native async error handling |
| **TypeScript** | `^5.9.2` | Type safety and schema synchronization across all backend layers |
| **MongoDB** | `6.0+` | Scalable NoSQL document database |
| **Mongoose** | `^9.7.4` | ODM with strict schema typing, indexes, and document transformation |
| **Zod** | `^4.4.3` | Type-safe runtime schema validation for requests and environment |
| **jsonwebtoken** | `^9.0.3` | Cryptographic JWT access and refresh token generation & validation |
| **bcryptjs** | `^3.0.3` | Secure salted one-way password hashing (salt rounds: 12) |
| **helmet** | `^8.3.0` | Comprehensive HTTP security header hardening |
| **cors** | `^2.8.6` | Cross-Origin Resource Sharing security and origin filtering |
| **compression** | `^1.8.1` | Gzip compression for high-performance HTTP responses |
| **cookie-parser**| `^1.4.7` | Cookie parsing middleware |
| **morgan** | `^1.11.0` | HTTP request access logging stream |
| **winston** | `^3.19.0` | Structured JSON application logger |
| **winston-daily-rotate-file** | `^5.0.0` | Daily log rotation with automated retention limits |
| **dotenv** | `^17.4.2` | Environment configuration loading |
| **http-status-codes** | `^2.3.0` | Standardized HTTP status codes |

### Development & Tooling
| Tool | Version | Purpose |
|---|---|---|
| **tsx** | `^4.23.1` | Fast TypeScript execution and development watcher |
| **@types/node** | `^26.1.1` | Node.js type definitions |
| **@types/express** | `^5.0.6` | Express 5 type definitions |

---

## 4. Prerequisites

Before setting up the backend locally, ensure your environment meets the following requirements:

1. **Node.js:** Active LTS version `>= 16.20.2` (Node.js 20 or Node.js 22 recommended).
   ```bash
   node -v
   ```
2. **npm:** Version `8.x` or higher.
   ```bash
   npm -v
   ```
3. **MongoDB:** A running local MongoDB instance (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection URI.
   ```bash
   mongosh --eval "db.adminCommand('ping')"
   ```
4. **Git:** For source control and repository cloning.

---

## 5. Installation & Setup

Follow these exact steps to clone, configure, and start the service:

### Step 1: Clone Repository
```bash
git clone https://github.com/Hardeep171/Fresco.git
cd Fresco/fresco-backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to create your local `.env` configuration:
```bash
cp .env.example .env
```

Review and adjust variables in `.env` if necessary (see [Environment Configuration](#6-environment-configuration)).

### Step 4: Start MongoDB
If using local MongoDB:
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name fresco-mongo mongo:7
```

### Step 5: Start Backend in Development Mode
```bash
npm run dev
```

The application will initialize database connections and start listening on port `5000`:
```
info: FRESCO backend started {"port":5000,"environment":"development","nodeVersion":"v...","pid":...}
```

### Step 6: Verify Service Health
Open a terminal and ping the health endpoint:
```bash
curl http://localhost:5000/api/v1/health
```

Expected output:
```json
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "uptime": 1.25,
    "timestamp": "2026-08-14T10:15:00.000Z"
  }
}
```

---

## 6. Environment Configuration

All environment variables are validated at server startup using strict **Zod** schemas in [`src/config/env.ts`](file:///home/user/Desktop/FRESCO/Fresco/fresco-backend/src/config/env.ts). If any required variable is missing or malformed, startup immediately fails with a descriptive error.

| Variable Name | Required | Default | Format / Constraints | Description |
|---|:---:|:---:|---|---|
| `NODE_ENV` | No | `development` | `development` \| `test` \| `production` | Application execution environment |
| `PORT` | No | `5000` | Integer (`1` – `65535`) | HTTP port for incoming connections |
| `MONGO_URI` | **Yes** | — | Valid MongoDB URI | Connection string for MongoDB instance |
| `LOG_LEVEL` | No | `info` | `error` \| `warn` \| `info` \| `http` \| `debug` | Winston logging threshold |
| `CORS_ORIGIN` | No | `http://localhost:3000,http://localhost:19006,http://localhost:8081` | Comma-separated URLs (wildcard `*` disallowed in production) | Allowed client origins for CORS policy |
| `JWT_ACCESS_SECRET` | **Yes** | — | String (Minimum 32 characters) | Secret key for signing JWT access tokens |
| `JWT_ACCESS_EXPIRES_IN` | **Yes** | `15m` | Regex `/^[1-9]\d*[mhd]$/` | Access token lifespan (e.g., `15m`, `1h`) |
| `JWT_REFRESH_SECRET` | **Yes** | — | String (Minimum 32 characters) | Secret key for signing JWT refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | **Yes** | `7d` | Regex `/^[1-9]\d*[mhd]$/` | Refresh token lifespan (e.g., `7d`, `30d`) |
| `BCRYPT_SALT_ROUNDS` | No | `12` | Integer (`10` – `15`) | Cost factor for password hashing |

---

## 7. Development & Build Commands

All verified npm scripts available in `package.json`:

```bash
# Start backend in development mode with live hot-reload
npm run dev

# Run strict TypeScript typechecking without emitting JS files
npx tsc --noEmit

# Compile production bundle into dist/ directory
npm run build

# Start production server from compiled dist/ bundle
npm start
```

---

## 8. Automated Testing & Quality Verification

The repository contains extensive end-to-end (E2E) automated test suites in `src/tests/` covering security, state machines, financial recalculations, and concurrency handling.

### Run All Test Suites
```bash
# 1. Security, Authentication, RBAC, IDOR & API Response Contracts (36 tests)
npx tsx src/tests/security.e2e.ts

# 2. Inspection Lifecycle, Pricing Adjustments & State Machine Sync (171 tests)
npx tsx src/tests/inspection.e2e.ts

# 3. Payment Collections, Retries, Full/Partial Refunds & Concurrency (77 tests)
npx tsx src/tests/payment.e2e.ts
```

### Verified Test Results
```
==================================================
TEST SUMMARY:
• security.e2e.ts:   36 Passed,   0 Failed (100%)
• inspection.e2e.ts: 171 Passed,  0 Failed (100%)
• payment.e2e.ts:    77 Passed,   0 Failed (100%)
--------------------------------------------------
TOTAL:               284 Passed,  0 Failed (100%)
==================================================
```

---

## 9. Backend Architecture & Folder Structure

FRESCO follows a decoupled **7-layer architecture**:

```
[Mobile Client (React Native / Redux)]
                  │
                  ▼
          [Express Router] (src/routes/*)
                  │
                  ▼
         [Middlewares Pipeline] (src/middlewares/*)
         ├── authenticate (JWT Bearer Verification)
         ├── authorize (RBAC Role Checks)
         └── errorMiddleware (Centralized Error Envelope)
                  │
                  ▼
          [Zod Validator] (src/validators/*)
                  │
                  ▼
            [Controller] (src/controllers/*)
                  │
                  ▼
              [Service] (src/services/*)
              ├── Pure Business Logic
              ├── Pricing Engine & Snapshot Calculation
              ├── Order / Inspection / Payment State Machines
              └── Resource Ownership & IDOR Protection
                  │
                  ▼
            [Repository] (src/repositories/*)
              └── Isolated Data Access & Atomic MongoDB Updates
                  │
                  ▼
          [Mongoose Model] (src/models/*)
                  │
                  ▼
          [MongoDB Database]
```

### Folder Structure
```
fresco-backend/
├── dist/                      # Production compiled JavaScript code
├── logs/                      # Winston daily rotating JSON logs
├── src/
│   ├── config/                # Environment schema validation and Winston logger
│   │   ├── env.ts
│   │   └── logger.ts
│   ├── constants/             # Enums, statuses, and validation constraint constants
│   │   ├── address.constants.ts
│   │   ├── assignment.constants.ts
│   │   ├── cart.constants.ts
│   │   ├── category.constants.ts
│   │   ├── delivery-task.constants.ts
│   │   ├── garment.constants.ts
│   │   ├── inspection.constants.ts
│   │   ├── order.constants.ts
│   │   ├── payment.constants.ts
│   │   ├── pricing.constants.ts
│   │   ├── service.constants.ts
│   │   ├── user.constants.ts
│   │   └── validation.constants.ts
│   ├── controllers/           # HTTP controllers handling request/response serialization
│   │   ├── address.controller.ts
│   │   ├── assignment.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── category.controller.ts
│   │   ├── delivery-task.controller.ts
│   │   ├── garment.controller.ts
│   │   ├── health.controller.ts
│   │   ├── inspection.controller.ts
│   │   ├── order.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── pricing.controller.ts
│   │   ├── service.controller.ts
│   │   └── user.controller.ts
│   ├── lib/                   # Database connection lifecycle and validator runners
│   │   ├── database.ts
│   │   └── validation.ts
│   ├── middlewares/           # Authentication, authorization, and error handling
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── not-found.middleware.ts
│   ├── models/                # Mongoose models, schemas, and indexing definitions
│   │   ├── address.model.ts
│   │   ├── assignment.model.ts
│   │   ├── cart.model.ts
│   │   ├── category.model.ts
│   │   ├── delivery-task.model.ts
│   │   ├── garment.model.ts
│   │   ├── inspection.model.ts
│   │   ├── order.model.ts
│   │   ├── payment.model.ts
│   │   ├── pricing.model.ts
│   │   ├── service.model.ts
│   │   └── user.model.ts
│   ├── repositories/          # Data access layer with isolated queries
│   │   ├── address.repository.ts
│   │   ├── assignment.repository.ts
│   │   ├── auth.repository.ts
│   │   ├── cart.repository.ts
│   │   ├── category.repository.ts
│   │   ├── delivery-task.repository.ts
│   │   ├── garment.repository.ts
│   │   ├── inspection.repository.ts
│   │   ├── order.repository.ts
│   │   ├── payment.repository.ts
│   │   ├── pricing.repository.ts
│   │   ├── service.repository.ts
│   │   └── user.repository.ts
│   ├── routes/                # Express API route modules and central router
│   │   ├── address.routes.ts
│   │   ├── assignment.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── category.routes.ts
│   │   ├── delivery-task.routes.ts
│   │   ├── garment.routes.ts
│   │   ├── health.routes.ts
│   │   ├── index.ts
│   │   ├── inspection.routes.ts
│   │   ├── order.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── pricing.routes.ts
│   │   ├── service.routes.ts
│   │   └── user.routes.ts
│   ├── services/              # Core business logic and transaction workflows
│   │   ├── address.service.ts
│   │   ├── assignment.service.ts
│   │   ├── auth.service.ts
│   │   ├── cart.service.ts
│   │   ├── category.service.ts
│   │   ├── delivery-task.service.ts
│   │   ├── garment.service.ts
│   │   ├── inspection.service.ts
│   │   ├── order.service.ts
│   │   ├── payment.service.ts
│   │   ├── pricing.service.ts
│   │   ├── service.service.ts
│   │   └── user.service.ts
│   ├── tests/                 # Automated End-to-End integration test suites
│   │   ├── inspection.e2e.ts
│   │   ├── payment.e2e.ts
│   │   └── security.e2e.ts
│   ├── types/                 # Ambient TypeScript definitions
│   │   └── express.d.ts
│   ├── utils/                 # Utilities for ApiError, ApiResponse, JWT, bcrypt
│   │   ├── api-error.ts
│   │   ├── api-response.ts
│   │   ├── async-handler.ts
│   │   ├── jwt.ts
│   │   └── password.ts
│   ├── validators/            # Strict Zod schemas for payload and query validation
│   │   ├── address.validator.ts
│   │   ├── assignment.validator.ts
│   │   ├── auth.validator.ts
│   │   ├── cart.validator.ts
│   │   ├── category.validator.ts
│   │   ├── delivery-task.validator.ts
│   │   ├── garment.validator.ts
│   │   ├── inspection.validator.ts
│   │   ├── order.validator.ts
│   │   ├── payment.validator.ts
│   │   ├── pricing.validator.ts
│   │   ├── service.validator.ts
│   │   └── user.validator.ts
│   ├── app.ts                 # Express application configuration
│   └── server.ts              # Server bootstrap and graceful shutdown handler
├── .env.example               # Template environment configuration
├── package.json               # Dependencies and build scripts
└── tsconfig.json              # TypeScript compiler configuration
```

---

## 10. User Roles & Authorization Matrix

The system defines 6 hierarchical user roles (`USER_ROLES`):

```
SUPER_ADMIN > ADMIN > CITY_MANAGER > BRANCH_MANAGER > DELIVERY_PARTNER > CUSTOMER
```

`ADMIN_ROLES` includes `["SUPER_ADMIN", "ADMIN", "CITY_MANAGER", "BRANCH_MANAGER"]`.

| Module / Operation | CUSTOMER | DELIVERY_PARTNER | BRANCH_MANAGER / CITY_MANAGER | ADMIN / SUPER_ADMIN |
|---|:---:|:---:|:---:|:---:|
| **Public Catalog Browsing** | ✅ | ✅ | ✅ | ✅ |
| **Manage Own Profile / Password** | ✅ | ✅ | ✅ | ✅ |
| **Manage Own Addresses** | ✅ | ✅ | ✅ | ✅ |
| **Manage Own Cart** | ✅ | ❌ | ❌ | ❌ |
| **Place & Cancel Own Orders** | ✅ | ❌ | ❌ | ❌ |
| **View Own Orders** | ✅ | ❌ | ❌ | ❌ |
| **View Assigned Orders** | ❌ | ✅ | ❌ | ❌ |
| **View All Orders** | ❌ | ❌ | ✅ | ✅ |
| **Update Order Status / Payment Status** | ❌ | ❌ | ✅ | ✅ |
| **Manage Catalog (Create/Edit/Disable)** | ❌ | ❌ | ✅ | ✅ |
| **Assign Delivery Partners** | ❌ | ❌ | ✅ | ✅ |
| **Accept / Complete Partner Assignments**| ❌ | ✅ | ❌ | ❌ |
| **Create & Submit Garment Inspections** | ❌ | ❌ | ✅ | ✅ |
| **Record Doorstep Payment (Receive/Fail)** | ❌ | ✅ | ❌ | ❌ |
| **Retry Failed Payment** | ✅ (Own) | ❌ | ❌ | ❌ |
| **Issue Full / Partial Refunds** | ❌ | ❌ | ✅ | ✅ |

---

## 11. Core Business Workflows & State Machines

### 11.1 Customer Cart → Checkout → Order Flow
```
Customer browses catalog (Category → Garment → Service → Pricing)
                           │
                           ▼
          POST /api/v1/cart (Adds item)
  [Server validates active entities and verifies prices]
                           │
                           ▼
          PATCH /api/v1/cart/items/:id (Updates quantity)
                           │
                           ▼
          POST /api/v1/orders (Checkout)
  ├── 1. Verifies customer account is ACTIVE
  ├── 2. Verifies cart contains at least 1 item
  ├── 3. Freezes pricing snapshot (subtotal, discounts, tax, delivery fee, total)
  ├── 4. Freezes pickup and delivery address snapshots
  ├── 5. Creates Order document with status: "PLACED", paymentStatus: "PENDING"
  └── 6. Automatically resets and clears customer's cart
```

---

### 11.2 Order Lifecycle State Machine
```
[PLACED] ───────► [CONFIRMED] ───────► [PICKUP_ASSIGNED] ───────► [PICKED_UP]
    │                 │
    ▼                 ▼
[CANCELLED]       [CANCELLED]
                                              │
                                              ▼
[DELIVERED] ◄─── [OUT_FOR_DELIVERY] ◄─── [READY_FOR_DELIVERY] ◄─── [IN_PROCESS] ◄─── [UNDER_INSPECTION]
```

- **Customer Cancellation:** Orders can be cancelled by the customer **ONLY** when in `PLACED` or `CONFIRMED` status. Once an order reaches `PICKUP_ASSIGNED` or later, cancellation is rejected with `HTTP 400 Bad Request`.
- **Assignment Sync:** When a delivery partner accepts a pickup assignment, the order transitions to `PICKUP_ASSIGNED`. When completed, it transitions to `PICKED_UP`.
- **Inspection Sync:** Creating an inspection transitions the order from `PICKED_UP` to `UNDER_INSPECTION`. Submitting the inspection transitions the order to `IN_PROCESS`.

---

### 11.3 Workshop Inspection Lifecycle
```
[DRAFT] ───────► [SUBMITTED] ───────► [APPROVED / REJECTED]
   │
   ▼
[CANCELLED]
```
1. **Creation:** An inspector initiates an inspection for an order in `PICKED_UP` status. The order status automatically moves to `UNDER_INSPECTION`.
2. **Item Evaluation:** Inspector records inspected quantities, item conditions (`NORMAL`, `STAINED`, `DAMAGED`, `TORN`, `COLOR_BLEED_RISK`), damage notes, and extra service requests.
3. **Price Recalculation:** The server recalculates subtotals using active catalog pricing, adds extra service fees, applies manual financial adjustments, and calculates `finalTotalAmount`.
4. **Submission:** Submitting a `DRAFT` inspection transitions its status to `SUBMITTED` and automatically advances the associated order to `IN_PROCESS`.

---

### 11.4 Assignment & Delivery Task Flow
- **Pickup Phase:** Admin creates a `PICKUP` assignment → Partner accepts assignment (`order.status` moves to `PICKUP_ASSIGNED`) → Partner collects garments and completes assignment (`order.status` moves to `PICKED_UP`).
- **Delivery Phase:** Admin creates a `DELIVERY` assignment → Partner accepts assignment (`order.status` moves to `OUT_FOR_DELIVERY`) → Partner delivers garments to customer and collects payment → Partner completes assignment (`order.status` moves to `DELIVERED`).

---

### 11.5 Payment & Refund Engine
```
[PENDING] ───────► [PAID] ───────► [REFUNDED]
    │                ▲
    ▼                │
 [FAILED] ───────────┘
```
- **Payment Creation:** Automatically derives payable amount from the finalized order pricing snapshot. Enforces a strict 1-Order-to-1-Payment relationship.
- **Doorstep Payment Collection:** Delivery partner marks payment as received (`PAID`) via `POST /payments/:id/receive` or failed (`FAILED`) via `POST /payments/:id/fail`.
- **Customer Payment Retry:** Customers can retry a failed payment via `POST /payments/:id/retry` (moves status back to `PENDING`).
- **Refund Engine:** Admins can issue full or partial refunds with over-refund protection (`maxRefundableAmount = totalAmount - completedRefunds`). Full refund synchronizes Payment and Order status to `REFUNDED`.

---

## 12. Complete API Endpoint Catalog (84 Endpoints)

All endpoints are prefixed with `/api/v1`.

### 1. Health Module (1 Endpoint)
| Method | Endpoint | Auth | Role | Description | Status |
|---|---|:---:|---|---|:---:|
| `GET` | `/health` | No | Public | Service health & uptime probe | `200` |

### 2. Authentication Module (4 Endpoints)
| Method | Endpoint | Auth | Role | Request Body | Status |
|---|---|:---:|---|---|:---:|
| `POST` | `/auth/register` | No | Public | `{ firstName, lastName, email, phone, password }` | `201` |
| `POST` | `/auth/login` | No | Public | `{ email, password }` | `200` |
| `POST` | `/auth/refresh-token` | No | Public | `{ refreshToken }` | `200` |
| `POST` | `/auth/logout` | No | Public | `{ refreshToken }` | `200` |

### 3. User Management Module (6 Endpoints)
| Method | Endpoint | Auth | Role | Request Body | Status |
|---|---|:---:|---|---|:---:|
| `GET` | `/users/me` | Yes | All | None | `200` |
| `PATCH` | `/users/profile` | Yes | All | `{ firstName?, lastName?, phone?, profileImage? }` | `200` |
| `PATCH` | `/users/change-password` | Yes | All | `{ currentPassword, newPassword }` | `200` |
| `POST` | `/users/forgot-password` | No | Public | `{ email }` | `200` |
| `POST` | `/users/reset-password` | No | Public | `{ token, newPassword }` | `200` |
| `POST` | `/users/verify-email` | No | Public | `{ token }` | `200` |

### 4. Address Module (6 Endpoints)
| Method | Endpoint | Auth | Role | Request Body | Status |
|---|---|:---:|---|---|:---:|
| `POST` | `/addresses` | Yes | All | `{ label, fullName, phone, addressLine1, city, state, postalCode, ... }` | `201` |
| `GET` | `/addresses` | Yes | All | None | `200` |
| `GET` | `/addresses/:id` | Yes | Owner | None | `200` |
| `PATCH` | `/addresses/:id` | Yes | Owner | `{ label?, fullName?, phone?, addressLine1?, ... }` | `200` |
| `DELETE` | `/addresses/:id` | Yes | Owner | None (Soft delete) | `200` |
| `PATCH` | `/addresses/:id/default` | Yes | Owner | None | `200` |

### 5. Category Module (6 Endpoints)
| Method | Endpoint | Auth | Role | Query / Body | Status |
|---|---|:---:|---|---|:---:|
| `GET` | `/categories` | No | Public | Query: `?isActive=true\|false` | `200` |
| `GET` | `/categories/:id` | No | Public | None | `200` |
| `POST` | `/categories` | Yes | ADMIN_ROLES | `{ name, description?, displayOrder?, icon? }` | `201` |
| `PATCH` | `/categories/:id` | Yes | ADMIN_ROLES | `{ name?, description?, displayOrder?, icon? }` | `200` |
| `PATCH` | `/categories/:id/enable` | Yes | ADMIN_ROLES | None | `200` |
| `DELETE` | `/categories/:id` | Yes | ADMIN_ROLES | None (Soft delete `isActive: false`) | `200` |

### 6. Garment Module (6 Endpoints)
| Method | Endpoint | Auth | Role | Query / Body | Status |
|---|---|:---:|---|---|:---:|
| `GET` | `/garments` | No | Public | Query: `?categoryId=<id>&isActive=true\|false` | `200` |
| `GET` | `/garments/:id` | No | Public | None | `200` |
| `POST` | `/garments` | Yes | ADMIN_ROLES | `{ categoryId, name, description?, displayOrder?, icon? }` | `201` |
| `PATCH` | `/garments/:id` | Yes | ADMIN_ROLES | `{ categoryId?, name?, description?, displayOrder?, icon? }` | `200` |
| `PATCH` | `/garments/:id/enable` | Yes | ADMIN_ROLES | None | `200` |
| `DELETE` | `/garments/:id` | Yes | ADMIN_ROLES | None (Soft delete `isActive: false`) | `200` |

### 7. Service Module (6 Endpoints)
| Method | Endpoint | Auth | Role | Query / Body | Status |
|---|---|:---:|---|---|:---:|
| `GET` | `/services` | No | Public | Query: `?isActive=true\|false` | `200` |
| `GET` | `/services/:id` | No | Public | None | `200` |
| `POST` | `/services` | Yes | ADMIN_ROLES | `{ name, description?, displayOrder?, icon? }` | `201` |
| `PATCH` | `/services/:id` | Yes | ADMIN_ROLES | `{ name?, description?, displayOrder?, icon? }` | `200` |
| `PATCH` | `/services/:id/enable` | Yes | ADMIN_ROLES | None | `200` |
| `DELETE` | `/services/:id` | Yes | ADMIN_ROLES | None (Soft delete `isActive: false`) | `200` |

### 8. Pricing Matrix Module (6 Endpoints)
| Method | Endpoint | Auth | Role | Query / Body | Status |
|---|---|:---:|---|---|:---:|
| `GET` | `/pricing` | No | Public | Query: `?garmentId=<id>&serviceId=<id>&isActive=true` | `200` |
| `GET` | `/pricing/:id` | No | Public | None | `200` |
| `POST` | `/pricing` | Yes | ADMIN_ROLES | `{ garmentId, serviceId, price, currency? }` | `201` |
| `PATCH` | `/pricing/:id` | Yes | ADMIN_ROLES | `{ price?, currency? }` | `200` |
| `PATCH` | `/pricing/:id/enable` | Yes | ADMIN_ROLES | None | `200` |
| `DELETE` | `/pricing/:id` | Yes | ADMIN_ROLES | None (Soft delete `isActive: false`) | `200` |

### 9. Cart Module (5 Endpoints)
| Method | Endpoint | Auth | Role | Request Body | Status |
|---|---|:---:|---|---|:---:|
| `GET` | `/cart` | Yes | Customer | None | `200` |
| `POST` | `/cart` | Yes | Customer | `{ garmentId, serviceId, quantity }` | `200` |
| `PATCH` | `/cart/items/:id` | Yes | Customer | `{ quantity }` | `200` |
| `DELETE` | `/cart/items/:id` | Yes | Customer | None | `200` |
| `DELETE` | `/cart` | Yes | Customer | None (Clears cart) | `200` |

### 10. Order Module (7 Endpoints)
| Method | Endpoint | Auth | Role | Request Body | Status |
|---|---|:---:|---|---|:---:|
| `GET` | `/orders` | Yes | Customer | None (Returns customer's orders) | `200` |
| `POST` | `/orders` | Yes | Customer | `{ pickupAddress, deliveryAddress, pickupDate?, deliveryDate?, ... }` | `201` |
| `GET` | `/orders/all` | Yes | ADMIN_ROLES | Query: `?status=&paymentStatus=&userId=` | `200` |
| `GET` | `/orders/:id` | Yes | Owner/Partner/Admin | None | `200` |
| `PATCH` | `/orders/:id/status` | Yes | ADMIN_ROLES | `{ status }` | `200` |
| `PATCH` | `/orders/:id/payment-status` | Yes | ADMIN_ROLES | `{ paymentStatus }` | `200` |
| `PATCH` | `/orders/:id/cancel` | Yes | Owner (Customer) | None (Allowed only in PLACED/CONFIRMED) | `200` |

### 11. Assignment Module (8 Endpoints)
| Method | Endpoint | Auth | Role | Query / Body | Status |
|---|---|:---:|---|---|:---:|
| `GET` | `/assignments/partner` | Yes | DELIVERY_PARTNER | None | `200` |
| `POST` | `/assignments` | Yes | ADMIN_ROLES | `{ orderId, partnerId, assignmentType, notes? }` | `201` |
| `GET` | `/assignments` | Yes | ADMIN_ROLES | Query: `?partnerId=&assignmentType=&status=&isActive=` | `200` |
| `GET` | `/assignments/:id` | Yes | ADMIN_ROLES | None | `200` |
| `PATCH` | `/assignments/:id/accept` | Yes | Assigned Partner | None | `200` |
| `PATCH` | `/assignments/:id/complete` | Yes | Assigned Partner | None | `200` |
| `PATCH` | `/assignments/:id/status` | Yes | ADMIN_ROLES | `{ status }` | `200` |
| `DELETE` | `/assignments/:id` | Yes | ADMIN_ROLES | None (Soft delete) | `200` |

### 12. Delivery Task Module (6 Endpoints)
| Method | Endpoint | Auth | Role | Query / Body | Status |
|---|---|:---:|---|---|:---:|
| `GET` | `/delivery-tasks/partner` | Yes | DELIVERY_PARTNER | None | `200` |
| `POST` | `/delivery-tasks` | Yes | ADMIN_ROLES | `{ assignmentId, notes? }` | `201` |
| `GET` | `/delivery-tasks` | Yes | ADMIN_ROLES | Query: `?partnerId=&taskType=&status=&isActive=` | `200` |
| `GET` | `/delivery-tasks/:id` | Yes | ADMIN_ROLES | None | `200` |
| `PATCH` | `/delivery-tasks/:id/status` | Yes | ADMIN_ROLES | `{ status }` | `200` |
| `DELETE` | `/delivery-tasks/:id` | Yes | ADMIN_ROLES | None (Soft delete) | `200` |

### 13. Inspection Module (7 Endpoints)
| Method | Endpoint | Auth | Role | Request Body | Status |
|---|---|:---:|---|---|:---:|
| `POST` | `/inspections` | Yes | ADMIN_ROLES | `{ orderId, items, extraServices?, adjustmentAmount?, ... }` | `201` |
| `GET` | `/inspections` | Yes | All | Query: `?orderId=&inspectorId=&status=&isActive=` | `200` |
| `GET` | `/inspections/order/:orderId` | Yes | All | None | `200` |
| `GET` | `/inspections/:id` | Yes | All | None | `200` |
| `PATCH` | `/inspections/:id` | Yes | ADMIN_ROLES | `{ items?, extraServices?, adjustmentAmount?, ... }` | `200` |
| `POST` | `/inspections/:id/submit` | Yes | ADMIN_ROLES | None (Advances Order to IN_PROCESS) | `200` |
| `DELETE` | `/inspections/:id` | Yes | ADMIN_ROLES | None (Soft delete) | `200` |

### 14. Payment & Refund Module (10 Endpoints)
| Method | Endpoint | Auth | Role | Request Body | Status |
|---|---|:---:|---|---|:---:|
| `POST` | `/payments` | Yes | Customer (Owner) | `{ orderId, paymentMethod }` | `201` |
| `GET` | `/payments` | Yes | ADMIN_ROLES | Query: `?status=&paymentMethod=&customerId=&orderId=` | `200` |
| `GET` | `/payments/customer` | Yes | Customer | None | `200` |
| `GET` | `/payments/order/:orderId` | Yes | Owner/Partner/Admin | None | `200` |
| `GET` | `/payments/:id` | Yes | Owner/Partner/Admin | None | `200` |
| `GET` | `/payments/:id/refunds` | Yes | All | None | `200` |
| `POST` | `/payments/:id/receive` | Yes | Assigned Partner | `{ paymentMethod? }` (Marks PAID) | `200` |
| `POST` | `/payments/:id/fail` | Yes | Assigned Partner | None (Marks FAILED) | `200` |
| `POST` | `/payments/:id/retry` | Yes | Customer (Owner) | `{ paymentMethod }` (Moves back to PENDING) | `200` |
| `POST` | `/payments/:id/refund` | Yes | ADMIN_ROLES | `{ amount, reason? }` | `200` |

---

## 13. API Response & Error Standards

### Success Response Envelope (`ApiResponse`)
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "_id": "6a7ee6fa452d2a6f9645dfb1",
      "firstName": "Rahul",
      "lastName": "Sharma",
      "email": "rahul.sharma@example.com",
      "phone": "+919876543210",
      "role": "CUSTOMER",
      "status": "ACTIVE",
      "isEmailVerified": false,
      "isPhoneVerified": false,
      "createdAt": "2026-08-14T09:00:00.000Z",
      "updatedAt": "2026-08-14T09:00:00.000Z"
    }
  }
}
```

### Error Response Envelope (`ApiError`)
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "phone",
      "message": "Phone must be a valid international phone number."
    }
  ]
}
```

### HTTP Status Code Conventions
- `200 OK`: Successful read, update, or state transition.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure, invalid state transition, or business rule violation.
- `401 Unauthorized`: Missing, invalid, or expired JWT token.
- `403 Forbidden`: Authenticated user lacks required permissions or does not own the resource.
- `404 Not Found`: Target entity not found.
- `409 Conflict`: Unique key collision or concurrent state mutation.
- `500 Internal Server Error`: Unhandled server exception (sanitized in production).

---

## 14. API Testing & Quickstart with cURL

### 1. Register a Customer
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Rahul",
    "lastName": "Sharma",
    "email": "rahul@example.com",
    "phone": "+919876543210",
    "password": "Password@123"
  }'
```

### 2. Login to Receive JWT Tokens
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rahul@example.com",
    "password": "Password@123"
  }'
```

Save the returned `accessToken` and `refreshToken`.

### 3. Fetch Authenticated Profile
```bash
curl -X GET http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

### 4. Create Saved Delivery Address
```bash
curl -X POST http://localhost:5000/api/v1/addresses \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "HOME",
    "fullName": "Rahul Sharma",
    "phone": "+919876543210",
    "addressLine1": "Flat 402, Sunshine Heights, MG Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560001",
    "country": "India",
    "isDefault": true
  }'
```

### 5. Add Item to Cart & Place Order
```bash
# Add item to cart
curl -X POST http://localhost:5000/api/v1/cart \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "garmentId": "<GARMENT_OBJECT_ID>",
    "serviceId": "<SERVICE_OBJECT_ID>",
    "quantity": 2
  }'

# Checkout / Create Order
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "pickupAddress": {
      "fullName": "Rahul Sharma",
      "phone": "+919876543210",
      "addressLine1": "Flat 402, Sunshine Heights, MG Road",
      "city": "Bengaluru",
      "state": "Karnataka",
      "postalCode": "560001"
    },
    "deliveryAddress": {
      "fullName": "Rahul Sharma",
      "phone": "+919876543210",
      "addressLine1": "Flat 402, Sunshine Heights, MG Road",
      "city": "Bengaluru",
      "state": "Karnataka",
      "postalCode": "560001"
    }
  }'
```

---

## 15. React Native & Redux Toolkit Integration Guide

### 15.1 Secure Token Management
- **Never** store access/refresh tokens in unencrypted `AsyncStorage`.
- Use **`expo-secure-store`** (Expo) or **`react-native-keychain`** (Bare React Native).

### 15.2 Axios Silent Refresh Interceptor
Configure your mobile API client with an automatic token refresh interceptor:

```typescript
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const apiClient = axios.create({
  baseURL: "http://YOUR_SERVER_IP:5000/api/v1",
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post("http://YOUR_SERVER_IP:5000/api/v1/auth/refresh-token", {
          refreshToken,
        });

        await SecureStore.setItemAsync("accessToken", data.data.accessToken);
        await SecureStore.setItemAsync("refreshToken", data.data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        // Dispatch logout to Redux store / navigate to Login screen
      }
    }
    return Promise.reject(error);
  }
);
```

### 15.3 Suggested Redux Toolkit Slices
```
src/store/
├── index.ts                      # Root Redux store configuration
├── slices/
│   ├── authSlice.ts              # Session tokens, user role, isAuthenticated
│   ├── userSlice.ts              # Profile data, active settings
│   ├── addressSlice.ts           # Saved addresses, selected default address
│   ├── catalogSlice.ts           # Categories, garments, services, pricing cache
│   ├── cartSlice.ts              # Active cart items, quantities, subtotal
│   ├── orderSlice.ts             # Customer order list, tracking details
│   ├── partnerAssignmentSlice.ts # Delivery partner tasks & assignment roster
│   ├── inspectionSlice.ts        # Order inspection review details
│   └── paymentSlice.ts           # Payment status, retry handling, refunds
```

### 15.4 Mobile Data Standards
- **Identifiers:** 24-character hex strings (`ObjectId`).
- **Dates:** ISO-8601 UTC strings (`"2026-08-14T10:30:00.000Z"`).
- **Currencies:** Numeric amounts in INR (e.g., `499.00`).
- **Boolean Filters:** Pass as strings in query parameters (`?isActive=true`).

---

## 16. Security & Protection Mechanisms

1. **HTTP Security Headers:** Powered by `helmet()` with strict default headers. `x-powered-by` header disabled.
2. **CORS Origin Whitelisting:** Enforced via `CORS_ORIGIN` environment variable.
3. **Password Security:** Salted one-way hashing with `bcryptjs` (salt rounds: 12).
4. **Token Security:** Asymmetric-ready JWT signing with independent secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) and strict duration validation.
5. **IDOR & Ownership Protection:** All customer and partner endpoints explicitly verify resource ownership in the service layer before processing requests.
6. **Input Sanitization:** All request bodies, route parameters, and query parameters validated against strict Zod schemas before hitting controllers.
7. **Production Error Masking:** Stack traces and internal database errors are masked with `"Internal server error."` in production mode.

---

## 17. Database Indexes & Performance

Optimized compound and single-field MongoDB indexes are defined across all Mongoose models:

- **Users:** `{ status: 1, role: 1, deletedAt: 1 }`, `{ email: 1 }`, `{ phone: 1 }`.
- **Addresses:** `{ userId: 1, isDefault: 1, deletedAt: 1 }`.
- **Categories, Garments, Services:** `{ name: 1 }`, `{ isActive: 1 }`, `{ displayOrder: 1 }`.
- **Pricing:** `{ garmentId: 1, serviceId: 1 }` (unique compound index).
- **Orders:** `{ userId: 1, createdAt: -1 }`, `{ status: 1, createdAt: -1 }`, `{ paymentStatus: 1 }`.
- **Assignments:** `{ orderId: 1, assignmentType: 1 }`, `{ partnerId: 1, status: 1 }`.
- **Delivery Tasks:** `{ assignmentId: 1 }`, `{ partnerId: 1, status: 1 }`.
- **Inspections:** `{ orderId: 1 }` (unique active index), `{ inspectorId: 1 }`.
- **Payments:** `{ orderId: 1 }` (unique), `{ customerId: 1, status: 1 }`, `{ receivedByPartnerId: 1, status: 1 }`.

---

## 18. Future Enhancements & Roadmap

1. **SMS & WhatsApp Notifications:** Integration with Twilio / Gupshup to send automated SMS/WhatsApp alerts on order status milestones.
2. **Online Payment Gateway:** Razorpay / Stripe integration for in-app credit/debit card and UPI intent payments alongside doorstep collection.
3. **Live GPS Tracking:** WebSocket gateway streaming real-time delivery partner coordinates to customer tracking screens.

---

**Certified & Maintained by FRESCO Engineering Team**  
*The FRESCO backend is fully operational, hardened, tested, and ready for React Native mobile app development.*
