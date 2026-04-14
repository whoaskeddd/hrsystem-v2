# Admin API

## Разделы

- пользователи
- компании
- вакансии
- резюме
- жалобы
- системные логи
- уведомления

## Эндпоинты админки

- `GET /admin/users`
- `PATCH /admin/users/{user_id}/block`
- `PATCH /admin/users/{user_id}/unblock`
- `GET /admin/companies`
- `GET /admin/vacancies`
- `GET /admin/resumes`
- `GET /admin/reports`
- `PATCH /admin/reports/{report_id}/status`
- `GET /admin/logs`

## Эндпоинты уведомлений

- `GET /notifications`
- `POST /notifications/read-all`
- `POST /notifications/{notification_id}/read`
- `GET /notification-settings`
- `PATCH /notification-settings`

## Что важно для реализации

- разделить админские роли и доступы
- определить причины блокировки пользователей и компаний
- зафиксировать жизненный цикл жалобы и статусы модерации
- договориться о сроке хранения и формате логов
