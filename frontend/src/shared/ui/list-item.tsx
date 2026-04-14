import type { ReactNode } from "react";

type ListItemProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  action?: ReactNode;
  accent?: boolean;
};

export function ListItem({ title, subtitle, meta, action, accent = false }: ListItemProps) {
  return (
    <div
      className={[
        "flex flex-col gap-4 rounded-[22px] border p-5 transition duration-200 lg:flex-row lg:items-center lg:justify-between",
        accent ? "border-gold/35 bg-gold/10 shadow-glow" : "border-white/8 bg-soft/60 hover:border-white/15",
      ].join(" ")}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-xl font-semibold text-primary">{title}</h3>
          {meta ? <span className="text-xs uppercase tracking-[0.2em] text-gold-soft/80">{meta}</span> : null}
        </div>
        {subtitle ? <p className="max-w-2xl text-sm leading-6 text-secondary">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
