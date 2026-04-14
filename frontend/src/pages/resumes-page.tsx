import { Button } from "../shared/ui/button";
import { FilterPanel } from "../shared/ui/filter-panel";
import { FilterSection } from "../shared/ui/filter-section";
import { useDelayedLoading } from "../shared/hooks/use-delayed-loading";
import { ListItem } from "../shared/ui/list-item";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { Skeleton } from "../shared/ui/skeleton";
import { Tag } from "../shared/ui/tag";

const candidates = [
  {
    name: "Анна Смирнова",
    role: "Старший frontend-разработчик",
    experience: "5 лет опыта",
    salary: "200 000 ₽",
    location: "Москва",
    skills: ["React", "TypeScript", "Дизайн-системы"],
  },
  {
    name: "Илья Воронцов",
    role: "Продуктовый дизайнер",
    experience: "4 года опыта",
    salary: "220 000 ₽",
    location: "Санкт-Петербург",
    skills: ["Figma", "UX", "Исследования"],
  },
  {
    name: "Мария Волкова",
    role: "Руководитель подбора",
    experience: "7 лет опыта",
    salary: "250 000 ₽",
    location: "Удаленно",
    skills: ["Подбор", "Аналитика", "Стейкхолдеры"],
  },
];

function ResumesSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-[24px] border border-white/8 bg-soft/55 p-5">
          <div className="space-y-4">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-56" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full max-w-3xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ResumesPage() {
  const { isLoaded, showSkeleton } = useDelayedLoading({ totalMs: 980, delayMs: 220 });

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Поиск кандидатов"
        subtitle="Экран для работодателя и рекрутера: быстрая фильтрация, понятное сканирование профилей и компактные действия по каждому кандидату."
        actions={
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
            <div className="rounded-full border border-white/8 bg-soft/70 px-4 py-3 text-sm text-muted">
              Навыки, должность, опыт, ключевые слова
            </div>
            <div className="rounded-full border border-white/8 bg-soft/70 px-4 py-3 text-sm text-secondary">
              Сортировка: релевантность
            </div>
            <div className="rounded-full border border-white/8 bg-soft/70 px-4 py-3 text-sm text-secondary">
              Только новые
            </div>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)] 2xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-28 xl:h-fit">
          <FilterPanel
            title="Фильтры кандидатов"
            eyebrow="Левая панель поиска"
            hint="Быстрые теги навыков, расширенный поиск и сохраненные подборки можно связать со store на следующем шаге."
            footer={
              <div className="flex flex-col gap-3">
                <Button fullWidth>Показать 48 кандидатов</Button>
                <Button variant="secondary" fullWidth>
                  Сохранить поиск
                </Button>
              </div>
            }
          >
            <FilterSection title="Опыт">
              <div className="space-y-2 text-sm text-secondary">
                {["Не имеет значения", "1-3 года", "3-6 лет", "Более 6 лет"].map((item, index) => (
                  <label key={item} className="flex items-center gap-3 rounded-[14px] px-2 py-2 hover:bg-white/5">
                    <span className={["h-4 w-4 rounded-[5px] border", index === 2 ? "border-gold bg-gold/80" : "border-white/20"].join(" ")} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Зарплатные ожидания">
              <div className="space-y-2 text-sm text-secondary">
                {["До 150 000 ₽", "150 000-220 000 ₽", "220 000-300 000 ₽", "Выше 300 000 ₽"].map((item, index) => (
                  <label key={item} className="flex items-center gap-3 rounded-[14px] px-2 py-2 hover:bg-white/5">
                    <span className={["h-4 w-4 rounded-full border", index === 1 ? "border-gold bg-gold/80" : "border-white/20"].join(" ")} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Локация и удаленка">
              <div className="space-y-2 text-sm text-secondary">
                {["Москва", "Санкт-Петербург", "Удаленно", "Готов к релокации"].map((item, index) => (
                  <label key={item} className="flex items-center gap-3 rounded-[14px] px-2 py-2 hover:bg-white/5">
                    <span className={["h-4 w-4 rounded-[5px] border", index === 2 ? "border-gold bg-gold/80" : "border-white/20"].join(" ")} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Образование">
              <div className="space-y-2 text-sm text-secondary">
                {["Высшее", "Среднее специальное", "Курсы и буткемпы"].map((item) => (
                  <label key={item} className="flex items-center gap-3 rounded-[14px] px-2 py-2 hover:bg-white/5">
                    <span className="h-4 w-4 rounded-[5px] border border-white/20" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Навыки" actionLabel="Теги">
              <div className="flex flex-wrap gap-2">
                <Tag>React</Tag>
                <Tag>TypeScript</Tag>
                <Tag>Figma</Tag>
                <Tag>HRTech</Tag>
                <Tag>Аналитика</Tag>
              </div>
            </FilterSection>
          </FilterPanel>
        </aside>

        <section className="min-w-0 space-y-5">
          <div className="rounded-[22px] border border-white/8 bg-elevated/70 p-5">
            <div className="flex flex-wrap gap-2">
              <Tag>React</Tag>
              <Tag>Москва</Tag>
              <Tag>3-6 лет</Tag>
              <Tag>Высшее образование</Tag>
            </div>
          </div>

          {showSkeleton && !isLoaded ? (
            <ResumesSkeleton />
          ) : (
            <div className={["space-y-4 transition duration-500", isLoaded ? "opacity-100" : "opacity-0"].join(" ")}>
              {candidates.map((candidate, index) => (
                <ListItem
                  key={candidate.name}
                  title={candidate.name}
                  subtitle={`${candidate.role} • ${candidate.experience} • ${candidate.location}`}
                  meta={index === 0 ? "лучшее совпадение" : undefined}
                  action={
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill) => (
                          <Tag key={skill}>{skill}</Tag>
                        ))}
                        <Tag>{candidate.salary}</Tag>
                      </div>
                      <Button>Просмотреть</Button>
                      <Button variant="secondary">Пригласить</Button>
                    </div>
                  }
                  accent={index === 0}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
