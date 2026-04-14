# Resumes API

## Разделы

- резюме
- сценарии соискателя
- избранное резюме

## Эндпоинты резюме

- `GET /resumes`
- `POST /resumes`
- `GET /resumes/{resume_id}`
- `PATCH /resumes/{resume_id}`
- `DELETE /resumes/{resume_id}`

## Эндпоинты избранного резюме

- `GET /favorites/resumes`
- `POST /favorites/resumes/{resume_id}`
- `DELETE /favorites/resumes/{resume_id}`

## Модели

- `Resume`
- `CandidateProfile`

## Что важно для реализации

- поддержать несколько резюме на одного пользователя
- определить visibility: публичное, по ссылке, приватное
- продумать формат опыта, навыков, портфолио и вложений
- согласовать выдачу списка резюме для работодателя и самого кандидата
