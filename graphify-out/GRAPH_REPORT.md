# Graph Report - SkillTwin  (2026-11-02)

## Corpus Check
- 77 files · ~51,902 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: .css 4, (none) 2, .example 1)

## Summary
- 496 nodes · 815 edges · 40 communities (31 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6afd779e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.jsx
- package.json
- backend/package.json
- oauth.js
- ai.js
- dashboard.js
- SkillTwin improvement run changelog
- SkillTwin AI
- server.js
- contracts.test.js
- services
- admin.js
- db.js
- SkillTwin project phase status (phases 1 to 19)
- SkillTwin project status and handover
- Phase 19 handoff — persistent dark mode
- File-by-file audit — final state
- SkillTwin Phase 15 handoff
- SkillTwin project file map
- AUDIT_SUMMARY.md
- ai.js
- authMiddleware.js
- Remaining work and verification tasks
- vercel.json
- AGENTS.md
- SkillTwin Phase 16 handoff
- roadmap.js
- schema.sql
- Phase 18 handoff — official roadmap references
- 002_assessments.sql
- migrate_student_readiness_columns
- 009_role_based_skill_catalog.sql
- SkillTwin audit summary
- SkillTwin findings and blockers
- SkillTwin Phase 17 handoff

## God Nodes (most connected - your core abstractions)
1. `react` - 19 edges
2. `users` - 18 edges
3. `useAuth()` - 18 edges
4. `SkillTwin improvement run changelog` - 14 edges
5. `Dashboard()` - 13 edges
6. `react-router-dom` - 12 edges
7. `App()` - 12 edges
8. `protectedRequest()` - 11 edges
9. `lucide-react` - 11 edges
10. `Project progress` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Requirements traceability` --references--> `CareerPathsPanel()`  [INFERRED]
  project-audit/REQUIREMENTS_TRACEABILITY.md → src/components/CareerPathsPanel.jsx
- `assessment_results` --references--> `users`  [EXTRACTED]
  backend/migrations/002_assessments.sql → backend/schema.sql
- `admin_audit_log` --references--> `users`  [EXTRACTED]
  backend/migrations/006_admin_audit_log.sql → backend/schema.sql
- `oauth_identities` --references--> `users`  [EXTRACTED]
  backend/migrations/007_oauth_login.sql → backend/schema.sql
- `oauth_login_attempts` --references--> `users`  [EXTRACTED]
  backend/migrations/007_oauth_login.sql → backend/schema.sql

## Import Cycles
- None detected.

## Communities (40 total, 9 thin omitted)

### Community 0 - "App.jsx"
Cohesion: 0.08
Nodes (51): lucide-react, react, react-router-dom, App(), BackendAdminRedirect(), OnboardingRoute(), ProtectedRoute(), AnimatedSection() (+43 more)

### Community 1 - "package.json"
Cohesion: 0.07
Nodes (32): dependencies, axios@^1.20.0, lucide-react@^1.61.0, pdfjs-dist@^6.5.438, react@^19.3.1, react-dom@^19.3.1, react-router-dom@^7.18.4, recharts@^3.10.1 (+24 more)

### Community 2 - "backend/package.json"
Cohesion: 0.07
Nodes (34): dependencies, bcryptjs@^3.0.3, cors@^2.8.6, dotenv@^18.0.9, express-rate-limit@^8.7.1, jose@^6.2.13, jsonwebtoken@^9.0.3, mysql2@^3.24.6 (+26 more)

### Community 3 - "oauth.js"
Cohesion: 0.12
Nodes (25): authorizationEndpoint(), backendUrl(), bcrypt, callbackUrl(), configuredOrigins(), crypto, digest(), exchangeProviderCode() (+17 more)

### Community 4 - "ai.js"
Cohesion: 0.27
Nodes (10): calculateReadiness(), levelScores, scoreForLevel(), express, getCareerPathSummaries(), getCareerReadiness(), importanceScores, refreshAndPersistReadiness() (+2 more)

### Community 5 - "dashboard.js"
Cohesion: 0.21
Nodes (26): activityMarkup(), activityText(), api(), changeRole(), dateKey(), distributionMarkup(), drawTableRows(), drawUsers() (+18 more)

### Community 6 - "SkillTwin improvement run changelog"
Cohesion: 0.06
Nodes (32): 26 October 2026 — frontend redesign, 2 November 2026 — Phase 15: resume import and analysis history, 2 November 2026 — Phase 16: motion-aware shared background, 2 November 2026 — Phase 17: career path shortlist, 2 November 2026 — Phase 18: in-app role roadmaps, 2 November 2026 — Phase 19: persistent dark mode, Backend behavior and security, Changed files (+24 more)

### Community 7 - "SkillTwin AI"
Cohesion: 0.09
Nodes (23): Admin console, API overview, Demo access, Google and Microsoft sign-in, Phase 10 — Assessments (implemented), Phase 11 — Personalized learning roadmap (implemented), Phase 12 — Progress tracking (implemented), Phase 13 — Role-aware resume evidence analysis (implemented) (+15 more)

### Community 8 - "server.js"
Cohesion: 0.12
Nodes (13): adminDashboard, allowedOrigins, authRateLimitMessage, cors, express, isLocalDevelopmentOrigin(), loginRateLimiter, origin() (+5 more)

### Community 9 - "contracts.test.js"
Cohesion: 0.13
Nodes (7): app, assert, fs, jwt, { mock, test }, path, request

### Community 10 - "services"
Cohesion: 0.14
Nodes (13): generateValue, key, sync, value, services, buildCommand, envVars, healthCheckPath (+5 more)

### Community 11 - "admin.js"
Cohesion: 0.17
Nodes (4): isHiddenAdminColumn(), express, hiddenAdminTables, router

### Community 12 - "db.js"
Cohesion: 0.22
Nodes (4): db, mysql, path, path

### Community 13 - "SkillTwin project phase status (phases 1 to 19)"
Cohesion: 0.22
Nodes (7): Relationship notes, SkillTwin database ER diagram, Agreed scope for this implementation, Historical local verification snapshot — 14 October 2026, Maintenance note, Phase tracker, SkillTwin project phase status (phases 1 to 19)

### Community 14 - "SkillTwin project status and handover"
Cohesion: 0.18
Nodes (11): Architecture and source state, Latest phase — Phase 15, Latest phase — Phase 16, Latest phase — Phase 17, Latest phase — Phase 18, Latest phase — Phase 19, Outcome, Remaining risk (+3 more)

### Community 15 - "Phase 19 handoff — persistent dark mode"
Cohesion: 0.40
Nodes (4): Delivered, Files, Phase 19 handoff — persistent dark mode, Verification

### Community 16 - "File-by-file audit — final state"
Cohesion: 0.33
Nodes (5): Application source, Backend source, Database, configuration, and docs, Dependency review, File-by-file audit — final state

### Community 17 - "SkillTwin Phase 15 handoff"
Cohesion: 0.29
Nodes (6): Database rollout, Delivered, Files and API, Product/privacy boundary, SkillTwin Phase 15 handoff, Verification status and next steps

### Community 18 - "SkillTwin project file map"
Cohesion: 0.33
Nodes (5): Database and deployment, Important source connections, Runtime architecture, Safety boundaries, SkillTwin project file map

### Community 20 - "ai.js"
Cohesion: 0.29
Nodes (5): escapeRegex(), express, findResumeEvidence(), resumeSkillAliases, router

### Community 21 - "authMiddleware.js"
Cohesion: 0.22
Nodes (5): jwt, express@^5.3.0, express, router, express

### Community 22 - "Remaining work and verification tasks"
Cohesion: 0.50
Nodes (3): Already completed in this run, Next safe tasks, Remaining work and verification tasks

### Community 23 - "vercel.json"
Cohesion: 0.50
Nodes (3): headers, rewrites, $schema

### Community 26 - "SkillTwin Phase 16 handoff"
Cohesion: 0.50
Nodes (3): Delivered, SkillTwin Phase 16 handoff, Verification boundary

### Community 27 - "roadmap.js"
Cohesion: 0.25
Nodes (6): express, generateRoadmap(), getRoleGaps(), importanceScores, levelScores, router

### Community 28 - "schema.sql"
Cohesion: 0.12
Nodes (25): roadmap_milestones, admin_audit_log, oauth_identities, oauth_login_attempts, oauth_login_codes, resume_analyses, saved_career_roles, admin_audit_log (+17 more)

### Community 29 - "Phase 18 handoff — official roadmap references"
Cohesion: 0.40
Nodes (4): Delivered, Files, Phase 18 handoff — in-app role roadmaps, Verification

### Community 30 - "002_assessments.sql"
Cohesion: 0.80
Nodes (4): assessment_questions, assessment_result_answers, assessment_results, assessments

### Community 37 - "SkillTwin audit summary"
Cohesion: 0.50
Nodes (4): Current open work, Outcome, SkillTwin audit summary, Verification

### Community 38 - "SkillTwin findings and blockers"
Cohesion: 0.50
Nodes (4): Additional scope decisions, Confirmed findings, SkillTwin findings and blockers, Verification limits

### Community 39 - "SkillTwin Phase 17 handoff"
Cohesion: 0.50
Nodes (3): Delivered, Rollout and verification, SkillTwin Phase 17 handoff

## Knowledge Gaps
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Requirements traceability` connect `AUDIT_SUMMARY.md` to `App.jsx`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07789473684210527 - nodes in this community are weakly interconnected._
- **Why does `CareerPathsPanel()` connect `App.jsx` to `AUDIT_SUMMARY.md`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07058823529411765 - nodes in this community are weakly interconnected._
- **Why does `SkillTwin improvement run changelog` connect `SkillTwin improvement run changelog` to `AUDIT_SUMMARY.md`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Should `backend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06756756756756757 - nodes in this community are weakly interconnected._
- **Should `oauth.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1206896551724138 - nodes in this community are weakly interconnected._