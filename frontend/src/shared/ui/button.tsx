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
    primary: "border-gold/60 bg-gold/10 text-gold-soft shadow-glow hover:border-gold/80 hover:bg-gold/15",
    secondary: "border-white/10 bg-white/5 text-primary hover:border-white/20 hover:bg-white/8",
    ghost: "border-transparent bg-transparent text-secondary hover:border-white/10 hover:bg-white/5 hover:text-primary",
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
