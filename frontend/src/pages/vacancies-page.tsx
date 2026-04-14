import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppContext } from "../app/app-context";
import { Button } from "../shared/ui/button";
import { FilterPanel } from "../shared/ui/filter-panel";
import { FilterSection } from "../shared/ui/filter-section";
import { useDelayedLoading } from "../shared/hooks/use-delayed-loading";
import { Input } from "../shared/ui/input";
import { ListItem } from "../shared/ui/list-item";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { Skeleton } from "../shared/ui/skeleton";
import { Tag } from "../shared/ui/tag";

function VacanciesSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-[24px] border border-white/8 bg-soft/55 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-7 w-72" />
              <Skeleton className="h-4 w-60" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full max-w-3xl" />
              <Skeleton className="h-4 w-5/6 max-w-2xl" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-12 w-36 rounded-full" />
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function VacanciesPage() {
  const navigate = useNavigate();
  const { data } = useAppContext();
  const { isLoaded, showSkeleton } = useDelayedLoading({ totalMs: 920, delayMs: 220 });
  const [search, setSearch] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const vacancyCards = useMemo(
    () =>
      data.vacancies.filter((item) => {
        const searchMatch =
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.companyName.toLowerCase().includes(search.toLowerCase()) ||
          item.note.toLowerCase().includes(search.toLowerCase());
        const formatMatch = selectedFormat ? item.format === selectedFormat : true;
        return item.status === "published" && searchMatch && formatMatch;
      }),
    [data.vacancies, search, selectedFormat],
  );

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Вакансии"
        subtitle="Поиск вакансий с фильтрами, похожими на hh.ru: левый rail, быстрые параметры, понятная сортировка и удобное сканирование карточек."
        actions={
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Должность, навык, компания" className="rounded-full" />
            <div className="rounded-full border border-white/8 bg-soft/70 px-4 py-3 text-sm text-secondary">
              Сортировка: по дате
            </div>
            <div className="rounded-full border border-white/8 bg-soft/70 px-4 py-3 text-sm text-secondary">
              На странице: 20
            </div>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)] 2xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-28 xl:h-fit">
          <FilterPanel
            title="Фильтры вакансий"
            eyebrow="Расширенный поиск"
            hint="Сохраненные поиски, подписки и дополнительные параметры можно связать со store на следующем этапе."
            action={<span className="text-xs uppercase tracking-[0.18em] text-secondary">Расширенный поиск</span>}
            footer={
              <div className="flex flex-col gap-3 pt-2">
                <Button fullWidth>Показать {vacancyCards.length} вакансии</Button>
                <Button variant="secondary" fullWidth>
                  Сохранить поиск
                </Button>
                <Button variant="ghost" fullWidth>
                  Сбросить фильтры
                </Button>
              </div>
            }
          >
            <FilterSection title="Зарплата">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-[14px] border border-white/8 bg-base/70 px-3 py-3 text-sm text-secondary">от 120 000</div>
                  <div className="rounded-[14px] border border-white/8 bg-base/70 px-3 py-3 text-sm text-secondary">до 320 000</div>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="gold-glow-soft h-full w-2/3 rounded-full bg-gold/70" />
                </div>
              </div>
            </FilterSection>

            <FilterSection title="Опыт работы">
              <div className="space-y-2 text-sm text-secondary">
                {["Не имеет значения", "От 1 года до 3 лет", "От 3 до 6 лет", "Более 6 лет"].map((item, index) => (
                  <label key={item} className="flex items-center gap-3 rounded-[14px] px-2 py-2 hover:bg-white/5">
                    <span className={["h-4 w-4 rounded-full border", index === 2 ? "border-gold bg-gold/80" : "border-white/20"].join(" ")} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Формат работы">
              <div className="flex flex-wrap gap-2">
                {["Удаленно", "Гибрид", "Офис"].map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setSelectedFormat((current) => (current === item ? null : item))}
                    className={[
                      "rounded-full border px-3 py-2 text-xs",
                      selectedFormat === item ? "border-gold/40 bg-gold/10 text-gold-soft" : "border-white/10 bg-white/5 text-secondary",
                    ].join(" ")}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Тип занятости">
              <div className="space-y-2 text-sm text-secondary">
                {["Полная занятость", "Частичная занятость", "Проектная работа", "Стажировка"].map((item, index) => (
                  <label key={item} className="flex items-center gap-3 rounded-[14px] px-2 py-2 hover:bg-white/5">
                    <span className={["h-4 w-4 rounded-[5px] border", index === 0 ? "border-gold bg-gold/80" : "border-white/20"].join(" ")} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Регион">
              <div className="space-y-3">
                <div className="rounded-[14px] border border-white/8 bg-base/70 px-3 py-3 text-sm text-muted">Москва, Санкт-Петербург, удаленно</div>
                <div className="flex flex-wrap gap-2">
                  <Tag>Москва</Tag>
                  <Tag>Санкт-Петербург</Tag>
                  <Tag>Удаленно</Tag>
                </div>
              </div>
            </FilterSection>
          </FilterPanel>
        </aside>

        <section className="min-w-0 space-y-5">
          <div className="rounded-[22px] border border-white/8 bg-elevated/70 p-5">
            <div className="flex flex-wrap gap-2">
              <Tag>Удаленно</Tag>
              <Tag>Гибрид</Tag>
              <Tag>Москва</Tag>
              <Tag>3-6 лет</Tag>
              <Tag>Полная занятость</Tag>
            </div>
          </div>

          {showSkeleton && !isLoaded ? (
            <VacanciesSkeleton />
          ) : (
            <div className={["space-y-4 transition duration-500", isLoaded ? "opacity-100" : "opacity-0"].join(" ")}>
              {vacancyCards.map((item, index) => (
                <ListItem
                  key={item.id}
                  title={item.title}
                  subtitle={`${item.companyName} • ${item.location} • ${item.note}`}
                  meta={index === 0 ? "горячая вакансия" : undefined}
                  action={
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex flex-wrap gap-2">
                        <Tag>{item.salary}</Tag>
                        <Tag>{item.experience}</Tag>
                        <Tag>{item.format}</Tag>
                      </div>
                      <Button onClick={() => navigate(`/vacancies/${item.id}`)}>Открыть</Button>
                      <Button variant="secondary" className="px-4">
                        ★
                      </Button>
                    </div>
                  }
                  accent={index === 0}
                />
              ))}
              {vacancyCards.length === 0 ? (
                <div className="rounded-[22px] border border-white/8 bg-soft/60 p-6 text-sm text-secondary">
                  По текущим фильтрам ничего не найдено. Сбрось формат работы или измени запрос.
                </div>
              ) : null}
              <div className="flex justify-center pt-2">
                <Button variant="secondary">Показать еще</Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
