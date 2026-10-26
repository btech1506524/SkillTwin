# SkillTwin project phases 1 to 12

Status reviewed on 26 October 2026 against the repository source and audit evidence. The database-backed checks below are historical evidence from 14 October 2026 and were not rerun in the current sandbox. “Complete” means implemented and checked in the cited environment; it does not claim a production deployment.

## Agreed scope for this implementation

SkillTwin helps CSE students compare self-reported skills with configured career-role requirements, understand gaps and a readiness estimate, and follow learning milestones. The supporting features in scope through phase 12 are server-graded assessments and persisted progress tracking. Readiness is a deterministic estimate, not a hiring or placement prediction. Resume matching and career scenarios are deterministic helpers and do not call an external language model.

The primary acceptance journey is:

1. Register or sign in and retrieve the authenticated profile.
2. View the role skill requirements, add or update self-reported scores, and retrieve the saved values.
3. Change the target role and retrieve role-specific gaps and readiness.
4. Generate or load the role-specific roadmap, update a milestone, and see the saved progress.
5. Open an assessment, answer all questions, receive the server-calculated result, and retrieve it from history.

## Phase tracker

| Phase | Status | Evidence and remaining boundary |
| --- | --- | --- |
| 1. Requirements and planning | Complete | Scope, user journey, limitations, acceptance journey, and milestone tracker are recorded here and in the supplied project documentation. |
| 2. UI/UX and frontend foundation | Complete | React/Vite routes, shared navigation, reusable UI, and centralized API client build. Local demo navigation through dashboard tabs was inspected in the browser. |
| 3. Database and schema | Complete in source; runtime pending | `backend/schema.sql` defines the current 16-table shape. Existing installations use forward migrations 001–010, including OAuth tables in 007, onboarding in 008, role catalog in 009, and CGPA precision in 010. The current ER diagram is in [`database-erd.md`](database-erd.md); actual deployed table state still needs a disposable-database inspection. |
| 4. Backend foundation | Complete | Express health endpoint reports the API and MySQL connection ready locally. Local development CORS and startup ports are configured. |
| 5. Authentication and protected profile | Complete | Registration, password login, JWT protected profile retrieval, and rejection of missing/invalid JWTs passed against local MySQL. Profile responses include stored profile fields. |
| 6. Student profile and skills | Complete | New accounts start with no fabricated skill ratings. Skill scores can be saved by `skill_id` or catalogue name, read back, and validated to the documented ranges. |
| 7. Target career role | Complete | Role selection persists in `users.target_role`; the role read endpoint uses that source of truth. A changed role is reflected in the subsequent readiness and roadmap reads. |
| 8. Skill-gap analysis | Complete | The endpoint reports missing and below-target required skills with current/required values, gap, importance, and priority. Empty-profile behavior was checked. |
| 9. Career readiness | Complete | The documented bounded formula is implemented and checked with a known input against the local database. Readiness is recalculated after skill saves. |
| 10. Assessments | Complete | The catalogue and questions load, answer keys stay hidden before submission, and the server grades and stores attempts for the authenticated user. History and result details were checked. |
| 11. Personalised roadmap | Complete | Roadmaps are generated from role gaps and persisted. Concurrent initial reads reuse the same current roadmap instead of creating duplicate snapshots. |
| 12. Progress tracking | Complete | Milestone status and completion timestamps persist; aggregate progress reflects the saved status. Readiness refreshes after a skill update. |

## Historical local verification snapshot — 14 October 2026

- Frontend production build: passed.
- Backend JavaScript source checks: passed.
- Browser smoke check: local home page opened the demo dashboard; roadmap, assessment, and simulator tabs rendered. Assessment submission requires a signed-in account.
- Database-backed integration check: used temporary accounts to exercise registration/login, profile, skill save/read and validation, target-role change, gap/readiness, concurrent roadmap loading, progress updates, assessment grading/history, and cross-user access denial. Temporary accounts and dependent rows were deleted afterward.
- Local database before the check: 13 tables, 16 skills, 6 roles, 49 role-skill requirements, 1 assessment with 10 questions, 2 users, 9 existing user-skill records, 5 roadmaps, and 12 roadmap milestones. Test records were cleaned up; existing data was preserved. This count predates migrations 007–010 and is not the current source-schema count.

## Maintenance note

Use this tracker for historical phase evidence and the source-level status above. The supplied DOCX contains the original planning snapshot dated 13 October 2026 and remains unavailable in this repository. Current audit findings and blockers are tracked in [`project-audit/PROJECT_STATUS_AND_HANDOVER.md`](../project-audit/PROJECT_STATUS_AND_HANDOVER.md).
