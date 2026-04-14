import type { PropsWithChildren, ReactNode } from "react";

import { Button } from "./button";
import { SectionCard } from "./section-card";

type FilterPanelProps = PropsWithChildren<{
  title: string;
  eyebrow?: string;
  hint?: string;
  footer?: ReactNode;
  action?: ReactNode;
  className?: string;
}>;

export function FilterPanel({
  title,
  eyebrow,
  hint,
  footer,
  action,
  className = "",
  children,
}: FilterPanelProps) {
  return (
    <SectionCard title={title} eyebrow={eyebrow} action={action} className={`gold-glow-soft ${className}`.trim()}>
      <div className="space-y-4">
        {hint ? <div className="rounded-[18px] border border-gold/15 bg-gold/10 p-4 text-sm text-secondary">{hint}</div> : null}
        {children}
        {footer ?? (
          <div className="flex flex-col gap-3 pt-2">
            <Button fullWidth>Применить</Button>
            <Button variant="secondary" fullWidth>
              Сохранить поиск
            </Button>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
