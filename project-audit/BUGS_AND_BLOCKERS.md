# SkillTwin findings and blockers

**Updated:** 26 October 2026

This register supersedes the initial static audit after the implementation pass. “Fixed” means source and focused repository checks support the change; it does not imply a live MySQL, OAuth provider, or hosted deployment was tested.

## Confirmed findings

| ID | Finding | Final status | Evidence and verification |
|---|---|---|---|
| B-01 | Home career selection was lost before signup. | **FIXED** | `src/pages/Signup.jsx` now carries the query hint to onboarding, and `src/pages/Onboarding.jsx` validates it against the server role list before selecting and loading skills. `backend/test/contracts.test.js` covers the supported-role contract statically; live browser/API flow remains unavailable. |
| B-02 | Demo edits reset despite the persistence copy. | **FIXED** | `src/context/AuthContext.jsx` stores demo state only under `skilltwin_demo_user`, restores valid state after reload, isolates it from account credentials, and clears it on demo logout. README and Signup copy now describe the actual behavior. Browser reload was not possible in this sandbox. |
| B-03 | OAuth challenge fields were visible to the admin table browser. | **FIXED** | `backend/lib/security.js` excludes OAuth, nonce, verifier, state, and code-hash names; `backend/routes/admin.js` applies it to table metadata and rows. The backend test asserts all four OAuth challenge names are hidden. |
| B-04 | ERD and phase documentation omitted OAuth tables and later migrations. | **FIXED** | `docs/database-erd.md` now includes all 16 source tables and OAuth relationships; `docs/phases-1-12-status.md` records migrations 001–010 and labels the 13-table count as historical. Actual configured database state is still unverified. |
| B-05 | Auth rate limiting was delegated only to ingress. | **FIXED IN APPLICATION; STAGING INGRESS OPEN** | `backend/server.js` applies 15-minute per-instance IP limits of 10 login and 5 registration requests, uses `TRUST_PROXY_HOPS` explicitly, and documents the need for ingress limits across instances. No hosted ingress configuration or repeated staging request test was available. |
| B-06 | “Forgot password?” was not a recovery flow. | **RECLASSIFIED / HONEST UI** | No email delivery or recovery configuration exists. `src/pages/Login.jsx` now says “Password recovery unavailable”; README documents the dependency and secure requirements for future work. |
| B-07 | No repeatable automated checks existed. | **FIXED PARTIALLY** | Backend `npm test` now runs `backend/test/contracts.test.js` for health/auth rejection, admin authorization, readiness capping, OAuth field filtering, assessment answer secrecy, ownership SQL boundaries, and CGPA schema parity. Full MySQL integration coverage remains blocked by the environment. |
| B-08 | Original planning DOCX was unavailable. | **STILL BLOCKED** | It was not found in the repository or supplied attachment paths. Traceability remains based on README and repository Markdown. |
| B-09 | Local MySQL and browser startup were blocked by sandbox permissions. | **STILL BLOCKED** | The current run did not retry unsafe or unavailable external access. No production or unidentified database was used; local DB setup and browser smoke remain unverified. |
| B-10 | OAuth provider and hosted deployment checks were unavailable. | **STILL BLOCKED** | Provider credentials, staging deployment access, and hosted logs are not present. Source checks passed, but provider callbacks and deployment wiring are not claimed verified. |
| B-11 | Render uses a public Railway TCP proxy while documentation recommends private networking. | **STILL OPEN / EXTERNAL** | `render.yaml` and README now describe the configured proxy and retain TLS/least-privilege guidance. Railway/Render network controls were not accessible, so the boundary is not verified. |
| B-12 | Student JWTs use localStorage, creating conditional XSS exposure. | **STILL OPEN / ARCHITECTURAL** | `src/context/AuthContext.jsx` and `src/services/api.js` still use localStorage for the authenticated bearer token. No XSS was found; HttpOnly-cookie migration requires a separate CSRF/session design. |
| B-13 | CGPA 10.00 was accepted but not representable by `DECIMAL(3,2)`. | **FIXED IN SOURCE** | `backend/schema.sql`, migration `001_student_readiness.sql`, and new forward migration `010_cgpa_precision.sql` use `DECIMAL(4,2)`. The test checks fresh/upgrade source parity; MySQL round-trip is blocked. |
| B-14 | Demo role label could diverge from sample skills/readiness/roadmap. | **FIXED IN SOURCE** | `src/context/AuthContext.jsx` now supplies coherent role-specific demo samples and roadmap data; Dashboard uses the stored demo roadmap. Browser exercise of each role remains unavailable. |
| B-15 | Legacy simulator included optional skills in readiness. | **FIXED IN SOURCE** | `backend/routes/ai.js` now filters `crs.is_required = TRUE` and shares the capped readiness helper used by the primary route. The test asserts the required-skill boundary; DB comparison is blocked. |

## Additional scope decisions

- Phase 15 resume import/history remains future scope. No upload, OCR, retention, or resume-storage feature was added.
- The preliminary “AI career assistant” lead remains unconfirmed and is not implemented.
- Password recovery remains explicitly unavailable until verified email delivery and a product decision exist.

## Verification limits

- **PASS:** `npm run build`; `npm --prefix backend run build`; `npm --prefix backend test`; `npm audit --omit=dev`; `npm --prefix backend audit --omit=dev`.
- **NOT RUN / BLOCKED:** disposable MySQL schema creation and upgrade, browser reload smoke, OAuth provider exchange, Vercel/Render/Railway health and ingress checks.
- No production database, deployment, push, commit, or hosted secret was accessed.
