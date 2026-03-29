# Developer Instructions

This document provides all the essential commands needed to maintain and develop within this Nx monorepo.

## Prerequisites
- **Node.js**: v20 or higher (Managed via `nvm`)
- **Yarn**: v4+ (Managed via Corepack, bundled with Node.js)
- **Environment**: Ensure you are using the correct Node version. Run `nvm use 20` if necessary.

## Setup
To install all dependencies for the workspace:
```bash
yarn install
```

## Running Applications Locally
We recommend using **`npx nx`** to run commands, as it reliably finds the local dependencies in your `node_modules` and bypasses system Yarn incompatibilities (e.g. `No such file or directory: 'serve:backend'`).

**1. Environment Variables:**
The backend requires a `MONGODB_URI` to connect to MongoDB Atlas. Ensure `apps/backend/mushaf_backend/.env` exists. Start backend via node explicitly loading the env:
```bash
npx nx serve mushaf_backend
```
*(Backend runs on http://localhost:3000)*

**2. Start the React Frontend:**
```bash
npx nx serve mushaf_frontend
```
*(Frontend runs on http://localhost:4200)*

**Start Multiple Apps Simultaneously:**
```bash
npx nx run-many -t serve -p mushaf_frontend mushaf_backend
```

## Building Applications
To compile the applications for production:

**Build everything:**
```bash
npx nx run-many -t build
```
*(Compiled output will be generated in `dist/apps/<app-name>`)*

## Linting and Formatting
Check code style and catch issues early:
```bash
# Lint all projects
npx nx run-many -t lint

# Automatically format all files (Prettier)
npx nx format:write
```

## Generating New Components / Libraries
Nx generators help scaffold boilerplate so you don't have to manually wire up TS configs or build tools.

**Add a new frontend app (e.g., admin panel):**
```bash
npx nx g @nx/react:app admin_frontend --directory=apps/frontend/admin_frontend --projectNameAndRootFormat=as-provided
```

**Add a new backend service:**
```bash
npx nx g @nx/node:app reporting_backend --directory=apps/backend/reporting_backend --projectNameAndRootFormat=as-provided --framework=fastify
```

**Create a shared library:**
```bash
npx nx g @nx/js:library shared-types --directory=libs/shared-types
```

**Create a React component:**
```bash
npx nx g @nx/react:component my-component --project=mushaf_frontend
```

## Troubleshooting
If you encounter `No such file or directory: nx`, ensure:
1. You have run `yarn install`.
2. You are using `npx nx` which uses the local binary in `node_modules/.bin/nx`.
3. Your Node version is v20+ (`node -v`).
