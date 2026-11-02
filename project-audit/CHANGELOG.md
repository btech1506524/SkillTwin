# SkillTwin improvement run changelog

## 2 November 2026 — Phase 20: public role roadmap catalogue

### Implementation

- `src/pages/RoleRoadmaps.jsx`, `src/App.jsx`, `src/components/Navbar.jsx`, and `src/pages/Home.jsx` — expose `/roadmaps` to every visitor, add home/navigation links, and support shareable role selection.
- `src/data/roleRoadmaps.js`, `src/components/RoleRoadmapExplorer.jsx`, and `src/design-system.css` — expand the on-site curriculum to 14 original role guides and present a browsable catalogue with sequenced phases, outcomes, and skill areas.
- `backend/migrations/013_expanded_career_catalog.sql` and `backend/schema.sql` — add eight role records, their skill rows, and role requirement mappings for existing and fresh databases. No tables were added.
- README, phase tracker, ERD, requirements traceability, and project handoff now describe the public route and migration 013.

### Verification boundary

- Frontend build, Graphify update, and `git diff --check` results are recorded in the Phase 20 handoff.
- MySQL fresh/upgrade checks and browser smoke checks remain pending; no database was modified.

## 2 November 2026 — Phase 19: persistent dark mode

### Implementation

- `src/context/ThemeContext.jsx`, `src/App.jsx` — add app-wide theme state, persist the user's selection in local storage, and apply it to the document root.
- `src/components/Navbar.jsx`, `src/design-system.css` — add an accessible light/dark toggle and dark palette for shared app surfaces.
- `README.md`, `docs/phases-1-12-status.md`, and `project-audit/*` — record the feature and verification boundary.

### Verification boundary

- `npm run build` — PASS; Vite production bundle built successfully.
- `git diff --check` — PASS.
- SQL-aware Graphify update — PASS; graph contains 496 nodes and 815 edges.
- Browser theme-switch and reload checks have not been smoke-tested in this environment.

## 2 November 2026 — Phase 18: in-app role roadmaps

### Implementation

- `src/data/roleRoadmaps.js` — adds original 12-week curricula for all six supported roles, each with four phases, outcomes, and topic tags.
- `src/components/RoleRoadmapExplorer.jsx`, `src/pages/Dashboard.jsx`, `src/design-system.css` — add an in-app role selector and structured timeline below the existing personalized milestones. Preview selection does not modify the user's target role or saved progress.
- No external roadmap content, API, database, migration, or dependency change is involved.

### Verification boundary

- `npm run build` — PASS; Vite production bundle built successfully.
- `git diff --check` — PASS.
- SQL-aware Graphify update — PASS; graph contains 496 nodes and 815 edges.
- Browser role-switch and responsive-layout checks have not been smoke-tested in this environment.

**Run date:** 26 October 2026  
**Starting revision:** `main` at `main...origin/main`  
**Scope guard:** local source/documentation/dependency work only; no commit, deploy, production database, hosted secret, or push.

## Outcome

Implemented the audit-confirmed local fixes, modernized the frontend/backend dependency trees, added repeatable backend contract coverage, repaired the CGPA schema mismatch with a forward migration, added application auth throttling, and reconciled project status documentation. Live MySQL, browser, OAuth, and hosted deployment checks remain explicitly blocked or unrun.

## Changed files

### Frontend flow and demo

- `src/pages/Signup.jsx` — carries a selected home role hint to onboarding and reflects it in setup copy.
- `src/pages/Onboarding.jsx` — validates a requested role against the API role catalogue before selecting it and loading skills.
- `src/context/AuthContext.jsx` — persists demo state under an isolated key, restores valid state after reload, clears it on demo logout, and provides coherent role-specific demo samples.
- `src/pages/Dashboard.jsx` — renders the selected demo profile’s stored roadmap.
- `src/pages/Login.jsx` — replaces the non-functional recovery button with honest unavailable copy.

### Backend behavior and security

