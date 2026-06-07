import type { PublicCmsStaticPage } from '@sadafgold/types';
import { RichHtmlContent } from '@/shared/ui/rich-html-content';

interface CmsStaticPageViewProps {
  page: PublicCmsStaticPage;
}

export function CmsStaticPageView({ page }: CmsStaticPageViewProps) {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-stone-950 dark:text-zinc-50">{page.title}</h1>
      </div>
      <RichHtmlContent
        html={page.content}
        className="prose prose-sm max-w-none text-sm leading-8 text-stone-700 dark:text-zinc-300 [&_a]:text-amber-700 [&_a]:underline [&_img]:rounded-xl [&_p]:mb-4"
      />
    </div>
  );
}
