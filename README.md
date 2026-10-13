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

2. For a new database, create the database and tables using `backend/schema.sql` (for example, `mysql -u root -p < backend/schema.sql`). It creates the `skilltwin` database, seeds the skills and roles, and installs the assessment catalogue. For an existing database, apply `backend/migrations/001_student_readiness.sql` and then `backend/migrations/002_assessments.sql`. Avoid rerunning the full schema seed script on an existing database because it refreshes the built-in role-to-skill mappings.

3. Copy `backend/.env.example` to `backend/.env` and set the MySQL password and a private, random `JWT_SECRET`.

4. Start the API and client in separate terminals:

   ```bash
   npm run server
   npm run dev
   ```

   The API listens on port 5001 and Vite on port 5173. Set `VITE_API_BASE_URL` only if the API uses a different origin; its default is `http://localhost:5001/api`.

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
- `GET /api/health`

## Project progress

### Phase 10 — Assessments (implemented)

- The dashboard includes an assessment catalogue, multiple-choice assessment flow, immediate answer review, and saved attempt history.
- Assessments, questions, attempts, and per-question answers are stored in MySQL. Attempts are scoped to the authenticated user.
- Correct options and explanations are never included in the question-fetch response. The API validates the complete answer set, grades it against database answers, and persists the score in a transaction.
- Assessment results are diagnostic only and do not silently change the student's self-reported skill levels or career-readiness score.
- The initial seeded catalogue contains a 10-question Computer Science Fundamentals assessment.

The migration upgrades the original assessment tables in place and preserves their rows. A fresh database created from `backend/schema.sql` includes the assessment tables and starter assessment.

### Next phase — Phase 11: Personalized learning roadmap

Generate a persistent, user-specific roadmap from selected career-role skill gaps. Prioritize missing and below-target skills, create ordered milestones with clear outcomes, and let students track progress. Assessment history can inform prioritization, while leaving skill proficiency unchanged unless the student explicitly updates it.

The root `npm run build` command builds the frontend for production.

The gap response lists every skill required by the selected role, including skills the student has not recorded. Readiness is the unweighted sum of each current score capped at that skill's required score, divided by the sum of all required scores. Missing skills count as zero. The resume analyzer and career simulator currently use local deterministic rules; neither calls an external AI model.
