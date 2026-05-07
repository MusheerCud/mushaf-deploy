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

**3. Authentication Setup:**
The application uses JWT-based authentication. Ensure `JWT_SECRET` is set in the backend `.env` file.
- The **first user** to register via the frontend automatically becomes an `admin` with full permissions (`view`, `upload`, `delete`, `manage_users`).
- Subsequent users are assigned the `user` role with read-only permissions (`view`).

## Design Principles
- **Aesthetics First:** We use a custom, robust CSS implementation over extensive utility libraries where possible to guarantee pixel-perfect responsive alignments.
- **Light Theme Enforced:** Because `pg.docx` uploads naturally include literal `#000000` black hex colors for specific word-parts, the UI must strictly remain a Light Theme with white/neutral glassmorphism panels to preserve readability.

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

## Environment Variables

### Backend (`mushaf_backend`)
- `MONGODB_URI`: Connection string for MongoDB (Atlas).
- `JWT_SECRET`: Secret key used for signing JSON Web Tokens. Required for authentication to work.
- `PORT`: (Optional) Defaults to 3000.

### Frontend (`mushaf_frontend`)
- `VITE_API_URL`: The full URL of the backend (e.g., `https://mushaf-api.onrender.com`).
- `ENABLE_COREPACK`: Set to `1` in CI (Vercel) to enable Yarn v4.

## Deployment

### Deploying to Vercel
Custom settings required in the Vercel dashboard:
- **Build Command**: `npx nx build mushaf_frontend --outputPath=./out`
- **Output Directory**: `out`
- **Install Command**: `corepack yarn install --no-immutable`

### Deploying to Render
- **Build Command**: `yarn install && npx nx build mushaf_backend`
- **Start Command**: `node dist/apps/backend/mushaf_backend/main.js`

## Troubleshooting
If you encounter `No Output Directory found` on Vercel:
1. Ensure `vercel.json` is at the root.
2. Verify the `--outputPath=./out` flag is in the Build Command.
3. Check that `VITE_API_URL` doesn't have a trailing slash.
