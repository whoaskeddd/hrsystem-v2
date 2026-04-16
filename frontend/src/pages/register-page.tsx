import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getDashboardPath, useAppContext } from "../app/app-context";
import { Button } from "../shared/ui/button";
import { Input } from "../shared/ui/input";
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
    <div className="relative min-h-[calc(100vh-160px)]">
      <div className="fixed inset-0 z-10 bg-black/35 backdrop-blur-md" />
      <div className="relative z-20 flex min-h-[calc(100vh-160px)] items-center justify-center py-10">
        <div className="w-full max-w-xl rounded-[30px] border border-white/10 bg-base/88 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.22em] text-gold-soft/80">Регистрация</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-primary">Создайте аккаунт</h1>
            <p className="mt-3 text-sm leading-6 text-secondary">
              Выберите роль и заполните данные, чтобы сразу перейти в свое рабочее пространство.
            </p>
          </div>

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

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Создаем аккаунт..." : "Создать аккаунт"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate("/auth/login")}>
                Уже есть аккаунт
              </Button>
            </div>

            <div className="border-t border-white/8 pt-4 text-sm text-secondary">
              Уже зарегистрированы?{" "}
              <Link to="/auth/login" className="text-gold-soft transition hover:text-gold">
                Перейти ко входу
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