- `backend/server.js` — adds explicit proxy-hop parsing, per-instance login/registration rate limits, and an exported testable app/start function.
- `backend/routes/admin.js` — applies the sensitive-column helper to table browsing.
- `backend/routes/ai.js` — filters legacy simulator calculations to required skills and uses shared capped readiness math.
- `backend/routes/student.js` — uses shared readiness calculation.
- `backend/lib/readiness.js` — adds shared level mapping and capped readiness helper.
- `backend/lib/security.js` — adds OAuth/secret column denylist.
- `backend/test/contracts.test.js` — adds eleven native Node contract tests for health/auth rejection, rate limits, authorization, readiness, field filtering, ownership boundaries, answer secrecy, schema parity, and frontend role handoff.

### Database and configuration

- `backend/schema.sql` — changes fresh-install CGPA to `DECIMAL(4,2)`.
- `backend/migrations/001_student_readiness.sql` — aligns conditional CGPA creation with fresh schema.
- `backend/migrations/010_cgpa_precision.sql` — forward, rerunnable upgrade for existing databases.
- `backend/.env.example`, `render.yaml` — document/configure `TRUST_PROXY_HOPS` without adding secrets.

### Dependencies and documentation

- `package.json`, `package-lock.json` — frontend upgrades listed below.
- `backend/package.json`, `backend/package-lock.json` — backend upgrades, `express-rate-limit`, and Supertest test tooling.
- `README.md`, `docs/database-erd.md`, `docs/phases-1-12-status.md` — current setup, schema, deployment/rate-limit, demo, recovery, and historical verification wording.
- `project-audit/PROJECT_STATUS_AND_HANDOVER.md`, `REQUIREMENTS_TRACEABILITY.md`, `BUGS_AND_BLOCKERS.md`, `NEXT_AGENT_TASKS.md`, `PROJECT_FILE_MAP.md`, `FILE_BY_FILE_AUDIT.md`, `AUDIT_SUMMARY.md`, `CHANGELOG.md` — final audit state and dated run record.

## Dependency changes

Versions are the stable versions returned by npm during this run. Lockfiles were regenerated by npm, never hand-edited.

| Area/package | Old manifest range | New manifest range | Resolved version |
|---|---:|---:|---:|
| Frontend `react` | `^18.3.1` | `^19.3.1` | 19.3.1 |
| Frontend `react-dom` | `^18.3.1` | `^19.3.1` | 19.3.1 |
| Frontend `vite` | `^6.0.5` | `^8.3.5` | 8.3.5 |
| Frontend `@vitejs/plugin-react` | `^4.3.4` | `^6.1.2` | 6.1.2 |
| Frontend `react-router-dom` | `^7.1.1` | `^7.18.4` | 7.18.4 |
| Frontend `recharts` | `^2.15.0` | `^3.10.1` | 3.10.1 |
| Frontend `lucide-react` | `^0.468.0` | `^1.61.0` | 1.61.0 |
| Frontend `axios` | `^1.8.4` | `^1.20.0` | 1.20.0 |
| Backend `express` | `^5.1.0` | `^5.3.0` | 5.3.0 |
| Backend `dotenv` | `^16.4.7` | `^18.0.9` | 18.0.9 |
| Backend `jose` | `^6.2.12` | `^6.2.13` | 6.2.13 |
| Backend `mysql2` | `^3.14.4` | `^3.24.6` | 3.24.6 |
| Backend `bcryptjs` | `^3.0.2` | `^3.0.3` | 3.0.3 |
| Backend `jsonwebtoken` | `^9.0.2` | `^9.0.3` | 9.0.3 |
| Backend `cors` | `^2.8.5` | `^2.8.6` | 2.8.6 |
| Backend `express-rate-limit` | not present | `^8.7.1` | 8.7.1 |
| Backend dev `supertest` | not present | `^7.3.1` | 7.3.1 |

`npm audit fix` was run in both dependency roots; the original `follow-redirects` and `body-parser` advisories are no longer reported.

## Database migration record

- `010_cgpa_precision.sql`: changes existing `users.cgpa` to `DECIMAL(4,2)` so 10.00 is representable, preserving existing values.
- Fresh source schema and migration 001 were aligned to the same type.
- Fresh and upgrade **source-parity checks passed** in `backend/test/contracts.test.js`.
- Fresh schema execution, upgrade execution, and 0/9.99/10.00 MySQL round trips were **not run** because no disposable MySQL instance was positively identified.

