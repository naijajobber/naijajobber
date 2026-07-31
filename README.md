# NaijaJobber

AI-powered Remote Employment Platform for African talent and global employers.

## Phase 1 (local)

See [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md).

```bash
# Docker (recommended)
cp .env.example .env
docker compose up --build

# Or run apps locally with Mongo/Redis
cd backend && npm run start:dev
cd frontend && npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:3001/api/v1
- Swagger: http://localhost:3001/api/docs
