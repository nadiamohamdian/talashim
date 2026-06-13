export interface HomeMagazineArticleItem {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  href: string;
}

export const HOME_MAGAZINE_COVER_IMAGE = '/images/home/Rectangle%20171.png';

export const HOME_MAGAZINE_READ_MORE_LABEL = 'ادامه مطلب';

export const HOME_MAGAZINE_DEMO_EXCERPT =
  'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه...';

const HOME_MAGAZINE_DEMO_TITLE = 'چگونه از جواهرات خود نگهداری کنیم؟';

export const HOME_MAGAZINE_DEMO_ITEMS: HomeMagazineArticleItem[] = [
  {
    id: 'magazine-demo-1',
    title: HOME_MAGAZINE_DEMO_TITLE,
    excerpt: HOME_MAGAZINE_DEMO_EXCERPT,
    imageUrl: HOME_MAGAZINE_COVER_IMAGE,
    href: '/blog',
  },
  {
    id: 'magazine-demo-2',
    title: HOME_MAGAZINE_DEMO_TITLE,
    excerpt: HOME_MAGAZINE_DEMO_EXCERPT,
    imageUrl: HOME_MAGAZINE_COVER_IMAGE,
    href: '/blog',
  },
  {
    id: 'magazine-demo-3',
    title: HOME_MAGAZINE_DEMO_TITLE,
    excerpt: HOME_MAGAZINE_DEMO_EXCERPT,
    imageUrl: HOME_MAGAZINE_COVER_IMAGE,
    href: '/blog',
  },
];
