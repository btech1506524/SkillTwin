# Remaining work and verification tasks

**Updated:** 26 October 2026

Completed implementation tasks from the original list are recorded in `CHANGELOG.md`. The remaining tasks require an identified disposable service, browser permissions, staging access, or a product decision.

## Next safe tasks

1. **Disposable MySQL verification**
   - Positively identify a disposable MySQL 8 instance before connecting.
   - Apply `backend/schema.sql` to a fresh schema and migrations 001–010 to an upgrade fixture.
   - Round-trip CGPA 0, 9.99, and 10.00; run auth, onboarding, readiness, assessment, roadmap, progress, admin ownership, and two-user isolation checks.
   - Record sanitized results only. Never use the ignored configured database unless its identity is explicitly confirmed as disposable.

2. **Permitted browser smoke test**
   - Start Vite/API where loopback binding is permitted.
   - Exercise home role card → signup → onboarding for every supported role, demo edits/reload/logout, responsive keyboard navigation, reduced-motion behavior, and error/loading states.

3. **Staging integration**
   - Confirm Vercel → Render forwarding and set `TRUST_PROXY_HOPS` from the actual proxy chain.
   - Verify ingress and application rate limits, CORS, TLS, `/api/health/live`, `/api/health/ready`, migration state, and graceful shutdown.
   - Configure disposable Google/Microsoft provider apps and test state/nonce/PKCE, cancellation, conflict, linking, expiry, and one-time-code reuse.

4. **Security architecture follow-up**
   - Review the localStorage bearer-token decision and consider an HttpOnly-cookie migration only with a CSRF/session design.
   - Confirm Railway private networking or document the public TCP proxy restrictions and allowlists.

5. **Password recovery decision**
   - Keep the current honest unavailable label until a verified email provider and product scope exist.
   - If approved, add hashed expiring tokens, generic responses, throttling, single-use invalidation, and tests before exposing a recovery UI.

6. **Phase 15 scope decision**
   - Do not add resume upload/history until supported formats, size limits, retention/deletion rules, privacy handling, and ownership requirements are approved.

## Already completed in this run

- Selected home role is validated and carried through signup to onboarding.
- Demo state persists in a dedicated browser key and demo role samples remain coherent.
- OAuth challenge fields are excluded from admin table browsing.
- Application login/registration rate limits and proxy-hop configuration are present.
- ERD and phase status now describe the current 16-table source schema and migrations 001–010.
- CGPA schema/migration mismatch is repaired with forward migration 010.
- Legacy simulator uses required-skill readiness semantics.
- Backend contract tests, frontend/backend builds, audits, and documentation updates are present.
