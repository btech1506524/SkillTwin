# SkillTwin AI

SkillTwin is a career-readiness dashboard for engineering students. It includes a React/Vite client and an Express API backed by MySQL. The dashboard tracks skills, target roles and roadmap milestones, provides deterministic career scenario projections, and offers a keyword-based resume review (not an external generative AI service).

## Requirements

- Node.js 18 or newer
- MySQL 8 (for persistent accounts)

## Start the app

1. Install client and API dependencies:

   ```bash
   npm install
   npm --prefix backend install
   ```

2. For a new database, create the database and tables using `backend/schema.sql` (for example, `mysql -u root -p < backend/schema.sql`). It creates the `skilltwin` database, seeds the skills and roles, and installs the assessment catalogue and personalized roadmap tables. For an existing database, apply migrations `001_student_readiness.sql`, `002_assessments.sql`, and `003_personalized_roadmaps.sql` in order. Avoid rerunning the full schema seed script on an existing database because it refreshes the built-in role-to-skill mappings.

3. Copy `backend/.env.example` to `backend/.env` and set the MySQL password and a private, random `JWT_SECRET` (at least 32 characters for production).

4. Start the API and client in separate terminals:

   ```bash
   npm run server
   npm run dev
   ```

   The API listens on port 5001 and Vite on port 5173. The frontend calls `/api` on the same origin; Vite proxies that path to the local API during development. Set `VITE_DEV_API_PROXY` if the local backend uses another address.

## Demo access

Choose **Instant Demo Access** on Login or Signup, or use the home page demo action. Demo mode is local and works without an API or database. Changes made in demo mode are stored in that browser's local storage, not in MySQL. For persistent data, create an account and sign in while the API and database are available.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`
- `GET /api/student/profile`, `GET|PUT /api/student/skills`
- `GET|PUT /api/student/target-role`, `GET /api/student/gaps`, `GET /api/student/readiness`
- `GET|PUT /api/student/milestones`
- `POST /api/ai/simulate`, `POST /api/ai/analyze-resume`
- `GET /api/assessments`, `GET /api/assessments/:assessmentId`
- `POST /api/assessments/:assessmentId/submit`, `GET /api/assessments/results`, `GET /api/assessments/results/:resultId`
- `GET /api/roadmap`, `GET /api/roadmap/progress`, `POST /api/roadmap/generate`, `PUT /api/roadmap/milestones/:milestoneId`
- `GET /api/health`

## Project progress

### Phase 10 — Assessments (implemented)

- The dashboard includes an assessment catalogue, multiple-choice assessment flow, immediate answer review, and saved attempt history.
- Assessments, questions, attempts, and per-question answers are stored in MySQL. Attempts are scoped to the authenticated user.
- Correct options and explanations are never included in the question-fetch response. The API validates the complete answer set, grades it against database answers, and persists the score in a transaction.
- Assessment results are diagnostic only and do not silently change the student's self-reported skill levels or career-readiness score.
- The initial seeded catalogue contains a 10-question Computer Science Fundamentals assessment.

The assessment migration upgrades the original assessment tables in place and preserves their rows. A fresh database created from `backend/schema.sql` includes the assessment tables and starter assessment.

### Phase 11 — Personalized learning roadmap (implemented)

- Generates and saves an ordered learning roadmap for the student's selected role.
- Prioritizes each missing or below-target skill using gap size and role importance, and estimates effort for each milestone.
- Each milestone has a measurable proficiency outcome, gap context, and persisted planned/completed status.
- The dashboard loads the current saved plan, tracks completion, and can regenerate it after skill profile changes.
- Changing target roles generates a roadmap for the new role. Assessment results remain diagnostic and do not silently change reported skill levels.

The roadmap migration adds `roadmap_milestones` and a current-snapshot marker while retaining existing roadmap rows.

### Phase 12 — Progress tracking (implemented)

- Persists planned, in-progress, and completed roadmap-task states, including completion timestamps.
- Calculates completion percentage and task counts from saved task states, and keeps the roadmap's aggregate status in sync.
- Recomputes and stores career readiness after each saved skill update; authenticated clients refresh the displayed gaps and readiness.
- Shows each task state, completion date, completion percentage, and counts on the dashboard.

Phase 12 uses the Phase 11 `roadmap_milestones` table and adds no additional database migration.

### Next phase — Phase 13: Resume analysis

Improve resume analysis so it can compare resume evidence with the student's selected role requirements and clearly report supported skills and remaining gaps.

The root `npm run build` command builds the frontend for production.

## Production deployment

Deploy the built `dist/` directory to an HTTPS static host and run `backend/` as a separate Node.js service. Configure the HTTPS reverse proxy or platform routing so `/api/*` is forwarded to the API service and other paths serve the SPA entry point. The default frontend API URL is same-origin `/api`; for a separately hosted API, set `VITE_API_BASE_URL` at build time and set `CLIENT_ORIGIN` to the exact frontend origin(s).

Set `NODE_ENV=production`, `PORT`, `JWT_SECRET` (at least 32 randomly generated characters), `CLIENT_ORIGIN` (comma-separated HTTPS origins, no wildcards), and `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, and `DB_PORT`. Production startup rejects missing secrets/database settings, insecure client origins, and database TLS disabled. Set `DB_SSL=true`; when the database provider requires a private CA, set `DB_SSL_CA` to its CA bundle path. Use a dedicated least-privilege database account and keep credentials in the deployment secret store, never in the repository.

Apply schema/migrations before deploying. Keep MySQL on a private network, enable encrypted database backups and restore procedures, and configure request rate limits for `/api/auth/login` and `/api/auth/register` at the trusted ingress or API gateway (especially when running multiple API instances). Terminate HTTPS at a trusted load balancer, set its security headers/HSTS policy, and expose `/api/health/live` for liveness plus `/api/health/ready` for database readiness. The API bounds JSON bodies to 64 KB and drains connections on SIGTERM/SIGINT. Build with `npm run build`; deploy the resulting `dist/` and start the API with `npm --prefix backend start`.

### Render backend

For a manual Render Web Service, set **Root Directory** to `backend`, **Build Command** to `npm install; npm run build`, **Start Command** to `npm start`, and **Health Check Path** to `/api/health/live`. The backend build script runs Node syntax checks; it does not build the separate frontend. Set the production variables listed above in Render's Environment settings. Alternatively, create the service from the repository's root `render.yaml` Blueprint, which sets the backend root directory, build/start commands, health check, generates `JWT_SECRET`, and prompts for database credentials and `CLIENT_ORIGIN`.

The gap response lists every skill required by the selected role, including skills the student has not recorded. Readiness is the unweighted sum of each current score capped at that skill's required score, divided by the sum of all required scores. Missing skills count as zero. The resume analyzer and career simulator currently use local deterministic rules; neither calls an external AI model.
