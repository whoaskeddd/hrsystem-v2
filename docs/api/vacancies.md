# Vacancies API

## Разделы

- вакансии
- отклики
- избранное вакансий

## Эндпоинты вакансий

- `GET /vacancies`
- `POST /vacancies`
- `GET /vacancies/{vacancy_id}`
- `PATCH /vacancies/{vacancy_id}`
- `DELETE /vacancies/{vacancy_id}`
- `POST /vacancies/{vacancy_id}/publish`
- `POST /vacancies/{vacancy_id}/archive`

## Эндпоинты откликов

- `GET /applications`
- `POST /applications`
- `GET /applications/{application_id}`
- `PATCH /applications/{application_id}/status`
- `DELETE /applications/{application_id}`

## Эндпоинты избранного

- `GET /favorites/vacancies`
- `POST /favorites/vacancies/{vacancy_id}`
- `DELETE /favorites/vacancies/{vacancy_id}`

## Что важно для реализации

- список вакансий должен поддерживать фильтры, похожие на frontend-фильтры
- статусы вакансии должны включать хотя бы `draft`, `published`, `archived`
- статусы отклика должны покрывать весь найм-пайплайн
- нужно заранее определить публичные и приватные поля вакансии
