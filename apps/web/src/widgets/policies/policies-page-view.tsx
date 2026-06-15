import Link from 'next/link';
import { POLICIES_PAGE_COPY } from '@/shared/config/policies-page';

export function PoliciesPageView() {
  return (
    <div className="policies-page store-chrome-light store-minimal-header">
      <div className="policies-page-inner">
        <h1 className="policies-page-title">{POLICIES_PAGE_COPY.title}</h1>
        <p className="policies-page-lead">{POLICIES_PAGE_COPY.lead}</p>

        <div className="policies-page-sections">
          {POLICIES_PAGE_COPY.sections.map((section) => (
            <section key={section.heading} className="policies-page-section">
              <h2 className="policies-page-section-title">{section.heading}</h2>
              <p className="policies-page-body">{section.body}</p>
            </section>
          ))}
        </div>

        <Link href="/contact" className="policies-page-cta">
          تماس با پشتیبانی
        </Link>
      </div>
    </div>
  );
}
