import { useEffect, useMemo, useState } from "react";

import type { Resume } from "../app/app-context";
import { httpRequest } from "../shared/api/http-client";
import { FilterPanel } from "../shared/ui/filter-panel";
import { FilterSection } from "../shared/ui/filter-section";
import { useDelayedLoading } from "../shared/hooks/use-delayed-loading";
import { Input } from "../shared/ui/input";
import { ListItem } from "../shared/ui/list-item";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { Select } from "../shared/ui/select";
import { Skeleton } from "../shared/ui/skeleton";
import { Tag } from "../shared/ui/tag";

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

type ResumeSort = "updated_desc" | "updated_asc" | "name_asc" | "role_asc";

export function ResumesPage() {
  const { isLoaded, showSkeleton } = useDelayedLoading({ totalMs: 980, delayMs: 220 });
  const [query, setQuery] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState<ResumeSort>("updated_desc");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadResumes() {
      const params = new URLSearchParams({ page: "1", page_size: "100" });

      if (query.trim()) params.set("q", query.trim());
      if (remoteOnly) params.set("remote", "true");
      params.set("sort", sortBy === "updated_asc" ? "updated_at" : "-updated_at");

      try {
        const response = await httpRequest<Array<Record<string, unknown>>>(`/resumes?${params.toString()}`);
        if (cancelled) return;

        setResumes(
          response.map((item) => ({
            id: String(item.id ?? ""),
            candidateId: String(item.candidate_id ?? ""),
            candidateName: String(item.candidate_name ?? ""),
            role: String(item.role ?? ""),
            experience: String(item.experience ?? ""),
            salary: String(item.salary ?? ""),
            location: String(item.location ?? ""),
            visibility: String(item.visibility ?? ""),
            updatedAt: String(item.updated_at ?? ""),
            about: String(item.about ?? ""),
            skills: Array.isArray(item.skills) ? item.skills.map((x) => String(x)) : [],
            education: String(item.education ?? ""),
            formatPreference: String(item.format_preference ?? ""),
          })),
        );
        setError(null);
      } catch (requestError) {
        if (cancelled) return;
        setResumes([]);
        setError(requestError instanceof Error ? requestError.message : "Не удалось загрузить кандидатов.");
      }
    }

    void loadResumes();
    return () => {
      cancelled = true;
    };
  }, [query, remoteOnly, sortBy]);

  const candidates = useMemo(() => {
    return [...resumes].sort((left, right) => {
      switch (sortBy) {
        case "updated_asc":
          return left.updatedAt.localeCompare(right.updatedAt, "en");
        case "name_asc":
          return left.candidateName.localeCompare(right.candidateName, "ru");
        case "role_asc":
          return left.role.localeCompare(right.role, "ru");
        default:
          return right.updatedAt.localeCompare(left.updatedAt, "en");
      }
    });
  }, [resumes, sortBy]);

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Кандидаты"
        subtitle="Подберите специалистов по навыкам, роли и формату работы."
        actions={
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Навыки, должность, имя" className="rounded-full" />
            <Select value={sortBy} onChange={(event) => setSortBy(event.target.value as ResumeSort)}>
              <option value="updated_desc">Сначала новые</option>
              <option value="updated_asc">Сначала старые</option>
              <option value="name_asc">По имени</option>
              <option value="role_asc">По роли</option>
            </Select>
            <button
              type="button"
              onClick={() => setRemoteOnly((current) => !current)}
              className="rounded-full border border-white/8 bg-soft/70 px-4 py-3 text-sm text-secondary"
            >
              {remoteOnly ? "Только удаленка" : "Все форматы"}
            </button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-28 xl:h-fit">
          <FilterPanel title="Фильтры кандидатов" eyebrow="Подбор" hint="Используйте поиск и фильтры, чтобы быстрее найти подходящего специалиста.">
            <FilterSection title="Популярные навыки" actionLabel="Теги">
              <div className="flex flex-wrap gap-2">
                {["React", "TypeScript", "Python", "Figma"].map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-secondary transition hover:border-gold/40 hover:bg-gold/10 hover:text-gold-soft"
                    onClick={() => setQuery(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Формат работы">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setRemoteOnly(false)}
                  className={[
                    "rounded-full border px-3 py-2 text-xs",
                    !remoteOnly ? "border-gold/40 bg-gold/10 text-gold-soft" : "border-white/10 bg-white/5 text-secondary",
                  ].join(" ")}
                >
                  Все
                </button>
                <button
                  type="button"
                  onClick={() => setRemoteOnly(true)}
                  className={[
                    "rounded-full border px-3 py-2 text-xs",
                    remoteOnly ? "border-gold/40 bg-gold/10 text-gold-soft" : "border-white/10 bg-white/5 text-secondary",
                  ].join(" ")}
                >
                  Удаленно
                </button>
              </div>
            </FilterSection>
          </FilterPanel>
        </aside>

        <section className="min-w-0 space-y-5">
          <div className="rounded-[22px] border border-white/8 bg-elevated/70 p-5">
            <div className="flex flex-wrap gap-2">
              <Tag>{candidates.length} результатов</Tag>
              <Tag>{remoteOnly ? "Только удаленка" : "Все форматы"}</Tag>
            </div>
          </div>

          {showSkeleton && !isLoaded ? (
            <ResumesSkeleton />
          ) : (
            <div className={["space-y-4 transition duration-500", isLoaded ? "opacity-100" : "opacity-0"].join(" ")}>
              {error ? <div className="rounded-[22px] border border-rose-300/30 bg-rose-500/10 p-6 text-sm text-rose-100">{error}</div> : null}
              {candidates.map((candidate) => (
                <ListItem
                  key={candidate.id}
                  title={candidate.candidateName}
                  subtitle={`${candidate.role} • ${candidate.experience} • ${candidate.location}`}
                  action={
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill) => (
                          <Tag key={skill}>{skill}</Tag>
                        ))}
                        <Tag>{candidate.salary}</Tag>
                      </div>
                    </div>
                  }
                />
              ))}
              {candidates.length === 0 ? (
                <div className="rounded-[22px] border border-white/8 bg-soft/60 p-6 text-sm text-secondary">
                  По текущим параметрам подходящих кандидатов не найдено.
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
