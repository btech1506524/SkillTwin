# SkillTwin project file map

**Updated:** 26 October 2026

## Runtime architecture

```text
Browser
  └─ React 19 / React Router / Vite 8
       ├─ AuthContext: account session and isolated persistent demo state
       ├─ pages: home, login, signup, onboarding, dashboard, OAuth callback
       └─ Axios API client → same-origin /api or Vercel rewrite

Express 5 API
  ├─ auth + OAuth, student, AI helpers, assessments, roadmap
  ├─ admin APIs + backend-served /admin dashboard
  ├─ health, CORS, bounded JSON, rate limits, graceful shutdown
  └─ mysql2 pool → configured MySQL schema
```

## Important source connections

| Area | Files | Current responsibility |
|---|---|---|
| Frontend routes | `src/App.jsx`, `src/pages/*.jsx` | Guards account/onboarding routes; Signup passes a role hint to validated onboarding. |
| Auth/demo state | `src/context/AuthContext.jsx` | JWT account storage, refresh, skill/roadmap updates, dedicated demo localStorage and coherent role samples. |
| Dashboard | `src/pages/Dashboard.jsx`, `src/components/AssessmentsPanel.jsx` | Skills, roadmap, assessments, deterministic simulator, pasted-text resume evidence. Demo roadmap comes from the selected demo profile. |
| API client | `src/services/api.js` | Axios calls and bearer header for authenticated account sessions. |
| API process | `backend/server.js` | Express app, proxy-hop configuration, 10/5 auth limits, CORS, parser/errors, health, shutdown. Exports `app` for tests and starts only as the main module. |
| Auth/security | `backend/routes/auth.js`, `backend/routes/oauth.js`, `backend/middleware/*.js`, `backend/lib/security.js` | Registration/login/profile, OAuth, JWT/admin checks, sensitive admin-column filtering. |
| Readiness/simulation | `backend/routes/student.js`, `backend/routes/ai.js`, `backend/lib/readiness.js` | Required-skill-only capped readiness shared by primary and legacy simulation paths. |
| Assessments/roadmap | `backend/routes/assessments.js`, `backend/routes/roadmap.js` | Server grading, saved results, owned roadmap snapshots and milestone updates. |
| Admin | `backend/routes/admin.js`, `backend/admin-dashboard/` | Admin analytics, account management, CSV, read-only filtered table browser. |
| Tests | `backend/test/contracts.test.js` | Native Node tests for public auth rejection, authz, readiness, filtering, ownership SQL boundaries, answer secrecy, and schema parity. |

## Database and deployment

`backend/schema.sql` defines the current 16-table source schema. Migrations 001–010 are forward upgrades; 007 adds OAuth tables, 008 onboarding state, 009 the categorized role catalog, and 010 CGPA precision. `docs/database-erd.md` is reconciled to this source. `vercel.json` hosts the frontend/rewrite; `render.yaml` hosts the API and points to Railway MySQL with TLS. Hosted topology and actual schema state remain unverified.

## Safety boundaries

- Do not run schema or migration SQL against production or an unidentified database.
- Do not print `.env`, credentials, provider tokens, or user records.
- Do not treat the generated `dist/` or installed `node_modules/` as source changes.
- Keep `TRUST_PROXY_HOPS` aligned with confirmed proxy topology before relying on IP rate limits.
