# Festiverse'26 — Development Guide

> **Last updated:** 3 March 2026  
> **Stack:** React (Vite) · Express.js · Supabase (PostgreSQL + Storage) · Vercel

---

## 1. Repository Layout

```
Festiverse26/
├─ fesstiverse/              # React frontend (Vite)
│  └─ src/
│     ├─ App.jsx             # Root — routing + dual-view toggle
│     ├─ main.jsx            # Vite entry point
│     ├─ App.css / index.css # Global styles
│     ├─ lib/
│     │  ├─ api.js           # Central fetch helper (auto-attaches JWT)
│     │  └─ proxyImage.js    # Rewrites Supabase URLs through backend proxy
│     └─ components/
│        ├─ Navbar.jsx            # Sticky nav – switches links per view
│        ├─ HeroSection.jsx       # UDAAN hero section
│        ├─ Societies.jsx         # Society cards (UDAAN)
│        ├─ GalleryCarousel.jsx   # Image carousel (UDAAN)
│        ├─ TeamMembers.jsx       # Org-team display (UDAAN)
│        ├─ NoticeBoard.jsx       # Live notice board (UDAAN)
│        ├─ FestHero.jsx          # FESTIVERSE hero section
│        ├─ SponsorMarquee.jsx    # Scrolling sponsor logos
│        ├─ RegistrationForm.jsx  # OTP-based user registration form
│        ├─ FestGallery.jsx       # Photo gallery grid (FESTIVERSE)
│        ├─ FestFooter.jsx        # Footer with links
│        ├─ LoginModal.jsx        # Phone-number login modal
│        ├─ EventsDashboard.jsx   # Event listing (unused/standalone)
│        ├─ UserDashboard.jsx     # Logged-in user dashboard (profile, events, team)
│        └─ AdminPanel.jsx        # Full admin panel (CRUD for all entities)
│
├─ festiverse-backend/       # Express API
│  ├─ server.js              # Entry — middleware, route mounts, health check
│  ├─ vercel.json            # Vercel serverless config
│  ├─ package.json
│  ├─ .env                   # SUPABASE_URL, SUPABASE_KEY, JWT_SECRET, ADMIN_*
│  ├─ supabase_schema.sql    # Base schema (6 tables)
│  ├─ add_notices_table.sql  # Migration: notices table + team columns
│  ├─ add_team_support.sql   # Migration: team_size, team_members JSONB
│  ├─ seed_events.js         # Seed script for events table
│  ├─ migrate_teams.js       # One-off team data migration
│  ├─ test_connection.js     # Supabase connectivity test
│  └─ src/
│     ├─ config/
│     │  ├─ supabaseClient.js
│     │  └─ emailClient.js    # Nodemailer Gmail transporter + OTP/confirmation emails
│     ├─ middlewares/
│     │  ├─ authMiddleware.js  # verifyToken + verifyAdmin
│     │  └─ rateLimit.js       # In-memory rate limiting middleware
│     └─ routes/
│        ├─ authRoutes.js       # send-otp, register, login, profile CRUD
│        ├─ eventRoutes.js      # list events, register for events, my-events
│        ├─ contactRoutes.js    # POST contact form messages
│        ├─ galleryRoutes.js    # GET gallery images
│        ├─ teamRoutes.js       # GET team members
│        ├─ noticeRoutes.js     # GET active notices
│        ├─ adminRoutes.js      # Admin CRUD (registrations, users, gallery, team, events, notices)
│        └─ proxyRoutes.js      # Image proxy to bypass DNS hijacking
```

---

## 2. Architecture Overview

### Dual-View System
The app has two visual "universes" toggled by a pill switch in the navbar:

| View | Purpose | Components |
|------|---------|------------|
| **UDAAN** | College cultural society hub | `HeroSection`, `Societies`, `GalleryCarousel`, `TeamMembers`, `NoticeBoard` |
| **FESTIVERSE** | Annual fest event portal | `FestHero`, `SponsorMarquee`, `RegistrationForm`, `FestGallery`, `FestFooter` |

