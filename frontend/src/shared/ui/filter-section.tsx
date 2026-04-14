import type { ReactNode } from "react";

type FilterSectionProps = {
  title: string;
  actionLabel?: string;
  children: ReactNode;
};

export function FilterSection({ title, actionLabel = "Скрыть", children }: FilterSectionProps) {
  return (
    <section className="rounded-[20px] border border-white/8 bg-soft/55 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-primary">{title}</h3>
        <span className="text-xs uppercase tracking-[0.18em] text-secondary">{actionLabel}</span>
      </div>
      {children}
    </section>
  );
}
