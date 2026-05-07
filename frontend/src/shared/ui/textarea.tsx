import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={[
        "min-h-[140px] w-full rounded-[18px] border border-border bg-[var(--color-field)] px-4 py-3 text-sm text-primary outline-none transition placeholder:text-muted focus:border-gold/50 focus:bg-[var(--color-field-hover)]",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
