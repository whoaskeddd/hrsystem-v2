# Docs

Документация проекта собрана по [README.MD](/C:/develop/hrsystem-v2/README.MD) и [plan.md](/C:/develop/hrsystem-v2/plan.md).

## Структура

- [docs/api/README.md](/C:/develop/hrsystem-v2/docs/api/README.md) — обзор API, правила интеграции и карта разделов
- [docs/api/openapi.json](/C:/develop/hrsystem-v2/docs/api/openapi.json) — единый OpenAPI-контракт для backend
- [docs/api/auth.md](/C:/develop/hrsystem-v2/docs/api/auth.md) — авторизация и сессии
- [docs/api/users.md](/C:/develop/hrsystem-v2/docs/api/users.md) — пользователи, профили и компании
- [docs/api/vacancies.md](/C:/develop/hrsystem-v2/docs/api/vacancies.md) — вакансии, отклики и избранное
- [docs/api/resumes.md](/C:/develop/hrsystem-v2/docs/api/resumes.md) — резюме и профиль соискателя
- [docs/api/chat.md](/C:/develop/hrsystem-v2/docs/api/chat.md) — чаты, сообщения и звонки
- [docs/api/admin.md](/C:/develop/hrsystem-v2/docs/api/admin.md) — админские сценарии, модерация и логи

## Назначение

Эта структура нужна, чтобы:

- согласовать контракт между frontend и backend до интеграции
- держать единый OpenAPI-файл и человекочитаемую документацию рядом
- раздавать backend-разработчикам отдельные модули без чтения всего контракта
- использовать `openapi.json` как основу для FastAPI и typed clients

## Правило обновления

- при изменении эндпоинтов сначала обновляется [docs/api/openapi.json](/C:/develop/hrsystem-v2/docs/api/openapi.json)
- затем синхронизируются профильные markdown-файлы в `docs/api`
- backend-реализация не должна расходиться с контрактом в `docs/api`
