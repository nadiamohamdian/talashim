'use client';

import Image from 'next/image';
import {
  ABOUT_PAGE_COPY,
  ABOUT_PAGE_VALUES,
} from '@/shared/config/about-page';

export function AboutPageView() {
  return (
    <div className="about-page store-chrome-light store-minimal-header">
      <div className="about-page-inner">
        <header className="about-page-hero">
          <h1 className="about-page-title">{ABOUT_PAGE_COPY.heroTitle}</h1>
          <p className="about-page-intro">{ABOUT_PAGE_COPY.intro}</p>
        </header>

        <section className="about-page-section" aria-labelledby="about-story-title">
          <h2 id="about-story-title" className="about-page-section-title">
            {ABOUT_PAGE_COPY.storyTitle}
          </h2>
          <p className="about-page-body">{ABOUT_PAGE_COPY.storyBody}</p>
        </section>

        <section
          className="about-page-section about-page-section--values"
          aria-labelledby="about-values-title"
        >
          <h2 id="about-values-title" className="about-page-section-title">
            {ABOUT_PAGE_COPY.valuesTitle}
          </h2>

          <div className="about-values-grid">
            {ABOUT_PAGE_VALUES.map((value) => (
              <article key={value.key} className="about-value-card">
                <span className={`about-value-icon-wrap about-value-icon-wrap--${value.key}`}>
                  <Image
                    src={value.icon}
                    alt=""
                    width={value.iconWidth}
                    height={value.iconHeight}
                    className="about-value-icon"
                    sizes="30px"
                  />
                </span>
                <h3 className="about-value-label">{value.label}</h3>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
