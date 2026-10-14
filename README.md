# SkillTwin AI

SkillTwin is a career-readiness dashboard for engineering students. It includes a React/Vite client and an Express API backed by MySQL. The dashboard tracks skills, target roles and roadmap milestones, provides deterministic career scenario projections, and compares resume keyword evidence with role requirements (not an external generative AI service).

## Requirements

- Node.js 22 or newer (Node 22–24 supported)
- MySQL 8 (for persistent accounts)

## Start the app

1. Install client and API dependencies:

   ```bash
   npm install
   npm --prefix backend install
   ```

2. For a new database, create the database and tables using `backend/schema.sql` (for example, `mysql -u root -p < backend/schema.sql`), then select `skilltwin` and apply `backend/migrations/009_role_based_skill_catalog.sql`. For an existing database, select the target schema and apply unapplied migrations in order through `008_student_onboarding.sql`, then apply `009_role_based_skill_catalog.sql` (for example, `mysql -u root -p skilltwin < backend/migrations/009_role_based_skill_catalog.sql`). Migration files do not select a schema for you. Migration 009 adds required/optional role mapping and seeds the categorized role skill catalog without dropping student data. Avoid rerunning the full schema seed script on an existing database because it refreshes the built-in role-to-skill mappings.

3. Copy `backend/.env.example` to `backend/.env` and set the MySQL password and a private, random `JWT_SECRET` (at least 32 characters for production).

4. Start the API and client in separate terminals:

   ```bash
   npm run server
   npm run dev
   ```

   The API listens on port 5001 and Vite on port 5173. Vite proxies `/api` and `/admin` to the local API during development. Set `VITE_DEV_API_PROXY` if the local backend uses another address.

## Demo access

Choose **Instant Demo Access** on Login or Signup, or use the home page demo action. Demo mode is local and works without an API or database. Changes made in demo mode are stored in that browser's local storage, not in MySQL. For persistent data, create an account and sign in while the API and database are available.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`
- `POST /api/auth/oauth/:provider/start`, `POST /api/auth/oauth/:provider/link`, `GET /api/auth/oauth/:provider/callback`, `POST /api/auth/oauth/exchange`
- `GET /api/student/profile`, `GET|PUT /api/student/skills`
- `GET /api/student/onboarding` returns the authenticated profile, saved skills, and role list; `GET /api/student/onboarding/skills?roleId=...` returns that role's categorized required and optional skills; `PUT /api/student/onboarding` saves the role, profile, and selected proficiency levels.
- `GET|PUT /api/student/target-role`, `GET /api/student/gaps`, `GET /api/student/readiness`
- `GET|PUT /api/student/milestones`
- `POST /api/ai/simulate`, `POST /api/ai/analyze-resume`
- `GET /api/assessments`, `GET /api/assessments/:assessmentId`
- `POST /api/assessments/:assessmentId/submit`, `GET /api/assessments/results`, `GET /api/assessments/results/:resultId`
- `GET /api/roadmap`, `GET /api/roadmap/progress`, `POST /api/roadmap/generate`, `PUT /api/roadmap/milestones/:milestoneId`
- `/api/admin/*` — administrator-only overview and analytics, paginated user/profile access, CSV export, activity history, account-role management, and read-only current-database table browsing
- `GET /api/health`

## Admin console

The backend serves the interactive admin dashboard at `https://<backend-host>/admin`; the student frontend and API remain separate deployments. The dashboard signs in through the normal auth API, requires an account explicitly promoted to the `admin` role, and uses server-checked admin APIs. The frontend `/admin` path redirects to the backend dashboard. There is no default or public admin password. Apply migration `005_admin_access.sql` and promote the intended administrator through the private database console:

```sql
UPDATE users SET account_role = 'admin' WHERE email = 'admin@example.com';
```

The API checks the current role in MySQL on each admin request. Admins can search and inspect profiles, export filtered user lists to CSV, view registration/readiness analytics and an audit trail of admin sign-ins and account-role changes, view skills, roadmap history, milestones and assessment attempts, change other accounts between student/admin, and browse paginated records in the configured SkillTwin database. Table browsing is read-only; password hashes and fields matching secret, token, API-key, credential, salt, private-key, and resume-text names are excluded. Arbitrary SQL and other MySQL schemas are not exposed. At least one admin account must remain; an admin cannot change their own role. Locally, open `http://localhost:5001/admin` or `http://localhost:5173/admin`.

## Separate frontend and backend

Vercel hosts the Vite student frontend. Render hosts the Express API and its backend-served admin dashboard at `/admin`. The two apps deploy independently. The frontend's `/admin` route redirects to the configured Render admin URL.

## Project progress

