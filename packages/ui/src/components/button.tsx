import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "buy" | "sell" | "outline";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    "bg-amber-500 text-stone-950 hover:bg-amber-400 dark:bg-amber-400 dark:text-zinc-950",
  secondary:
    "bg-stone-900 text-white hover:bg-stone-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white",
  ghost:
    "bg-transparent text-stone-900 hover:bg-stone-100 dark:text-zinc-100 dark:hover:bg-zinc-800",
  buy: "bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500",
  sell: "bg-rose-600 text-white hover:bg-rose-500 dark:bg-rose-500",
  outline:
    "border border-stone-300 bg-transparent text-stone-900 hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900",
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
