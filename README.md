# NestJS Starter

A full-stack starter template with a NestJS API, Fastify, Prisma, PostgreSQL, JWT authentication, mail flows, Swagger docs, and a Vite React client.

## Stack

- NestJS 11 with Fastify
- TypeScript ESM
- Prisma with PostgreSQL
- JWT access and refresh token authentication
- Role-based guards and decorators
- Email verification and password reset mail templates
- Swagger/OpenAPI docs
- React 19 + Vite client
- Tailwind CSS 4 and Radix UI components
- Jest, ESLint, and Prettier

## Features

- Auth: signup, login, logout, refresh token, email verification, forgot password, reset password
- Users module with profile and user management foundation
- Global validation pipe, exception filter, logging interceptor, and response transform interceptor
- Health endpoint at `/health`
- API prefix at `/api/v1`
- Swagger UI at `/api/docs`
- Prisma client generated into `src/generated/prisma/client`
- Development server proxies the Vite client through the Nest app

## Requirements

- Node.js 20+
- npm
- PostgreSQL

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nestjs_starter

JWT_SECRET=change-me-access-secret
JWT_REFRESH_SECRET=change-me-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=user@example.com
MAIL_PASS=password
MAIL_FROM=noreply@example.com

CORS_ORIGINS=http://localhost:5000,http://localhost:5173
VITE_API_BASE_URL=/api/v1
VITE_GOOGLE_CLIENT_ID=
VITE_JWT_SECRET=change-me-client-secret
```

Generate the Prisma client:

```bash
npm run prisma:generate
```

Run database migrations:

```bash
npm run prisma:migrate
```

Optional seed:

```bash
npm run prisma:seed
```

## Development

Run the API and client together:

```bash
npm run start:dev
```

The Nest development server starts on `PORT`, the Vite client starts on `CLIENT_URL`, and non-API browser requests are proxied through the Nest app in development.

- App: `http://localhost:5000`
- API: `http://localhost:5000/api/v1`
- Swagger: `http://localhost:5000/api/docs`
- Health: `http://localhost:5000/health`

You can also run them separately:

```bash
npm run dev:server
npm run dev:client
```

## Build

Build server and client:

```bash
npm run build
```

Build only the Nest API:

```bash
npm run build:server
```

Build only the Vite client:

```bash
npm run build:client
```

Production output is written to `dist`. The client build is emitted to `dist/public`.

## Production

After building, start the compiled server:

```bash
npm run start:prod
```

Set production environment variables before starting the app. At minimum, configure:

- `NODE_ENV=production`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `MAIL_HOST`
- `MAIL_USER`
- `MAIL_PASS`
- `CORS_ORIGINS`

## Scripts

```bash
npm run start:dev          # Run API watch mode and Vite client together
npm run dev:client         # Vite client only
npm run build              # Build API and client
npm run start:prod         # Run compiled production server
npm run lint               # Lint and auto-fix TypeScript files
npm run format             # Format source and test files
npm run test               # Unit tests
npm run test:e2e           # End-to-end tests
npm run test:cov           # Coverage report
npm run test:type-check    # TypeScript no-emit check
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run dev migration
npm run prisma:migrate:prod # Deploy migrations in production
npm run prisma:seed        # Seed database
npm run prisma:studio      # Open Prisma Studio
```

## Project Structure

```text
src/
  config/          App, auth, database, Swagger, and env config
  core/            Guards, decorators, filters, interceptors, pipes
  generated/       Generated Prisma client
  infra/           Database, logger, cache, and mail infrastructure
  modules/         Feature modules: auth, users, health
  shared/          Shared constants, types, and utilities

client/
  src/app/         Pages and layouts
  src/components/  UI, auth, dashboard, and layout components
  src/hooks/       React hooks
  src/lib/         Client helpers and providers
  src/services/    API and auth services
  src/store/       Zustand stores

prisma/
  schema.prisma    Database schema
  seed.ts          Seed script
```

## Notes

- `tsconfig.build.tsbuildinfo` may appear after builds because TypeScript incremental compilation is enabled. It is a local build cache and can be ignored.
- Do not commit real secrets. Keep local values in `.env`.
- The generated Prisma client is placed under `src/generated/prisma/client`; regenerate it after schema changes.
