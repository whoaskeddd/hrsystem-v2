import { useNavigate } from "react-router-dom";

import { useAppContext } from "../app/app-context";
import { Button } from "../shared/ui/button";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { StatCard } from "../shared/ui/stat-card";
import { Surface } from "../shared/ui/surface";
import { TabGroup } from "../shared/ui/tab-group";
import { Tag } from "../shared/ui/tag";

export function LandingPage() {
  const navigate = useNavigate();
  const { data } = useAppContext();
  const featuredVacancies = data.vacancies.slice(0, 4);

  return (
    <div className="page-enter space-y-8 pb-8">
      <PageTopBar
        title="Найдите работу мечты или соберите сильную команду"
        subtitle="Платформа для поиска вакансий, работы с откликами и управления наймом в одном удобном пространстве."
        actions={<TabGroup tabs={["Соискателям", "Компаниям", "Администраторам"]} activeTab="Соискателям" />}
      />

      <section className="grid gap-6 2xl:grid-cols-[1.35fr_0.65fr]">
        <SectionCard title="Быстрый старт" eyebrow="Главный сценарий" className="gold-glow-soft overflow-hidden">
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <p className="max-w-3xl text-lg leading-8 text-secondary">
                Ищите подходящие вакансии, откликайтесь, ведите профиль и следите за всеми этапами найма в одном интерфейсе.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => navigate("/vacancies")}>Найти вакансии</Button>
                <Button variant="secondary" onClick={() => navigate("/resumes")}>
                  Найти кандидатов
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Tag>Вакансии</Tag>
                <Tag>Резюме</Tag>
                <Tag>Отклики</Tag>
                <Tag>Избранное</Tag>
                <Tag>Профили</Tag>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {[
                {
                  title: "Для соискателей",
                  text: "Профиль, отклики, уведомления и сохраненные вакансии всегда под рукой.",
                },
                {
                  title: "Для компаний",
                  text: "Управляйте вакансиями, отслеживайте отклики и ведите подбор в одном кабинете.",
                },
                {
                  title: "Для администраторов",
                  text: "Контролируйте ключевые процессы платформы и следите за важными событиями.",
                },
              ].map((item) => (
                <Surface key={item.title} title={item.title} subtitle={item.text} className="h-full" />
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Почему удобно" eyebrow="Преимущества">
          <div className="space-y-4 text-secondary">
            <p>Понятная структура, быстрый доступ к важным разделам и аккуратная подача информации помогают сосредоточиться на самом важном.</p>
            <div className="rounded-[20px] border border-gold/15 bg-gold/10 p-4">
              <p className="text-sm uppercase tracking-[0.18em] text-gold-soft/80">Возможности</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>Поиск вакансий и резюме</li>
                <li>Отклики и уведомления</li>
                <li>Кабинет соискателя и работодателя</li>
                <li>Избранное и история действий</li>
              </ul>
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Активных вакансий" value={String(data.vacancies.length)} meta="Свежие предложения в каталоге" />
        <StatCard label="Резюме в базе" value={String(data.resumes.length)} meta="Кандидаты с подробными профилями" />
        <StatCard
          label="Новых уведомлений"
          value={String(data.notifications.filter((item) => !item.isRead).length)}
          meta="Важные события после входа"
        />
      </section>

      <SectionCard title="Актуальные вакансии" eyebrow="Подборка">
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {featuredVacancies.map((vacancy) => (
            <article
              key={vacancy.id}
              className="rounded-[22px] border border-white/8 bg-soft/70 p-5 transition duration-200 hover:-translate-y-1 hover:border-gold/25 hover:shadow-glow"
            >
              <div className="mb-4">
                <h3 className="font-display text-lg font-semibold text-primary">{vacancy.title}</h3>
                <p className="mt-1 text-sm text-secondary">{vacancy.companyName}</p>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                <Tag>{vacancy.salary}</Tag>
                <Tag>{vacancy.experience}</Tag>
              </div>
              <p className="text-sm text-secondary">
                {vacancy.location} / {vacancy.format}
              </p>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
