# Users API

## Разделы

- текущий пользователь
- профиль соискателя
- профиль работодателя
- компании

## Эндпоинты пользователей

- `GET /users/me`
- `PATCH /users/me`
- `GET /candidate/profile`
- `PATCH /candidate/profile`
- `GET /employer/profile`
- `PATCH /employer/profile`

## Эндпоинты компаний

- `POST /companies`
- `GET /companies/{company_id}`
- `PATCH /companies/{company_id}`
- `POST /companies/{company_id}/verify`

## Модели

- `User`
- `CandidateProfile`
- `EmployerProfile`
- `Company`

## Что важно для реализации

- разграничить поля общего профиля и ролевых профилей
- поддержать заполненность профиля для onboarding
- отдельно продумать поток верификации работодателя и компании
