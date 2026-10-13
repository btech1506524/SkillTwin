# SkillTwin AI

SkillTwin is a career-readiness dashboard for engineering students. It includes a React/Vite client and an Express API backed by MySQL. The dashboard tracks skills, target roles and roadmap milestones, provides deterministic career scenario projections, and compares resume keyword evidence with role requirements (not an external generative AI service).

## Requirements

- Node.js 18 or newer
- MySQL 8 (for persistent accounts)

## Start the app

1. Install client and API dependencies:

   ```bash
   npm install
   npm --prefix backend install
   ```

2. For a new database, create the database and tables using `backend/schema.sql` (for example, `mysql -u root -p < backend/schema.sql`). It creates the `skilltwin` database, seeds skills and roles, and installs the assessment, roadmap, and admin tables. For an existing database, apply migrations `001_student_readiness.sql` through `005_admin_access.sql` in order. Avoid rerunning the full schema seed script on an existing database because it refreshes the built-in role-to-skill mappings.

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
- `/api/admin/*` — administrator-only overview, paginated user/profile access, account-role management, and read-only current-database table browsing
- `GET /api/health`

## Admin console

The `/admin` console requires a normal account that has been explicitly promoted to the `admin` role. New accounts are always students; there is no default or public admin password. After creating the intended administrator account, apply migration `005_admin_access.sql` and promote that account through the private database console:

```sql
UPDATE users SET account_role = 'admin' WHERE email = 'admin@example.com';
```

The account must sign out and back in to refresh the UI role. The API also checks the current role in MySQL on each admin request, so changing a role takes effect server-side immediately. Admins can search and inspect all student profiles, view skills, roadmap history, milestones and assessment attempts, change other accounts between student/admin, and browse paginated records in every table in the configured SkillTwin database. Table browsing is read-only, and fields matching password, secret, token, API-key, credential, salt, private-key, and resume-text names are excluded. The console does not expose arbitrary SQL, credentials, or other MySQL schemas. At least one admin account must remain; an admin cannot change their own role.

## Render: serve the admin UI with the API

The Render Blueprint builds the frontend and backend in the same service, and Express serves the generated `dist/` files plus `/api/*` from one origin. Use the repository root as **Root Directory** for a manual Render service. Use **Build Command** `npm ci && npm --prefix backend ci && npm run build && npm --prefix backend run build`, **Start Command** `npm --prefix backend start`, and **Health Check Path** `/api/health/live`. Set `CLIENT_ORIGIN` to the exact HTTPS origin of the Render service. Run migration `005_admin_access.sql` on the production database and promote the administrator account using the SQL above.

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

### Phase 13 — Role-aware resume evidence analysis (implemented)

- Compares pasted resume text with skill requirements for the authenticated student's saved target role.
- Reports matching keyword evidence, role requirements without evidence, match percentage, experience signals, and targeted suggestions.
- Limits analysis input to 20,000 characters and does not store the supplied resume text.
- Labels matches as deterministic keyword evidence; it does not claim to verify proficiency or call an external AI service.
- Adds Python to the AI / ML Engineer requirements for new databases and through migration `004_resume_analysis.sql` for existing databases.

### Phase 14 — Admin console (implemented)

- Adds a protected admin area for system counts, user search and profile inspection, account-role management, and read-only browsing of application database tables.
- Backend admin routes re-check the account role against MySQL on every request. Password hashes and other secret-like columns are excluded from table views; no SQL console is exposed.
- Existing installations need migration `005_admin_access.sql`; promote an administrator account using the procedure above.

### Next suggested phase — Phase 15: Resume import and analysis history

Add safe PDF/text resume import and let students save, compare, and remove their own prior analysis reports.

## Project audit — 2026-10-13

The repository-wide review found and fixed these issues:

- Sign-up no longer substitutes a shared fallback password. Login and registration only create a persistent session when the API returns both a user and a signed token.
- Registration now validates supported target roles, semester range, and profile field lengths. Empty/missing JSON bodies return validation errors instead of causing a server error. A role change commits the target role atomically; the next roadmap read generates a fresh snapshot while preserving earlier roadmap history.
- Authentication rejects malformed bearer headers and signed tokens without a valid numeric user ID.
- The simulator validates scenario inputs, clamps projections to the remaining readiness range, and caps each skill's contribution at its requirement. Dashboard skill values preserve a legitimate zero score, and overlapping simulation responses cannot overwrite newer selections.
- Failed server-backed skill or milestone changes no longer leave fabricated optimistic values in the browser. Failed role changes no longer change the displayed target role.
- Feature buttons now work, career selections carry through registration or update an existing profile, footer section links work from nested routes, and unknown client routes return to the home page. A Netlify `_redirects` rule supports direct SPA route loads there.
- Removed unsupported claims about AI career chat, university curriculum alignment, student testimonials, and placement/recruitment benchmarks. Resume analysis is deterministic text-keyword matching; assessments and projections are rule-based.
- Production configuration now rejects malformed client origins and invalid API ports.

The production database connection, migrations, account flow, and saved roadmap still require verification against a provisioned MySQL 8 service. This repository does not include a running database or deployment credentials, so that live integration check cannot be completed locally. Configure SPA history fallback on any static host other than Netlify as well.

The frontend production build and backend source checks are run as part of this audit. They do not replace the pending live MySQL/deployment verification.

The root `npm run build` command builds the frontend for production.

## Production deployment

The recommended Render deployment builds `dist/` and runs the API in one Node.js web service; Express serves the frontend and `/api/*` from the same origin. Alternatively, deploy `dist/` to an HTTPS static host and run `backend/` separately, with `/api/*` forwarded to the API and SPA history fallback enabled. For a separately hosted API, set `VITE_API_BASE_URL` at build time and `CLIENT_ORIGIN` to the exact frontend origin(s).

Set `NODE_ENV=production`, `PORT`, `JWT_SECRET` (at least 32 randomly generated characters), `CLIENT_ORIGIN` (comma-separated HTTPS origins, no wildcards), and `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, and `DB_PORT`. Production startup rejects missing secrets/database settings, insecure client origins, and database TLS disabled. Set `DB_SSL=true`; when the database provider requires a private CA, set `DB_SSL_CA` to its CA bundle path. Use a dedicated least-privilege database account and keep credentials in the deployment secret store, never in the repository.

Apply schema/migrations before deploying. Keep MySQL on a private network, enable encrypted database backups and restore procedures, and configure request rate limits for `/api/auth/login` and `/api/auth/register` at the trusted ingress or API gateway (especially when running multiple API instances). Terminate HTTPS at a trusted load balancer, set its security headers/HSTS policy, and expose `/api/health/live` for liveness plus `/api/health/ready` for database readiness. The API bounds JSON bodies to 64 KB and drains connections on SIGTERM/SIGINT. For the shared Render service, build with `npm run build` and `npm --prefix backend run build`, then start with `npm --prefix backend start`.

### Render service

For a manual Render Web Service, use the repository root as **Root Directory**, **Build Command** `npm ci && npm --prefix backend ci && npm run build && npm --prefix backend run build`, **Start Command** `npm --prefix backend start`, and **Health Check Path** `/api/health/live`. The root Blueprint in `render.yaml` applies this configuration, generates `JWT_SECRET`, and prompts for database credentials and `CLIENT_ORIGIN`.

The gap response lists every skill required by the selected role, including skills the student has not recorded. Readiness is the unweighted sum of each current score capped at that skill's required score, divided by the sum of all required scores. Missing skills count as zero. The resume analyzer and career simulator currently use local deterministic rules; neither calls an external AI model.
