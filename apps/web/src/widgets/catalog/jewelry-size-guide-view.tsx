'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { resolveSafeReturnPath } from '@/shared/lib/resolve-safe-return-path';

export type JewelrySizeGuideVariant = 'ring' | 'necklace' | 'bracelet';

export interface JewelrySizeGuideInfoBlock {
  subtitle: string;
  body: string;
}

export interface JewelrySizeGuideViewProps {
  variant: JewelrySizeGuideVariant;
  title: string;
  lead: string;
  leadDesktop?: string;
  chartSectionTitle?: string;
  chartHeaders: [string, string];
  chartRows: Array<{ primary: string; secondary: string }>;
  chartRowsDesktop?: Array<{ primary: string; secondary: string }>;
  tips: string[];
  tipsJustify?: boolean;
  diagram?: ReactNode;
  infoBlock?: JewelrySizeGuideInfoBlock;
  footnote?: string;
}

function JewelrySizeGuideTable({
  chartHeaders,
  chartRows,
  modifierClass,
}: {
  chartHeaders: [string, string];
  chartRows: Array<{ primary: string; secondary: string }>;
  modifierClass?: string;
}) {
  return (
    <div
      className={
        modifierClass
          ? `jewelry-size-guide-table-wrap ${modifierClass}`
          : 'jewelry-size-guide-table-wrap'
      }
    >
      <table className="jewelry-size-guide-table">
        <thead>
          <tr>
            <th scope="col">{chartHeaders[0]}</th>
            <th scope="col">{chartHeaders[1]}</th>
          </tr>
        </thead>
        <tbody>
          {chartRows.map((row, index) => (
            <tr key={`${row.primary}-${row.secondary}-${index}`}>
              <td>{row.primary}</td>
              <td>{row.secondary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function JewelrySizeGuideView({
  variant,
  title,
  lead,
  leadDesktop,
  chartSectionTitle,
  chartHeaders,
  chartRows,
  chartRowsDesktop,
  tips,
  tipsJustify = false,
  diagram,
  infoBlock,
  footnote,
}: JewelrySizeGuideViewProps) {
  const searchParams = useSearchParams();
  const returnHref = resolveSafeReturnPath(searchParams.get('from'));

  return (
    <div
      className={`jewelry-size-guide-page jewelry-size-guide-page--${variant} store-minimal-header`}
    >
      <div className="jewelry-size-guide-inner">
        <header className="jewelry-size-guide-hero">
          <h1 className="jewelry-size-guide-title">{title}</h1>
          {leadDesktop ? (
            <>
              <p className="jewelry-size-guide-lead jewelry-size-guide-lead--mobile">{lead}</p>
              <p className="jewelry-size-guide-lead jewelry-size-guide-lead--desktop">{leadDesktop}</p>
            </>
          ) : (
            <p className="jewelry-size-guide-lead">{lead}</p>
          )}
        </header>

        {diagram ? <div className="jewelry-size-guide-diagram-slot">{diagram}</div> : null}

        {infoBlock ? (
          <div className="jewelry-size-guide-info-block">
            <h2 className="jewelry-size-guide-info-subtitle">{infoBlock.subtitle}</h2>
            <p className="jewelry-size-guide-info-body">{infoBlock.body}</p>
          </div>
        ) : null}

        <div className="jewelry-size-guide-panels">
          <section
            className="jewelry-size-guide-table-section"
            aria-labelledby={chartSectionTitle ? 'jewelry-size-chart-title' : undefined}
          >
            {chartSectionTitle ? (
              <h2 id="jewelry-size-chart-title" className="jewelry-size-guide-chart-heading">
                {chartSectionTitle}
              </h2>
            ) : null}

            {chartRowsDesktop ? (
              <>
                <JewelrySizeGuideTable
                  chartHeaders={chartHeaders}
                  chartRows={chartRows}
                  modifierClass="jewelry-size-guide-table-wrap--mobile"
                />
                <JewelrySizeGuideTable
                  chartHeaders={chartHeaders}
                  chartRows={chartRowsDesktop}
                  modifierClass="jewelry-size-guide-table-wrap--desktop"
                />
              </>
            ) : (
              <JewelrySizeGuideTable chartHeaders={chartHeaders} chartRows={chartRows} />
            )}

            {footnote ? <p className="jewelry-size-guide-footnote">{footnote}</p> : null}
          </section>

          <div className="jewelry-size-guide-aside">
            <section className="jewelry-size-guide-section" aria-labelledby="jewelry-size-tips-title">
              <h2 id="jewelry-size-tips-title" className="jewelry-size-guide-section-title">
                نکات تکمیلی
              </h2>

              <ul
                className={
                  tipsJustify
                    ? 'jewelry-size-guide-tips jewelry-size-guide-tips--justify'
                    : 'jewelry-size-guide-tips'
                }
              >
                {tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>

            <Link href={returnHref} className="jewelry-size-guide-return-btn">
              بازگشت به صفحه محصول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
