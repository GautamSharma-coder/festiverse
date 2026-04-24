# Festiverse'26 — Development Guide

> **Last updated:** 23 April 2026  
> **Stack:** React 18 (Vite) · Express 4 · Supabase (PostgreSQL + Storage) · Render · Vercel  
> **API Version:** v1 (`/api/v1/`)

---

## 1. Repository Layout

```
Festiverse26/
├── fesstiverse/                     # React frontend (Vite)
│   ├── index.html                   # Entry HTML (structured data, font preloads)
│   ├── public/
│   │   ├── sitemap.xml              # SEO sitemap
│   │   └── robots.txt               # Crawler directives
│   ├── vercel.json                  # Vercel SPA routing config
│   └── src/
│       ├── App.jsx                  # Root — routing + lazy loading + dual-view toggle
│       ├── main.jsx                 # Vite entry point
│       ├── App.css / index.css      # Global styles
│       ├── lib/
│       │   ├── api.js               # Central fetch helper (auto-attaches JWT cookie)
│       │   └── proxyImage.js        # Rewrites Supabase URLs through backend proxy
│       └── components/
│           ├── Navbar.jsx           # Sticky nav – switches links per view
│           ├── HeroSection.jsx      # UDAAN hero section
│           ├── Societies.jsx        # Society cards (UDAAN)
│           ├── GalleryCarousel.jsx  # Image carousel (UDAAN)
│           ├── TeamMembers.jsx      # Org-team display (UDAAN)
│           ├── NoticeBoard.jsx      # Live notice board (UDAAN)
│           ├── FestHero.jsx         # FESTIVERSE hero section
│           ├── SponsorMarquee.jsx   # Scrolling sponsor logos
│           ├── RegistrationForm.jsx # OTP + Razorpay registration form
│           ├── FestGallery.jsx      # Photo gallery grid (FESTIVERSE)
│           ├── FestFooter.jsx       # Footer with links
│           ├── LoginModal.jsx       # Phone-number login modal
│           ├── UserDashboard.jsx    # Logged-in user dashboard
│           ├── AdminPanel.jsx       # Full admin panel (CRUD)
│           ├── EventsPage.jsx       # Event listing
│           ├── EventDetails.jsx     # Individual event page
│           ├── RegistrationPage.jsx # Campus + Inter-College registration
│           ├── Leaderboard.jsx      # Competition results & rankings
│           ├── CertificatesPage.jsx # Certificate download portal
│           ├── GalleryPage.jsx      # Full photo gallery
│           ├── SchedulePage.jsx     # Event schedule
│           ├── ContactPage.jsx      # Contact form
│           ├── SponsorsPage.jsx     # Sponsors showcase
│           ├── AboutPage.jsx        # About UDAAN & GEC
│           ├── HiringForm.jsx       # Team recruitment form
│           ├── FAQSection.jsx       # Frequently asked questions
│           ├── PreviousTeamsPage.jsx # Past organizing teams
│           ├── NotFoundPage.jsx     # 404 page
│           ├── ScrollReveal.jsx     # IntersectionObserver animation wrapper
│           ├── Toast.jsx            # Toast notification system
│           └── PWAInstallPrompt.jsx # PWA install prompt
│
├── festiverse-backend/              # Express API (Node.js)
│   ├── server.js                    # Entry — DNS fix, env validation, app startup
│   ├── vercel.json                  # Vercel serverless config
│   ├── package.json
│   ├── .env / .env.example          # Environment variables
│   ├── database.json                # db-migrate configuration
│   ├── supabase_schema.sql          # Base schema
│   ├── migrations/                  # SQL migration files
│   ├── seed_events.js               # Seed script for events
│   └── src/
│       ├── app.js                   # Express app factory (middleware chain)
│       ├── config/
│       │   ├── env.js               # Centralized environment config & validation
│       │   ├── cors.js              # CORS configuration
│       │   ├── helmet.js            # Security headers (CSP, HSTS, etc.)
│       │   ├── supabaseClient.js    # Supabase client singleton
│       │   ├── emailClient.js       # Resend (primary) + Gmail (fallback) email
│       │   └── logger.js            # Winston structured logger
│       ├── controllers/             # Thin request/response handlers
│       │   ├── authController.js    # Auth endpoints
│       │   └── paymentController.js # Payment endpoints
│       ├── services/                # Business logic (reusable)
│       │   ├── userService.js       # User CRUD, Festiverse ID generation
│       │   ├── authService.js       # OTP, registration, login, JWT
│       │   └── paymentService.js    # Razorpay orders, webhook processing
│       ├── validators/              # express-validator schemas
│       │   ├── authValidator.js     # Auth request validation
│       │   └── paymentValidator.js  # Payment request validation
│       ├── middlewares/
│       │   ├── errorHandler.js      # Global error handler + 404 handler
│       │   ├── requestLogger.js     # HTTP request/response logging
│       │   ├── requestId.js         # X-Request-ID middleware
│       │   ├── validate.js          # express-validator result middleware
│       │   ├── authMiddleware.js    # verifyToken + verifyAdmin (JWT)
│       │   ├── rateLimit.js         # In-memory rate limiting
│       │   └── sanitize.js          # XSS input sanitization
│       ├── routes/
│       │   ├── index.js             # Top-level route registrar
│       │   ├── v1/                  # API v1 routes
│       │   │   ├── index.js         # v1 route registrar
│       │   │   ├── authRoutes.js    # Auth (refactored: controller + validator)
│       │   │   └── paymentRoutes.js # Payment (refactored)
│       │   ├── eventRoutes.js       # Events (legacy, mounted under v1)
│       │   ├── adminRoutes.js       # Admin CRUD (legacy)
│       │   ├── contactRoutes.js     # Contact form
│       │   ├── galleryRoutes.js     # Gallery images
│       │   ├── teamRoutes.js        # Team members
│       │   ├── facultyRoutes.js     # Faculty listing
│       │   ├── noticeRoutes.js      # Notice board
│       │   ├── proxyRoutes.js       # Image proxy
│       │   ├── resultRoutes.js      # Competition results
│       │   ├── sponsorRoutes.js     # Sponsors
│       │   ├── hiringRoutes.js      # Hiring/recruitment
│       │   ├── certificateRoutes.js # Certificate generation
│       │   └── analyticsRoutes.js   # Visitor analytics
│       └── utils/
│           ├── AppError.js          # Custom error class (operational errors)
│           ├── asyncHandler.js      # Async route wrapper (eliminates try/catch)
│           └── pdfGenerator.js      # Certificate PDF generation
│
├── CONTRIBUTING.md                  # Contribution guidelines
└── development.md                   # This file
```

