# Festiverse Backend — Security & Architecture Documentation

> **Version:** 1.0.0 | **Last Updated:** 2026-05-02 | **Platform:** Government Engineering College, Samastipur

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Directory Structure](#3-directory-structure)
4. [Security Architecture](#4-security-architecture)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [API Reference](#6-api-reference)
7. [Database Schema](#7-database-schema)
8. [Middleware Pipeline](#8-middleware-pipeline)
9. [Environment Configuration](#9-environment-configuration)
10. [Deployment Checklist](#10-deployment-checklist)

---

## 1. System Overview

Festiverse is the backend for UDAAN — the annual technical and cultural fest of GEC Samastipur. It handles user registration, payment processing (Razorpay), event management, certificate generation, and an admin dashboard.

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js + Express.js |
| Database | Supabase (PostgreSQL) |
| Payments | Razorpay (Orders + Webhooks) |
| Auth | JWT (httpOnly cookies) + bcrypt (12 rounds) |
| Rate Limiting | Upstash Redis |
| Email | Resend (primary) + Gmail REST API (fallback) |
| Logging | Winston (structured JSON) |
| Security Headers | Helmet.js |
| File Storage | Supabase Storage (`assets` bucket) |

---

## 2. Architecture

### High-Level Flow

```
Client (React) ──HTTPS──▶ Express App
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
               Middleware   Routes   Error Handler
                    │         │
                    │    ┌────┴────┐
                    │    ▼         ▼
                    │ Controllers Services
                    │              │
                    │         ┌────┴────┐
                    │         ▼         ▼
                    │     Supabase   Razorpay
                    │         │
                    └─────────┘
```

### Request Lifecycle

```
Request → Trust Proxy → Request Logger → Helmet (Security Headers)
  → CORS → Cookie Parser → Body Parser (raw body for webhooks)
  → CSRF Guard (Origin + X-Requested-With) → Global Rate Limit (100/min)
  → Input Sanitization (XSS strip) → Request ID → Route Handler
  → Error Handler → Response
```

### Architectural Pattern

**Refactored routes** (auth, payment) use the **Controller → Service** pattern:
- **Controller**: Handles HTTP request/response lifecycle
- **Service**: Contains business logic, talks to DB

**Legacy routes** (events, admin, gallery, etc.) use inline handlers and are being migrated incrementally.

---

## 3. Directory Structure

```
src/
├── app.js                    # Express app factory
├── config/
│   ├── env.js                # Centralized env config + startup validation
│   ├── cors.js               # CORS whitelist configuration
│   ├── helmet.js             # Security headers (CSP, HSTS, Permissions-Policy)
│   ├── logger.js             # Winston structured logger
│   ├── supabaseClient.js     # Supabase SDK initialization
│   └── emailClient.js        # Resend + Gmail dual email service
├── controllers/
│   ├── authController.js     # Auth request handlers
│   └── paymentController.js  # Payment request handlers
├── middlewares/
│   ├── authMiddleware.js     # JWT verification + role checks
│   ├── csrfGuard.js          # X-Requested-With header enforcement
│   ├── errorHandler.js       # Global error handler (no stack leaks)
│   ├── rateLimit.js          # Upstash Redis rate limiter factory
│   ├── requestId.js          # Unique request ID for tracing
│   ├── requestLogger.js      # HTTP request logging
│   ├── sanitize.js           # XSS stripping, UUID validation, Gmail checks
│   └── validate.js           # express-validator runner
├── routes/
│   ├── index.js              # Top-level registrar (/api + /api/v1)
│   ├── v1/
│   │   ├── index.js          # V1 route mount point
│   │   ├── authRoutes.js     # Refactored auth routes
│   │   └── paymentRoutes.js  # Refactored payment routes
│   ├── adminRoutes.js        # Admin CRUD (1300+ lines)
│   ├── eventRoutes.js        # Event listing + registration
│   ├── certificateRoutes.js  # Certificate check + PDF download
│   ├── resultRoutes.js       # Public results
│   ├── analyticsRoutes.js    # Visitor tracking
│   ├── contactRoutes.js      # Contact form
│   ├── hiringRoutes.js       # Job applications
│   ├── proxyRoutes.js        # Image proxy (anti-DNS hijack)
│   └── [gallery|team|faculty|notices|sponsors]Routes.js
├── services/
│   ├── authService.js        # OTP, registration, password reset
│   ├── paymentService.js     # Razorpay order + webhook logic
│   └── userService.js        # User CRUD + Festiverse ID generation
├── utils/
│   ├── AppError.js           # Custom error class with statusCode
│   └── pdfGenerator.js       # Certificate PDF generation
└── validators/
    ├── authValidator.js       # Registration/login validation chains
    └── paymentValidator.js    # Payment validation chains
```

---

## 4. Security Architecture

### 4.1 Defense-in-Depth Layers

```
Layer 1: Network ──── Helmet (CSP, HSTS, X-Frame-Options, Permissions-Policy)
Layer 2: Transport ── CORS whitelist + CSRF (Origin + X-Requested-With)
Layer 3: Rate Limit ─ Global (100/min) + Route-specific (3-10/min)
Layer 4: Input ────── sanitize.js (XSS strip) + express-validator chains
Layer 5: Auth ─────── JWT httpOnly cookies + bcrypt 12 rounds + role checks
Layer 6: Data ─────── UUID validation on all IDs + parameterized queries
Layer 7: Logging ──── Winston structured JSON (no stack traces, no PII)
Layer 8: Crypto ───── crypto.randomInt() for all random values
```

### 4.2 Cryptographic Standards

| Use Case | Method | Details |
|----------|--------|---------|
| OTP Generation | `crypto.randomInt(100000, 999999)` | CSPRNG, 6 digits |
| Festiverse ID | `crypto.randomInt(1000, 9999)` | CSPRNG, 4 digits |
| Password Hashing | `bcrypt` (12 rounds) | OWASP minimum |
| OTP Storage | `bcrypt` (10 rounds) | Hashed before DB write |
| Webhook Verification | `crypto.createHmac('sha256')` | HMAC-SHA256 |
| Signature Comparison | `crypto.timingSafeEqual()` | Constant-time |
| IP Hashing (analytics) | `crypto.createHash('sha256')` | One-way hash |

### 4.3 Security Headers (Helmet)

| Header | Value |
|--------|-------|
| Content-Security-Policy | Strict allowlist for scripts, styles, images, frames |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains; preload` |
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `SAMEORIGIN` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | camera, microphone, geolocation, gyroscope, usb = none |

### 4.4 CSRF Protection (Dual Layer)

1. **Origin/Referer Validation**: All mutating requests (POST/PUT/DELETE) must have an `Origin` or `Referer` header matching `config.allowedOrigins`.
2. **X-Requested-With Header**: Required on all mutating requests (except webhooks).
3. **Webhook Exemption**: `/api/payment/webhook` is exempt (verified via HMAC signature instead).

### 4.5 Rate Limiting Matrix

| Route | Window | Max | Purpose |
|-------|--------|-----|---------|
| Global | 60s | 100 | Baseline DDoS protection |
| `POST /auth/send-otp` | 60s | 3 | OTP abuse prevention |
| `POST /auth/register` | 60s | 3 | Registration spam |
| `POST /auth/login` | 60s | 5 | Brute-force mitigation |
| `POST /events/register` | 60s | 10 | Event registration spam |
| `GET /certificates/download` | 60s | 5 | CPU-intensive PDF generation |
| `POST /analytics/visit` | 60s | 5 | Visitor count inflation |
| `POST /admin/login` | 60s | 5 | Admin brute-force |
| `POST /contact` | 300s | 5 | Contact form spam |
| `POST /hiring/submit` | 300s | 3 | Application spam |
| `POST /payment/create-order` | 60s | 5 | Payment abuse |

### 4.6 Input Validation Summary

| Check | Implementation | Where |
|-------|---------------|-------|
| Email format | Gmail-only regex + `+` alias rejection | Validator + Service layer |
| Phone format | `^[6-9]\d{9}$` (Indian numbers only) | Validator + Route handler |
| UUID format | `isValidUUID()` regex check | All `:id` params + query params |
| Password strength | 10-128 chars | Validator chain |
| XSS prevention | `stripHtml()` + `escapeSpecialChars()` | Global middleware |
| Field length | `enforceMaxLength()` | Per-field in route handlers |
| File type | Extension + MIME regex | Multer `fileFilter` |
| File size | 1-15 MB limits | Multer `limits` |
| Social URLs | Must start with `https://` | Admin team/faculty routes |
| College spoofing | Server-side `HOST_COLLEGE_NAME` match | Payment + registration |

---

## 5. Authentication & Authorization

### 5.1 Registration Flow

```
Client                          Backend                         Supabase
  │                                │                               │
  ├─── POST /auth/send-otp ──────▶│                               │
  │    { email }                   ├── assertGmail(email)          │
  │                                ├── crypto.randomInt() → OTP   │
  │                                ├── bcrypt.hash(OTP) ─────────▶│ otp_verifications
  │                                ├── sendOTPEmail(email, OTP)   │
  │◀── { success: true } ─────────┤                               │
  │                                │                               │
  ├─── POST /payment/create-order─▶│                               │
  │    { category, userData }      ├── validate all fields         │
  │                                ├── bcrypt.hash(password, 12) ─▶│ pending_registrations
  │                                ├── razorpay.orders.create()   │
  │◀── { orderId, amount } ───────┤                               │
  │                                │                               │
  │    [User pays via Razorpay]    │                               │
  │                                │                               │
  │    Razorpay ── POST /webhook ─▶│                               │
  │                                ├── HMAC-SHA256 verify          │
  │                                ├── timingSafeEqual()           │
  │                                ├── userService.createUser() ──▶│ users
  │                                ├── sendConfirmationEmail()     │
  │                                │                               │
  ├─── POST /auth/register ──────▶│                               │
  │    { email, otp, ... }         ├── verifyOTP (bcrypt.compare)  │
  │                                ├── jwt.sign() → token         │
  │◀── Set-Cookie: httpOnly ──────┤                               │
```

### 5.2 JWT Token Structure

```json
{
  "id": "uuid-of-user",
  "phone": "9876543210",
  "role": "student",
  "iat": 1714600000,
  "exp": 1714686400
}
```

- **Storage**: `httpOnly` cookie (`festiverse_token`)
- **Expiry**: 24 hours (user) / 4 hours (admin)
- **Flags**: `secure: true` (production), `sameSite: 'none'` (production)

### 5.3 Role-Based Access Control

| Role | Access |
|------|--------|
| `student` | Profile, event registration, certificates, results |
| `admin` | All student access + full CRUD on all resources |

Middleware chain: `verifyToken` → `verifyAdmin` (for admin routes)

---

## 6. API Reference

### 6.1 Auth Routes (`/api/v1/auth`)

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/send-otp` | No | 3/min | Send OTP to email |
| POST | `/verify-otp` | No | 3/min | Verify OTP independently |
| POST | `/register` | No | 3/min | Register with OTP verification |
| POST | `/login` | No | 5/min | Login with phone + password |
| POST | `/forgot-password-otp` | No | 3/min | Send password reset OTP |
| POST | `/reset-password` | No | 3/min | Reset password with OTP |
| GET | `/profile` | JWT | Global | Get user profile |
| PUT | `/profile` | JWT | Global | Update profile (+ avatar) |
| POST | `/logout` | No | Global | Clear JWT cookie |

### 6.2 Payment Routes (`/api/v1/payment`)

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/create-order` | No | 5/min | Create Razorpay order |
| POST | `/webhook` | HMAC | None | Razorpay webhook handler |
| GET | `/fees` | No | Global | Get registration fees |

### 6.3 Event Routes (`/api/v1/events`)

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| GET | `/` | No | Global | List all events |
| POST | `/register` | JWT | 10/min | Register for events |
| GET | `/my-events` | JWT | Global | List user's registrations |
| GET | `/lookup-member` | JWT | Global | Look up team member |

### 6.4 Admin Routes (`/api/v1/admin`)

All admin routes require `verifyToken + verifyAdmin` middleware.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Admin login (bcrypt) |
| POST | `/logout` | Clear admin cookie |
| GET | `/users` | List all users (paginated) |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| GET | `/registrations` | List event registrations |
| GET/POST/PUT/DELETE | `/events[/:id]` | Event CRUD |
| GET/POST/PUT/DELETE | `/gallery[/:id]` | Gallery CRUD |
| GET/POST/PUT/DELETE | `/team[/:id]` | Team member CRUD |
| GET/POST/PUT/DELETE | `/faculty[/:id]` | Faculty CRUD |
| GET/POST/PUT/DELETE | `/notices[/:id]` | Notice CRUD |
| GET/POST/PUT/DELETE | `/sponsors[/:id]` | Sponsor CRUD |
| GET/POST/PUT/DELETE | `/results[/:id]` | Results CRUD |
| POST | `/checkin` | QR code check-in |
| GET | `/analytics` | Visitor analytics |
| GET | `/messages` | Contact messages |
| GET/DELETE | `/hiring[/:id]` | Hiring applications |

### 6.5 Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/results/:eventId` | Event results |
| GET | `/api/v1/certificates/check/:festId` | Check certificates |
| GET | `/api/v1/certificates/download/:festId` | Download certificate PDF |
| POST | `/api/v1/contact` | Submit contact form |
| POST | `/api/v1/hiring/submit` | Submit job application |
| POST | `/api/v1/analytics/visit` | Record visit |
| GET | `/api/v1/proxy/image` | Proxy Supabase images |
| GET | `/api/v1/[gallery\|team\|faculty\|notices\|sponsors]` | Public data |

---

## 7. Database Schema

### Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────────────┐     ┌──────────────┐
│    users     │     │ event_registrations   │     │    events    │
├──────────────┤     ├──────────────────────┤     ├──────────────┤
│ id (PK,UUID) │◄────│ user_id (FK)         │────▶│ id (PK,UUID) │
│ name         │     │ event_id (FK)        │     │ name         │
│ email        │     │ custom_id            │     │ location     │
│ phone (UQ)   │     │ team_members (JSON)  │     │ date         │
│ college      │     │ checked_in           │     │ description  │
│ password_hash│     │ checked_in_at        │     │ rules        │
│ role         │     │ created_at           │     │ schedule     │
│ has_paid     │     │ UNIQUE(user_id,      │     │ image_url    │
│ avatar_url   │     │        event_id)     │     │ category     │
│ festiverse_id│     └──────────────────────┘     │ prizes       │
│ t_shirt_size │                                   │ results_pub  │
│ razorpay_*   │     ┌──────────────────────┐     └──────────────┘
│ created_at   │     │     results          │
└──────────────┘     ├──────────────────────┤
                     │ id (PK,UUID)         │
┌──────────────┐     │ event_id (FK)        │──────▶ events
│  otp_verif.  │     │ user_id (FK)         │──────▶ users
├──────────────┤     │ participant_name     │
│ id (PK,UUID) │     │ participant_college  │
│ email        │     │ participant_email    │
│ otp_hash     │     │ position             │
│ purpose      │     │ score                │
│ attempts     │     └──────────────────────┘
│ expires_at   │
│ created_at   │     ┌──────────────────────┐
└──────────────┘     │ pending_registrations│
                     ├──────────────────────┤
┌──────────────┐     │ id (PK,UUID)         │
│  visitors    │     │ order_id             │
├──────────────┤     │ user_data (JSON)     │
│ id (PK,UUID) │     │ status               │
│ ip_hash      │     │ created_at           │
│ client_hash  │     └──────────────────────┘
│ user_agent   │
│ created_at   │
└──────────────┘
```

### Additional Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `messages` | Contact form submissions | name, email, message |
| `gallery` | Image gallery | filename, url, title, category |
| `team` | Organizing team members | name, role, bio, social_link, image_url |
| `faculty` | Faculty members | name, role, department, image_url |
| `notices` | Notice board | title, description, color, link_url |
| `sponsors` | Event sponsors | name, logo_url, tier, website, sort_order |
| `hiring_applications` | Job applications | role, name, resume_url, branch, batch |

---

## 8. Middleware Pipeline

### Execution Order (top to bottom)

```
1.  trust proxy          → Sets req.ip from X-Forwarded-For
2.  requestLogger        → Logs HTTP method, path, status, duration
3.  helmet               → Sets 10+ security headers
4.  cors                 → Validates Origin against whitelist
5.  cookieParser         → Parses cookies into req.cookies
6.  express.json         → Parses JSON body (stores rawBody for webhooks)
7.  CSRF Guard (origin)  → Validates Origin/Referer on mutating requests
8.  CSRF Guard (header)  → Requires X-Requested-With header
9.  Global Rate Limit    → 100 requests/minute per IP
10. sanitizeInputs       → Strips HTML/XSS from body, query, params
11. requestId            → Attaches unique ID for log tracing
12. [Route Handler]      → Route-specific middleware + handler
13. notFoundHandler      → Catches unmatched routes → 404
14. errorHandler         → Catches thrown errors → safe JSON response
```

### Route-Level Middleware Stack Example

```javascript
// Event registration route middleware chain:
router.post('/register',
    verifyToken,        // 1. JWT cookie verification
    eventRegLimiter,    // 2. Rate limit (10/min)
    async (req, res) => {
        // 3. UUID validation on each eventId
        // 4. Team member cap (max 10)
        // 5. Batch size cap (max 20 events)
        // 6. DB upsert with conflict resolution
    }
);
```

---

## 9. Environment Configuration

### Required Variables (server won't start without these)

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret for signing JWT tokens | `a-very-long-random-string-64chars` |
| `SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOi...` |
| `ADMIN_PASSWORD` | bcrypt-hashed admin password | `$2b$12$...` |
| `HOST_COLLEGE_NAME` | Host college for internal fee | `Government Engineering College...` |

### Recommended Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RAZORPAY_KEY_ID` | Razorpay API key | — |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | — |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook HMAC secret | — |
| `FRONTEND_URL` | Frontend URL for CORS | — |
| `REGISTRATION_FEE_INTERNAL` | Internal student fee (₹) | `349` |
| `REGISTRATION_FEE_EXTERNAL` | External student fee (₹) | `699` |
| `JWT_EXPIRES_IN` | JWT token lifetime | `24h` |
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |

### Email Variables

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend.com API key (primary) |
| `GMAIL_CLIENT_ID` | Google OAuth client ID (fallback) |
| `GMAIL_CLIENT_SECRET` | Google OAuth client secret |
| `GMAIL_REFRESH_TOKEN` | Google OAuth refresh token |
| `EMAIL_USER` | Gmail sender address |

---

## 10. Deployment Checklist

### Pre-Deploy

- [ ] `NODE_ENV=production` is set
- [ ] `ADMIN_PASSWORD` is a bcrypt hash (starts with `$2b$`)
- [ ] `JWT_SECRET` is 64+ characters of random entropy
- [ ] All `RAZORPAY_*` variables are set
- [ ] `FRONTEND_URL` matches the deployed frontend domain
- [ ] `HOST_COLLEGE_NAME` matches exactly what the frontend sends
- [ ] Supabase RLS policies are enabled on sensitive tables

### Security Verification

- [ ] `helmet` is active → check response headers for `Content-Security-Policy`
- [ ] CORS only allows production domains → test from unauthorized origin
- [ ] Rate limits are functional → send >100 requests in 60s from same IP
- [ ] CSRF blocks requests without `X-Requested-With` header
- [ ] Webhooks verify HMAC signature → send forged webhook payload
- [ ] Admin login rejects plaintext `ADMIN_PASSWORD`
- [ ] OTPs expire after 5 minutes
- [ ] OTPs lock after 5 failed attempts
- [ ] File uploads reject non-image MIME types
- [ ] Proxy route rejects non-Supabase URLs

### Monitoring

- [ ] `logs/error.log` — Critical errors (rotated at 5MB, 5 files)
- [ ] `logs/combined.log` — All log levels (rotated at 5MB, 5 files)
- [ ] No `console.error` in route files (all use structured `logger`)
- [ ] No stack traces in production error responses

---

## Appendix A: Security Audit Changelog

### Fixes Applied (May 2026)

| # | Severity | File | Fix |
|---|----------|------|-----|
| 1 | Critical | `adminRoutes.js` | PostgREST filter injection in result user lookup |
| 2 | Critical | `paymentRoutes.js` | PostgREST filter injection in webhook user check |
| 3 | Critical | `userService.js` | PostgREST filter injection in `findExisting()` |
| 4 | High | `authService.js` | `Math.random()` → `crypto.randomInt()` for OTPs |
| 5 | High | `userService.js` | `Math.random()` → `crypto.randomInt()` for IDs |
| 6 | High | `eventRoutes.js` | `Math.random()` → `crypto.randomInt()` for custom IDs |
| 7 | High | `eventRoutes.js` | Missing UUID validation on event registration |
| 8 | High | `eventRoutes.js` | No rate limit on event registration |
| 9 | High | `certificateRoutes.js` | Missing UUID validation on `event_id` query |
| 10 | High | `certificateRoutes.js` | No rate limit on PDF generation |
| 11 | High | `analyticsRoutes.js` | No rate limit on `/visit` endpoint |
| 12 | High | `adminRoutes.js` | Missing UUID validation on result `event_id` |
| 13 | Medium | `paymentRoutes.js` | bcrypt rounds 10 → 12 (OWASP minimum) |
| 14 | Medium | 7 route files | `console.error` → structured `logger.error` |
| 15 | Medium | `authRoutes.js` | Stack trace leakage in error logs |
| 16 | Medium | `adminRoutes.js` | Uncapped pagination on sponsors/hiring |
| 17 | Low | `authMiddleware.js` | Raw `process.env` → centralized `config` |
| 18 | Low | `adminRoutes.js` | Raw `process.env` → centralized `config` |
| 19 | Low | `authRoutes.js` | Raw `process.env` → centralized `config` |
| 20 | Low | `helmet.js` | Added `Permissions-Policy` header |

---

## Appendix B: File Upload Security

| Parameter | Gallery | Team/Faculty | Avatar | Resume |
|-----------|---------|-------------|--------|--------|
| Max Size | 15 MB | 15 MB | 1 MB | 10 MB |
| Allowed Types | jpeg, jpg, png, webp, gif | jpeg, jpg, png, webp, gif | jpeg, jpg, png, webp, gif | pdf, doc, docx |
| Validation | Extension + MIME | Extension + MIME | Extension + MIME | Extension only |
| Storage | Supabase `assets/gallery/` | Supabase `assets/team/` or `assets/faculty/` | Supabase `assets/avatars/` | Supabase `assets/resumes/` |
| Naming | `{timestamp}-{sanitized_name}` | `{timestamp}-{sanitized_name}` | `{userId}-{timestamp}{ext}` | `{timestamp}_{sanitized_name}` |

---

*This document is auto-generated from the Festiverse backend codebase and reflects the production-hardened state as of May 2026.*
