import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../lib/utils";

export function Card({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-stone-200 bg-white shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
