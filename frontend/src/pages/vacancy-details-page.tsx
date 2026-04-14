import { Link, useParams } from "react-router-dom";

import { useAppContext } from "../app/app-context";
import { Button } from "../shared/ui/button";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { Surface } from "../shared/ui/surface";
import { Tag } from "../shared/ui/tag";

export function VacancyDetailsPage() {
  const { id } = useParams();
  const { data } = useAppContext();
  const vacancy = data.vacancies.find((item) => item.id === id);

  if (!vacancy) {
    return (
      <div className="page-enter space-y-6">
        <SectionCard title="Вакансия не найдена" eyebrow="404">
          <p className="text-sm text-secondary">Похоже, эта карточка была удалена или ссылка открыта по неверному идентификатору.</p>
          <div className="mt-4">
            <Link to="/vacancies">
              <Button>Вернуться к списку вакансий</Button>
            </Link>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title={vacancy.title}
        subtitle={vacancy.description}
        actions={
          <div className="flex flex-wrap gap-2">
            <Tag>{vacancy.salary}</Tag>
            <Tag>{vacancy.experience}</Tag>
            <Tag>{vacancy.format}</Tag>
            <Tag>{vacancy.location}</Tag>
            <Tag>{vacancy.employment}</Tag>
          </div>
        }
      />

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <SectionCard title="О роли" eyebrow={vacancy.companyName} className="gold-glow-soft overflow-hidden">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-6">
                <p className="max-w-4xl text-sm leading-7 text-secondary">
                  {vacancy.note}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button>Откликнуться</Button>
                  <Button variant="secondary">Сохранить</Button>
                  <Button variant="ghost">Поделиться</Button>
                </div>
              </div>

              <Surface title="Ключевые параметры" subtitle="То, что важно команде" className="h-fit">
                <div className="grid gap-3 text-sm text-secondary">
                  <div className="flex items-center justify-between rounded-[18px] border border-white/8 px-4 py-3">
                    <span>Команда</span>
                    <span className="text-gold-soft">12 frontend-инженеров</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[18px] border border-white/8 px-4 py-3">
                    <span>Релизный цикл</span>
                    <span>1 неделя</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[18px] border border-white/8 px-4 py-3">
                    <span>Формат</span>
                    <span>{vacancy.format} / {vacancy.location}</span>
                  </div>
                </div>
              </Surface>
            </div>
          </SectionCard>

          {[
            { title: "Обязанности", points: vacancy.responsibilities },
            { title: "Требования", points: vacancy.requirements },
            { title: "Что предлагаем", points: vacancy.perks },
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
          <SectionCard title="Компания" eyebrow="Сайд-карта" className="h-fit">
            <div className="space-y-4 text-sm text-secondary">
              <Surface title={vacancy.companyName} subtitle="Карточка компании готова к связке с `GET /companies/{company_id}`." />
              <Surface title="О компании">
                <p className="text-sm leading-6 text-secondary">
                  Детальная страница уже опирается на единые сущности приложения, поэтому backend сможет подключить реальные данные без перестройки layout.
                </p>
              </Surface>
              <Surface title="Другие вакансии компании">
                <div className="space-y-2 text-sm text-secondary">
                  {data.vacancies
                    .filter((item) => item.companyId === vacancy.companyId && item.id !== vacancy.id)
                    .map((item) => (
                      <p key={item.id}>{item.title}</p>
                    ))}
                </div>
              </Surface>
            </div>
          </SectionCard>

          <SectionCard title="Похожие вакансии" eyebrow="Рекомендации">
            <div className="space-y-3">
              {["Инженер frontend-платформы", "Старший продуктовый дизайнер", "Технический рекрутер"].map((item) => (
                <Surface key={item} title={item} subtitle="Сильная продуктовая среда, удаленка/гибрид, премиальный B2B сегмент." />
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
