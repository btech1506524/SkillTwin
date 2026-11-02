# SkillTwin Phase 15 handoff

**Updated:** 2 November 2026
**Status:** Implemented in source; database and browser integration still need verification.

## Delivered

Phase 15 adds private resume import and analysis history to the existing deterministic role-fit analyzer.

- `.txt` files are decoded as UTF-8 in the browser. PDF.js extracts text from text-based PDFs in the browser.
- Limits: `.txt` up to 1 MB; PDF up to 5 MB and 10 pages; extracted text up to 20,000 characters. Scanned-image PDFs and OCR are unsupported.
- The original file is never uploaded. Extracted text is sent to the API for the analysis request, then discarded; neither file nor resume text is written to database or application logs.
- The database stores the report name, role, source type, timestamp, and deterministic result JSON only. The browser does not send the imported file name.
- Each account retains at most 20 reports. The oldest are removed after a new report is saved. Users can view, compare, and delete only their own reports. Deleting an account cascades to its report rows.
- The `resume_analyses` table is excluded from the administrator's database table browser.
- History is retained until the user deletes it or reaches the 20-report cap; no time-based purge is configured.

## Files and API

- `src/services/resumeImport.js` — local `.txt`/PDF extraction and input limits.
- `src/pages/Dashboard.jsx`, `src/design-system.css` — import, account-private history, report comparison, and deletion UI.
- `src/services/api.js` — analysis-history client methods.
- `backend/routes/ai.js` — result persistence, 20-report pruning, and owner-filtered read/delete routes.
- `backend/schema.sql`, `backend/migrations/011_resume_analysis_history.sql` — fresh/upgrade schema.
- `README.md`, `docs/database-erd.md`, `docs/phases-1-12-status.md` — updated setup and phase documentation.

Endpoints:

- `POST /api/ai/analyze-resume` — analyze and save one report.
- `GET /api/ai/resume-analyses` — list the current user's latest reports.
- `GET /api/ai/resume-analyses/:analysisId` — read one owned report.
- `DELETE /api/ai/resume-analyses/:analysisId` — remove one owned report.

## Database rollout

For an existing installation, select the SkillTwin schema and apply `backend/migrations/011_resume_analysis_history.sql` once. Fresh databases created from `backend/schema.sql` already include the table. The migration is `CREATE TABLE IF NOT EXISTS` and does not alter existing student rows.

## Verification status and next steps

- `npm run build` — PASS on 2 November 2026.
- `npm --prefix backend run build` — PASS on 2 November 2026.
- `git diff --check` — PASS after cleanup.
- Backend contract tests were not rerun after Phase 15; the 26 October pass is historical.
- Source implementation is complete; live integration remains pending.
- Apply migration 011 to a positively identified disposable MySQL 8 schema. Verify create/list/detail/delete, account ownership isolation, account deletion cascade, and retention at 20 reports.
- In a permitted browser, verify text and PDF imports, unsupported/scanned PDFs, file/page/character limits, saved report comparison, deletion, keyboard focus, and small-screen layout.
- Do not claim hosted or production integration until the migration and API behavior have been checked in staging.

## Product/privacy boundary

This phase stores analysis reports, which can still reveal a student's role interests and inferred resume coverage. Reports are private to the account in the student app, hidden from the administrator's table browser, and deletable. They have no expiration beyond the 20-item rolling cap. Database operators can access persisted database content under their infrastructure permissions. Changing this policy requires updating the README, UI copy, and retention implementation together.
