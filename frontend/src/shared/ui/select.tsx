import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      className={[
        "w-full appearance-none rounded-[18px] border border-border bg-[var(--color-field)] px-4 py-3 text-sm text-primary outline-none transition focus:border-gold/50 focus:bg-[var(--color-field-hover)]",
        className,
      ].join(" ")}
      style={{ color: "var(--color-text-primary)" }}
      {...props}
    >
      {children}
    </select>
  );
}
