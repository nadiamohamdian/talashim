import { Card } from "@gold/ui";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="p-8">
        <p className="text-sm font-medium text-amber-700">احراز هویت</p>
        <h1 className="mt-3 text-3xl font-bold text-stone-950">ورود به حساب کاربری</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          در این اسکلت، فرم ورود آماده است و به‌سادگی به endpointهای `auth` متصل می‌شود.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </Card>
    </div>
  );
}
