'use client';

import Image from 'next/image';
import type { PublicCmsAboutPage } from '@sadafgold/types';

interface AboutPageViewProps {
  content: PublicCmsAboutPage;
}

export function AboutPageView({ content }: AboutPageViewProps) {
  const { copy, decorImageUrl, values } = content;

  return (
    <div className="about-page store-chrome-light store-minimal-header">
      <div className="about-page-inner">
        <div className="about-page-decor" aria-hidden>
          <Image
            src={decorImageUrl}
            alt=""
            width={351}
            height={468}
            className="about-page-decor-img"
            priority
            unoptimized
          />
        </div>

        <h1 id="about-page-title" className="about-page-title">
          {copy.heroTitle}
        </h1>
        <p className="about-page-intro">{copy.intro}</p>

        <section className="about-page-story" aria-labelledby="about-story-title">
          <h2 id="about-story-title" className="about-page-section-title">
            {copy.storyTitle}
          </h2>
          <p className="about-page-body">{copy.storyBody}</p>
        </section>

        <div className="about-page-layout">
          <section className="about-page-values" aria-labelledby="about-values-title">
            <h2 id="about-values-title" className="about-values-title">
              {copy.valuesTitle}
            </h2>

            <div className="about-values-grid">
              {values.map((value) => (
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
                  <h3 className="about-value-label">{value.label}</h3>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
