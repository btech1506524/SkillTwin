# Requirements traceability

**Updated:** 26 October 2026

The official planning DOCX is unavailable. This matrix uses the current README, phase tracker, ERD, source, migrations, and focused tests. “Source-checked” is not a live service claim.

| ID | Requirement | Current implementation/evidence | Verification/status | Remaining action |
|---|---|---|---|---|
| R-01 | Register, sign in, and retrieve an authenticated profile. | `backend/routes/auth.js`, `backend/middleware/authMiddleware.js`; bcrypt/JWT responses omit password hashes. | Input rejection, missing/malformed token, and syntax tests pass. **Implemented; DB flow not verified.** | Run disposable-MySQL auth flow. |
| R-02 | Save profile, role, categorized skills, and CGPA 0–10. | `src/pages/Signup.jsx` → `src/pages/Onboarding.jsx` preserves validated role hints; `backend/routes/student.js`; schema/migration 010 use `DECIMAL(4,2)`. | CGPA source-parity and route contract checks pass. **Implemented; MySQL/browser flow blocked.** | Round-trip 0, 9.99, 10.00 in disposable MySQL. |
| R-03 | Calculate required-skill gaps/readiness. | `backend/routes/student.js` uses `backend/lib/readiness.js`, caps current scores at targets, and excludes optional mappings. | Capped formula test passes. **Implemented; DB calculation not live-verified.** | Run known-input disposable DB checks. |
| R-04 | Read/update/delete owned skills. | Student routes use JWT-derived user IDs and parameterized ownership queries. | Source/build checked. **Implemented; cross-user DB test pending.** | Run two-user disposable isolation test. |
| R-05 | Assessments hide answers, grade server-side, save history. | `backend/routes/assessments.js` question select excludes keys; submission validates complete answers in a transaction. | Answer secrecy and ownership query contracts pass. **Implemented; DB grading pending.** | Exercise grading/rollback in disposable MySQL. |
| R-06 | Generate and retain role-specific roadmaps. | `backend/routes/roadmap.js` generates current snapshots and retains older rows. | Required-skill/ownership SQL checked. **Implemented; DB flow pending.** | Verify first-load concurrency and role changes. |
| R-07 | Persist roadmap progress and aggregate status. | Roadmap milestone updates require owned current rows and update timestamps/status. | Ownership contract checked. **Implemented; DB flow pending.** | Verify transitions and cross-user denial. |
| R-08 | Analyze pasted resume evidence for saved role without storing text. | `backend/routes/ai.js` deterministic matcher, 20,000-character cap, no resume table. | Source checked. **Implemented; API/DB flow pending.** | Run boundary and non-persistence checks. |
| R-09 | Simulate readiness without mutating profile. | Named scenarios are bounded; legacy role simulator now filters required skills and shares readiness math. | Source/test boundary checked. **Implemented; DB flow pending.** | Compare same profile against readiness in disposable DB. |
| R-10 | Protected admin console and read-only table browsing. | Admin middleware rechecks DB role; admin table browser uses `backend/lib/security.js` denylist for secret/OAuth challenge fields. | Student authorization and field-filter tests pass. **Implemented; DB admin flow pending.** | Run admin role/CSV/pagination checks. |
| R-11 | Current schema and ordered migrations. | `backend/schema.sql` plus migrations 001–010; ERD lists 16 tables and OAuth relations. | Static fresh/upgrade CGPA parity passes. **Source aligned; live schema pending.** | Apply to disposable fresh and upgrade schemas. |
| R-12 | Vercel frontend/Render API/Railway MySQL deployment shape. | `vercel.json`, `render.yaml`, TLS config, health endpoints, explicit `TRUST_PROXY_HOPS`. | Config inspected. **Not hosted-verified.** | Verify staging domains, TLS, health, migrations, and ingress. |
| R-13 | Health, bounded JSON, CORS, errors, graceful shutdown. | `backend/server.js` provides live/ready routes, 64 KB parsing, CORS, error handler, shutdown, and rate limits. | Live health supertest and syntax checks pass. **Implemented; bind/DB readiness pending.** | Run permitted local API smoke. |
| R-14 | Deterministic resume/simulator behavior is labeled accurately. | Static aliases/scenario boosts; UI/API call them keyword evidence/rule-based previews. | Source checked. **Implemented.** | Keep regression contract tests current. |
| R-15 | Offline demo persists browser changes and stays coherent. | Dedicated demo localStorage state, role-specific sample profiles/roadmaps, isolated from auth storage. | Source checked. **Implemented; browser reload pending.** | Exercise reload/logout in a permitted browser. |
| R-16 | Google/Microsoft OAuth and linking. | `backend/routes/oauth.js`, OAuth UI, migration 007; challenge material is now hidden from admin browsing. | **Blocked** by provider credentials/staging access. | Run provider success/cancel/expiry/conflict/code-reuse tests in staging. |
| R-17 | Resume import/history. | No upload/history schema or routes; README marks it Phase 15 future scope. | **Not applicable to current denominator.** | Obtain explicit scope, retention, and privacy approval first. |

## Current metrics

- Current-scope denominator: R-01 through R-16 = 16.
- Source/build/test evidence after this run: R-01 through R-15 implemented, with live-service gaps; R-16 externally blocked.
- No feature is labeled end-to-end verified without a current runtime result. R-17 remains excluded future scope.
