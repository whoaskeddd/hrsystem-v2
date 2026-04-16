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

const sidebarItems = ["Обзор", "Профиль компании", "Вакансии", "Отклики", "Аналитика"];
const sectionIdByItem: Record<string, string> = {
  Обзор: "employer-overview",
  "Профиль компании": "employer-company-profile",
  Вакансии: "employer-vacancies",
  Отклики: "employer-vacancies",
  Аналитика: "employer-overview",
};

export function EmployerDashboardPage() {
  const { activeEmployerProfile, data, sessionUser, updateEmployerProfile, createVacancy } = useAppContext();
  const [isSaving, setIsSaving] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState("Обзор");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vacancySuccess, setVacancySuccess] = useState<string | null>(null);
  const [vacancyError, setVacancyError] = useState<string | null>(null);
  const [isCreatingVacancy, setIsCreatingVacancy] = useState(false);
  const [form, setForm] = useState(() => ({
    companyName: activeEmployerProfile?.companyName ?? "",
    position: activeEmployerProfile?.position ?? "",
    aboutCompany: activeEmployerProfile?.aboutCompany ?? "",
    office: activeEmployerProfile?.office ?? "",
    teamSize: activeEmployerProfile?.teamSize ?? "",
    responseRate: activeEmployerProfile?.responseRate ?? "",
  }));
  const [vacancyForm, setVacancyForm] = useState(() => ({
    title: "",
    salary: "",
    experience: "",
    location: "",
    format: "",
    employment: "",
    note: "",
    description: "",
    responsibilitiesRaw: "",
    requirementsRaw: "",
    perksRaw: "",
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
      setSuccess("Профиль компании обновлен через backend.");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Не удалось сохранить профиль.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateVacancy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreatingVacancy(true);
    setVacancyError(null);
    setVacancySuccess(null);

    try {
      await createVacancy({
        title: vacancyForm.title,
        salary: vacancyForm.salary,
        experience: vacancyForm.experience,
        location: vacancyForm.location,
        format: vacancyForm.format,
        employment: vacancyForm.employment,
        note: vacancyForm.note,
        description: vacancyForm.description,
        responsibilities: vacancyForm.responsibilitiesRaw
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        requirements: vacancyForm.requirementsRaw
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        perks: vacancyForm.perksRaw
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      setVacancySuccess("Вакансия создана.");
      setVacancyForm({
        title: "",
        salary: "",
        experience: "",
        location: "",
        format: "",
        employment: "",
        note: "",
        description: "",
        responsibilitiesRaw: "",
        requirementsRaw: "",
        perksRaw: "",
      });
    } catch (submissionError) {
      setVacancyError(submissionError instanceof Error ? submissionError.message : "Не удалось создать вакансию.");
    } finally {
      setIsCreatingVacancy(false);
    }
  }

  function handleSidebarItemClick(item: string) {
    setActiveSidebarItem(item);
    const sectionId = sectionIdByItem[item];
    if (!sectionId) {
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Кабинет работодателя"
        subtitle="Сводка компании, вакансии и отклики уже собираются из backend API без локальных заглушек."
        actions={
          <div className="flex flex-wrap gap-2">
            <Tag>{activeEmployerProfile.companyName}</Tag>
            <Tag>{sessionUser.status}</Tag>
          </div>
        }
      />

      <div className="grid gap-6 2xl:grid-cols-[300px_minmax(0,1fr)]">
        <SidebarNav
          title="Навигация"
          eyebrow="Работодатель"
          items={sidebarItems}
          activeItem={activeSidebarItem}
          onItemClick={handleSidebarItemClick}
        />

        <div className="space-y-6">
          <section className="grid gap-4 lg:grid-cols-3">
            <div id="employer-overview" className="relative -top-24" />
            <StatCard label="Вакансий компании" value={String(companyVacancies.length)} meta="Каталог связан с /vacancies" />
            <StatCard label="Откликов в работе" value={String(companyApplications.length)} meta="Статусы приходят из /applications" />
            <StatCard label="Response rate" value={activeEmployerProfile.responseRate} meta="Значение хранится в employer profile" />
          </section>

          <SectionCard title="Операционная сводка" eyebrow="Hiring overview">
            <div className="grid gap-4 xl:grid-cols-3">
              <Surface title="Команда" subtitle={`${activeEmployerProfile.teamSize} • офис ${activeEmployerProfile.office}`} />
              <Surface title="Фокус найма" subtitle={activeEmployerProfile.hiringFocus.join(", ") || "Пока не заполнен"} />
              <Surface
                title="Следующий шаг"
                subtitle={companyVacancies.length ? "Можно публиковать новые вакансии и переводить отклики по этапам." : "Добавьте первую вакансию в backend."}
              />
            </div>
          </SectionCard>

          <SectionCard title="Профиль компании" eyebrow="PATCH /employer/profile">
            <div id="employer-company-profile" className="relative -top-24" />
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

          <SectionCard title="Вакансии компании" eyebrow="Live list">
            <div id="employer-vacancies" className="relative -top-24" />
            <form className="mb-6 grid gap-4 rounded-[20px] border border-white/10 bg-soft/60 p-4" onSubmit={handleCreateVacancy}>
              {vacancyError ? <StatusBanner tone="error">{vacancyError}</StatusBanner> : null}
              {vacancySuccess ? <StatusBanner tone="success">{vacancySuccess}</StatusBanner> : null}
              <div className="grid gap-4 xl:grid-cols-2">
                <Input placeholder="Название вакансии" value={vacancyForm.title} onChange={(event) => setVacancyForm((current) => ({ ...current, title: event.target.value }))} required />
                <Input placeholder="Зарплата" value={vacancyForm.salary} onChange={(event) => setVacancyForm((current) => ({ ...current, salary: event.target.value }))} />
                <Input placeholder="Опыт" value={vacancyForm.experience} onChange={(event) => setVacancyForm((current) => ({ ...current, experience: event.target.value }))} />
                <Input placeholder="Локация" value={vacancyForm.location} onChange={(event) => setVacancyForm((current) => ({ ...current, location: event.target.value }))} />
                <Input placeholder="Формат работы" value={vacancyForm.format} onChange={(event) => setVacancyForm((current) => ({ ...current, format: event.target.value }))} />
                <Input placeholder="Тип занятости" value={vacancyForm.employment} onChange={(event) => setVacancyForm((current) => ({ ...current, employment: event.target.value }))} />
              </div>
              <Input placeholder="Краткая заметка" value={vacancyForm.note} onChange={(event) => setVacancyForm((current) => ({ ...current, note: event.target.value }))} />
              <Textarea placeholder="Описание вакансии" value={vacancyForm.description} onChange={(event) => setVacancyForm((current) => ({ ...current, description: event.target.value }))} />
              <div className="grid gap-4 xl:grid-cols-3">
                <Textarea placeholder="Обязанности (по строкам)" value={vacancyForm.responsibilitiesRaw} onChange={(event) => setVacancyForm((current) => ({ ...current, responsibilitiesRaw: event.target.value }))} />
                <Textarea placeholder="Требования (по строкам)" value={vacancyForm.requirementsRaw} onChange={(event) => setVacancyForm((current) => ({ ...current, requirementsRaw: event.target.value }))} />
                <Textarea placeholder="Плюшки (по строкам)" value={vacancyForm.perksRaw} onChange={(event) => setVacancyForm((current) => ({ ...current, perksRaw: event.target.value }))} />
              </div>
              <Button type="submit" className="w-fit" disabled={isCreatingVacancy}>
                {isCreatingVacancy ? "Создаем..." : "Создать вакансию"}
              </Button>
            </form>
            <div className="grid gap-4 xl:grid-cols-2">
              {companyVacancies.map((vacancy) => (
                <Surface key={vacancy.id} title={vacancy.title} subtitle={`${vacancy.salary} • ${vacancy.location} • ${vacancy.status}`} />
              ))}
              {companyVacancies.length === 0 ? <Surface title="Пока пусто" subtitle="После создания вакансии она появится здесь автоматически." /> : null}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
