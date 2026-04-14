# Frontend

## Локальный запуск

```powershell
npm install
npm run dev -- --host 127.0.0.1
```

Откройте `http://127.0.0.1:5173`.

## Запуск в Docker

Из корня проекта:

```powershell
docker compose up --build frontend
```

Откройте `http://localhost:5173`.

## Структура

- `src/pages` — страницы приложения
- `src/shared/ui` — общий UI-kit
- `src/shared/layout` — shell и глобальная навигация
- `src/shared/hooks` — общие хуки
