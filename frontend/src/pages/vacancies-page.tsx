import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { Vacancy } from "../app/app-context";
import { useAppContext } from "../app/app-context";
import { httpRequest } from "../shared/api/http-client";
import { Button } from "../shared/ui/button";
import { FilterPanel } from "../shared/ui/filter-panel";
import { FilterSection } from "../shared/ui/filter-section";
import { useDelayedLoading } from "../shared/hooks/use-delayed-loading";
import { Input } from "../shared/ui/input";
import { ListItem } from "../shared/ui/list-item";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { Select } from "../shared/ui/select";
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

type VacancySort = "newest" | "salary_desc" | "salary_asc" | "title_asc";

export function VacanciesPage() {
  const navigate = useNavigate();
  const { role, isVacancyFavorite, toggleFavoriteVacancy } = useAppContext();
  const { isLoaded, showSkeleton } = useDelayedLoading({ totalMs: 920, delayMs: 220 });
  const [search, setSearch] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [selectedEmployment, setSelectedEmployment] = useState<string>("all");
  const [sortBy, setSortBy] = useState<VacancySort>("newest");
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVacancies() {
      const params = new URLSearchParams({
        page: "1",
        page_size: "100",
      });

      if (search.trim()) {
        params.set("q", search.trim());
      }

      if (selectedEmployment !== "all") {
        params.set("employment", selectedEmployment);
      }

      if (selectedFormat === "Удаленно") {
        params.set("remote", "true");
      }

      if (sortBy === "salary_desc") {
        params.set("sort", "-salary");
      } else if (sortBy === "salary_asc") {
        params.set("sort", "salary");
      } else {
        params.set("sort", "-created_at");
      }

      try {
        const response = await httpRequest<Array<Record<string, unknown>>>(`/vacancies?${params.toString()}`);
        if (cancelled) {
          return;
        }

        const mapped: Vacancy[] = response.map((item) => ({
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
        }));

        setVacancies(mapped);
        setError(null);
      } catch (requestError) {
        if (cancelled) {
          return;
        }
        setVacancies([]);
        setError(requestError instanceof Error ? requestError.message : "Не удалось загрузить вакансии.");
      }
    }

    void loadVacancies();

    return () => {
      cancelled = true;
    };
  }, [search, selectedEmployment, selectedFormat, sortBy]);

  const vacancyCards = useMemo(() => {
    const filtered = vacancies.filter((item) => {
      const formatMatch = selectedFormat === "all" ? true : item.format === selectedFormat;
      return item.status === "published" && formatMatch;
    });

    return [...filtered].sort((left, right) => {
      switch (sortBy) {
        case "salary_desc":
          return right.salary.localeCompare(left.salary, "ru");
        case "salary_asc":
          return left.salary.localeCompare(right.salary, "ru");
        case "title_asc":
          return left.title.localeCompare(right.title, "ru");
        case "newest":
        default:
          return (right.publishedAt || "").localeCompare(left.publishedAt || "", "en");
      }
    });
  }, [vacancies, selectedFormat, sortBy]);

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Вакансии"
        subtitle="Подберите подходящую роль с помощью поиска, фильтров и сортировки."
        actions={
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Должность, навык, компания"
              className="rounded-full"
            />
            <Select value={sortBy} onChange={(event) => setSortBy(event.target.value as VacancySort)}>
              <option value="newest">Сначала новые</option>
              <option value="salary_desc">Сначала высокая зарплата</option>
              <option value="salary_asc">Сначала низкая зарплата</option>
              <option value="title_asc">По названию</option>
            </Select>
            <div className="rounded-full border border-white/8 bg-soft/70 px-4 py-3 text-sm text-secondary">
              Найдено: {vacancyCards.length}
            </div>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-28 xl:h-fit">
          <FilterPanel title="Фильтры вакансий" eyebrow="Подбор" hint="Уточните параметры, чтобы быстрее найти нужную вакансию.">
            <FilterSection title="Формат работы">
              <div className="flex flex-wrap gap-2">
                {["all", "Удаленно", "Гибрид", "Офис"].map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setSelectedFormat(item)}
                    className={[
                      "rounded-full border px-3 py-2 text-xs",
                      selectedFormat === item ? "border-gold/40 bg-gold/10 text-gold-soft" : "border-white/10 bg-white/5 text-secondary",
                    ].join(" ")}
                  >
                    {item === "all" ? "Все" : item}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Тип занятости">
              <div className="flex flex-wrap gap-2">
                {["all", "Полная занятость", "Частичная занятость", "Проектная работа", "Стажировка"].map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setSelectedEmployment(item)}
                    className={[
                      "rounded-full border px-3 py-2 text-xs",
                      selectedEmployment === item ? "border-gold/40 bg-gold/10 text-gold-soft" : "border-white/10 bg-white/5 text-secondary",
                    ].join(" ")}
                  >
                    {item === "all" ? "Все" : item}
                  </button>
                ))}
              </div>
            </FilterSection>
          </FilterPanel>
        </aside>

        <section className="min-w-0 space-y-5">
          <div className="rounded-[22px] border border-white/8 bg-elevated/70 p-5">
            <div className="flex flex-wrap gap-2">
              <Tag>{selectedFormat === "all" ? "Все форматы" : selectedFormat}</Tag>
              <Tag>{selectedEmployment === "all" ? "Любая занятость" : selectedEmployment}</Tag>
              <Tag>{vacancyCards.length} результатов</Tag>
            </div>
          </div>

          {showSkeleton && !isLoaded ? (
            <VacanciesSkeleton />
          ) : (
            <div className={["space-y-4 transition duration-500", isLoaded ? "opacity-100" : "opacity-0"].join(" ")}>
              {error ? (
                <div className="rounded-[22px] border border-rose-300/30 bg-rose-500/10 p-6 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}
              {vacancyCards.map((item) => (
                <ListItem
                  key={item.id}
                  title={item.title}
                  subtitle={`${item.companyName} • ${item.location} • ${item.note}`}
                  action={
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex flex-wrap gap-2">
                        <Tag>{item.salary}</Tag>
                        <Tag>{item.experience}</Tag>
                        <Tag>{item.format}</Tag>
                      </div>
                      <Button onClick={() => navigate(`/vacancies/${item.id}`)}>Открыть</Button>
                      <Button
                        variant="secondary"
                        className="px-4"
                        onClick={() => {
                          if (role === "guest") {
                            navigate("/auth/login");
                            return;
                          }

                          void toggleFavoriteVacancy(item.id);
                        }}
                      >
                        {isVacancyFavorite(item.id) ? "★" : "☆"}
                      </Button>
                    </div>
                  }
                />
              ))}
              {vacancyCards.length === 0 ? (
                <div className="rounded-[22px] border border-white/8 bg-soft/60 p-6 text-sm text-secondary">
                  По текущим фильтрам ничего не найдено. Попробуйте изменить условия поиска.
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