---

## 2. Architecture Overview

### Backend Architecture (Layered)

The backend follows a production-grade **Controller → Service → Utils** pattern:

```
Request → Route → Validator → Controller → Service → Database
                                              ↓
                                          AppError (thrown)
                                              ↓
                                      Global Error Handler → Response
```

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Routes** | URL mapping, middleware chain, rate limiters | `src/routes/v1/` |
| **Validators** | Declarative request validation (express-validator) | `src/validators/` |
| **Controllers** | Parse request → call service → send response | `src/controllers/` |
| **Services** | Business logic, DB queries, external API calls | `src/services/` |
| **Utils** | Shared utilities (AppError, asyncHandler) | `src/utils/` |
| **Middlewares** | Auth, rate limiting, sanitization, error handling | `src/middlewares/` |
| **Config** | Environment, CORS, Helmet, DB client, email | `src/config/` |

### API Versioning

All API routes are versioned under `/api/v1/`:

```
/api/v1/auth/login        # New versioned endpoint
/api/auth/login            # Backward-compatible (maps to v1)
```

Both paths work. The backward-compatible route ensures the frontend continues working during migration.

### Dual-View System (Frontend)

The app has two visual "universes" toggled by a pill switch in the navbar:

| View | Purpose | Components |
|------|---------|------------|
| **UDAAN** | College cultural society hub | `HeroSection`, `Societies`, `GalleryCarousel`, `TeamMembers`, `NoticeBoard` |
| **FESTIVERSE** | Annual fest event portal | `FestHero`, `SponsorMarquee`, `RegistrationForm`, `FestGallery`, `FestFooter` |

