import type { ReactNode } from "react";

type PageTopBarProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function PageTopBar({ title, subtitle, actions }: PageTopBarProps) {
  return (
    <div className="rounded-[26px] border border-white/8 bg-elevated/85 p-5 shadow-card backdrop-blur sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-primary sm:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-3 max-w-3xl text-sm leading-6 text-secondary">{subtitle}</p> : null}
        </div>
        {actions ? <div className="w-full xl:w-auto">{actions}</div> : null}
      </div>
    </div>
  );
}
