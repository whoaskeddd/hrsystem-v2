import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getDashboardPath, useAppContext } from "../app/app-context";
import { Button } from "../shared/ui/button";
import { Input } from "../shared/ui/input";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { Select } from "../shared/ui/select";
import { StatusBanner } from "../shared/ui/status-banner";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAppContext();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  const [companyName, setCompanyName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({ fullName, email, password, role, companyName });
      navigate(getDashboardPath(role), { replace: true });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Не удалось создать аккаунт.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Создать аккаунт"
        subtitle="Регистрация уже разделяет роли соискателя и работодателя и готова к подключению backend endpoint без изменения UX."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,540px)_minmax(0,1fr)]">
        <SectionCard title="Регистрация" eyebrow="New account" className="gold-glow-soft">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}

            <div className="space-y-2">
              <label className="text-sm text-secondary">Имя и фамилия</label>
              <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Анна Смирнова" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-secondary">Email</label>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-secondary">Пароль</label>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Минимум 8 символов" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-secondary">Роль</label>
              <Select value={role} onChange={(event) => setRole(event.target.value as "candidate" | "employer")}>
                <option value="candidate">Соискатель</option>
                <option value="employer">Работодатель</option>
              </Select>
            </div>

            {role === "employer" ? (
              <div className="space-y-2">
                <label className="text-sm text-secondary">Компания</label>
                <Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Aurum Labs" required />
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Создаем аккаунт..." : "Создать аккаунт"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate("/auth/login")}>
                Уже есть аккаунт
              </Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="После регистрации" eyebrow="Onboarding">
          <div className="space-y-4 text-sm leading-7 text-secondary">
            <p>Соискатель попадает в свой кабинет, где может редактировать профиль, работать с резюме и отслеживать отклики.</p>
            <p>Работодатель попадает в кабинет компании с hiring metrics, активными вакансиями и формой профиля команды.</p>
            <StatusBanner tone="info">
              Protected routes и ролевые переходы уже работают, поэтому backend можно подключать поэтапно.
            </StatusBanner>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
