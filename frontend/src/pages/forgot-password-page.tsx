import { useState } from "react";

import { useAppContext } from "../app/app-context";
import { Button } from "../shared/ui/button";
import { Input } from "../shared/ui/input";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
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
      setSuccess("Инструкция по сбросу пароля отправлена. После подключения backend останется подменить mock flow на реальный email reset.");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Не удалось отправить письмо.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Восстановление пароля"
        subtitle="Отдельная recovery-страница со штатными состояниями загрузки, ошибки и успешной отправки."
      />

      <SectionCard title="Сброс пароля" eyebrow="Recovery flow" className="max-w-2xl gold-glow-soft">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}
          {success ? <StatusBanner tone="success">{success}</StatusBanner> : null}

          <div className="space-y-2">
            <label className="text-sm text-secondary">Рабочий email</label>
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="anna@hrplatform.dev" required />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Отправляем..." : "Отправить письмо"}
          </Button>
        </form>
      </SectionCard>
    </div>
  );
}
