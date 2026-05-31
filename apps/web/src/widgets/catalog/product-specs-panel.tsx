import type { ProductDetails } from '@sadafgold/types';

interface ProductSpecsPanelProps {
  product: ProductDetails;
}

export function ProductSpecsPanel({ product }: ProductSpecsPanelProps) {
  const specs = product.specifications ?? {
    وزن: `${product.weightGram} گرم`,
    اجرت: `${product.makingFeePercent} درصد`,
    رنگ: product.color ?? 'طلایی',
    عیار: `${product.karat} عیار`,
  };

  return (
    <div className="space-y-4">
      <ul className="space-y-2 text-sm leading-8 text-foreground">
        {Object.entries(specs).map(([label, value]) => (
          <li key={label} className="flex items-start gap-2">
            <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-dark" />
            <span>
              <span className="font-semibold">{label}:</span> {String(value)}
            </span>
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-nude-200 bg-nude-50/50 px-4 py-3 text-sm">
        <span className="text-muted">شناسه محصول (SKU): </span>
        <span className="font-mono font-semibold text-foreground">{product.sku}</span>
      </div>
    </div>
  );
}
