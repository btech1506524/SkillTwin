# SkillTwin project status and handover

- **Updated:** 2 November 2026
- **Repository:** `/home/sanjivani/Projects/SkillTwin`
- **Starting state:** clean `main` at `48aea94`, synchronized with `origin/main` before Phase 15 edits; current Phase 15–19 changes are uncommitted
- **Scope:** source fixes, dependency modernization, schema/documentation reconciliation, frontend/admin visual redesign, Phases 15–19, and whole-project Graphify indexing; no deployment or production access.

## Latest phase — Phase 19

The frontend now has a global light/dark theme toggle that persists the selection in browser storage. See [`PHASE-19-HANDOFF.md`](PHASE-19-HANDOFF.md) for implementation and verification details.

## Latest phase — Phase 18

The Learning Roadmap tab now includes original SkillTwin learning paths for all six configured roles. Students can preview another role without changing their current target role or saved personalized milestones. The role curriculum stays in the app and requires no backend or database change. See [`PHASE-18-HANDOFF.md`](PHASE-18-HANDOFF.md) for implementation details.

## Latest phase — Phase 17

Students can compare all configured career roles against their saved self-ratings and save/remove paths from a private shortlist. The dashboard displays required-skill fit, requirements met, and leading gaps without changing the current target role or profile. The account-owned `saved_career_roles` table is in migration 012 and is hidden from the admin table browser. See [`PHASE-17-HANDOFF.md`](PHASE-17-HANDOFF.md) for rollout and remaining verification.

## Latest phase — Phase 16

The shared decorative particle background now draws a still scene when the browser requests reduced motion, pauses its animation while the tab is hidden, and resumes when visible. The canvas is marked hidden from assistive technology. See [`PHASE-16-HANDOFF.md`](PHASE-16-HANDOFF.md) for behavior and verification status.

## Latest phase — Phase 15

Phase 15 is implemented in source. The dashboard reads `.txt` and text-based PDF files locally in the browser, submits extracted text for deterministic analysis, and saves only the report result and user-selected metadata. Files and extracted text are not persisted. Each user keeps at most 20 reports and can view, compare, and delete their own history. See [`PHASE-15-HANDOFF.md`](PHASE-15-HANDOFF.md) for limits, schema rollout, and remaining verification.

The current source schema has 18 tables. Existing installations apply migrations 001–012 in order; fresh installs use `backend/schema.sql`.

## Outcome

The audit’s locally actionable defects are repaired. Home career selections now survive signup into validated onboarding. Demo state is browser-persistent under a separate key and role-specific samples keep labels, skills, scores, and roadmaps coherent. Admin table browsing hides OAuth challenge material. The legacy simulator uses required skills and shared capped readiness math. CGPA storage now supports the documented 0–10 range through fresh schema and migration 010. Application auth rate limits are present with explicit proxy-hop configuration. Login copy no longer promises unavailable password recovery.

The root and backend dependency trees were upgraded on 26 October 2026; both production audit commands reported zero vulnerabilities at that point. PDF.js was added to the root tree on 2 November for Phase 15, so the root audit needs rerunning before release.

The frontend now uses a shared light workspace design system in `src/design-system.css`, with responsive and reduced-motion rules across student routes. The backend-served admin console was visually aligned through `backend/admin-dashboard/dashboard.css`. The admin database browser excludes private resume analysis and career shortlist tables.

## Architecture and source state

- React 19/Vite 8 frontend in `src/`; Express 5/MySQL API in `backend/`.
- `backend/schema.sql` contains the current 18-table source shape, including OAuth, resume-analysis history, and saved career paths. Existing installations apply migrations 001–012 in order; no migration runner or `schema_migrations` table exists.
- Readiness is deterministic and required-skill-only; current scores are capped at each target before the ratio is calculated.
- Resume analysis remains deterministic keyword evidence. Imported files are read in the browser; extracted text is request-only and not stored. Analysis results are stored privately per user under Phase 15.
- Admin access is JWT plus a live database role check. Table browsing is read-only and denylisted by column name.
- Resume-analysis history is excluded from the admin table browser; only its owner-scoped API can list, read, or delete reports.
- Career shortlists are unique per account/role, cascade on account or role deletion, and are available only through the owner's student API.
- The API applies 10/15-minute login and 5/15-minute registration IP limits per instance. `TRUST_PROXY_HOPS` must match the real trusted proxy chain; ingress limits remain required for multiple instances.

## Reports and source evidence

- [Requirements traceability](REQUIREMENTS_TRACEABILITY.md) — current requirement status and remaining evidence.
- [Findings and blockers](BUGS_AND_BLOCKERS.md) — fixed/open/reclassified/blocked register.
- [Remaining tasks](NEXT_AGENT_TASKS.md) — disposable DB, browser, staging, and product-decision work.
- [File map](PROJECT_FILE_MAP.md) and [file audit](FILE_BY_FILE_AUDIT.md) — current architecture and changed-file evidence.
- [Audit summary](AUDIT_SUMMARY.md) — concise handover.
- [Run changelog](CHANGELOG.md) — dated complete change/check record.
- [Database ERD](../docs/database-erd.md) and [phase status](../docs/phases-1-12-status.md) — reconciled source documentation.

## Verification record

| Command | Result | Boundary |
|---|---|---|
| `npm run build` | PASS on 2 November 2026 | Frontend production bundle including in-app role roadmaps and the theme toggle. |
| `npm --prefix backend run build` | PASS on 2 November 2026 | Backend JavaScript syntax checks. |
| `npm --prefix backend test` | PASS on 26 October 2026; not rerun after Phase 17 | 11 native contract tests; no live DB. |
| `git diff --check` | PASS on 2 November 2026 | Clean after Phase 19 changes. |
| `PYTHONPATH=/home/sanjivani/.local/lib/python3.14/site-packages graphify update .` | PASS on 2 November 2026 | SQL-aware graph contains 496 nodes and 815 edges. |
| `npm audit --omit=dev` | PASS on 26 October 2026; not rerun after PDF.js addition | Root runtime dependency tree. |
| `npm --prefix backend audit --omit=dev` | PASS on 26 October 2026 | Backend runtime dependency tree. |
| Browser desktop/mobile inspection | NOT RUN after Phase 19 | Role switching, theme persistence, and responsive theme surfaces need a permitted browser check. |
| Local API/browser startup | BLOCKED in prior audit | Sandbox loopback bind permission not available in audit evidence. |
| MySQL fresh/upgrade and feature flows | PENDING | Apply migrations through 012 to a positively identified disposable database; verify resume history and career shortlist ownership, uniqueness, and cascades. |
| OAuth/deployment/ingress staging | NOT RUN | Credentials and hosted access unavailable. |

## Remaining risk

Live MySQL round trips, browser visual/accessibility smoke, OAuth provider behavior, hosted TLS/CORS/rate-limit topology, and Railway network controls remain unverified. LocalStorage bearer tokens remain a conditional XSS exposure. The original planning DOCX remains unavailable.
