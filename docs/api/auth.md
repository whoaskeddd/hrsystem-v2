# Auth API

## Назначение

Раздел покрывает регистрацию, вход, выход, refresh-токен и восстановление пароля.

## Эндпоинты

- `POST /auth/register` — регистрация пользователя
- `POST /auth/login` — вход пользователя
- `POST /auth/logout` — завершение сессии
- `POST /auth/refresh` — обновление access token
- `POST /auth/forgot-password` — запрос письма на восстановление
- `POST /auth/reset-password` — установка нового пароля

## Ожидаемые сценарии

- регистрация должна учитывать роль пользователя: соискатель или работодатель
- login возвращает access token, refresh token и краткий профиль
- logout инвалидирует refresh token или сессию
- forgot/reset-password должны поддерживать безопасный одноразовый токен

## Что уточнить на backend

- срок жизни access и refresh токенов
- хранение refresh token: cookie или body
- rate limit на login и forgot-password
- подтверждение email после регистрации