### Frontend Performance

- **Route-level code splitting** via `React.lazy()` + `Suspense` — 15 lazy-loaded chunks
- **Razorpay SDK lazy loading** — only loaded when user initiates payment
- **Iconify async** — non-render-blocking icon loading
- **Font preloading** — critical Inter font preloaded, Google Fonts non-blocking

### Frontend Routing (React Router v6)

| Route | Component | Auth | Loading |
|-------|-----------|------|---------|
| `/` | `HomePage` (dual-view) | Public | Eager |
| `/dashboard` | `UserDashboard` | Requires login | Lazy |
| `/admin` | `AdminPanel` | Admin credentials | Lazy |
| `/events` | `EventsPage` | Public | Lazy |
| `/events/:id` | `EventDetails` | Public | Lazy |
| `/register` | `RegistrationPage` | Public | Lazy |
| `/leaderboard` | `Leaderboard` | Public | Lazy |
| `/gallery` | `GalleryPage` | Public | Lazy |
| `/certificates` | `CertificatesPage` | Public | Lazy |
| `/schedule` | `SchedulePage` | Public | Lazy |
| `/about` | `AboutPage` | Public | Lazy |
| `/contact` | `ContactPage` | Public | Lazy |
| `/sponsors` | `SponsorsPage` | Public | Lazy |
| `/hiring` | `HiringForm` | Public | Lazy |
| `/previous-teams` | `PreviousTeamsPage` | Public | Lazy |
| `*` | `NotFoundPage` | Public | Lazy |

### Backend API Endpoints (`/api/v1/`)

| Prefix | Module | Key Operations |
|--------|--------|----------------|
| `/auth` | Auth | `send-otp`, `register`, `login`, `forgot-password-otp`, `reset-password`, `GET/PUT profile`, `logout` |
| `/events` | Events | `GET /` (list), `POST /register`, `GET /my-events`, `GET /qr/:id`, `GET /:id`, `GET /lookup-member/:fid` |
| `/payment` | Payment | `POST /create-order`, `POST /webhook` |
| `/admin` | Admin | Full CRUD (registrations, users, gallery, team, events, notices, results, sponsors) |
| `/gallery` | Gallery | `GET /` (list images) |
| `/contact` | Contact | `POST /` (submit message) |
| `/team` | Team | `GET /` (list members) |
| `/faculty` | Faculty | `GET /` (list faculty) |
| `/notices` | Notices | `GET /` (active notices) |
| `/results` | Results | `GET /` (competition results) |
| `/sponsors` | Sponsors | `GET /` (sponsor listing) |
| `/hiring` | Hiring | `POST /` (recruitment application) |
| `/certificates` | Certificates | `GET /download/:id` (PDF generation) |
| `/analytics` | Analytics | `GET /stats`, `POST /heartbeat` (live user tracking) |
| `/proxy` | Proxy | Image proxy for Supabase Storage |

### Database (Supabase PostgreSQL)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | Registered users | `name`, `email`, `phone` (unique), `password_hash`, `festiverse_id`, `role`, `has_paid`, `avatar_url` |
| `events` | Fest events | `name`, `location`, `date`, `description`, `team_size`, `category`, `image_url`, `rules`, `prizes` |
| `event_registrations` | User ↔ Event (M:N) | `user_id`, `event_id`, `team_members` (JSONB), `custom_id` |
| `pending_registrations` | Pre-payment user data | `order_id`, `user_data` (JSONB), `status` |
| `messages` | Contact form submissions | `name`, `email`, `message` |
| `gallery` | Uploaded images | `url`, `title`, `category`, `filename` |
| `team` | Organizing committee | `name`, `role`, `bio`, `society`, `category`, `image_url` |
| `faculty` | Faculty members | `name`, `designation`, `department`, `image_url` |
| `notices` | Digital notice board | `title`, `description`, `color`, `is_active`, `link_url`, `link_text` |
| `results` | Competition results | `event_id`, `participant_name`, `participant_email`, `position`, `user_id` |
| `sponsors` | Sponsors | `name`, `logo_url`, `tier`, `website` |
| `hiring_applications` | Team recruitment | `name`, `email`, `phone`, `role`, `portfolio_url` |
| `analytics` | Visitor tracking | `visitor_hash`, `page`, `user_agent` |

