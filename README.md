# Mushaf Monorepo

Welcome to the central repository for **Mushaf**. This repository contains the mobile, frontend, and backend codebases engineered as a unified monorepo.

We utilize **Nx** as our monorepo orchestrator to drastically improve build times, ensure consistent tooling, and allow code sharing across different parts of the stack.

## Getting Started
> [!IMPORTANT]
> This project requires **Node.js v20+**. If you have `nvm` installed, run `nvm use` in the root directory.

To get acquainted with this repository, please review the newly organized documentation in the `.agents` directory:


- **[.agents/CONTEXT.md](./.agents/CONTEXT.md)**: Details the architectural boundaries, tech stack (React + Fastify + Android), and folder structure.
- **[.agents/INSTRUCTIONS.md](./.agents/INSTRUCTIONS.md)**: Contains all the essential commands (`npm install`, `npx nx serve`, etc.) required to boot up the environment and maintain the project.

## Tech Stack
- **Frontend**: React, Vite, TypeScript
- **Backend**: Node.js, Fastify, TypeScript
- **Mobile**: Android (Independent Native)
- **Monorepo Build System**: Nx
