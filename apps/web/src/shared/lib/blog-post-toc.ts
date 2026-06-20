export interface BlogPostTocItem {
  id: string;
  label: string;
  href: string;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function injectHeadingIds(html: string): { html: string; items: BlogPostTocItem[] } {
  const items: BlogPostTocItem[] = [];
  let index = 0;

  const updated = html.replace(/<h([2-3])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attrs, inner) => {
    const label = stripHtml(inner);
    if (!label) {
      return match;
    }

    const id = `bp-section-${index}`;
    index += 1;
    items.push({ id, label, href: `#${id}` });

    const attrsWithoutId = String(attrs).replace(/\sid="[^"]*"/i, '');
    return `<h${level}${attrsWithoutId} id="${id}">${inner}</h${level}>`;
  });

  return { html: updated, items };
}
