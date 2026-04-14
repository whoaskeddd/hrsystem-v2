import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { getDashboardPath, useAppContext } from "../app/app-context";
import { Button } from "../shared/ui/button";
import { Input } from "../shared/ui/input";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { StatusBanner } from "../shared/ui/status-banner";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAppContext();
  const [email, setEmail] = useState("anna@hrplatform.dev");
  const [password, setPassword] = useState("demo-password");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      const targetPath =
        email === "igor@aurumlabs.dev"
          ? getDashboardPath("employer")
          : email === "admin@hrplatform.dev"
            ? getDashboardPath("admin")
            : typeof location.state === "object" && location.state && "from" in location.state
              ? String(location.state.from)
              : getDashboardPath("candidate");
      navigate(targetPath, { replace: true });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Не удалось выполнить вход.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Вход в платформу"
        subtitle="Рабочая auth-страница со штатными loading/error состояниями и ролевым redirect после входа."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
        <SectionCard title="Авторизация" eyebrow="Secure entry" className="gold-glow-soft">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}

            <div className="space-y-2">
              <label className="text-sm text-secondary">Email</label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-secondary">Пароль</label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Введите пароль"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Входим..." : "Войти"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate("/auth/register")}>
                Создать аккаунт
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate("/auth/forgot-password")}>
                Забыли пароль
              </Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Готово для backend-интеграции" eyebrow="Что уже заложено">
          <div className="grid gap-4 text-sm leading-7 text-secondary">
            <p>
              Форма уже отделена от визуального слоя и готова к замене mock-auth на реальный `POST /auth/login`.
              После подключения backend останется подменить источник данных и инициализацию сессии.
            </p>
            <StatusBanner tone="info">
              Демо-аккаунты: `anna@hrplatform.dev`, `igor@aurumlabs.dev`, `admin@hrplatform.dev`.
            </StatusBanner>
            <p>
              Нет аккаунта? <Link to="/auth/register" className="text-gold-soft">Перейти к регистрации</Link>.
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
