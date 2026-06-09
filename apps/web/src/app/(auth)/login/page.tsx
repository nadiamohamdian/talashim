import { AuthLoginView } from '@/widgets/auth/auth-login-view';

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return <AuthLoginView next={params.next ?? null} />;
}
