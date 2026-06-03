export function AuthBootScreen({ message = 'در حال بررسی احراز هویت...' }: { message?: string }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-600 dark:border-zinc-800 dark:bg-zinc-900">
      {message}
    </div>
  );
}