## Checks

| Exact command | Result |
|---|---|
| `npm run build` | PASS — Vite 8 production bundle |
| `npm --prefix backend run build` | PASS — Node syntax checks |
| `npm --prefix backend test` | PASS — 11 tests |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm --prefix backend audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm outdated --json` / `npm --prefix backend outdated --json` | PASS — reviewed before upgrades |
| Browser startup/reload smoke | BLOCKED — sandbox listener permission |
| MySQL fresh/upgrade integration | BLOCKED — no identified disposable DB |
| OAuth/deployment/staging | NOT RUN — no credentials/access |

## Findings disposition

- **Fixed:** B-01, B-02, B-03, B-04, B-05 application portion, B-13, B-14, B-15.
- **Reclassified/honest scope:** B-06 password recovery is unavailable and documented; Phase 15 and AI assistant remain outside current scope.
- **Partially addressed:** B-07 now has focused contract tests; full DB integration coverage remains open.
- **Still open/external:** B-11 network boundary, B-12 localStorage token architecture.
- **Blocked:** B-08 original DOCX, B-09 local DB/browser environment, B-10 OAuth/hosted deployment.

## Remaining risks and next steps

Use `NEXT_AGENT_TASKS.md` for the exact disposable-DB, browser, staging, password-recovery, and Phase 15 follow-ups. Do not claim end-to-end readiness until those environment-dependent checks run with sanitized output.

## 26 October 2026 — frontend redesign

### Changed files

- `src/design-system.css` — adds the shared production visual system: warm neutral canvas, paper surfaces, navy ink, teal action color, amber progress accent, reusable spacing/radius/shadow tokens, responsive layouts, visible focus, and reduced-motion rules.
- `src/main.jsx` — loads the shared design system after existing styles so all current routes receive the redesign without changing API contracts.
- `src/components/Navbar.jsx` — adds navigation landmark wiring and expanded/collapsed state semantics for the mobile menu.
- `src/pages/Home.jsx` — adds accessible names to career-role selection controls while preserving role-query navigation.
- `src/pages/Login.jsx`, `src/pages/Signup.jsx` — improves auth surface styling and adds explicit form-control labels/IDs for browser autofill and assistive technology.
- `src/pages/Dashboard.jsx` — keeps all real API interactions intact and changes simulator scenario cards into semantic keyboard-accessible buttons.
- `backend/admin-dashboard/dashboard.css` — visually aligns the protected admin console with the same restrained light workspace system while preserving its existing server-side authorization and data behavior.
- `backend/admin-dashboard/index.html` — updates the admin theme color for the redesigned light surface.

### Design/integration coverage

- Redesigned shared navigation, home marketing/role-selection surface, auth pages, onboarding cards/stepper/forms, student dashboard metrics/tabs/roadmap/simulator/resume/assessment surfaces, and admin workspace styling.
- Kept demo state, OAuth, API calls, dashboard tabs, admin access controls, loading/error/empty states, and real backend data flows unchanged.
- Added mobile/tablet breakpoints and `prefers-reduced-motion` handling; removed particle/glow presentation from the active visual system.

### Checks

| Exact command/procedure | Result |
|---|---|
| `npm run build` | PASS — Vite production build after redesign |
| `npm --prefix backend test` | PASS — 11 tests |
| `npm --prefix backend run build` | PASS — backend syntax checks |
| `git diff --check` | PASS |
| Browser desktop/mobile screenshot inspection | BLOCKED — virtual display unavailable; Xvfb installation was interrupted |
| Backend/MySQL/OAuth integration | Not rerun — redesign preserved existing contracts; prior blockers remain |

No dependency or backend API/schema changes were made for the redesign.

## 2 November 2026 — Phase 15: resume import and analysis history

### Implementation

- `src/services/resumeImport.js` — uses Mozilla PDF.js in the browser to extract text from PDF files and UTF-8 text files. Enforces 5 MB total file size, 1 MB text-file size, 10 PDF pages, 20,000 extracted characters, and a serialized request-size limit. PDF source files are not uploaded; scanned PDFs are unsupported.
- `src/pages/Dashboard.jsx` — adds file import, report naming, a private saved-report list, report detail loading, two-report comparison, deletion confirmation, and retention/privacy copy.
- `src/design-system.css` — styles import controls, history, comparison, and responsive states.
- `src/services/api.js` — adds analysis history list/detail/delete calls and source/report metadata to the analyze request.
- `backend/routes/ai.js` — stores result JSON only, serializes account retention pruning, and scopes every history read/delete to the authenticated user.
- `backend/routes/admin.js` — excludes the private `resume_analyses` table from administrator table browsing.
- `backend/schema.sql`, `backend/migrations/011_resume_analysis_history.sql` — add the user-owned history table with account-delete cascade. Existing databases apply migration 011; fresh installs use the updated source schema.
- `README.md`, `docs/database-erd.md`, `docs/phases-1-12-status.md`, and `project-audit/*` — update phase status, API/schema notes, and this handoff.

### Privacy and retention decisions

- The raw resume text and original file are not stored in database or application logs. Extracted text is sent to the API only for the requested analysis.
- Saved reports contain the role, match result, skill evidence labels, recommendations, report name, source type, and timestamp. Reports remain until manually deleted or pruned beyond the latest 20 per account.
- Reports are owner-scoped and cascade-delete with the user account. No administrator report-browsing route was added.
- The administrator database table browser explicitly hides the reports table. Database operators with direct infrastructure access can still access database contents.

### Verification boundary

- Frontend production build is recorded in the Phase 15 handoff.
- Existing backend contract tests were not changed or rerun after Phase 15; the documented 26 October result is historical.
- Disposable MySQL migration/ownership/retention checks and browser import/comparison checks remain pending. No deployment, provider, production DB, or hosted secret was accessed.

## 2 November 2026 — Phase 16: motion-aware shared background

### Implementation

- `src/components/ParticleBackground.jsx` — honors the browser's reduced-motion preference by drawing a static scene, updates behavior if the preference changes, pauses requestAnimationFrame while the document is hidden, restarts when visible, and marks the decorative canvas hidden from assistive technology and focus.
- Rebuilds particle positions after viewport resize. Retains the existing 38-particle budget and proximity-line algorithm; no new dependency, API, or database state was needed.
- `README.md`, `docs/phases-1-12-status.md`, and `project-audit/*` — update the current phase tracker and handoff.

### Verification boundary

- `npm run build` — PASS on 2 November 2026.
- `git diff --check` — PASS on 2 November 2026.
- `graphify update .` — PASS; updated the project graph to 407 nodes and 682 edges.
- Browser smoke checks for reduced-motion changes, tab visibility, and resize remain pending.

## 2 November 2026 — Phase 17: career path shortlist

### Implementation

- `backend/schema.sql`, `backend/migrations/012_saved_career_roles.sql` — add an account-owned role shortlist keyed by `(user_id, role_id)` with cascade deletion and a role lookup index.
- `backend/routes/student.js` — share the existing required-skill scoring logic across the target-role view and a new authenticated career-path comparison endpoint. Add idempotent owner-scoped save and remove routes.
- `backend/routes/admin.js` — hide `saved_career_roles` from the read-only administrator table browser.
- `src/services/api.js`, `src/components/CareerPathsPanel.jsx`, `src/pages/Dashboard.jsx`, `src/design-system.css` — add the Career Paths tab with per-role skill fit, matched requirement count, top gaps, and a filterable save/remove shortlist.
- `README.md`, `docs/database-erd.md`, `docs/phases-1-12-status.md`, and `project-audit/*` — document the current 18-table source schema, migration 012, endpoints, rollout, and verification boundary.

### Verification boundary

- `npm run build` — PASS on 2 November 2026.
- `npm --prefix backend run build` — PASS on 2 November 2026.
- `git diff --check` — PASS on 2 November 2026.
- SQL-aware Graphify update — PASS; graph now contains 466 nodes and 771 edges.
- Browser path comparison/shortlist checks and disposable MySQL migration/ownership/cascade checks remain pending. No database was modified.
