import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={[
        "min-h-[140px] w-full rounded-[18px] border border-white/10 bg-soft/70 px-4 py-3 text-sm text-primary outline-none transition placeholder:text-muted focus:border-gold/40 focus:bg-soft/90",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
