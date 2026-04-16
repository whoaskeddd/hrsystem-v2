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
import { TabGroup } from "../shared/ui/tab-group";
import { Tag } from "../shared/ui/tag";
import { Textarea } from "../shared/ui/textarea";

const sidebarItems = ["Профиль", "Резюме", "Отклики", "Избранное", "Уведомления"];
const sectionIdByItem: Record<string, string> = {
  Профиль: "candidate-profile",
  Резюме: "candidate-resumes",
  Отклики: "candidate-applications",
  Избранное: "candidate-applications",
  Уведомления: "candidate-applications",
};

export function CandidateProfilePage() {
  const { activeCandidateProfile, data, sessionUser, updateCandidateProfile, createResume, isVacancyFavorite } = useAppContext();
  const [isSaving, setIsSaving] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState("Профиль");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeSuccess, setResumeSuccess] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [isCreatingResume, setIsCreatingResume] = useState(false);
  const [form, setForm] = useState(() => ({
    headline: activeCandidateProfile?.headline ?? "",
    about: activeCandidateProfile?.about ?? "",
    location: activeCandidateProfile?.location ?? "",
    preferredFormat: activeCandidateProfile?.preferredFormat ?? "",
    salaryExpectation: activeCandidateProfile?.salaryExpectation ?? "",
    availability: activeCandidateProfile?.availability ?? "",
  }));
  const [resumeForm, setResumeForm] = useState(() => ({
    role: "",
    experience: "",
    salary: "",
    location: "",
    visibility: "public",
    about: "",
    skillsRaw: "",
    education: "",
    formatPreference: "",
  }));

  const currentResumes = useMemo(
    () => data.resumes.filter((resume) => resume.candidateId === sessionUser?.id),
    [data.resumes, sessionUser?.id],
  );
  const currentApplications = useMemo(
    () => data.applications.filter((application) => application.candidateId === sessionUser?.id),
    [data.applications, sessionUser?.id],
  );
  const favoriteVacancies = useMemo(
    () => data.vacancies.filter((vacancy) => isVacancyFavorite(vacancy.id)),
    [data.vacancies, isVacancyFavorite],
  );

  if (!activeCandidateProfile || !sessionUser) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSuccess(null);
    setError(null);

    try {
      await updateCandidateProfile(form);
      setSuccess("Профиль сохранен и синхронизирован с backend.");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Не удалось сохранить профиль.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateResume(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreatingResume(true);
    setResumeError(null);
    setResumeSuccess(null);

    try {
      await createResume({
        role: resumeForm.role,
        experience: resumeForm.experience,
        salary: resumeForm.salary,
        location: resumeForm.location,
        visibility: resumeForm.visibility,
        about: resumeForm.about,
        skills: resumeForm.skillsRaw
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        education: resumeForm.education,
        formatPreference: resumeForm.formatPreference,
      });
      setResumeSuccess("Резюме создано.");
      setResumeForm({
        role: "",
        experience: "",
        salary: "",
        location: "",
        visibility: "public",
        about: "",
        skillsRaw: "",
        education: "",
        formatPreference: "",
      });
    } catch (submissionError) {
      setResumeError(submissionError instanceof Error ? submissionError.message : "Не удалось создать резюме.");
    } finally {
      setIsCreatingResume(false);
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
        title="Личный кабинет соискателя"
        subtitle="Профиль, резюме, отклики и уведомления уже работают поверх реальных backend-данных."
        actions={<TabGroup tabs={["Профиль", "Резюме", "Отклики"]} activeTab="Профиль" />}
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <StatCard label="Активных резюме" value={String(currentResumes.length)} meta="Список приходит из /resumes" />
        <StatCard label="Откликов" value={String(currentApplications.length)} meta="История строится по /applications" />
        <StatCard
          label="Новых уведомлений"
          value={String(data.notifications.filter((item) => !item.isRead).length)}
          meta="Центр событий на /notifications"
        />
      </section>

      <div className="grid gap-6 2xl:grid-cols-[300px_minmax(0,1fr)]">
        <SidebarNav
          title="Навигация"
          eyebrow="Кабинет"
          items={sidebarItems}
          activeItem={activeSidebarItem}
          onItemClick={handleSidebarItemClick}
        />

        <div className="space-y-6">
          <SectionCard title={sessionUser.fullName} eyebrow="Профиль кандидата">
            <div id="candidate-profile" className="relative -top-24" />
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Tag>{activeCandidateProfile.headline}</Tag>
                  <Tag>{activeCandidateProfile.experience}</Tag>
                  <Tag>{activeCandidateProfile.location}</Tag>
                  <Tag>{sessionUser.status}</Tag>
                </div>
                <p className="max-w-4xl text-sm leading-7 text-secondary">{activeCandidateProfile.about}</p>
                <div className="flex flex-wrap gap-2">
                  {activeCandidateProfile.skills.map((skill) => (
                    <Tag key={skill}>{skill}</Tag>
                  ))}
                </div>
              </div>

              <Surface title="Контакты" subtitle="Публичная информация профиля">
                <div className="grid gap-3 text-sm text-secondary">
                  <div className="flex items-center justify-between rounded-[18px] border border-white/8 px-4 py-3">
                    <span>Почта</span>
                    <span className="text-gold-soft">{sessionUser.email}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[18px] border border-white/8 px-4 py-3">
                    <span>Профиль</span>
                    <span>/{sessionUser.fullName.toLowerCase().replace(/\s+/g, "-")}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[18px] border border-white/8 px-4 py-3">
                    <span>Готовность</span>
                    <span>{activeCandidateProfile.availability}</span>
                  </div>
                </div>
              </Surface>
            </div>
          </SectionCard>

          <SectionCard title="Редактирование профиля" eyebrow="PATCH /candidate/profile">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}
              {success ? <StatusBanner tone="success">{success}</StatusBanner> : null}

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-secondary">Заголовок профиля</label>
                  <Input value={form.headline} onChange={(event) => setForm((current) => ({ ...current, headline: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-secondary">Локация</label>
                  <Input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-secondary">Формат работы</label>
                  <Input
                    value={form.preferredFormat}
                    onChange={(event) => setForm((current) => ({ ...current, preferredFormat: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-secondary">Ожидания по доходу</label>
                  <Input
                    value={form.salaryExpectation}
                    onChange={(event) => setForm((current) => ({ ...current, salaryExpectation: event.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-secondary">О себе</label>
                <Textarea value={form.about} onChange={(event) => setForm((current) => ({ ...current, about: event.target.value }))} />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-secondary">Доступность</label>
                <Input value={form.availability} onChange={(event) => setForm((current) => ({ ...current, availability: event.target.value }))} />
              </div>

              <Button type="submit" disabled={isSaving} className="w-fit">
                {isSaving ? "Сохраняем..." : "Сохранить профиль"}
              </Button>
            </form>
          </SectionCard>

          <SectionCard title="Мои резюме" eyebrow="Backend catalog">
            <div id="candidate-resumes" className="relative -top-24" />
            <form className="mb-6 grid gap-4 rounded-[20px] border border-white/10 bg-soft/60 p-4" onSubmit={handleCreateResume}>
              {resumeError ? <StatusBanner tone="error">{resumeError}</StatusBanner> : null}
              {resumeSuccess ? <StatusBanner tone="success">{resumeSuccess}</StatusBanner> : null}
              <div className="grid gap-4 xl:grid-cols-2">
                <Input placeholder="Роль в резюме" value={resumeForm.role} onChange={(event) => setResumeForm((current) => ({ ...current, role: event.target.value }))} required />
                <Input placeholder="Опыт" value={resumeForm.experience} onChange={(event) => setResumeForm((current) => ({ ...current, experience: event.target.value }))} />
                <Input placeholder="Ожидания по зарплате" value={resumeForm.salary} onChange={(event) => setResumeForm((current) => ({ ...current, salary: event.target.value }))} />
                <Input placeholder="Локация" value={resumeForm.location} onChange={(event) => setResumeForm((current) => ({ ...current, location: event.target.value }))} />
                <Input placeholder="Видимость (public/private/link)" value={resumeForm.visibility} onChange={(event) => setResumeForm((current) => ({ ...current, visibility: event.target.value }))} />
                <Input placeholder="Предпочтительный формат" value={resumeForm.formatPreference} onChange={(event) => setResumeForm((current) => ({ ...current, formatPreference: event.target.value }))} />
              </div>
              <Input placeholder="Навыки через запятую" value={resumeForm.skillsRaw} onChange={(event) => setResumeForm((current) => ({ ...current, skillsRaw: event.target.value }))} />
              <Input placeholder="Образование" value={resumeForm.education} onChange={(event) => setResumeForm((current) => ({ ...current, education: event.target.value }))} />
              <Textarea placeholder="О себе" value={resumeForm.about} onChange={(event) => setResumeForm((current) => ({ ...current, about: event.target.value }))} />
              <Button type="submit" className="w-fit" disabled={isCreatingResume}>
                {isCreatingResume ? "Создаем..." : "Создать резюме"}
              </Button>
            </form>
            <div className="grid gap-4 xl:grid-cols-2">
              {currentResumes.map((resume) => (
                <article key={resume.id} className="rounded-[22px] border border-white/8 bg-soft/60 p-5 transition hover:border-gold/20">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-primary">{resume.role}</h3>
                    <p className="mt-2 text-sm text-secondary">{resume.updatedAt || "Дата обновления появится после следующего изменения"}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Tag>{resume.experience}</Tag>
                    <Tag>{resume.visibility}</Tag>
                    <Tag>{resume.salary}</Tag>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-secondary">{resume.about}</p>
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Отклики и избранное" eyebrow="Рабочие данные">
            <div id="candidate-applications" className="relative -top-24" />
            <div className="grid gap-4 xl:grid-cols-3">
              <Surface
                title="Текущие отклики"
                subtitle={currentApplications.length ? currentApplications.map((item) => item.status).join(" • ") : "Пока нет активных откликов"}
              />
              <Surface
                title="Избранные вакансии"
                subtitle={favoriteVacancies.length ? favoriteVacancies.map((item) => item.title).join(" • ") : "Избранное пока пусто"}
              />
              <Surface title="Профиль" subtitle="Все изменения сразу уходят в backend и не зависят от локальных моков." />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-3">
              {activeCandidateProfile.summary.map((item) => (
                <Surface key={item} title="Ключевой факт" subtitle={item} />
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
