# Turbo StockOps

[![CodeFactor](https://www.codefactor.io/repository/github/it11-support/turbo-stockops/badge)](https://www.codefactor.io/repository/github/it11-support/turbo-stockops)

Turbo StockOps is a monorepo for stock and warehouse operations, consisting of a backend API and a frontend dashboard. This project is designed to help operational teams manage orders, items, pick lists, customers, areas, and user authorization in an integrated way.

## Key Features

- Order and stock item management
- Pick list processing for item retrieval
- Rack and barcode item support
- Customer, area, and user management
- Authentication and role-based access control
- Responsive UI dashboard for daily operations

## Tech Stack

- Monorepo: Turbo + pnpm
- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Express, TypeScript
- Database: MySQL + Prisma
- Other tools: JWT, cron jobs, CORS, and shared types package

## Repository Structure

- apps/api: backend API and business logic
- apps/web: frontend dashboard
- packages/types-library: shared type definitions across applications

## Prerequisites

- Node.js 18+
- pnpm
- MySQL

## Development Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create an environment file for the API in apps/api, for example:

   ```env
   PORT=4000
   TZ=Asia/Jakarta
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_NAME=stockops
   DATABASE_USER=root
   DATABASE_PASSWORD=your_password
   JWT_SECRET=change_me
   JWT_EXPIRES_IN=7d
   MSSQL_API=localhost:8000/api
   ```

3. Generate the Prisma client:

   ```bash
   pnpm db:generate
   ```

4. Run database migrations if needed:

   ```bash
   pnpm --filter stockops-api exec prisma migrate dev
   ```

5. Start the application:

   ```bash
   pnpm dev
   ```

## Useful Commands

- Build all applications:

  ```bash
  pnpm build
  ```

- Run lint:

  ```bash
  pnpm lint
  ```

## Notes

- The API runs on port 4000 by default.
- The frontend can be accessed through the Vite dev server in development mode.
- To run specific parts of the application, use the appropriate pnpm workspace filters.
