# Next-Gamifikasi

Gamification learning platform built with Next.js, Prisma, MySQL, and Ollama.

Both **development** and **production** Docker stacks use the same base services (MySQL, Ollama, migrations on app start). Use the dev overlay for hot reload while coding.

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2
- Git

Optional (local dev without Docker): Node.js 20+, MySQL 8, and Ollama running locally.

---

## Environment setup

```bash
git clone <repository-url>
cd Next-Gamifikasi
cp .env.example .env
```

Edit `.env` and set at least:

| Variable                          | Example                                                  | Notes                                                      |
| --------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| `MYSQL_ROOT_PASSWORD`             | `changeme_root`                                          | MySQL root password                                        |
| `MYSQL_PASSWORD`                  | `changeme_user`                                          | App DB user password                                       |
| `DATABASE_URL`                    | `mysql://gamifikasi:changeme_user@mysql:3306/gamifikasi` | Host must be `mysql` inside Docker                         |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | random string                                            | Generate with `openssl rand -base64 32`                    |
| `AUTH_URL` / `NEXTAUTH_URL`       | `http://localhost:5174`                                  | Must match how you open the app                            |
| `AUTH_GOOGLE_ID`                  | `*.apps.googleusercontent.com`                           | Google Cloud OAuth client ID (optional)                    |
| `AUTH_GOOGLE_SECRET`              | client secret                                            | Google Cloud OAuth client secret (optional)                |
| `AUTH_TRUST_HOST`                 | `true`                                                   | Set on VPS/production behind public IP or domain           |
| `OLLAMA_MODEL`                    | `qwen2.5:3b`                                             | First start downloads the model (can take several minutes) |

### Google sign-in (optional)

