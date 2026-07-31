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

## Deploy (Render + Vercel)

### Backend — Render
- Blueprint: [`render.yaml`](render.yaml) (Root Directory `backend`)
- Or create a Web Service manually with:
  - Build: `npm ci --include=dev && npm run build`
  - Start: `npm run start:prod`
  - Health: `/api/v1/health`
- Set `MONGODB_URI`, `FRONTEND_URL` (Vercel URL), `API_PUBLIC_URL` (Render URL), JWT secrets, seed admin.
- Note: `NODE_ENV=production` skips npm `devDependencies`; the build command uses `--include=dev`, and `@nestjs/cli` + `typescript` are also in `dependencies` so `nest build` works on Render.

### Frontend — Vercel
- Project **Root Directory** must be `frontend`
- Config: [`frontend/vercel.json`](frontend/vercel.json) (Next.js App Router — deep links work without SPA `index.html` rewrites)
- Env: `NEXT_PUBLIC_API_URL=https://YOUR-API.onrender.com/api/v1`
- Redeploy after changing `NEXT_PUBLIC_*` (build-time vars)

Then set Render `FRONTEND_URL` to the Vercel URL and redeploy the API (CORS).