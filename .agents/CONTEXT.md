# Monorepo Context

## Overview
This repository is structured as a monorepo managed by **Nx** with **Yarn v4** as the package manager, aiming to keep the codebase modular, maintainable, and highly scalable. 

## Architectural Pillars
1. **Frontend** (`apps/frontend/`): Contains one or more React applications built with Vite and TypeScript.
2. **Backend** (`apps/backend/`): Contains one or more Node.js API services powered by Fastify and TypeScript.
3. **Mobile** (`Android/`): An independent native Android application living in the monorepo.

## Folder Structure
```text
.
├── apps/
│   ├── frontend/
│   │   └── mushaf_frontend/   # Main React + Vite application
│   └── backend/
│       └── mushaf_backend/    # Main Node.js + Fastify API
├── Android/                   # Native Android codebase (independent)
├── libs/                      # Shared internal libraries (types, utilities, UI components)
├── .agents/                   # AI agent context and instructions
├── nx.json                    # Nx workspace configuration (packageManager: yarn)
└── README.md                  # Root entry point
```

## Why This Structure?
Nesting apps under domain folders (e.g., `apps/frontend/`, `apps/backend/`) allows you to add further apps cleanly:
- `apps/frontend/admin_panel/` for a future admin dashboard
- `apps/backend/reporting_service/` for a new microservice

This avoids a flat, hard-to-navigate `apps/` directory as the monorepo scales.

## Package Manager
This monorepo uses **Yarn v4** (Berry). Do NOT use `npm install`, always use `yarn install`.

## Shared Code (`libs/`)
Whenever there is duplicate logic between apps (shared DTOs, utility functions, React component library), extract it into a library under `libs/`. Nx makes it trivial to import these libraries directly as if they were npm packages.

## Current Project Status (Mushaf App)
The Mushaf Application currently consists of a full-stack pipeline designed to parse `.docx` tables and render them flawlessly on the web.

### 1. Database Schema (MongoDB)
A nested Mongoose schema is used to isolate word-level hex colors exactly as defined in the Word document:
- **Page** (`pageNumber`, `lines`)
- **Line/Verse** (`lineNumber`, `verseNumber`, `arabicText`, `arabicSegments`, `tamilSegments`, `tagSegments`)
- **Segment** (`order`, `runs`)
- **Run** (`text`, `color` - *e.g. `#77206D`, `#BF4E14`*)

### 2. Backend API (`mushaf_backend`)
Fastify runs on port 3000. Uses a raw XML parser (`unzipper` + `xml2js`) with `preserveChildrenOrder` to safely navigate Word document XML (`w:p`, `w:tbl`).
- `POST /pages/:pageNumber` (multipart data upload, parses docx, extracts up to 3 rows of segments, upserts MongoDB)
- `GET /pages/:pageNumber` (fetches a single fully parsed page json)
- `DELETE /pages/:pageNumber` (removes a parsed page from MongoDB)

### 3. Frontend (`mushaf_frontend`)
A React + Vite application running on port 4200. Features an elegant glassmorphic **Light Theme** UI optimized for both Desktop and Mobile.
- **Responsive Sidebar** (`App.tsx`): Features a stateful toggle (Hamburger menu) for mobile devices.
- **Space Optimization**: Utilizes up to `1400px` of screen width with tight grid spacing to minimize whitespace.
- **ViewPage**: 
  - Dynamic **Search** bar and inline **Delete** action.
  - Renders **Arabic**, **Tamil**, and **Tag** (Red text) segments in a stacked grid.
  - Multi-row segment support (3rd row is treated as optional Tags).

### 4. Authentication System
JWT-based auth using `@fastify/jwt` + `bcryptjs`.

**User Model** (`user.model.ts`):
- `email` (unique, used as username)
- `name`, `mobileNumber`
- `password` (bcrypt-hashed, never returned in API)
- `role`: `'admin' | 'user'`
- `permissions`: `['view', 'upload', 'delete', 'manage_users']` (role-defaulted)
- First registered user auto-becomes admin

**Auth API Routes**:
- `POST /auth/register` — Public. Creates account, returns JWT
- `POST /auth/login` — Public. Verifies credentials, returns JWT
- `GET /auth/me` — Protected. Returns current user profile

**Protected Routes**:
- `POST /pages/:n` — requires `authenticate` + `upload` permission
- `DELETE /pages/:n` — requires `authenticate` + `delete` permission
- `GET /pages/:n` — public (no auth needed to browse)

**Frontend Auth**:
- `AuthContext.tsx` — React context with JWT stored in `localStorage`
- `LoginPage.tsx` — Email + Password glassmorphic login form
- `SignupPage.tsx` — Name, Email, Mobile, Password + Confirm signup form
- `app.tsx` — Shows Login/Signup until authenticated, then shows sidebar+content
- Sidebar footer shows avatar, name, role, and Sign Out button
- Upload menu item only visible to users with `upload` permission

**Environment Variables** (backend `.env`):
- `JWT_SECRET` — Secret key for signing JWTs

