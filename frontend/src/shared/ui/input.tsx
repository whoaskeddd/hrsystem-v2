import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={[
        "w-full rounded-[18px] border border-white/10 bg-soft/70 px-4 py-3 text-sm text-primary outline-none transition placeholder:text-muted focus:border-gold/40 focus:bg-soft/90",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
