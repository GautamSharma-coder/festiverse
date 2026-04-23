# Contributing to Festiverse'26

Thank you for your interest in contributing to **Festiverse'26** — the official platform for the annual cultural fest of Government Engineering College, Samastipur! 🎉

Please read through this guide before submitting a pull request or opening an issue.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Code Style & Standards](#code-style--standards)
- [Backend Architecture](#backend-architecture)
- [Environment Setup](#environment-setup)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

By participating in this project, you agree to maintain a **respectful, inclusive, and collaborative** environment. Harassment, discrimination, or personal attacks will not be tolerated.

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Git | 2.30+ |

### Clone the Repository

```bash
git clone https://github.com/GautamSharma-coder/festiverse.git
cd festiverse
```

### Install Dependencies

```bash
# Frontend
cd fesstiverse
npm install

# Backend
cd ../festiverse-backend
npm install
```

### Run Locally

```bash
# Terminal 1 — Backend
cd festiverse-backend
npm run dev        # Starts on http://localhost:3000

# Terminal 2 — Frontend
cd fesstiverse
npm run dev        # Starts on http://localhost:5173
```

---

## Project Structure

```
Festiverse26/
├── fesstiverse/                 # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx              # Root — routing + dual-view toggle
│   │   ├── components/          # UI components
│   │   └── lib/                 # API helpers, utilities
│   ├── public/                  # Static assets (sitemap, robots.txt)
│   └── index.html               # Entry HTML
│
├── festiverse-backend/          # Express API (Node.js)
│   ├── server.js                # Entry point
│   ├── src/
│   │   ├── app.js               # Express app factory
│   │   ├── config/              # Environment, CORS, Helmet, DB client
│   │   ├── controllers/         # Request/response handlers
│   │   ├── services/            # Business logic (reusable)
│   │   ├── validators/          # Request validation schemas
│   │   ├── middlewares/         # Auth, rate limiting, sanitization
│   │   ├── routes/
│   │   │   ├── index.js         # Route registrar
│   │   │   └── v1/              # Versioned API routes
│   │   └── utils/               # AppError, asyncHandler, PDF generator
│   └── migrations/              # SQL migration files
│
└── development.md               # In-depth development guide
```

---

## Development Workflow

1. **Check existing issues** — Look for open issues before starting new work.
2. **Create a branch** — Branch off from `main` using the naming convention below.
3. **Make changes** — Write clean, well-documented code following our standards.
4. **Test locally** — Verify both frontend and backend work together.
5. **Submit a PR** — Open a pull request with a clear description.

---

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. **Never push directly.** |
| `dev` | Integration branch for testing before merging to main. |
| `feature/<name>` | New features (e.g., `feature/certificate-download`) |
| `fix/<name>` | Bug fixes (e.g., `fix/otp-validation`) |
| `refactor/<name>` | Code refactoring (e.g., `refactor/auth-service`) |
| `docs/<name>` | Documentation updates |

### Example

```bash
git checkout -b feature/sponsor-page
# ... make changes ...
git push origin feature/sponsor-page
```

---

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>

[optional body]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `refactor` | Code restructuring (no feature change) |
| `style` | Formatting, missing semicolons, etc. |
| `docs` | Documentation only |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build process, dependency updates |

### Examples

```
feat(auth): add forgot-password OTP flow
fix(payment): handle duplicate webhook events
refactor(backend): extract auth logic into service layer
docs: update CONTRIBUTING.md with branching strategy
perf(frontend): lazy-load route components with React.lazy
```

---

## Pull Request Guidelines

1. **One PR per feature/fix** — Don't bundle unrelated changes.
2. **Descriptive title** — Use the same format as commit messages.
3. **Include context** — Explain _what_ you changed and _why_.
4. **Screenshots** — For any UI changes, include before/after screenshots.
5. **Test evidence** — Describe how you tested the changes.
6. **Link issues** — Reference related issues (e.g., `Closes #42`).

### PR Template

```markdown
## What does this PR do?
Brief description of the change.

## How was it tested?
- [ ] Tested locally (frontend + backend)
- [ ] Tested on mobile viewport
- [ ] Tested edge cases

## Screenshots (if applicable)
Before: ...
After: ...
```

---

## Code Style & Standards

### General

- Use **ES6+** syntax (arrow functions, destructuring, template literals).
- Prefer `const` over `let`. Never use `var`.
- Use meaningful, descriptive variable and function names.
- Keep functions focused — one function, one responsibility.
- Add JSDoc comments for service functions and complex logic.

### Frontend (React)

- Components use **PascalCase** filenames (e.g., `HeroSection.jsx`).
- Use **functional components** with hooks. No class components.
- Keep component files under **300 lines**. Extract sub-components if needed.
- Use `apiFetch()` from `lib/api.js` for all API calls — never raw `fetch`.
- CSS uses embedded styles or `index.css`. No CSS-in-JS libraries.

### Backend (Express)

- Follow the **Controller → Service → Utils** layered architecture.
- Route files should be **thin** — only route definitions, validators, and middleware.
- Business logic belongs in **services** (`src/services/`).
- Use `asyncHandler()` wrapper — no manual try/catch in routes.
- Use `AppError` for operational errors — never `res.status().json()` directly in services.
- Validate requests using **express-validator** schemas in `src/validators/`.

### API Conventions

- All API routes are versioned under `/api/v1/`.
- Response format: `{ success: boolean, message: string, data?: any }`.
- Error format: `{ success: false, message: string, requestId?: string }`.
- Use proper HTTP status codes (200, 201, 400, 401, 403, 404, 409, 429, 500).

---

## Backend Architecture

```
Request → Route → Validator → Controller → Service → Database
                                              ↓
                                          AppError (thrown)
                                              ↓
                                      Global Error Handler → Response
```

### Adding a New Feature (Example: Announcements)

1. **Create service**: `src/services/announcementService.js`
2. **Create validator**: `src/validators/announcementValidator.js`
3. **Create controller**: `src/controllers/announcementController.js`
4. **Create route**: `src/routes/v1/announcementRoutes.js`
5. **Register route** in `src/routes/v1/index.js`:
   ```js
   router.use('/announcements', require('./announcementRoutes'));
   ```
6. **Create migration** (if new table needed):
   ```bash
   npm run migrate:create add-announcements-table
   ```

---

## Environment Setup

### Backend `.env`

```env
# Required
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
ADMIN_PASSWORD=your_admin_password

# Payment (Razorpay)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Email (Gmail)
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
EMAIL_USER=your_email

# Email (Resend — Primary)
RESEND_API_KEY=your_resend_key

# Frontend
FRONTEND_URL=http://localhost:5173

# Fees
REGISTRATION_FEE_INTERNAL=349
REGISTRATION_FEE_EXTERNAL=699
```

> ⚠️ **Never commit `.env` files.** Copy `.env.example` and fill in your values.

### Frontend `.env`

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## Reporting Issues

When reporting a bug, please include:

1. **Description** — What happened vs. what you expected.
2. **Steps to reproduce** — Numbered list of actions.
3. **Environment** — Browser, OS, device type.
4. **Screenshots / Console logs** — If applicable.
5. **Severity** — Is it a crash, data loss, cosmetic issue, etc.?

### Issue Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `feature` | New feature request |
| `enhancement` | Improvement to existing feature |
| `docs` | Documentation improvement |
| `good-first-issue` | Great for first-time contributors |
| `priority-high` | Needs immediate attention |

---

## Questions?

If you have any questions about contributing, feel free to:

- Open a [Discussion](https://github.com/GautamSharma-coder/festiverse/discussions) on GitHub.
- Reach out to the maintainer: **Gautam Sharma** ([@GautamSharma-coder](https://github.com/GautamSharma-coder)).

---

**Happy Contributing! 🚀**
