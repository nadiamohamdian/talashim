'use client';

import { useId, useState } from 'react';
import type { FaqPageItem } from '@/shared/config/faq-page';
import { RichHtmlContent } from '@/shared/ui/rich-html-content';

interface FaqAccordionProps {
  items: FaqPageItem[];
  defaultOpenIndex?: number;
  defaultOpenIndices?: number[];
}

function FaqAnswer({ answer }: { answer: string }) {
  const looksLikeHtml = /<[^>]+>/.test(answer);

  if (looksLikeHtml) {
    return (
      <RichHtmlContent html={answer} className="faq-item-answer faq-item-answer--rich" />
    );
  }

  return <p className="faq-item-answer">{answer}</p>;
}

export function FaqAccordion({
  items,
  defaultOpenIndex = 1,
  defaultOpenIndices,
}: FaqAccordionProps) {
  const baseId = useId();
  const safeDefault =
    items.length === 0 ? -1 : Math.min(Math.max(defaultOpenIndex, 0), items.length - 1);
  const [openIndices, setOpenIndices] = useState<Set<number>>(() => {
    if (defaultOpenIndices?.length) {
      return new Set(
        defaultOpenIndices.filter((index) => index >= 0 && index < items.length),
      );
    }

    return safeDefault >= 0 ? new Set([safeDefault]) : new Set();
  });

  if (items.length === 0) {
    return <p className="faq-page-empty">سوالی ثبت نشده است.</p>;
  }

  const toggleItem = (index: number) => {
    setOpenIndices((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="faq-accordion">
      {items.map((item, index) => {
        const isOpen = openIndices.has(index);
        const panelId = `${baseId}-panel-${index}`;
        const triggerId = `${baseId}-trigger-${index}`;

        return (
          <article
            key={item.id}
            className={`faq-item${isOpen ? ' faq-item--open' : ''}`}
          >
            <button
              id={triggerId}
              type="button"
              className="faq-item-trigger"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggleItem(index)}
            >
              <span className="faq-item-question">{item.question}</span>
              <span
                className={`faq-item-chevron${isOpen ? ' faq-item-chevron--open' : ''}`}
                aria-hidden
              />
            </button>

            {isOpen ? (
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="faq-item-panel"
              >
                <FaqAnswer answer={item.answer} />
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
