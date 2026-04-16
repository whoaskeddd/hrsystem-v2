import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import type { Vacancy } from "../app/app-context";
import { useAppContext } from "../app/app-context";
import { httpRequest } from "../shared/api/http-client";
import { Button } from "../shared/ui/button";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { StatusBanner } from "../shared/ui/status-banner";
import { Surface } from "../shared/ui/surface";
import { Tag } from "../shared/ui/tag";

export function VacancyDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, role, applyToVacancy, isVacancyFavorite, toggleFavoriteVacancy } = useAppContext();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [relatedVacancies, setRelatedVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const alreadyApplied = data.applications.some((item) => item.vacancyId === id);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadVacancy() {
      if (!id) {
        setLoadError("Не передан идентификатор вакансии.");
        setLoading(false);
        return;
      }

      try {
        const vacancyPayload = await httpRequest<Record<string, unknown>>(`/vacancies/${id}`);
        const currentVacancy: Vacancy = {
          id: String(vacancyPayload.id ?? ""),
          title: String(vacancyPayload.title ?? ""),
          companyId: String(vacancyPayload.company_id ?? ""),
          companyName: String(vacancyPayload.company_name ?? ""),
          salary: String(vacancyPayload.salary ?? ""),
          experience: String(vacancyPayload.experience ?? ""),
          location: String(vacancyPayload.location ?? ""),
          format: String(vacancyPayload.format ?? ""),
          employment: String(vacancyPayload.employment ?? ""),
          status: (String(vacancyPayload.status ?? "draft") as Vacancy["status"]) ?? "draft",
          publishedAt: String(vacancyPayload.published_at ?? ""),
          note: String(vacancyPayload.note ?? ""),
          description: String(vacancyPayload.description ?? ""),
          responsibilities: Array.isArray(vacancyPayload.responsibilities)
            ? vacancyPayload.responsibilities.map((x) => String(x))
            : [],
          requirements: Array.isArray(vacancyPayload.requirements) ? vacancyPayload.requirements.map((x) => String(x)) : [],
          perks: Array.isArray(vacancyPayload.perks) ? vacancyPayload.perks.map((x) => String(x)) : [],
        };

        const relatedPayload = await httpRequest<Array<Record<string, unknown>>>("/vacancies?page=1&page_size=100");
        const related = relatedPayload
          .map((item) => ({
            id: String(item.id ?? ""),
            title: String(item.title ?? ""),
            companyId: String(item.company_id ?? ""),
            companyName: String(item.company_name ?? ""),
            salary: String(item.salary ?? ""),
            experience: String(item.experience ?? ""),
            location: String(item.location ?? ""),
            format: String(item.format ?? ""),
            employment: String(item.employment ?? ""),
            status: (String(item.status ?? "draft") as Vacancy["status"]) ?? "draft",
            publishedAt: String(item.published_at ?? ""),
            note: String(item.note ?? ""),
            description: String(item.description ?? ""),
            responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities.map((x) => String(x)) : [],
            requirements: Array.isArray(item.requirements) ? item.requirements.map((x) => String(x)) : [],
            perks: Array.isArray(item.perks) ? item.perks.map((x) => String(x)) : [],
          }))
          .filter((item) => item.id !== currentVacancy.id);

        if (cancelled) {
          return;
        }

        setVacancy(currentVacancy);
        setRelatedVacancies(related);
        setLoadError(null);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setVacancy(null);
        setRelatedVacancies([]);
        setLoadError(requestError instanceof Error ? requestError.message : "Не удалось загрузить вакансию.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    setLoading(true);
    void loadVacancy();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const companyVacancies = useMemo(
    () => relatedVacancies.filter((item) => item.companyId === vacancy?.companyId),
    [relatedVacancies, vacancy?.companyId],
  );

  const similarVacancies = useMemo(() => relatedVacancies.slice(0, 3), [relatedVacancies]);

  if (loading) {
    return (
      <div className="page-enter space-y-6">
        <SectionCard title="Загрузка вакансии" eyebrow="Please wait">
          <p className="text-sm text-secondary">Получаем данные вакансии из API.</p>
        </SectionCard>
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="page-enter space-y-6">
        <SectionCard title="Вакансия не найдена" eyebrow="404">
          <p className="text-sm text-secondary">
            {loadError ?? "Похоже, карточка была удалена или каталог еще не успел загрузиться."}
          </p>
          <div className="mt-4">
            <Link to="/vacancies">
              <Button>Вернуться к списку вакансий</Button>
            </Link>
          </div>
        </SectionCard>
      </div>
    );
  }

  const currentVacancy = vacancy;

  async function handleApply() {
    if (role === "guest") {
      navigate("/auth/login");
      return;
    }

    if (role !== "candidate") {
      setError("Отклик доступен только для аккаунта соискателя.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStatus(null);

    try {
      await applyToVacancy(currentVacancy.id);
      setStatus("Отклик отправлен и сразу появился в истории applications.");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Не удалось отправить отклик.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title={currentVacancy.title}
        subtitle={currentVacancy.description}
        actions={
          <div className="flex flex-wrap gap-2">
            <Tag>{currentVacancy.salary}</Tag>
            <Tag>{currentVacancy.experience}</Tag>
            <Tag>{currentVacancy.format}</Tag>
            <Tag>{currentVacancy.location}</Tag>
            <Tag>{currentVacancy.employment}</Tag>
          </div>
        }
      />

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <SectionCard title="О роли" eyebrow={currentVacancy.companyName} className="gold-glow-soft overflow-hidden">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-6">
                {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}
                {status ? <StatusBanner tone="success">{status}</StatusBanner> : null}
                <p className="max-w-4xl text-sm leading-7 text-secondary">{currentVacancy.note}</p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => void handleApply()} disabled={alreadyApplied || isSubmitting}>
                    {alreadyApplied ? "Отклик уже отправлен" : isSubmitting ? "Отправляем..." : "Откликнуться"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (role === "guest") {
                        navigate("/auth/login");
                        return;
                      }

                      void toggleFavoriteVacancy(currentVacancy.id);
                    }}
                  >
                    {isVacancyFavorite(currentVacancy.id) ? "Убрать из избранного" : "Сохранить"}
                  </Button>
                  <Button variant="ghost" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                    Поделиться
                  </Button>
                </div>
              </div>

              <Surface title="Ключевые параметры" subtitle="То, что приходит из backend и доступно сразу">
                <div className="grid gap-3 text-sm text-secondary">
                  <div className="flex items-center justify-between rounded-[18px] border border-white/8 px-4 py-3">
                    <span>Компания</span>
                    <span className="text-gold-soft">{currentVacancy.companyName}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[18px] border border-white/8 px-4 py-3">
                    <span>Статус</span>
                    <span>{currentVacancy.status}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[18px] border border-white/8 px-4 py-3">
                    <span>Формат</span>
                    <span>
                      {currentVacancy.format} / {currentVacancy.location}
                    </span>
                  </div>
                </div>
              </Surface>
            </div>
          </SectionCard>

          {[
            { title: "Обязанности", points: currentVacancy.responsibilities },
            { title: "Требования", points: currentVacancy.requirements },
            { title: "Что предлагаем", points: currentVacancy.perks },
          ].map((section) => (
            <SectionCard key={section.title} title={section.title}>
              <ul className="grid gap-3 text-sm leading-7 text-secondary">
                {section.points.map((point) => (
                  <li key={point} className="rounded-[18px] border border-white/8 bg-soft/55 px-4 py-3">
                    {point}
                  </li>
                ))}
              </ul>
            </SectionCard>
          ))}
        </div>

        <div className="space-y-6">
          <SectionCard title="Компания" eyebrow="Side panel" className="h-fit">
            <div className="space-y-4 text-sm text-secondary">
              <Surface title={currentVacancy.companyName} subtitle={`ID компании: ${currentVacancy.companyId || "не указан"}`} />
              <Surface title="Публикация">
                <p className="text-sm leading-6 text-secondary">
                  {currentVacancy.publishedAt ? `Опубликовано: ${currentVacancy.publishedAt}` : "Дата публикации не указана."}
                </p>
              </Surface>
              <Surface title="Другие вакансии компании">
                <div className="space-y-2 text-sm text-secondary">
                  {companyVacancies.map((item) => (
                    <p key={item.id}>{item.title}</p>
                  ))}
                  {companyVacancies.length === 0 ? (
                    <p>Других вакансий пока нет.</p>
                  ) : null}
                </div>
              </Surface>
            </div>
          </SectionCard>

          <SectionCard title="Похожие вакансии" eyebrow="Каталог">
            <div className="space-y-3">
              {similarVacancies.map((item) => (
                <Surface key={item.id} title={item.title} subtitle={`${item.companyName} • ${item.location} • ${item.salary}`} />
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
