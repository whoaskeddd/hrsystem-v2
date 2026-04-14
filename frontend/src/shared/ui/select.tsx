import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      className={[
        "w-full rounded-[18px] border border-white/10 bg-soft/70 px-4 py-3 text-sm text-primary outline-none transition focus:border-gold/40 focus:bg-soft/90",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </select>
  );
}
