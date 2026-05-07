# Test Plan

## Scope
Validate milestones 5-8 end-to-end: applications/favorites, messaging, calls, notifications flow, and theme switching.

## Levels
- API integration (FastAPI TestClient).
- WebSocket smoke for chat channel.
- Frontend type/build validation.
- Manual UX smoke (messages/calls/theme toggle).

## Critical Scenarios
1. Auth baseline
- Register candidate/employer.
- Login and fetch `/api/v1/users/me`.

2. Messaging API
- Create chat between candidate and employer.
- Send message to chat.
- Employer sees unread count increment.
- Mark chat as read resets unread count.
- Message history returns in chronological order.

3. Chat WebSocket
- Connect to `/api/v1/ws/chats/{chat_id}?token=...`.
- Send `ping`, receive `pong`.

4. Calls API
- Start call for chat participants.
- Update status (`requested` -> `ended`).
- Verify call appears in both participants call lists.

5. Notifications
- New message creates notification for recipient.
- Call status update creates notification for peer.

6. Frontend integration
- Messages page renders chat list and messages from backend.
- Sending message updates UI and backend state.
- Calls page renders call history and allows status update.

7. Theme switching
- Toggle in header switches between dark/light.
- Selection persists after reload (local storage).
- Light theme variables apply globally and keep readable contrast.

## Validation Commands
From repo root:
- `cd backend && python -m pytest -q`
- `cd frontend && npm ci`
- `cd frontend && npm run build`

## Exit Gates
- Backend tests pass including new messaging/calls tests.
- WebSocket smoke passes in test client.
- Frontend build passes.
- Manual smoke confirms:
  - chat send/read lifecycle;
  - call start/end lifecycle;
  - dark/light theme switch and persistence.
