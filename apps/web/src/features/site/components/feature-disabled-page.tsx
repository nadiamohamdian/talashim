import Link from 'next/link';

type FeatureDisabledPageProps = {
  title: string;
  description: string;
};

export function FeatureDisabledPage({ title, description }: FeatureDisabledPageProps) {
  return (
    <div className="mx-auto max-w-lg">
      <div className="card-luxury p-8 text-center">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-muted">{description}</p>
        <Link href="/" className="btn-gold mt-6 inline-flex">
          بازگشت به فروشگاه
        </Link>
      </div>
    </div>
  );
}
