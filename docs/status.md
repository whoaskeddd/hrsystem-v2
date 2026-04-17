# Status

## Current Phase
[~] Finalization pass after implementing milestones 5-8 and UI theming switch.

## Done
- [x] Completed backend milestone 5 (applications/favorites) and kept role-safe access checks.
- [x] Implemented backend milestone 6 (messaging):
  - `/api/v1/chats`
  - `/api/v1/chats/{chat_id}`
  - `/api/v1/chats/{chat_id}/messages`
  - `/api/v1/chats/{chat_id}/read`
  - WebSocket channel `/api/v1/ws/chats/{chat_id}`
- [x] Implemented backend milestone 7 (calls):
  - `/api/v1/calls`
  - `/api/v1/calls/{call_id}`
  - `/api/v1/calls/{call_id}/status`
- [x] Extended seed with baseline chat/message/call demo entities.
- [x] Added Alembic migration `0002_messaging_calls.py`.
- [x] Integrated frontend app context with backend chats/calls and new actions:
  - load messages
  - send message
  - mark chat as read
  - start call
  - patch call status
- [x] Rebuilt `messages` and `calls` pages on top of real API data.
- [x] Added dark/light theme switching with persistent state in local storage.
- [x] Added premium light theme palette and variable-driven shadows/background.
- [x] Updated plan checkpoints in `plan.md` for backend milestones 5-8.

## In Progress
- [ ] Validation in this environment is partially blocked by runtime tooling issues.

## Next
1. Run backend tests in an environment with a working Python runtime.
2. Run frontend build after `npm ci` succeeds (currently blocked by local npm runtime issue).
3. Do a quick manual smoke: auth -> chat -> send/read message -> call start/end -> theme toggle.

## Key Decisions
- Messaging/calls are implemented as REST + WebSocket increment, preserving existing auth model.
- Theme switching is global (`data-theme` on `documentElement`) to avoid component-level styling drift.
- Light theme keeps premium direction (ivory/champagne/gold) while preserving design tokens.

## Assumptions
- Existing pages should remain compatible with expanded context types.
- Polling every 10 seconds on messages page is acceptable as frontend realtime fallback.

## Blockers
- Python runtime unavailable in this shell (`python` command points to Windows Store stub).
- `npm ci` currently fails in this environment with npm internal error before dependency install.

## Audit Log
- 2026-04-17: implemented milestones 6-8 backend + frontend chat/calls integration + theme switch.
