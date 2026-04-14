import type { PropsWithChildren, ReactNode } from "react";

type SurfaceProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  badge?: string;
  action?: ReactNode;
  className?: string;
}>;

export function Surface({ title, subtitle, badge, action, className = "", children }: SurfaceProps) {
  return (
    <section className={["rounded-[24px] border border-white/8 bg-soft/55 p-5", className].join(" ")}>
      {(title || subtitle || badge || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {badge ? <p className="text-xs uppercase tracking-[0.22em] text-gold-soft/75">{badge}</p> : null}
            {title ? <h3 className="mt-1 font-display text-xl font-semibold text-primary">{title}</h3> : null}
            {subtitle ? <p className="mt-2 text-sm text-secondary">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
