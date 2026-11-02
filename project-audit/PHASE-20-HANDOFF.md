# Phase 20 handoff — public role roadmap catalogue

**Date:** 2 November 2026
**Status:** Implemented in source; production build passed; browser and MySQL checks pending
**Scope:** Public roadmaps and expanded supported career roles

## Delivered

- Added the public `/roadmaps` page. Visitors can browse all 14 role guides without signing in; the page is linked from the home hero and shared navigation.
- Added shareable role selection in the query string, a visual role catalogue, and a sequenced 12-week plan with outcomes and focus areas for each role.
- Roadmap topic labels use the same skill names as the database catalogue; all 14 roles receive shared technical foundations and optional soft skills alongside their specific requirements.
- Kept the authenticated personalized milestone roadmap and saved profile progress separate from public role-guide selection.
- Expanded the database career catalog from six source-schema roles to 14 with skill definitions and role requirements. Existing installations apply migration `013_expanded_career_catalog.sql`; fresh installs receive the corresponding seed data from `backend/schema.sql`.
- Migration 013 adds no tables and uses upserts so role, skill, and mapping inserts can be retried safely.
- The migration gives every role the shared technical foundation and optional soft-skill mappings used by the career profile. Role-specific guide tags are present in the shared skill catalog.

## Files

- `src/pages/RoleRoadmaps.jsx`, `src/data/roleRoadmaps.js`, `src/components/RoleRoadmapExplorer.jsx`
- `src/pages/Home.jsx`, `src/components/Navbar.jsx`, `src/App.jsx`, `src/design-system.css`
- `backend/migrations/013_expanded_career_catalog.sql`, `backend/schema.sql`
- README, ERD, phase tracker, and project-audit handoff documents

## Verification

| Check | Result |
|---|---|
| `npm run build` | PASS; Vite production bundle built |
| `npm --prefix backend run build` | PASS; backend JavaScript syntax checks |
| `git diff --check` | PASS on 2 November 2026 |
| `graphify update .` | PASS; graph refreshed to 510 nodes and 846 edges. The extractor reported no symbols for migration 013, so its role/skill joins were cross-checked separately. |
| Static role/skill consistency check | PASS; 14 unique roadmap roles match the fresh-schema role names, all 73 guide skill labels exist in the source skill catalog, and all 65 role-specific migration mappings resolve to defined skills. |
| Public route and role switching in browser | Not run |
| Fresh/upgrade MySQL role parity | Not run; apply schema or migration 013 to a confirmed disposable database |
