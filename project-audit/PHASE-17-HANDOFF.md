# SkillTwin Phase 17 handoff

**Updated:** 2 November 2026
**Status:** Implemented in source; migration and browser integration still need verification.

## Delivered

Students can compare every configured career role against their saved self-ratings, see a deterministic skill-fit estimate and the three highest-priority gaps, and keep a private shortlist. The feature does not change their current target role or skill profile. Demo mode links to sign-in because the shortlist is account-owned.

- `backend/migrations/012_saved_career_roles.sql` adds a unique `(user_id, role_id)` table with cascading account and role deletion. Fresh installs receive the same table from `backend/schema.sql`.
- `backend/routes/student.js` adds authenticated career comparison and shortlist save/remove routes. Reads and writes use the JWT-derived account id; duplicate saves are idempotent.
- `backend/routes/admin.js` hides shortlist rows from the administrator's database table browser.
- `src/services/api.js` and `src/components/CareerPathsPanel.jsx` load, compare, save, filter, and remove paths. The new dashboard tab displays the current target and each path's fit and gaps.
- `docs/database-erd.md`, `README.md`, and the phase/audit documents describe migration 012 and the new feature.

Endpoints:

- `GET /api/student/career-paths`
- `POST /api/student/saved-career-roles` with `{ "roleId": 1 }`
- `DELETE /api/student/saved-career-roles/:roleId`

Shortlist entries remain until a student removes them or the account/role is deleted. No time-based retention is configured.

## Rollout and verification

- Existing installations apply `backend/migrations/012_saved_career_roles.sql` after migrations 001–011. Fresh installs use `backend/schema.sql`.
- `npm run build` — PASS on 2 November 2026.
- `npm --prefix backend run build` — PASS on 2 November 2026.
- `git diff --check` — PASS on 2 November 2026.
- SQL-aware `graphify update .` — PASS; Graphify now contains 466 nodes and 771 edges.
- Disposable MySQL checks for duplicate saves, cross-account isolation, account cascade, and comparison scoring remain pending.
- Browser checks for role comparison, shortlist filtering/save/remove, demo sign-in prompt, keyboard use, and mobile layout remain pending.
- The migration adds a new table only. Dropping it during rollback deletes saved shortlist entries; it does not alter existing profile, skill, or roadmap rows.
