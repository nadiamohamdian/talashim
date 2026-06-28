export interface HomeMagazineArticleItem {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  href: string;
}

export const HOME_MAGAZINE_COVER_IMAGE =
  '/images/home/jeweler-working-his-workshop-cutting-gold-ring-with-saw%201.png';

export const HOME_MAGAZINE_READ_MORE_LABEL = 'ادامه مطلب';

export const HOME_MAGAZINE_DEMO_SLUG = 'jewelry-care-tips';

export const HOME_MAGAZINE_DEMO_HREF = `/blog/${HOME_MAGAZINE_DEMO_SLUG}`;

export const HOME_MAGAZINE_DEMO_EXCERPT =
  'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.';

const HOME_MAGAZINE_DEMO_TITLE = 'چگونه از طلا و جواهرات خود نگهداری کنیم؟';

export const HOME_MAGAZINE_DEMO_ITEMS: HomeMagazineArticleItem[] = [
  {
    id: 'magazine-demo-1',
    title: HOME_MAGAZINE_DEMO_TITLE,
    excerpt: HOME_MAGAZINE_DEMO_EXCERPT,
    imageUrl: HOME_MAGAZINE_COVER_IMAGE,
    href: HOME_MAGAZINE_DEMO_HREF,
  },
  {
    id: 'magazine-demo-2',
    title: HOME_MAGAZINE_DEMO_TITLE,
    excerpt: HOME_MAGAZINE_DEMO_EXCERPT,
    imageUrl: HOME_MAGAZINE_COVER_IMAGE,
    href: HOME_MAGAZINE_DEMO_HREF,
  },
  {
    id: 'magazine-demo-3',
    title: HOME_MAGAZINE_DEMO_TITLE,
    excerpt: HOME_MAGAZINE_DEMO_EXCERPT,
    imageUrl: HOME_MAGAZINE_COVER_IMAGE,
    href: HOME_MAGAZINE_DEMO_HREF,
  },
  {
    id: 'magazine-demo-4',
    title: HOME_MAGAZINE_DEMO_TITLE,
    excerpt: HOME_MAGAZINE_DEMO_EXCERPT,
    imageUrl: HOME_MAGAZINE_COVER_IMAGE,
    href: HOME_MAGAZINE_DEMO_HREF,
  },
];
