import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAppContext } from "../app/app-context";
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
  const vacancy = data.vacancies.find((item) => item.id === id);
  const alreadyApplied = data.applications.some((item) => item.vacancyId === id);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!vacancy) {
    return (
      <div className="page-enter space-y-6">
        <SectionCard title="Вакансия не найдена" eyebrow="404">
          <p className="text-sm text-secondary">
            Похоже, карточка была удалена или каталог еще не успел загрузиться.
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
                  {data.vacancies
                    .filter((item) => item.companyId === currentVacancy.companyId && item.id !== currentVacancy.id)
                    .map((item) => (
                      <p key={item.id}>{item.title}</p>
                    ))}
                  {data.vacancies.filter((item) => item.companyId === currentVacancy.companyId && item.id !== currentVacancy.id).length === 0 ? (
                    <p>Других вакансий пока нет.</p>
                  ) : null}
                </div>
              </Surface>
            </div>
          </SectionCard>

          <SectionCard title="Похожие вакансии" eyebrow="Каталог">
            <div className="space-y-3">
              {data.vacancies
                .filter((item) => item.id !== currentVacancy.id)
                .slice(0, 3)
                .map((item) => (
                  <Surface key={item.id} title={item.title} subtitle={`${item.companyName} • ${item.location} • ${item.salary}`} />
                ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
