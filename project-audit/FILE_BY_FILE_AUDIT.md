# File-by-file audit — final state

**Updated:** 26 October 2026

This is a focused final inventory of the files inspected or changed in this run. Generated `dist/`, `node_modules/`, `.git/`, ignored `.env`, and lockfile transitive contents are excluded from source review. No secret values or user records were read into the reports.

## Application source

| File | Final role / evidence |
|---|---|
| `src/App.jsx` | Route guards and backend admin redirect; no change required. |
| `src/pages/Home.jsx` | Encodes supported role selection into Signup URL; source confirmed. |
| `src/pages/Signup.jsx` | Reads the role hint and carries it to onboarding; copy describes persistent demo state. |
| `src/pages/Onboarding.jsx` | Validates the incoming role against the API role list before loading its skills; CGPA accepts 0–10. |
| `src/pages/Login.jsx` | Password recovery affordance is explicitly unavailable until email delivery exists. |
| `src/pages/Dashboard.jsx` | Uses stored coherent demo roadmaps; account roadmap behavior remains API-backed. |
| `src/context/AuthContext.jsx` | Dedicated demo localStorage key, restore/clear behavior, role-specific sample profiles, and account/demo isolation. |
| `src/services/api.js` | Authenticated API client; localStorage bearer-token architecture remains an open conditional risk. |
| `src/App.css`, `src/index.css`, shared components | Existing visual/accessibility implementation inspected as surrounding context; no broad redesign was introduced. |

## Backend source

| File | Final role / evidence |
|---|---|
| `backend/server.js` | Express 5 app, `TRUST_PROXY_HOPS`, application auth limits, parser/CORS/error handling, health/shutdown, testable export. |
| `backend/routes/auth.js` | Password registration/login/profile; public input validation and JWT session behavior. |
| `backend/routes/oauth.js` | Provider authorization code + PKCE/state/nonce and one-time exchange; staging remains blocked. |
| `backend/routes/student.js` | Profile/onboarding/skills/readiness; uses required-only mapping and shared readiness math. |
| `backend/routes/ai.js` | Required-only legacy simulator and deterministic resume matcher. |
| `backend/routes/assessments.js` | Answer-key secrecy, full-set validation, transaction grading, and user-owned result reads. |
| `backend/routes/roadmap.js` | Required-gap generation and current-roadmap milestone ownership checks. |
| `backend/routes/admin.js` | Admin APIs and read-only table browser; visible columns pass through `lib/security.js`. |
| `backend/lib/readiness.js` | Shared required-target score mapping and capped readiness calculation. |
| `backend/lib/security.js` | Sensitive/OAuth admin-column denylist. |
| `backend/middleware/authMiddleware.js` | Bearer/JWT validation and numeric user identity. |
| `backend/middleware/adminMiddleware.js` | Per-request database role recheck. |
| `backend/test/contracts.test.js` | 11 repeatable native contract tests; no live DB dependency. |
| `backend/package.json`, `backend/package-lock.json` | Runtime updates, express-rate-limit, Supertest test dependency, and test script. |

## Database, configuration, and docs

| File | Final role / evidence |
|---|---|
| `backend/schema.sql` | Fresh source schema now uses `DECIMAL(4,2)` for CGPA and includes OAuth tables. |
| `backend/migrations/001_student_readiness.sql` | Fresh/upgrade CGPA declaration aligned to `DECIMAL(4,2)`. |
| `backend/migrations/010_cgpa_precision.sql` | Forward upgrade for existing `users.cgpa`; repeatable `ALTER TABLE ... MODIFY COLUMN`. |
| `docs/database-erd.md` | Includes 16 source tables, OAuth relationships, migrations 001–010, and live-schema caveat. |
| `docs/phases-1-12-status.md` | Historical 14 October checks are labeled; current source/migration status is corrected. |
| `README.md` | Setup through migration 010, demo persistence, admin filtering, rate limits/proxy topology, recovery scope, and deployment caveats. |
| `backend/.env.example`, `render.yaml` | `TRUST_PROXY_HOPS` is explicit; deployment secrets remain external. |
| `project-audit/*.md` | Final status, traceability, findings, task list, file map, summary, and changelog updated together. |

## Dependency review

Root runtime/build: React 19.3.1, React Router 7.18.4, Recharts 3.10.1, Lucide 1.61.0, Axios 1.20.0, Vite 8.3.5, React plugin 6.1.2. Backend: Express 5.3.0, dotenv 18.0.9, jose 6.2.13, mysql2 3.24.6, bcryptjs 3.0.3, jsonwebtoken 9.0.3, cors 2.8.6, express-rate-limit 8.7.1. `npm audit` reports zero runtime vulnerabilities in both trees.
