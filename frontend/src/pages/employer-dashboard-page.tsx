import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppContext } from "../app/app-context";
import { Button } from "../shared/ui/button";
import { EMPLOYMENT_TYPE_OPTIONS, WORK_FORMAT_OPTIONS } from "../shared/constants/job-options";
import { Input } from "../shared/ui/input";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { Select } from "../shared/ui/select";
import { SidebarNav } from "../shared/ui/sidebar-nav";
import { StatCard } from "../shared/ui/stat-card";
import { StatusBanner } from "../shared/ui/status-banner";
import { Surface } from "../shared/ui/surface";
import { Tag } from "../shared/ui/tag";
import { Textarea } from "../shared/ui/textarea";

const sidebarItems = ["Обзор", "Профиль компании", "Вакансии", "Отклики"] as const;
const sectionIdByItem: Record<(typeof sidebarItems)[number], string> = {
  Обзор: "employer-overview",
  "Профиль компании": "employer-company-profile",
  Вакансии: "employer-vacancies",
  Отклики: "employer-applications",
};

export function EmployerDashboardPage() {
  const { activeEmployerProfile, data, sessionUser, updateEmployerProfile, createVacancy } = useAppContext();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState<(typeof sidebarItems)[number]>("Обзор");
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
  const companyChats = useMemo(
    () => data.chats.filter((chat) => companyVacancies.some((vacancy) => vacancy.id === chat.vacancyId)),
    [companyVacancies, data.chats],
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
      setSuccess("Профиль компании обновлен.");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Не удалось сохранить профиль компании.");
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

  function handleSidebarItemClick(item: (typeof sidebarItems)[number]) {
    setActiveSidebarItem(item);
    document.getElementById(sectionIdByItem[item])?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Кабинет компании"
        subtitle="Управляйте данными компании, публикуйте вакансии и общайтесь с кандидатами по откликам."
        actions={
          <div className="flex flex-wrap gap-2">
            <Tag>{activeEmployerProfile.companyName}</Tag>
            <Tag>{sessionUser.status || "активно"}</Tag>
          </div>
        }
      />

      <div className="grid gap-6 2xl:grid-cols-[300px_minmax(0,1fr)]">
        <SidebarNav
          title="Навигация"
          eyebrow="Компания"
          items={[...sidebarItems]}
          activeItem={activeSidebarItem}
          onItemClick={(item) => handleSidebarItemClick(item as (typeof sidebarItems)[number])}
        />

        <div className="space-y-6">
          <div id="employer-overview" className="relative -top-24" />
          <section className="grid gap-4 lg:grid-cols-3">
            <StatCard label="Вакансии" value={String(companyVacancies.length)} meta="Все опубликованные позиции" />
            <StatCard label="Отклики" value={String(companyApplications.length)} meta="Кандидаты по вашим вакансиям" />
            <StatCard label="Скорость ответа" value={activeEmployerProfile.responseRate || "н/д"} meta="Показатель компании" />
          </section>

          <SectionCard title="Обзор найма" eyebrow="Текущая ситуация">
            <div className="grid gap-4 xl:grid-cols-3">
              <Surface title="Команда" subtitle={`${activeEmployerProfile.teamSize || "н/д"} • ${activeEmployerProfile.office || "офис не указан"}`} />
              <Surface title="Фокус найма" subtitle={activeEmployerProfile.hiringFocus.join(", ") || "Добавьте направления в профиль"} />
              <Surface
                title="Следующий шаг"
                subtitle={companyVacancies.length ? "Разберите новые отклики и переходите в чаты с кандидатами." : "Создайте первую вакансию, чтобы начать прием откликов."}
              />
            </div>
          </SectionCard>

          <div id="employer-company-profile" className="relative -top-24" />
          <SectionCard title="Профиль компании" eyebrow="Основная информация">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}
              {success ? <StatusBanner tone="success">{success}</StatusBanner> : null}

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-secondary">Компания</label>
                  <Input value={form.companyName} onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-secondary">Должность</label>
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
                <label className="text-sm text-secondary">Скорость ответа</label>
                <Input value={form.responseRate} onChange={(event) => setForm((current) => ({ ...current, responseRate: event.target.value }))} />
              </div>

              <Button type="submit" disabled={isSaving} className="w-fit">
                {isSaving ? "Сохраняем..." : "Сохранить изменения"}
              </Button>
            </form>
          </SectionCard>

          <div id="employer-vacancies" className="relative -top-24" />
          <SectionCard title="Вакансии компании" eyebrow="Новая вакансия">
            <form className="mb-6 grid gap-4 rounded-[20px] border border-white/10 bg-soft/60 p-4" onSubmit={handleCreateVacancy}>
              {vacancyError ? <StatusBanner tone="error">{vacancyError}</StatusBanner> : null}
              {vacancySuccess ? <StatusBanner tone="success">{vacancySuccess}</StatusBanner> : null}

              <div className="grid gap-4 xl:grid-cols-2">
                <Input placeholder="Название вакансии" value={vacancyForm.title} onChange={(event) => setVacancyForm((current) => ({ ...current, title: event.target.value }))} required />
                <Input placeholder="Зарплата" value={vacancyForm.salary} onChange={(event) => setVacancyForm((current) => ({ ...current, salary: event.target.value }))} />
                <Input placeholder="Опыт" value={vacancyForm.experience} onChange={(event) => setVacancyForm((current) => ({ ...current, experience: event.target.value }))} />
                <Input placeholder="Локация" value={vacancyForm.location} onChange={(event) => setVacancyForm((current) => ({ ...current, location: event.target.value }))} />
                <Select value={vacancyForm.format} onChange={(event) => setVacancyForm((current) => ({ ...current, format: event.target.value }))} required>
                  <option value="">Выберите формат работы</option>
                  {WORK_FORMAT_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
                <Select value={vacancyForm.employment} onChange={(event) => setVacancyForm((current) => ({ ...current, employment: event.target.value }))} required>
                  <option value="">Выберите тип занятости</option>
                  {EMPLOYMENT_TYPE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>

              <Input placeholder="Короткая заметка" value={vacancyForm.note} onChange={(event) => setVacancyForm((current) => ({ ...current, note: event.target.value }))} />
              <Textarea placeholder="Описание вакансии" value={vacancyForm.description} onChange={(event) => setVacancyForm((current) => ({ ...current, description: event.target.value }))} />

              <div className="grid gap-4 xl:grid-cols-3">
                <Textarea placeholder="Обязанности, по одной на строку" value={vacancyForm.responsibilitiesRaw} onChange={(event) => setVacancyForm((current) => ({ ...current, responsibilitiesRaw: event.target.value }))} />
                <Textarea placeholder="Требования, по одному на строку" value={vacancyForm.requirementsRaw} onChange={(event) => setVacancyForm((current) => ({ ...current, requirementsRaw: event.target.value }))} />
                <Textarea placeholder="Преимущества, по одному на строку" value={vacancyForm.perksRaw} onChange={(event) => setVacancyForm((current) => ({ ...current, perksRaw: event.target.value }))} />
              </div>

              <Button type="submit" className="w-fit" disabled={isCreatingVacancy}>
                {isCreatingVacancy ? "Создаем..." : "Создать вакансию"}
              </Button>
            </form>

            <div className="grid gap-4 xl:grid-cols-2">
              {companyVacancies.map((vacancy) => (
                <Surface key={vacancy.id} title={vacancy.title} subtitle={`${vacancy.salary} • ${vacancy.location} • ${vacancy.format} • ${vacancy.employment}`} />
              ))}
              {companyVacancies.length === 0 ? <Surface title="Пока нет вакансий" subtitle="Создайте первую вакансию, и она появится здесь." /> : null}
            </div>
          </SectionCard>

          <div id="employer-applications" className="relative -top-24" />
          <SectionCard title="Отклики" eyebrow="Чаты с кандидатами">
            <div className="grid gap-4 xl:grid-cols-2">
              {companyChats.map((chat) => (
                <Surface
                  key={chat.id}
                  title={chat.candidateName || chat.peerName || "Кандидат"}
                  subtitle={`${chat.vacancyTitle || "Вакансия"} • ${chat.applicationStatus || "отклик отправлен"}`}
                  action={
                    <Button variant="secondary" onClick={() => navigate(`/messages?chat=${chat.id}`)}>
                      Открыть чат
                    </Button>
                  }
                >
                  <p className="text-sm text-secondary">{chat.lastMessageText || "Здесь хранится вся переписка с кандидатом по этой вакансии."}</p>
                </Surface>
              ))}
              {companyChats.length === 0 ? (
                <Surface
                  title="Пока нет чатов"
                  subtitle={companyApplications.length ? "Отклики уже есть, список диалогов обновится автоматически." : "Когда кандидат откликнется, здесь появится новый диалог."}
                />
              ) : null}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
