# Status

## Current Phase
[x] Backend milestones 1-5 implemented, stopped before messaging logic.

## Done
- [x] Reviewed repository context (`plan.md`, `AGENT.md`, `docs/api/*`, frontend structure).
- [x] Built backend architecture: FastAPI + SQLAlchemy + Alembic + JWT + RBAC + shared API errors.
- [x] Implemented milestones 1-5 API modules:
  - Auth (`/auth/*`), user/profile/company (`/users/me`, `/candidate/profile`, `/employer/profile`, `/companies/*`)
  - Vacancies and resumes CRUD (`/vacancies*`, `/resumes*`)
  - Applications and favorites (`/applications*`, `/favorites/*`)
  - Notifications + baseline admin endpoints (`/notifications*`, `/admin/*`)
- [x] Added explicit stop-point for messaging/calls backend logic (`/api/v1/chats`, `/api/v1/calls` -> 501).
- [x] Added migrations and seed data for initial demo users/content.
- [x] Added backend Docker image and updated full stack `docker-compose` (postgres + backend + frontend).
- [x] Integrated frontend with backend for auth/profile/data hydration while preserving current UI flow.
- [x] Verified in containers:
  - frontend build succeeds (`npm run build`)
  - backend tests pass (`PYTHONPATH=/app pytest -q`)
  - backend API responds via in-container smoke calls.

## In Progress
- [ ] None.

## Next
1. Implement Milestone 6 messaging logic (chat models/messages/websocket realtime).
2. Extend frontend messages/calls pages from local state to API/WebSocket.
3. Expand automated test coverage for role matrix and filters.

## Key Decisions
- Messaging and call logic intentionally not implemented, per request stop point.
- Frontend now uses backend for auth and profile updates; list data hydrates from API with local fallback.
- Docker Postgres host mapping changed to `5433:5432` to avoid local port conflict.

## Assumptions
- Existing frontend pages should keep working during progressive backend integration.
- Contract can be extended in next phase for full messaging websocket payloads.

## Blockers
- None.

## Audit Log
- 2026-04-15: completed backend + docker integration up to pre-messaging boundary.