1. Create an OAuth client in [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Add **Authorized redirect URI**: `{AUTH_URL}/api/auth/callback/google` (e.g. `http://localhost:5174/api/auth/callback/google` or your production URL).
3. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in `.env`.
4. First Google login creates a **student** account automatically.

---

## Quick start (Docker dev)

### 1. Start the dev stack

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Or:

```bash
npm run docker:dev
```

This starts:

| Service       | Container               | Purpose                            |
| ------------- | ----------------------- | ---------------------------------- |
| MySQL 8       | `gamifikasi-mysql`      | Database                           |
| Ollama        | `gamifikasi-ollama`     | Local LLM for AI chat and feedback |
| Next.js (dev) | `gamifikasi-nextjs-dev` | App with HMR on port **5174**      |

On every start, the dev app runs `prisma migrate deploy`, `prisma generate`, then `next dev`.

### 2. Seed demo data (first time only)

See [Database migrate & seed (Docker)](#database-migrate--seed-docker) below.

### 3. Open the app

- **App:** http://localhost:5174
- **Landing page:** visible when **not** logged in (use incognito or sign out)

---

## Quick start (Docker production)

Use this for a **production-like build** on your laptop or server: optimized Next.js standalone image, no hot reload. Same port (**5174**), same `.env`, same MySQL/Ollama volumes as dev.

### Production vs dev

|               | Dev                                                                            | Production                            |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------- |
| Command       | `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build` | `docker compose up --build -d`        |
| App container | `gamifikasi-nextjs-dev`                                                        | `gamifikasi-nextjs`                   |
| Code changes  | Instant (HMR)                                                                  | Requires **`--build`**                |
| Best for      | Daily coding                                                                   | Testing “as users see it”, pre-deploy |

### Step 1 — Environment (first time only)

```bash
cd Next-Gamifikasi
cp .env.example .env
```

Edit `.env` (see [Environment setup](#environment-setup)). For local production test, keep:

```env
AUTH_URL=http://localhost:5174
NEXTAUTH_URL=http://localhost:5174
DATABASE_URL=mysql://gamifikasi:YOUR_PASSWORD@mysql:3306/gamifikasi
OLLAMA_BASE_URL=http://ollama:11434
```

Generate secrets:

```bash
openssl rand -base64 32   # use for AUTH_SECRET and NEXTAUTH_SECRET
```

### Step 2 — Stop dev stack (if running)

Dev and production both use port **5174**. Stop dev first:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

Do **not** add `-v` unless you want to wipe the database.

### Step 3 — Start production

```bash
docker compose up --build -d
```

Shortcut:

```bash
npm run docker:prod
```

**First start** can take **5–15 minutes** (Next.js build + optional Ollama model download). Later starts are faster.

Containers started:

| Service        | Container           | Port     |
| -------------- | ------------------- | -------- |
| MySQL 8        | `gamifikasi-mysql`  | internal |
| Ollama         | `gamifikasi-ollama` | internal |
| Next.js (prod) | `gamifikasi-nextjs` | **5174** |

On every start, `gamifikasi-nextjs` runs:

`prisma migrate deploy` → `prisma generate` → `node server.js`

### Step 4 — Check status

```bash
docker compose ps
```

All services should be **Up**; `mysql` and `ollama` should be **healthy**. Then open:

- **App:** http://localhost:5174
- **Login:** http://localhost:5174/login

View logs if the app does not come up:

```bash
docker compose logs -f nextjs
```

### Step 5 — Seed demo data (first time or fresh DB only)

Skip this if you already seeded while using dev (volumes are shared).

```bash
docker compose --profile seed run --rm db-seed
```

Or:

```bash
npm run docker:seed
```

### Step 6 — Sign in

| Role    | Email                    | Password     |
| ------- | ------------------------ | ------------ |
| Admin   | `admin@gamifikasi.com`   | `admin123`   |
| Student | `student@gamifikasi.com` | `student123` |

### After pulling new code

**Restart alone is not enough** — rebuild the image:

```bash
docker compose up --build -d
```

### Stop production

```bash
docker compose down
# or
npm run docker:prod:down
```

### Switch back to dev

```bash
docker compose down
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

### Production cheat sheet

```bash
# Start
docker compose up --build -d

# Status
docker compose ps

# Logs
docker compose logs -f nextjs

# Rebuild after code changes
docker compose up --build -d

# Seed (fresh DB)
docker compose --profile seed run --rm db-seed

# Stop
docker compose down
```

---

## Demo accounts

After seeding, sign in at http://localhost:5174/login with:

| Role    | Email                    | Password     |
| ------- | ------------------------ | ------------ |
| Admin   | `admin@gamifikasi.com`   | `admin123`   |
| Student | `student@gamifikasi.com` | `student123` |

```
Admin: admin@gamifikasi.com / admin123
Student: student@gamifikasi.com / student123
```

---

## Database migrate & seed (Docker)

Migrations run **automatically** when the app container starts (dev and production).  
**Seeding is manual** — run once after the first setup or after wiping volumes.

### When to run what

| Task                    | Auto on app start? | When to run manually                                    |
| ----------------------- | ------------------ | ------------------------------------------------------- |
| `prisma migrate deploy` | Yes (dev + prod)   | After pulling new migrations, restart the app container |
| `prisma db seed`        | No                 | First setup, or after `docker compose down -v`          |

### Dev — migrate & seed

**Migrate** (usually automatic; restart dev app if needed):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml restart nextjs-dev
```

**Seed** (first time or fresh DB):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec nextjs-dev npx prisma db seed
```

Or use the shared seed service (works with dev or prod stack):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile seed run --rm db-seed
```

### Production — migrate & seed

**Migrate** (usually automatic; restart after pulling new migrations):

```bash
docker compose restart nextjs
```

Or migrate only (MySQL must be running):

```bash
docker compose --profile seed run --rm db-seed sh -c "npx prisma migrate deploy"
```

Or:

```bash
npm run docker:migrate
```

**Seed** (first time or fresh DB):

```bash
docker compose --profile seed run --rm db-seed
```

Or:

```bash
npm run docker:seed
```

The `db-seed` service runs **`migrate deploy` + `db seed`** in one step — safe to use on a fresh database.

### Backup & restore (Docker MySQL)

MySQL runs in container `gamifikasi-mysql`. Stack must be **running** (`docker compose ps`).

**Requirements:** `.env` with `MYSQL_ROOT_PASSWORD` and `MYSQL_DATABASE` (default `gamifikasi`).

#### Backup (export to `.sql` file)

```bash
# Default: backups/gamifikasi-YYYYMMDD-HHMMSS.sql
npm run docker:backup

# Or with custom path
bash scripts/docker-db-backup.sh backups/my-backup.sql
```

Manual command (same result):

```bash
mkdir -p backups
source .env
docker compose exec -T mysql mysqldump \
  -u root -p"${MYSQL_ROOT_PASSWORD}" \
  --single-transaction --routines --triggers --add-drop-table \
  "${MYSQL_DATABASE}" > backups/gamifikasi-$(date +%Y%m%d-%H%M%S).sql
```

#### Import (restore from `.sql` file)

**Warning:** This **overwrites** tables that exist in the dump. Back up first if unsure.

```bash
npm run docker:import -- backups/my-backup.sql

# Or
bash scripts/docker-db-import.sh backups/my-backup.sql
```

Manual command:

```bash
source .env
docker compose exec -T mysql mysql \
  -u root -p"${MYSQL_ROOT_PASSWORD}" \
  "${MYSQL_DATABASE}" < backups/my-backup.sql
```

#### Copy database: laptop → VPS (Hostinger KVM)

**On laptop** (export):

```bash
npm run docker:backup
# file: backups/gamifikasi-YYYYMMDD-HHMMSS.sql
```

**Upload to server:**

```bash
scp backups/gamifikasi-20250609-120000.sql root@YOUR_VPS_IP:/opt/Next-Gamifikasi/backups/
```

**On VPS** (import — stack must be running):

```bash
cd /opt/Next-Gamifikasi
bash scripts/docker-db-import.sh backups/gamifikasi-20250609-120000.sql
```

**Or backup directly on VPS over SSH** (no local file):

```bash
ssh root@YOUR_VPS_IP 'cd /opt/Next-Gamifikasi && bash scripts/docker-db-backup.sh' > gamifikasi-vps.sql
```

#### Notes

| Topic          | Detail                                                                                  |
| -------------- | --------------------------------------------------------------------------------------- |
| Dev vs prod    | Same MySQL volume on one machine — one backup covers both                               |
| Fresh empty DB | Use [seed](#database-migrate--seed-docker) instead of import if you only need demo data |
| After import   | Restart app if needed: `docker compose restart nextjs`                                  |
| Git            | SQL dumps are in `.gitignore` — do not commit backups                                   |
| Security       | Never expose MySQL port 3306 to the public internet                                     |

### Fresh database (reset volumes)

```bash
# Dev
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile seed run --rm db-seed

# Production
docker compose down -v
docker compose up --build -d
docker compose --profile seed run --rm db-seed
```

---

## Daily commands

### Dev

```bash
# Start (foreground, with logs)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Start detached (background)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Stop
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# Stop and remove volumes (fresh DB — run seed again afterward)
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v

# Rebuild after git pull or dependency changes
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

npm shortcuts:

```bash
npm run docker:dev        # up --build nextjs-dev
npm run docker:dev:down   # down dev stack
npm run docker:seed       # migrate + seed via db-seed service
```

### Production

```bash
# Start detached
docker compose up --build -d

# Stop
docker compose down

# Rebuild after git pull (required for UI/code changes)
docker compose up --build -d

# Seed demo data
npm run docker:seed
```

---

## Important: dev vs production Docker

| Command                                                             | Result                                          |
| ------------------------------------------------------------------- | ----------------------------------------------- |
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` | **Dev** — bind-mounted source, hot reload       |
| `docker compose up --build -d`                                      | **Production** — baked standalone image, no HMR |

Both stacks share **MySQL**, **Ollama**, and the **`db-seed`** service.  
Do **not** use `docker compose up` without `--build` after pulling UI changes. A plain `docker compose restart` does not rebuild the production image.

---

## Local dev without Docker (optional)

If MySQL and Ollama already run on your machine:

1. Copy `.env.example` to `.env` and point `DATABASE_URL` to your local MySQL (e.g. `localhost:3306`).
2. Set `OLLAMA_BASE_URL=http://localhost:11434`.
3. Install and migrate:

```bash
npm ci
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

App runs at http://localhost:5174.

Demo accounts (after seed):

```
Admin: admin@gamifikasi.com / admin123
Student: student@gamifikasi.com / student123
```

---

## Troubleshooting

### Port 5174 already in use (production)

Another container (usually **dev**) is still running:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
docker compose up --build -d
```

### Production build fails

Production runs `npm run build` inside Docker. Fix TypeScript/build errors locally, then:

```bash
docker compose up --build -d
```

### UI looks old after git pull (production)

Rebuild — `docker compose restart` does **not** update the baked image:

```bash
docker compose up --build -d
```

### UI looks old (minimal admin menu, no landing page)

You are likely running the **production** container or a stale build.

```bash
docker compose down
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

### Landing page not visible

- `/` shows the marketing landing page only for **guests**.
- Logged-in users are redirected to `/dashboard` or `/admin/dashboard`.

### Landing page returns 500

MySQL may be down. Check containers:

```bash
docker ps --filter name=gamifikasi
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Migration failed on fresh database

If `20250623000000_external_api_security` fails with “Duplicate column name 'scopes'”, mark it applied (columns already exist from an earlier migration):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml run --rm --no-deps nextjs-dev \
  npx prisma migrate resolve --applied 20250623000000_external_api_security
```

Then run `migrate deploy` and seed again.

### Ollama model download is slow

The first `docker compose up` waits for `ollama-pull` to download `OLLAMA_MODEL`. Later starts reuse the cached model volume.

### AI chat or External API returns "network error"

Common causes on production:

1. **Cold start** — After idle time, Ollama unloads the model from RAM. The first request can take 1–3 minutes to reload. Traefik or the browser may cut the connection before the model is ready.
   - Set `OLLAMA_KEEP_ALIVE=-1` in `.env` (default in `docker-compose.yml`) so the model stays loaded.
   - Rebuild: `docker compose up --build -d`
2. **Ollama out of memory** — The `ollama` container is limited to 6 GB. Heavy chat after several turns can exhaust RAM. Check: `docker logs gamifikasi-ollama --tail 50`
3. **External API daily quota** — If you use `/api/v1/chat` with a token, check **Admin → API Tokens → Daily quota**. A quota of `5` blocks the 6th request (HTTP 429, not always shown as JSON in some clients).
4. **Rate limit** — External API allows 60 requests per 10 minutes per token (unlikely at 5 questions unless shared token).

Verify Ollama from the server:

```bash
docker exec gamifikasi-nextjs wget -qO- http://ollama:11434/api/tags
docker logs gamifikasi-ollama --tail 30
docker stats gamifikasi-ollama gamifikasi-nextjs --no-stream
```

### Stale Next.js cache in dev

The dev compose file uses an anonymous volume for `/app/.next`. If the UI behaves oddly after large changes:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec nextjs-dev npx prisma db seed
```

---

## Project structure (dev-relevant)

```
src/app/              Next.js App Router pages
src/components/       UI components (landing, admin, student)
src/actions/          Server actions
src/lib/              Shared utilities, labels, Ollama client
prisma/               Schema, migrations, seed
docker-compose.yml    Base stack (MySQL, Ollama, production Next.js)
docker-compose.dev.yml Dev overlay (nextjs-dev with HMR)
```

---

## License

Private project — see repository owner for usage terms.
