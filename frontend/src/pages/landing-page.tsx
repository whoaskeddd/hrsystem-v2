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
        title="Найдите работу мечты или наймите лучших кандидатов"
        subtitle="Фронтенд уже закрывает foundation, auth flow и кабинеты для ролей. Backend можно подключать к готовому UI слою без переписывания экранов."
        actions={<TabGroup tabs={["Соискателям", "Компаниям", "Администраторам"]} activeTab="Соискателям" />}
      />

      <section className="grid gap-6 2xl:grid-cols-[1.35fr_0.65fr]">
        <SectionCard title="Быстрый старт" eyebrow="Главный сценарий" className="gold-glow-soft overflow-hidden">
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <p className="max-w-3xl text-lg leading-8 text-secondary">
                Сервис спроектирован в логике hh.ru, но с более аккуратной визуальной системой: больше воздуха, чище карточки, спокойнее навигация и явнее ключевые действия.
              </p>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
                <div className="rounded-[22px] border border-white/8 bg-soft/80 p-3">
                  <input
                    className="w-full bg-transparent px-3 py-3 text-base text-primary outline-none placeholder:text-muted"
                    placeholder="Название должности, навык, компания..."
                  />
                </div>
                <Button className="w-full justify-center" onClick={() => navigate("/vacancies")}>
                  Найти
                </Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => navigate("/vacancies")}>Найти вакансии</Button>
                <Button variant="secondary" onClick={() => navigate("/resumes")}>Найти кандидатов</Button>
                <Button variant="ghost">Сохраненные поиски</Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Tag>Москва</Tag>
                <Tag>Удаленно</Tag>
                <Tag>Полная занятость</Tag>
                <Tag>Middle+</Tag>
                <Tag>Продукт</Tag>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {[
                {
                  title: "Для соискателей",
                  text: "Быстрый поиск вакансий, прозрачные статусы откликов и центр коммуникации внутри платформы.",
                },
                {
                  title: "Для компаний",
                  text: "Публикация вакансий, поиск кандидатов и единый процесс общения без разрыва между этапами.",
                },
                {
                  title: "Для администраторов",
                  text: "Модерация, контроль контента, логов и ключевых сущностей в одной панели.",
                },
              ].map((item) => (
                <Surface key={item.title} title={item.title} subtitle={item.text} className="h-full" />
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Что уже готово" eyebrow="Foundation">
          <div className="space-y-4 text-secondary">
            <p>Frontend уже выглядит как единая polished foundation-версия: общая система карточек, списков, фильтров, сообщений и административных экранов.</p>
            <div className="rounded-[20px] border border-gold/15 bg-gold/10 p-4">
              <p className="text-sm uppercase tracking-[0.18em] text-gold-soft/80">Текущий статус</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>Полноширинный shell и маршруты</li>
                <li>Dark/gold визуальная система по design-system-spec</li>
                <li>hh.ru-подобные фильтры и структура списков</li>
                <li>Мягкие анимации и skeleton loading по необходимости</li>
              </ul>
            </div>
            <Surface badge="Интеграция" title="Что можно подключать дальше" subtitle="JWT auth, profile endpoints, CRUD вакансий и резюме, WebSocket chat и signaling звонков." />
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Активных вакансий" value={String(data.vacancies.length)} meta="Карточки подключены к общему store" />
        <StatCard label="Кандидатов в базе" value={String(data.resumes.length)} meta="Поиск и фильтры готовы к реальным DTO" />
        <StatCard label="Новых уведомлений" value={String(data.notifications.filter((item) => !item.isRead).length)} meta="Встроенный центр событий и read state" />
      </section>

      <SectionCard title="Избранные вакансии" eyebrow="Подборка">
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {featuredVacancies.map((vacancy) => (
            <article key={vacancy.title} className="rounded-[22px] border border-white/8 bg-soft/70 p-5 transition duration-200 hover:-translate-y-1 hover:border-gold/25 hover:shadow-glow">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-primary">{vacancy.title}</h3>
                  <p className="mt-1 text-sm text-secondary">{vacancy.companyName}</p>
                </div>
                <span className="text-gold-soft">★</span>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                <Tag>{vacancy.salary}</Tag>
                <Tag>{vacancy.experience}</Tag>
              </div>
              <p className="text-sm text-secondary">{vacancy.location} / {vacancy.format}</p>
            </article>
          ))}
        </div>
      </SectionCard>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <SectionCard title="Как это работает" eyebrow="3 шага">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Создайте профиль", description: "Заполните резюме или оформите профиль компании за несколько минут." },
              { title: "Ищите точечно", description: "Используйте фильтры, быстрый поиск и сохраненные подборки." },
              { title: "Общайтесь внутри платформы", description: "Сообщения, статусы откликов и звонки собраны в одном месте." },
            ].map((step, index) => (
              <article key={step.title} className="rounded-[20px] border border-white/8 bg-soft/60 p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-gold-soft/70">Шаг {index + 1}</p>
                <h3 className="mt-3 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-secondary">{step.description}</p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Поддерживаемые сценарии" eyebrow="Собранные экраны">
          <div className="grid gap-4 sm:grid-cols-2">
            {["Поиск вакансий", "Поиск кандидатов", "Карточка вакансии", "Личный кабинет", "Сообщения и звонки", "Административные разделы"].map((item) => (
              <Surface key={item} className="h-full" title={item} subtitle="Экран уже переведен на единый app state и не зависит от локальных page-level заглушек." />
            ))}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
