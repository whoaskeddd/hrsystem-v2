# AGENT.md

Этот файл предназначен для второго разработчика проекта. Предполагается, что твоя основная зона ответственности: backend на FastAPI и интеграция с уже подготовленным frontend.

## Контекст проекта

Проект: HR Platform в стиле hh.ru.

Цель:

- поиск вакансий и кандидатов
- работа с резюме и вакансиями
- отклики и избранное
- чат и сообщения
- звонки
- уведомления
- админ-панель

Стек проекта:

- Backend: `FastAPI`
- Frontend: `React + Vite + TypeScript + Tailwind CSS`
- Контейнеризация: `Docker`

## Текущая структура

- [README.MD](/C:/develop/hrsystem-v2/README.MD) — общее описание платформы
- [plan.md](/C:/develop/hrsystem-v2/plan.md) — план по milestone и распределение ответственности
- [design-system-spec.md](/C:/develop/hrsystem-v2/design-system-spec.md) — требования к визуальной системе frontend
- [frontend](/C:/develop/hrsystem-v2/frontend) — уже созданный frontend-каркас и страницы
- [backend](/C:/develop/hrsystem-v2/backend) — папка под backend
- [docs/api](/C:/develop/hrsystem-v2/docs/api) — API-контракт и описание модулей
- [docker-compose.yml](/C:/develop/hrsystem-v2/docker-compose.yml) — общая точка запуска контейнеров

## Что уже сделано

Frontend уже поднят и структурирован:

- есть роутинг и базовый shell
- готовы основные страницы интерфейса
- оформлен dark/gold UI
- есть Dockerfile для frontend
- есть skeleton/loading и UI-kit базового уровня

API-документация уже подготовлена:

- [docs/api/openapi.json](/C:/develop/hrsystem-v2/docs/api/openapi.json) — текущий OpenAPI-контракт
- [docs/api/README.md](/C:/develop/hrsystem-v2/docs/api/README.md) — обзор API
- [docs/api/auth.md](/C:/develop/hrsystem-v2/docs/api/auth.md)
- [docs/api/users.md](/C:/develop/hrsystem-v2/docs/api/users.md)
- [docs/api/vacancies.md](/C:/develop/hrsystem-v2/docs/api/vacancies.md)
- [docs/api/resumes.md](/C:/develop/hrsystem-v2/docs/api/resumes.md)
- [docs/api/chat.md](/C:/develop/hrsystem-v2/docs/api/chat.md)
- [docs/api/admin.md](/C:/develop/hrsystem-v2/docs/api/admin.md)

Важно: `docs/api/openapi.json` сейчас является главным источником правды по API до появления полноценной backend-реализации.

## Твоя зона ответственности

Как второй разработчик, ты отвечаешь за:

- структуру backend-проекта на FastAPI
- конфиги, логирование и окружение
- БД и миграции
- Pydantic-схемы и ORM-модели
- JWT auth и refresh flow
- RBAC по ролям
- REST API по контракту
- WebSocket для чатов
- signaling для звонков
- уведомления
- админские эндпоинты
- backend-тесты
- поддержку актуальности API-документации

## Порядок работы

Рекомендуемый порядок:

1. Поднять backend-каркас в [backend](/C:/develop/hrsystem-v2/backend).
2. Настроить Docker для backend.
3. Подключить PostgreSQL.
4. Настроить Alembic.
5. Создать базовые модели: `User`, `Role`, `Company`, `Vacancy`, `Resume`.
6. Реализовать auth и роли.
7. Начать реализацию API строго по [docs/api/openapi.json](/C:/develop/hrsystem-v2/docs/api/openapi.json).
8. После каждого модуля синхронизировать документацию.

## Жесткие правила синхронизации

- Не придумывай новые эндпоинты молча. Сначала обнови контракт в `docs/api`, потом код.
- Если меняется request/response schema, обнови и `openapi.json`, и соответствующий markdown-файл в `docs/api`.
- Frontend должен получать предсказуемые DTO. Не ломай уже согласованные имена полей без обновления контракта.
- Если нужно временно отойти от спецификации, зафиксируй это в `docs/api`.

## Что особенно важно для интеграции с frontend

- Базовый API-префикс: `/api/v1`
- Формат ответов: `application/json`
- Авторизация: `Bearer JWT`
- Ошибки должны быть единообразными: `{ code, message, details }`
- Все list endpoints должны поддерживать пагинацию и сортировку
- Фильтрация вакансий и резюме должна совпадать с логикой экранов frontend

Frontend уже визуально ориентирован на следующие сценарии:

- список вакансий
- карточка вакансии
- профиль кандидата
- список резюме
- сообщения
- звонки
- админка

Поэтому backend лучше поднимать модулями в такой последовательности:

1. Auth
2. Users and profiles
3. Vacancies
4. Resumes
5. Applications and favorites
6. Chats
7. Calls
8. Notifications
9. Admin

## Ожидаемая структура backend

Можно стартовать с такой схемы:

- `backend/app/main.py`
- `backend/app/core/`
- `backend/app/api/`
- `backend/app/models/`
- `backend/app/schemas/`
- `backend/app/services/`
- `backend/app/db/`
- `backend/app/ws/`
- `backend/alembic/`
- `backend/tests/`

Пример модульного деления:

- `api/v1/auth.py`
- `api/v1/users.py`
- `api/v1/companies.py`
- `api/v1/vacancies.py`
- `api/v1/resumes.py`
- `api/v1/applications.py`
- `api/v1/favorites.py`
- `api/v1/chats.py`
- `api/v1/calls.py`
- `api/v1/notifications.py`
- `api/v1/admin.py`

## Docker и запуск

Сейчас в проекте уже есть:

- [frontend/Dockerfile](/C:/develop/hrsystem-v2/frontend/Dockerfile)
- [docker-compose.yml](/C:/develop/hrsystem-v2/docker-compose.yml)

Твоя задача:

- добавить `backend/Dockerfile`
- при необходимости добавить `backend/requirements.txt` или `pyproject.toml`
- расширить `docker-compose.yml`, чтобы backend и frontend поднимались вместе
- предусмотреть подключение БД через контейнер

## Минимум, который стоит сделать первым

Первый рабочий результат backend должен включать:

- запускаемый FastAPI-проект
- health-check endpoint
- подключение к БД
- миграции
- модель пользователя и роли
- регистрация и логин
- `GET /users/me`

После этого можно считать foundation для backend состоявшимся.

## Definition of Done для backend-фичи

Фича считается готовой, если:

- есть endpoint
- есть схема запроса и ответа
- есть валидация
- есть проверка доступа
- есть обработка ошибок
- есть базовые тесты
- OpenAPI и docs обновлены
- frontend может безопасно интегрироваться по контракту

## Практическое правило

Если сомневаешься между “быстро написать код” и “сначала обновить контракт”, всегда сначала обновляй контракт.

Это проект, в котором frontend и backend идут параллельно, поэтому предсказуемость API важнее локальной скорости.
