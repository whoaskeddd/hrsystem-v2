import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppContext } from "../app/app-context";
import { Button } from "../shared/ui/button";
import { Input } from "../shared/ui/input";
import { StatusBanner } from "../shared/ui/status-banner";

export function LoginPage() {
  const navigate = useNavigate();
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
      navigate("/", { replace: true });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Не удалось выполнить вход.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-160px)] overflow-hidden">
      <div className="fixed inset-0 z-10 bg-[var(--color-overlay)] backdrop-blur-md" />
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[10%] top-[12%] h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute right-[12%] top-[22%] h-64 w-64 rounded-full bg-soft/85 blur-3xl" />
      </div>

      <div className="relative z-20 flex min-h-[calc(100vh-160px)] items-center justify-center py-10">
        <div className="w-full max-w-xl rounded-[32px] border border-border/80 bg-elevated/95 p-8 shadow-card backdrop-blur-xl">
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
              <Button type="submit" disabled={isSubmitting} className="sm:min-w-[180px]">
                {isSubmitting ? "Входим..." : "Войти"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate("/auth/register")} className="sm:min-w-[220px]">
                Создать аккаунт
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
