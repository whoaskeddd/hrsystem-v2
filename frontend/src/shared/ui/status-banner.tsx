import type { ReactNode } from "react";

type StatusBannerProps = {
  tone: "success" | "error" | "info";
  children: ReactNode;
};

export function StatusBanner({ tone, children }: StatusBannerProps) {
  const styles = {
    success: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
    error: "border-red-400/20 bg-red-500/10 text-red-100",
    info: "border-gold/20 bg-gold/10 text-gold-soft",
  };

  return <div className={["rounded-[18px] border px-4 py-3 text-sm leading-6", styles[tone]].join(" ")}>{children}</div>;
}
