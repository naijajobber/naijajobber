# Production hardening checklist (Phases 5–7)

## Secrets

- Rotate `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` for every environment
- Configure payment keys only when wiring **real** SDKs. Until then keep `PAYMENT_MODE=mock` — Stripe/Paystack/Flutterwave providers are scaffolds.
- Set `AI_MODE=live` only with `OPENAI_API_KEY` (optional `OPENAI_BASE_URL` / `OPENAI_MODEL`)
- Configure `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` for production Google OAuth
- Set `CLOUDINARY_*` for production uploads (local `uploads/` is fine for staging)
- Nest.js loads **`backend/.env`**. Align `FRONTEND_URL` with the real web origin (usually `http://localhost:3000` locally).

## Rate limits & auth

- Global throttling via `THROTTLE_TTL` / `THROTTLE_LIMIT`
- AI routes use tighter Nest throttling plus Redis hourly/daily counters (`AI_HOURLY_LIMIT`, `AI_DAILY_LIMIT`)
- Helmet + CORS remain enabled in `main.ts`; keep `FRONTEND_URL` accurate

## Health

- `GET /api/v1/health` checks MongoDB and Redis (Redis memory fallback still reports PONG)

## Docker / Render

- Prefer `docker compose up --build` for Mongo + Redis + apps
- For PaaS: point `MONGODB_URI` and Redis env vars at managed services; set `API_PUBLIC_URL` and `FRONTEND_URL` to public HTTPS origins
- Seed admin via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (change immediately after first login)

## Smoke / CI

```bash
cd backend
npm test -- --forceExit
npm run smoke:ai
npm run smoke:admin
npm run smoke:profile
```

Frontend Playwright (opt-in, servers must be up):

```bash
cd frontend
npx playwright install chromium
E2E_BASE_URL=http://localhost:3000 npm run test:e2e
```
