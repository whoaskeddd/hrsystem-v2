import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
    fullWidth?: boolean;
  }
>;

export function Button({
  children,
  className = "",
  variant = "primary",
  fullWidth = false,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "border-gold/55 bg-gold/12 text-gold-soft shadow-glow hover:border-gold/75 hover:bg-gold/18",
    secondary: "border-border bg-[var(--color-field)] text-primary hover:border-gold/30 hover:bg-[var(--color-field-hover)]",
    ghost: "border-transparent bg-transparent text-secondary hover:border-border hover:bg-[var(--color-field)] hover:text-primary",
  };

  return (
    <button
      className={[
        "rounded-full border px-5 py-3 text-sm font-medium transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
        variants[variant],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