The current implementation and local verification status for Phases 1–12 is tracked in [`docs/phases-1-12-status.md`](docs/phases-1-12-status.md). The database relationships are documented in [`docs/database-erd.md`](docs/database-erd.md). The status tracker distinguishes implementation evidence from production deployment, which remains a later phase.

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
- Existing installations need migrations `005_admin_access.sql` and `006_admin_audit_log.sql`; promote an administrator account using the procedure above.
- The admin overview shows student sign-up trends, readiness bands, and popular role choices. Admin sign-ins and account-role changes are recorded in `admin_audit_log` and shown in the activity view.
- Admins can export a filtered account list to CSV. Spreadsheet formula prefixes are escaped in exported cells.

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

The production database connection, migrations, account flow, and saved roadmap still require verification against a provisioned MySQL 8 service. This repository does not include a running database or deployment credentials, so that live integration check cannot be completed locally. Vercel SPA deep links are configured by the root `vercel.json`; the `public/_redirects` file is for Netlify deployments.

The frontend production build and backend source checks are run as part of this audit. They do not replace the pending live MySQL/deployment verification.

The root `npm run build` command builds the frontend for production.

## Production deployment

Deploy the React/Vite student frontend to Vercel and the Express API/admin dashboard to Render. The root `render.yaml` defines the Render backend only. The API serves `/api/*` plus its own `/admin` dashboard and does not serve the student frontend. The current Vercel config proxies `/api/*` to Render, and the admin route redirects to the Render dashboard. Set Render's `CLIENT_ORIGIN` to the exact HTTPS Vercel origin. `vercel.json` enables SPA deep links and applies baseline browser security headers.

Set `NODE_ENV=production`, `PORT`, `JWT_SECRET` (at least 32 randomly generated characters), `CLIENT_ORIGIN` (comma-separated HTTPS origins, no wildcards), and the database connection values. Production startup rejects missing secrets/database settings, insecure client origins, and database TLS disabled. Set `DB_SSL=true`; `DB_SSL_CA` is resolved relative to `backend/` unless it is an absolute path. For the current Railway MySQL deployment, `render.yaml` uses the public TCP proxy, database `railway`, and the checked-in public CA certificate. Set `DB_USER` and `DB_PASS` in Render from the Railway MySQL service variables. Use a dedicated least-privilege database account and keep credentials in the deployment secret store, never in the repository.

Apply schema/migrations before deploying. Keep MySQL on a private network, enable encrypted database backups and restore procedures, and configure request rate limits for `/api/auth/login` and `/api/auth/register` at the trusted ingress or API gateway (especially when running multiple API instances). Terminate HTTPS at a trusted load balancer, set its security headers/HSTS policy, and expose `/api/health/live` for liveness plus `/api/health/ready` for database readiness. The API bounds JSON bodies to 64 KB and drains connections on SIGTERM/SIGINT.

### Vercel frontend

Use the repository root as the project root, `npm ci` as the install command, `npm run build` as the build command, and `dist` as the output directory. Node.js 22–24 is supported. `vercel.json` proxies `/api/*` to `https://skilltwin-l25l.onrender.com`; update that rewrite if the Render domain changes. `VITE_API_BASE_URL` and `VITE_ADMIN_URL` can override the defaults when using a different deployment.

### Render backend

The Render Blueprint defines only the backend web service. For a manual Render Web Service, use **Root Directory** `backend`, **Build Command** `npm ci && npm run build`, **Start Command** `npm start`, and **Health Check Path** `/api/health/live`. Node.js 22–24 is supported. Set `CLIENT_ORIGIN` to `https://skill-twin-orpin.vercel.app` (no path or trailing slash), and set `DB_USER` and `DB_PASS` from Railway. The Blueprint sets the Railway public TCP host, port, schema, and CA bundle path. The API installs from `backend/package-lock.json`.

The gap response lists every skill required by the selected role, including skills the student has not recorded. Readiness is the unweighted sum of each current score capped at that skill's required score, divided by the sum of all required scores. Missing skills count as zero. The resume analyzer and career simulator currently use local deterministic rules; neither calls an external AI model.

### Google and Microsoft sign-in

The login and registration pages support Google OpenID Connect and Microsoft identity platform sign-in. Configure a Google OAuth web client and a Microsoft Entra app registration, then set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MICROSOFT_CLIENT_ID`, and `MICROSOFT_CLIENT_SECRET` in Render. Set the Microsoft app's supported account types to organizational and personal Microsoft accounts; `MICROSOFT_TENANT_ID=common` enables both. Keep client secrets only in Render's secret environment variables.

Register these exact Web redirect URIs with the identity providers:

- Google: `https://skilltwin-l25l.onrender.com/api/auth/oauth/google/callback`
- Microsoft: `https://skilltwin-l25l.onrender.com/api/auth/oauth/microsoft/callback`

Set `OAUTH_BACKEND_URL=https://skilltwin-l25l.onrender.com` and `OAUTH_FRONTEND_URL=https://skill-twin-orpin.vercel.app`. For local development, use the local API and frontend origins instead. Apply migration `007_oauth_login.sql` before enabling provider credentials. OAuth-only accounts receive random non-recoverable password hashes; existing password accounts are never merged solely by matching email. Sign into an existing account first and connect the provider from its dashboard.
