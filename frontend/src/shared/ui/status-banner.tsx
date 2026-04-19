import type { ReactNode } from "react";

type StatusBannerProps = {
  tone: "success" | "error" | "info";
  children: ReactNode;
};

export function StatusBanner({ tone, children }: StatusBannerProps) {
  const styles: Record<StatusBannerProps["tone"], React.CSSProperties> = {
    success: {
      backgroundColor: "var(--color-success-bg)",
      borderColor: "var(--color-success-border)",
      color: "var(--color-success-text)",
    },
    error: {
      backgroundColor: "var(--color-error-bg)",
      borderColor: "var(--color-error-border)",
      color: "var(--color-error-text)",
    },
    info: {
      backgroundColor: "var(--color-info-bg)",
      borderColor: "var(--color-info-border)",
      color: "var(--color-info-text)",
    },
  };

  return (
    <div className="rounded-[18px] border px-4 py-3 text-sm leading-6" style={styles[tone]}>
      {children}
    </div>
  );
}
