import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { getDashboardPath, useAppContext } from "../app/app-context";
import { Button } from "../shared/ui/button";
import { Input } from "../shared/ui/input";
import { StatusBanner } from "../shared/ui/status-banner";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="relative min-h-[calc(100vh-160px)]">
      <div className="fixed inset-0 z-10 bg-black/35 backdrop-blur-md" />
      <div className="relative z-20 flex min-h-[calc(100vh-160px)] items-center justify-center py-10">
        <div className="w-full max-w-xl rounded-[30px] border border-white/10 bg-base/88 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.22em] text-gold-soft/80">Авторизация</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-primary">С возвращением</h1>
            <p className="mt-3 text-sm leading-6 text-secondary">
              Войдите в аккаунт, чтобы продолжить работу с вакансиями, откликами и личным кабинетом.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}

            <div className="space-y-2">
              <label className="text-sm text-secondary">Email</label>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-secondary">Пароль</label>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Введите пароль" required />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Входим..." : "Войти"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate("/auth/register")}>
                Создать аккаунт
              </Button>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/8 pt-4 text-sm text-secondary sm:flex-row sm:items-center sm:justify-between">
              <Link to="/auth/forgot-password" className="text-gold-soft transition hover:text-gold">
                Забыли пароль?
              </Link>
              <p>
                Нет аккаунта?{" "}
                <Link to="/auth/register" className="text-gold-soft transition hover:text-gold">
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