### Frontend Routing (React Router)
| Route | Component | Auth |
|-------|-----------|------|
| `/` | `HomePage` (dual-view) | Public |
| `/dashboard` | `UserDashboard` | Requires login |
| `/admin` | `AdminPanel` | Admin credentials |

### Backend API Endpoints
| Prefix | Module | Key Operations |
|--------|--------|----------------|
| `/api/auth` | `authRoutes` | `send-otp`, `register`, `login`, `GET/PUT profile` |
| `/api/events` | `eventRoutes` | `GET /` (list), `POST /register`, `GET /my-events` |
| `/api/contact` | `contactRoutes` | `POST /` (submit message) |
| `/api/gallery` | `galleryRoutes` | `GET /` (list images) |
| `/api/team` | `teamRoutes` | `GET /` (list members) |
| `/api/notices` | `noticeRoutes` | `GET /` (active notices) |
| `/api/admin` | `adminRoutes` | Full CRUD (gallery, team, events, users, messages, notices) |
| `/api/proxy` | `proxyRoutes` | Image proxy for Supabase Storage |

### Database (Supabase PostgreSQL)
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | Registered users | `name`, `college`, `email`, `phone` (unique), `role` |
| `events` | Fest events | `name`, `location`, `date`, `description`, `team_size` |
| `event_registrations` | User ↔ Event (M:N) | `user_id`, `event_id`, `team_members` (JSONB) |
| `messages` | Contact form submissions | `name`, `email`, `message` |
| `gallery` | Uploaded images | `url`, `title`, `category`, `filename` |
| `team` | Organizing committee | `name`, `role`, `bio`, `society`, `category`, `image_url` |
| `notices` | Digital notice board | `title`, `description`, `color`, `is_active` |

