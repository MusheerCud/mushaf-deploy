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
