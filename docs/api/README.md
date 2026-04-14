# API Docs

Папка `docs/api` содержит базовый контракт API для HR Platform и человекочитаемую документацию по разделам.

## Что лежит в папке

- [openapi.json](/C:/develop/hrsystem-v2/docs/api/openapi.json) — единый OpenAPI-контракт для backend на FastAPI
- [auth.md](/C:/develop/hrsystem-v2/docs/api/auth.md) — авторизация, refresh и восстановление пароля
- [users.md](/C:/develop/hrsystem-v2/docs/api/users.md) — пользователи, профили и компании
- [vacancies.md](/C:/develop/hrsystem-v2/docs/api/vacancies.md) — вакансии, отклики и избранное
- [resumes.md](/C:/develop/hrsystem-v2/docs/api/resumes.md) — резюме и сценарии соискателя
- [chat.md](/C:/develop/hrsystem-v2/docs/api/chat.md) — чаты, сообщения, звонки и realtime-заметки
- [admin.md](/C:/develop/hrsystem-v2/docs/api/admin.md) — модерация, жалобы и логи

## Базовые правила

- Базовый префикс API: `/api/v1`
- Формат ответов: `application/json`
- Авторизация: `Bearer JWT`
- Формат ошибок: единый объект `{ code, message, details }`
- Все списки должны поддерживать `page`, `page_size`, `sort`

## Основные сущности

- `User`
- `CandidateProfile`
- `EmployerProfile`
- `Company`
- `Vacancy`
- `Resume`
- `Application`
- `Chat`
- `Message`
- `Call`
- `Notification`
- `Report`

## Группы API

- Auth: регистрация, вход, refresh, logout, восстановление пароля
- Users: текущий пользователь, профиль соискателя, профиль работодателя
- Companies: создание, редактирование и верификация компаний
- Vacancies: CRUD вакансий, публикация, архив, список и детальная карточка
- Resumes: CRUD резюме, публичность, статусы, выдача
- Applications: отклики и смена статусов по найму
- Favorites: избранные вакансии и резюме
- Chats: список чатов, сообщения, read-state
- Calls: история звонков, создание звонка, обновление статуса
- Notifications: список уведомлений и настройки
- Admin: пользователи, компании, вакансии, резюме, жалобы, системные логи

## Что еще нужно сделать backend-разработчику

- уточнить поля моделей и enum-значения
- согласовать пагинацию и сортировку
- определить RBAC на уровне эндпоинтов
- зафиксировать схемы ошибок
- добавить WebSocket-контракты для чатов и звонков
- синхронизировать FastAPI OpenAPI со спецификацией в этой папке

## Рекомендация по процессу

1. Сначала согласовать [openapi.json](/C:/develop/hrsystem-v2/docs/api/openapi.json).
2. Затем backend реализует Pydantic-схемы и роуты по контракту.
3. Frontend использует этот контракт как источник типов и mock API.
4. После каждой фичи обновляются и OpenAPI, и профильные markdown-файлы.