### Authentication Flow

1. User enters email → backend sends **6-digit OTP** via Resend (primary) or Gmail (fallback)
2. User enters OTP → backend validates (timing-safe comparison, 5-min expiry)
3. User completes **Razorpay payment** (₹349 campus / ₹699 inter-college)
4. Payment signature verified → user created in Supabase with unique Festiverse ID (e.g., `F26GS4821`)
5. JWT issued (24h expiry), stored as **httpOnly cookie** (`festiverse_token`)
6. `apiFetch()` auto-sends cookies (`credentials: 'include'`) with all requests
7. Login: phone + password → bcrypt comparison → JWT cookie
8. Admin login: hardcoded `ADMIN_PASSWORD` from `.env` → bcrypt hashed
9. **Rate limiting:** OTP (3/min), login (5/min), registration (3/min), payment (5/min), global (100/min)

### Security

- **Helmet** with CSP, HSTS, referrer policy, X-Content-Type-Options
- **XSS sanitization** middleware on all user inputs
- **Timing-safe comparison** for OTP and payment signatures
- **bcrypt** password hashing (salt rounds: 10-12)
- **UUID validation** on sensitive endpoints
- **Request ID** tracking for debugging (`X-Request-ID` header)
- **CORS allowlist** with credentials support

### Email System (Dual-Tier)

| Service | Role | Sender |
|---------|------|--------|
| **Resend** | Primary | `no-reply@udaangecsamastipur.in` |
| **Gmail REST API** | Fallback (auto) | `gautamksharma45@gmail.com` |

### File Uploads

- **Multer** (memory storage) handles multipart uploads
- Files uploaded to **Supabase Storage** bucket `assets` (public)
- Avatar uploads: 5MB limit, image types only (jpeg, jpg, png, webp, gif)
- Proxy route (`/api/v1/proxy`) re-serves images to bypass DNS hijacking

---

## 3. What's Done ✅

### Frontend
- [x] Dual-view toggle (UDAAN ↔ FESTIVERSE) with animated pill switch
- [x] Responsive navbar with hamburger menu for mobile
- [x] 16+ page components with route-level code splitting
- [x] OTP + Razorpay payment registration flow
- [x] Campus + Inter-College registration sections
- [x] Two-step login modal (phone + password)
- [x] User Dashboard (profile, events, team building, QR codes)
- [x] Admin Panel — full CRUD for all entities
- [x] Event details pages with rules, schedule, prizes
- [x] Leaderboard with rankings and winner badges
- [x] Certificate download portal with PDF generation
- [x] Event schedule page
- [x] Gallery page with masonry grid
- [x] Contact, About, Sponsors, FAQ pages
- [x] Team hiring/recruitment form
- [x] Previous teams archive
- [x] Toast notification system
- [x] ScrollReveal animations
- [x] PWA install prompt
- [x] SEO: sitemap.xml, robots.txt, structured data (JSON-LD)
- [x] Font preloading + non-blocking Google Fonts
- [x] Lazy-loaded Razorpay SDK (on-demand)
- [x] Async Iconify loading

