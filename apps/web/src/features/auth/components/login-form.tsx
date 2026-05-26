"use client";

import { Button } from "@gold/ui";
import { useState } from "react";

export function LoginForm() {
  const [status, setStatus] = useState<"idle" | "success">("idle");

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setStatus("success");
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700" htmlFor="email">
          ایمیل
        </label>
        <input
          id="email"
          type="email"
          required
          className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none ring-amber-400 transition focus:ring-2"
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700" htmlFor="password">
          رمز عبور
        </label>
        <input
          id="password"
          type="password"
          required
          className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none ring-amber-400 transition focus:ring-2"
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" className="w-full">
        ورود به حساب
      </Button>
      {status === "success" ? (
        <p className="text-sm text-emerald-700">
          فرم آماده است و در مرحله بعد به endpoint احراز هویت متصل می‌شود.
        </p>
      ) : null}
    </form>
  );
}
