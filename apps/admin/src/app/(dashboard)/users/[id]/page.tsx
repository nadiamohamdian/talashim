import { UserDetailPanel } from '@/features/users/components/user-detail-panel';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <UserDetailPanel userId={id} />;
}