### Backend
- [x] Layered architecture (Controller → Service → Utils)
- [x] API versioning (`/api/v1/` with backward compat)
- [x] App factory pattern (`src/app.js`)
- [x] Centralized environment config (`src/config/env.js`)
- [x] Global error handler with `AppError` class
- [x] `asyncHandler` wrapper (eliminates try/catch boilerplate)
- [x] Declarative request validation (express-validator)
- [x] Dual-tier email (Resend primary + Gmail fallback)
- [x] Razorpay payment with webhook processing
- [x] JWT auth with httpOnly cookies
- [x] bcrypt password hashing
- [x] 6-digit OTP with timing-safe comparison
- [x] Rate limiting (OTP, login, registration, payment, global)
- [x] XSS sanitization middleware
- [x] Helmet security headers (CSP, HSTS, CORP)
- [x] Request ID tracking
- [x] Winston structured logging
- [x] Live user analytics (heartbeat + visitor tracking)
- [x] Certificate PDF generation
- [x] Image proxy for DNS hijacking workaround
- [x] Database migrations (db-migrate)

---

## 4. To-Do 🚧

### Features
- [ ] **Event calendar view** — visual calendar showing events by date
- [ ] **Search & filter** — search events, gallery, team members
- [ ] **Social sharing** — share event / registration links
- [ ] **Push notifications** — for notice board and event announcements
- [ ] **Dark/Light mode toggle** — currently hardcoded dark theme

### DevOps & Infra
- [ ] **CI/CD pipeline** — GitHub Actions for automated testing and deployment
- [ ] **Automated tests** — unit tests for services, integration tests for API
- [ ] **Staging environment** — separate staging deployment
- [ ] **Monitoring** — uptime monitoring, error tracking (Sentry)
- [ ] **Redis** — replace in-memory OTP/rate-limit stores for multi-instance support

### Refactoring
- [ ] **Migrate remaining routes** — events, admin, gallery, etc. to Controller → Service pattern
- [ ] **Frontend API base URL** — migrate from `/api/` to `/api/v1/` in `lib/api.js`
- [ ] **Accessibility (a11y)** — ARIA labels, keyboard navigation, focus management

---

## 5. Quick Start

```bash
# Backend
cd festiverse-backend
cp .env.example .env          # Fill in all required env vars (see below)
npm install
npm run dev                    # Starts on http://localhost:3000

# Frontend
cd fesstiverse
npm install
npm run dev                    # Starts on http://localhost:5173
```

### Environment Variables

#### Backend (`.env`)

```env
# Required
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
ADMIN_PASSWORD=your_admin_password

# Payment
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Email (Resend — Primary)
RESEND_API_KEY=your_resend_key

# Email (Gmail — Fallback)
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
EMAIL_USER=your_email

# Config
FRONTEND_URL=http://localhost:5173
REGISTRATION_FEE_INTERNAL=349
REGISTRATION_FEE_EXTERNAL=699
```

#### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 6. Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 18+, Vite 5, React Router v6, React.lazy + Suspense |
| Styling | CSS-in-JS (embedded in components), Google Fonts (Inter, Syne, Outfit) |
| Backend | Node.js 18+, Express 4, Multer, express-validator |
| Architecture | Controller → Service → Utils (layered), API v1 versioning |
| Database | Supabase (PostgreSQL), db-migrate |
| Storage | Supabase Storage (bucket: `assets`) |
| Auth | JWT (httpOnly cookies), bcrypt, 6-digit OTP (timing-safe) |
| Payment | Razorpay (order + webhook + signature verification) |
| Email | Resend (primary), Gmail REST API (fallback) |
| Security | Helmet (CSP/HSTS), XSS sanitization, rate limiting, CORS |
| Logging | Winston (structured, file rotation) |
| Deployment | Vercel (frontend), Render (backend) |
| SEO | sitemap.xml, robots.txt, JSON-LD structured data |

---

## 7. Useful Commands

```bash
# Backend
npm run dev                    # Start with --watch (auto-restart)
npm start                      # Production start
npm run migrate:latest         # Run pending migrations
npm run migrate:down           # Rollback last migration
npm run migrate:create <name>  # Create new migration

# Frontend
npm run dev                    # Vite dev server
npm run build                  # Production build
npm run preview                # Preview production build
```
