import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={[
        "w-full rounded-[18px] border border-border bg-[var(--color-field)] px-4 py-3 text-sm text-primary outline-none transition placeholder:text-muted focus:border-gold/50 focus:bg-[var(--color-field-hover)]",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
