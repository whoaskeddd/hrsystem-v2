import { useMemo, useState } from "react";

import { useAppContext } from "../app/app-context";
import { Button } from "../shared/ui/button";
import { Input } from "../shared/ui/input";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { SidebarNav } from "../shared/ui/sidebar-nav";
import { StatCard } from "../shared/ui/stat-card";
import { StatusBanner } from "../shared/ui/status-banner";
import { Surface } from "../shared/ui/surface";
import { Tag } from "../shared/ui/tag";
import { Textarea } from "../shared/ui/textarea";

const sidebarItems = ["Обзор", "Профиль компании", "Вакансии", "Отклики", "Сообщения", "Звонки", "Аналитика"];

export function EmployerDashboardPage() {
  const { activeEmployerProfile, data, sessionUser, updateEmployerProfile } = useAppContext();
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(() => ({
    companyName: activeEmployerProfile?.companyName ?? "",
    position: activeEmployerProfile?.position ?? "",
    aboutCompany: activeEmployerProfile?.aboutCompany ?? "",
    office: activeEmployerProfile?.office ?? "",
    teamSize: activeEmployerProfile?.teamSize ?? "",
    responseRate: activeEmployerProfile?.responseRate ?? "",
  }));

  const companyVacancies = useMemo(
    () => data.vacancies.filter((vacancy) => vacancy.companyId === activeEmployerProfile?.companyId),
    [activeEmployerProfile?.companyId, data.vacancies],
  );
  const companyApplications = useMemo(
    () => data.applications.filter((application) => companyVacancies.some((vacancy) => vacancy.id === application.vacancyId)),
    [companyVacancies, data.applications],
  );

  if (!activeEmployerProfile || !sessionUser) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSuccess(null);
    setError(null);

    try {
      await updateEmployerProfile(form);
      setSuccess("Профиль компании обновлен и готов к синхронизации с backend.");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Не удалось сохранить профиль.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Кабинет работодателя"
        subtitle="Рабочий кабинет компании: hiring metrics, текущие вакансии, воронка откликов и форма редактирования профиля."
        actions={<div className="flex flex-wrap gap-2"><Tag>{activeEmployerProfile.companyName}</Tag><Tag>{sessionUser.status}</Tag></div>}
      />

      <div className="grid gap-6 2xl:grid-cols-[300px_minmax(0,1fr)]">
        <SidebarNav title="Навигация" eyebrow="Работодатель" items={sidebarItems} activeItem="Обзор" />

        <div className="space-y-6">
          <section className="grid gap-4 lg:grid-cols-3">
            <StatCard label="Активных вакансий" value={String(companyVacancies.length)} meta="Опубликованные карточки компании" />
            <StatCard label="Откликов в работе" value={String(companyApplications.length)} meta="Текущая воронка найма" />
            <StatCard label="Response rate" value={activeEmployerProfile.responseRate} meta="Средняя скорость ответа кандидатам" />
          </section>

          <SectionCard title="Операционная сводка" eyebrow="Hiring overview">
            <div className="grid gap-4 xl:grid-cols-3">
              <Surface title="Команда" subtitle={`${activeEmployerProfile.teamSize} • офис ${activeEmployerProfile.office}`} />
              <Surface title="Фокус найма" subtitle={activeEmployerProfile.hiringFocus.join(", ")} />
              <Surface title="Следующий шаг" subtitle="Подключить backend CRUD вакансий и статусы откликов по контракту." />
            </div>
          </SectionCard>

          <SectionCard title="Профиль компании" eyebrow="Редактирование">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}
              {success ? <StatusBanner tone="success">{success}</StatusBanner> : null}

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-secondary">Компания</label>
                  <Input value={form.companyName} onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-secondary">Роль</label>
                  <Input value={form.position} onChange={(event) => setForm((current) => ({ ...current, position: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-secondary">Офис</label>
                  <Input value={form.office} onChange={(event) => setForm((current) => ({ ...current, office: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-secondary">Размер команды</label>
                  <Input value={form.teamSize} onChange={(event) => setForm((current) => ({ ...current, teamSize: event.target.value }))} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-secondary">О компании</label>
                <Textarea value={form.aboutCompany} onChange={(event) => setForm((current) => ({ ...current, aboutCompany: event.target.value }))} />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-secondary">Response rate</label>
                <Input value={form.responseRate} onChange={(event) => setForm((current) => ({ ...current, responseRate: event.target.value }))} />
              </div>

              <Button type="submit" disabled={isSaving} className="w-fit">
                {isSaving ? "Сохраняем..." : "Сохранить изменения"}
              </Button>
            </form>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
