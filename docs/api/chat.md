# Chat and Calls API

## Разделы

- чаты
- сообщения
- звонки
- realtime-каналы

## Эндпоинты чатов

- `GET /chats`
- `POST /chats`
- `GET /chats/{chat_id}`
- `GET /chats/{chat_id}/messages`
- `POST /chats/{chat_id}/messages`
- `POST /chats/{chat_id}/read`

## Эндпоинты звонков

- `GET /calls`
- `POST /calls`
- `GET /calls/{call_id}`
- `PATCH /calls/{call_id}/status`

## Дополнительно

- WebSocket signaling для звонков не описывается полностью в OpenAPI
- рекомендуется выделить отдельный канал `/ws/calls/{call_id}`
- для чатов также желательно ввести realtime-канал для новых сообщений и read-state

## Что важно для реализации

- сохранить единый `chat_id` как контекст для сообщений и звонков
- предусмотреть message status: `sent`, `delivered`, `read`
- определить правила хранения истории звонков и итогов интервью
