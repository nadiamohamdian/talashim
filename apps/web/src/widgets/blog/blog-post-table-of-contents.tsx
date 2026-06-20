import type { BlogPostTocItem } from '@/shared/lib/blog-post-toc';

interface BlogPostTableOfContentsProps {
  items: BlogPostTocItem[];
}

export function BlogPostTableOfContents({ items }: BlogPostTableOfContentsProps) {
  if (!items.length) {
    return null;
  }

  return (
    <nav className="blog-post-toc" aria-label="فهرست محتوا">
      <div className="blog-post-toc-box">
        <h2 className="blog-post-toc-title">فهرست محتوا</h2>
        <ul className="blog-post-toc-list">
          {items.map((item) => (
            <li key={item.id} className="blog-post-toc-item">
              <a href={item.href} className="blog-post-toc-link">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
