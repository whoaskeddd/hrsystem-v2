import type { PropsWithChildren } from "react";

export function Tag({ children }: PropsWithChildren) {
  return (
    <span className="inline-flex items-center rounded-full border border-gold/15 bg-gold/10 px-3 py-1 text-xs font-medium text-gold-soft">
      {children}
    </span>
  );
}
