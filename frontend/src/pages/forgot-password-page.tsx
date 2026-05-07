import { useState } from "react";
import { Link } from "react-router-dom";

import { useAppContext } from "../app/app-context";
import { Button } from "../shared/ui/button";
import { Input } from "../shared/ui/input";
import { StatusBanner } from "../shared/ui/status-banner";

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAppContext();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await requestPasswordReset(email);
      setSuccess("Если аккаунт существует, инструкция по восстановлению уже отправлена на почту.");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Не удалось отправить письмо.");
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
            <p className="text-sm uppercase tracking-[0.22em] text-gold-soft/80">Восстановление</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-primary">Сброс пароля</h1>
            <p className="mt-3 text-sm leading-6 text-secondary">
              Укажите почту, и мы отправим инструкцию для восстановления доступа.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}
            {success ? <StatusBanner tone="success">{success}</StatusBanner> : null}

            <div className="space-y-2">
              <label className="text-sm text-secondary">Email</label>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="anna@hrplatform.dev" required />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Отправляем..." : "Отправить письмо"}
              </Button>
              <Link to="/auth/login">
                <Button type="button" variant="secondary">Вернуться ко входу</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
