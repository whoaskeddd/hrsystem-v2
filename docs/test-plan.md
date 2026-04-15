# Test Plan

## Scope
Validate backend milestones 1-5 and frontend-backend integration, explicitly excluding messaging logic implementation.

## Levels
- Unit-light: core helpers (auth/password/token).
- API integration: main REST endpoints via FastAPI TestClient.
- Container smoke: `docker compose up` for postgres + backend + frontend.

## Critical Scenarios
1. Auth flow
- Register candidate/employer.
- Login returns access/refresh tokens.
- `GET /api/v1/users/me` works with bearer token.
- Refresh token rotation works.

2. Profiles and company
- Candidate/employer profile read/update.
- Company create/get/update/verify with role checks.

3. Vacancies and resumes
- CRUD operations and ownership checks.
- Vacancy publish/archive transitions.
- Resume visibility and list filters.

4. Applications and favorites
- Apply/unapply lifecycle.
- Update application status by employer/admin.
- Add/remove/list favorites for vacancies/resumes.

5. Notifications/admin (baseline)
- Notification list/read/read-all.
- Admin list users and block/unblock.

6. Frontend integration smoke
- Login/register/password reset forms hit backend.
- Candidate/employer profile pages save via backend.
- Listings pages render API-backed data without runtime errors.

## Validation Commands
From repo root:
- `python3 -m compileall backend/app`
- `cd backend && pytest -q`
- `docker compose config`
- `docker compose up --build -d`
- `docker compose ps`

## Exit Gates
- All validation commands succeed.
- Backend starts and serves `GET /healthz`.
- Frontend starts and loads with backend API configured.
- No implementation for chat/messenger logic is introduced.
