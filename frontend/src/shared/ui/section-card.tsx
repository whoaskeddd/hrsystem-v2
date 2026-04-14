import type { PropsWithChildren, ReactNode } from "react";

type SectionCardProps = PropsWithChildren<{
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
}>;

export function SectionCard({ title, eyebrow, action, className = "", children }: SectionCardProps) {
  return (
    <section
      className={[
        "rounded-shell border border-white/8 bg-elevated/90 p-6 shadow-card backdrop-blur sm:p-8",
        className,
      ].join(" ")}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          {eyebrow ? <p className="mb-2 text-xs uppercase tracking-[0.22em] text-gold-soft/80">{eyebrow}</p> : null}
          <h2 className="font-display text-2xl font-semibold text-primary">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
