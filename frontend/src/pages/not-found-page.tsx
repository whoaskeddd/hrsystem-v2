import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-shell border border-white/8 bg-elevated/90 p-8 text-center shadow-card">
        <p className="text-sm uppercase tracking-[0.2em] text-gold-soft/70">404</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">Страница не найдена</h1>
        <p className="mt-4 text-secondary">Маршрут еще не реализован или ссылка устарела.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full border border-gold/60 bg-gold/10 px-5 py-3 text-sm font-medium text-gold-soft"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
