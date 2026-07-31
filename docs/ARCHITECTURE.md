# NaijaJobber Architecture (Phase 1)

## Style

- Domain-Driven Design with NestJS feature modules
- Clean Architecture layering: controllers → services → repositories → MongoDB
- SOLID + dependency injection via Nest providers
- Repository pattern for persistence (`UsersRepository`)

## Backend layout

```
backend/src/
  config/                 # Env + Joi validation
  common/                 # Guards, filters, interceptors, decorators, RBAC
  infrastructure/         # Mongo, Redis, Mail, Winston, BullMQ scaffold
  modules/
    auth/                 # JWT + refresh + email verify + password reset
    users/                # Profile + roles
    health/               # Liveness for Compose / ops
```

## API conventions

- Prefix: `/api/v1`
- Docs: `/api/docs`
- Envelope: `{ success, data, meta, message }`
- Auth: Bearer JWT access token; refresh via `/auth/refresh`

## Frontend

- Next.js 15 App Router marketing site + auth pages
- Dark-first emerald theme from brand logo
- Axios client → Nest API; Zustand session store; TanStack Query provider ready

## Scaling notes (later phases)

- Horizontal API replicas behind load balancer
- Redis for sessions, rate limits, BullMQ workers
- Mongo indexes on email, jobs search fields, compound filters
- CDN for frontend assets + Cloudinary for uploads
