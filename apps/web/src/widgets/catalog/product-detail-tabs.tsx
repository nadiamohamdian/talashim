'use client';

import { useState } from 'react';
import type { ProductDetails } from '@sadafgold/types';
import { RichHtmlContent } from '@/shared/ui/rich-html-content';
import { ProductSpecsPanel } from './product-specs-panel';

interface ProductDetailTabsProps {
  product: ProductDetails;
}

const TABS = [
  { id: 'description', label: 'توضیحات' },
  { id: 'specs', label: 'توضیحات تکمیلی' },
  { id: 'reviews', label: 'نظرات' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function ProductDetailTabs({ product }: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('description');

  return (
    <section className="mt-10 space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-nude-200 pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'border border-b-0 border-nude-200 bg-white text-gold-dark'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card-luxury min-h-[240px] p-5 md:p-6">
        {activeTab === 'description' ? (
          <RichHtmlContent
            html={product.description}
            className="prose prose-sm max-w-none text-sm leading-8 text-muted [&_a]:text-amber-700 [&_a]:underline"
          />
        ) : null}

        {activeTab === 'specs' ? <ProductSpecsPanel product={product} /> : null}

        {activeTab === 'reviews' ? (
          <p className="text-sm text-muted">هنوز نظری ثبت نشده است.</p>
        ) : null}
      </div>
    </section>
  );
}
