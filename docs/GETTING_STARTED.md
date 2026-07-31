# NaijaJobber — Getting Started (Phase 1)

## Prerequisites

- Node.js 22+
- Docker Desktop (recommended for MongoDB + Redis + full stack)
- Or local MongoDB 7 + Redis 7 if running without Docker

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- Web: http://localhost:3000
- API: http://localhost:3001/api/v1
- Swagger: http://localhost:3001/api/docs
- Seed admin: `admin@naijajobber.local` / `Admin123!`

## Local development (without Docker services for apps)

1. Start MongoDB and Redis (Docker service-only is fine):

```bash
docker compose up mongo redis
```

2. Backend:

```bash
cd backend
cp ../.env.example .env
# set MONGODB_URI=mongodb://127.0.0.1:27017/naijajobber and REDIS_HOST=127.0.0.1
npm install
npm run start:dev
```

If Redis is down, the API falls back to an in-memory store automatically.

3. Frontend:

```bash
cd frontend
echo NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1 > .env.local
npm install
npm run dev
```

## Auth flow smoke test

Without Docker MongoDB, run the in-memory smoke suite:

```bash
cd backend
npm run smoke:auth
npm run smoke:jobs
```

- `smoke:auth` — register → verify → login → profile → refresh → logout
- `smoke:jobs` — employer company → admin verify → publish job → seeker apply → employer applicants

With a live stack:

1. Register at `/register`
2. Copy verification token from API console logs (`[DEV MAIL]`)
3. POST `/api/v1/auth/verify-email` with `{ "token": "..." }` or use `/verify-email`
4. Login at `/login`
5. Call `/api/v1/users/me` with Bearer access token

> Note: Docker Desktop was not available on the Phase 1 build machine; `docker-compose.yml` is ready for when Docker is installed. Redis falls back to an in-memory store if Redis is down.

## Phase 2–7 surfaces

- Public job board: `/jobs`, `/jobs/[slug]`
- Seeker / employer dashboards, messages, notifications, billing
- AI tools: `/dashboard/ai` (`AI_MODE=mock` without OpenAI keys)
- Admin: `/dashboard/admin` (seed `admin@naijajobber.local` / `Admin123!`)
- Seeker profile/CV: `/dashboard/profile`, public talent `/talent/[id]`
- Settings + job alerts: `/dashboard/settings`
- Seeded demo company `novahire-africa` (VERIFIED) with featured jobs on API boot

### Smoke scripts

```bash
cd backend
npm run smoke:messaging
npm run smoke:billing
npm run smoke:ai
npm run smoke:admin
npm run smoke:profile
```

See also [PRODUCTION.md](./PRODUCTION.md) for secrets, health, and Playwright opt-in.

## Architecture

- NestJS DDD modules: `auth`, `users`, `health`, `employers`, `companies`, `jobs`, `applications`, `notifications`, `messaging`, `billing`, `ai`, `admin`, `profiles`
- BullMQ email + alerts queues (inline mail fallback if Redis down)
- Socket.IO gateway namespace `/messaging`
- Payment adapters: **mock is the supported local path** (`PAYMENT_MODE=mock`). Stripe/Paystack/Flutterwave classes are scaffolds (no live SDK/API yet).
- AI adapters: mock / OpenAI-compatible (`AI_MODE=mock` locally)
- Google OAuth: live with keys, or mock callback `GET /auth/google/callback?email=...`
- CV generate writes a real HTML file under `/uploads` (not a fake PDF URL)
- Put Nest env in **`backend/.env`** (not only the repo root). Use `FRONTEND_URL=http://localhost:3000` and `MONGODB_URI=mongodb://127.0.0.1:27017/naijajobber` for local Node.