### Authentication Flow
1. User enters email → backend sends real 4-digit OTP via Gmail (Nodemailer)
2. User enters OTP → backend validates (in-memory store, 5-min expiry)
3. On registration: user created in Supabase, confirmation email sent
4. JWT issued (24h expiry), stored in `localStorage`
5. `apiFetch()` auto-attaches `Authorization: Bearer <token>` to all requests
6. Login is two-step: phone → OTP to registered email → verify
7. Admin login uses hardcoded `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `.env`
8. Rate limiting: 3 OTP requests/min, 5 login attempts/min

### File Uploads
- **Multer** (memory storage) handles multipart uploads on `POST /api/admin/gallery` and `POST /api/admin/team`
- Files are uploaded to **Supabase Storage** bucket `assets` (public)
- A proxy route (`/api/proxy`) re-serves images to bypass DNS hijacking issues on certain ISPs

---

## 3. What's Already Done ✅

### Frontend
- [x] Dual-view toggle (UDAAN ↔ FESTIVERSE) with animated pill switch
- [x] Responsive navbar with hamburger menu for mobile
- [x] UDAAN sections: Hero, Societies, Gallery Carousel, Team Members, Notice Board
- [x] FESTIVERSE sections: Hero, Sponsor Marquee, Registration Form, Gallery, Footer
- [x] OTP-based registration flow with auto-login
- [x] Two-step OTP login modal (phone → email OTP → verify)
- [x] Toast notification system (replaces browser alerts)
- [x] User Dashboard (profile editing, event browsing & registration, team building, registered events view)
- [x] Admin Panel — full CRUD for: registrations, messages, users, gallery, team members, events, notices
- [x] Admin login with JWT + session management
- [x] Image proxy for DNS-hijacked Supabase URLs
- [x] Mobile-responsive layouts across all components

### Backend
- [x] Express server with CORS, JSON body parsing
- [x] Supabase client integration
- [x] Auth routes (real Email OTP via Nodemailer, register, two-step login, profile)
- [x] Event routes (list, register with team support, my-events)
- [x] Contact, Gallery, Team, Notices read routes
- [x] Admin CRUD routes with `verifyToken` + `verifyAdmin` middleware
- [x] File upload to Supabase Storage via Multer
- [x] Image proxy route to work around DNS issues
- [x] Vercel deployment configuration
- [x] Database schema + migration scripts
- [x] Rate limiting on OTP (3/min) and login (5/min) endpoints
- [x] Input validation (email, phone, OTP format) on auth routes
- [x] Registration confirmation email (fire-and-forget)

---

## 4. What's Left / To-Do 🚧

### High Priority
- [x] **Real Email OTP** — replaced mock OTP with Nodemailer + Gmail (DNS-safe)
- [x] **Removed `otp_hint`** — OTP is no longer leaked in API responses
- [ ] **Payment gateway integration** — if registration requires a fee, integrate Razorpay / Stripe
- [ ] **Protected admin route** — add route guard or hide the UI entry point

### Security & Production Readiness
- [x] **Rate limiting** — OTP (3/min), login (5/min) via in-memory rate limiter
- [x] **Input validation** — email, phone (10-digit), OTP (4-digit) format checks on auth
- [x] **Email notifications** — confirmation email on registration
- [ ] **HTTPS & secure cookies** — JWT is stored in `localStorage` (XSS-vulnerable); consider `httpOnly` cookies
- [ ] **Environment variable validation** — no startup checks for required env vars
- [ ] **Remove hardcoded DNS workaround** — the undici agent forcing Supabase to `104.18.38.10` is a temporary ISP fix
- [x] **CORS configuration** — allowlist for localhost + production origin, with `credentials: true`
- [x] **Environment variable validation** — startup warnings for missing `SUPABASE_*`, `JWT_SECRET`, email credentials
- [ ] **Error logging** — add a proper logging library (Winston / Pino) instead of `console.error`

### Features
- [ ] **Event details page** — individual event pages with full descriptions, rules, schedule
- [ ] **Event calendar view** — visual calendar showing events by date (some scaffolding exists in `EventsDashboard.jsx`)
- [ ] **Search & filter** — search events, gallery, team members
- [ ] **User profile avatars** — user avatar upload functionality
- [ ] **Social sharing** — share event / registration links on social media
- [ ] **Push notifications / live updates** — for notice board and event announcements
- [ ] **QR code-based check-in** — generate QR for registered users, scan at event entry
- [ ] **Leaderboard / results** — competition results and winner announcements
- [ ] **Sponsor section** — `SponsorMarquee.jsx` exists but needs real data and management via admin
- [ ] **About page** — dedicated page for UDAAN club and college info

### UI/UX Improvements
- [ ] **Loading skeletons** — show skeleton UI while data loads (partially done in admin panel)
- [x] **Toast notifications** — `useToast` hook + `Toast.jsx` component replaces all `alert()` calls
- [ ] **Dark/Light mode toggle** — currently hardcoded dark theme
- [x] **Animations** — scroll-triggered `ScrollReveal` component (IntersectionObserver) wrapping all sections
- [x] **Sponsor marquee** — fixed broken Tailwind classes, now uses proper CSS keyframe marquee animation
- [ ] **Accessibility (a11y)** — add proper ARIA labels, keyboard navigation, focus management
- [ ] **PWA support** — service worker, manifest, offline capability

### DevOps & Infra
- [ ] **CI/CD pipeline** — automated testing and deployment (GitHub Actions)
- [ ] **Database migrations tool** — currently using raw SQL files; adopt a migration framework
- [ ] **Automated tests** — no unit or integration tests exist
- [ ] **Staging environment** — separate staging deployment for testing before production
- [ ] **Monitoring & alerting** — uptime monitoring, error tracking (Sentry), analytics

---

## 5. Quick Start

```bash
# Backend
cd festiverse-backend
cp .env.example .env          # Fill in Supabase URL, Key, JWT secret, Admin creds
npm install
npm run dev                    # Starts on http://localhost:3000

# Frontend
cd fesstiverse
npm install
npm run dev                    # Starts on http://localhost:5173
```

Set `VITE_API_URL=http://localhost:3000` in `fesstiverse/.env` for local development.

---

## 6. Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 18+, Vite, React Router v6 |
| Styling | CSS-in-JS (embedded in components), Google Fonts (Syne, Outfit) |
| Backend | Node.js, Express 4, Multer |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage (bucket: `assets`) |
| Auth | JWT (jsonwebtoken), Email OTP (Nodemailer + Gmail) |
| Deployment | Vercel (backend), TBD (frontend) |
