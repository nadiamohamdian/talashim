export const FAQ_PAGE_META = {
  title: 'سوالات متداول',
  description: 'پاسخ سوالات رایج درباره سفارش، ارسال، پرداخت و محصولات طلاشیم.',
} as const;

const FIGMA_PLACEHOLDER_QUESTION = 'صنعت چاپ، و با استفاده از طراحان گرافیک است؟';

const FIGMA_PLACEHOLDER_ANSWER =
  'صنعت چاپ، و با استفاده از طراحان گرافیک است؟ صنعت چاپ، و با استفاده از طراحان گرافیک است؟ صنعت چاپ، و با استفاده از طراحان گرافیک است؟ صنعت چاپ، و با استفاده از طراحان گرافیک است؟ صنعت صنعت چاپ، و با استفاده از طراحان گرافیک است؟ صنعت چاپ، و با استفاده از طراحان گرافیک';

export interface FaqPageItem {
  id: string;
  question: string;
  answer: string;
}

/** Fallback content when CMS FAQ posts are unavailable — matches Figma layout. */
export const DEMO_FAQ_ITEMS: FaqPageItem[] = Array.from({ length: 12 }, (_, index) => ({
  id: `demo-faq-${index + 1}`,
  question: FIGMA_PLACEHOLDER_QUESTION,
  answer: FIGMA_PLACEHOLDER_ANSWER,
}));
