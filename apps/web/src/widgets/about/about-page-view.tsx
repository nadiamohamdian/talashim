'use client';

import Image from 'next/image';
import {
  ABOUT_PAGE_COPY,
  ABOUT_PAGE_DECOR_IMAGE,
  ABOUT_PAGE_VALUES,
} from '@/shared/config/about-page';

export function AboutPageView() {
  return (
    <div className="about-page store-chrome-light store-minimal-header">
      <div className="about-page-inner">
        <div className="about-page-decor" aria-hidden>
          <Image
            src={ABOUT_PAGE_DECOR_IMAGE}
            alt=""
            width={351}
            height={468}
            className="about-page-decor-img"
            priority
            unoptimized
          />
        </div>

        <div className="about-page-layout">
          <section className="about-page-story" aria-labelledby="about-story-title">
            <h2 id="about-story-title" className="about-page-section-title">
              {ABOUT_PAGE_COPY.storyTitle}
            </h2>
            <p className="about-page-body">{ABOUT_PAGE_COPY.storyBody}</p>
          </section>

          <section className="about-page-values" aria-labelledby="about-page-title">
            <h1 id="about-page-title" className="about-page-title">
              {ABOUT_PAGE_COPY.heroTitle}
            </h1>
            <p className="about-page-intro">{ABOUT_PAGE_COPY.intro}</p>

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
                      unoptimized
                    />
                  </span>
                  <h2 className="about-value-label">{value.label}</h2>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
