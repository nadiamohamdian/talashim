import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClassMap: Record<ButtonVariant, string> = {
  primary: "bg-amber-500 text-stone-950 hover:bg-amber-400",
  secondary: "bg-stone-900 text-white hover:bg-stone-800",
  ghost: "bg-transparent text-stone-900 hover:bg-stone-100",
};

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variantClassMap[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
