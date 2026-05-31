import fs from 'node:fs';
import path from 'node:path';

const routesFile = fs.readFileSync('src/shared/config/admin-routes.ts', 'utf8');
const blocks = routesFile.split(/\n {2}r\(\{/).slice(1);
const routes = blocks
  .map((b) => ({
    id: b.match(/id: '([^']+)'/)?.[1],
    routePath: b.match(/path: '([^']*)'/)?.[1],
    dynamic: b.includes('dynamic: true'),
  }))
  .filter((r) => r.id && r.routePath !== undefined);

function pageContent(routeId) {
  return `import { ModuleSkeletonPage } from '@/features/skeleton/components/module-skeleton-page';

export default function Page() {
  return <ModuleSkeletonPage routeId="${routeId}" />;
}
`;
}

let count = 0;
for (const route of routes) {
  if (route.dynamic) continue;
  const segments =
    route.routePath === '/'
      ? ['(dashboard)', 'page.tsx']
      : ['(dashboard)', ...route.routePath.split('/').filter(Boolean), 'page.tsx'];
  const file = path.join('src', 'app', ...segments);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, pageContent(route.id));
  count += 1;
}

const dynamicPages = [
  { file: 'src/app/(dashboard)/products/[slug]/page.tsx', id: 'products.detail' },
  { file: 'src/app/(dashboard)/products/[slug]/edit/page.tsx', id: 'products.edit' },
  { file: 'src/app/(dashboard)/orders/[id]/page.tsx', id: 'orders.detail' },
  { file: 'src/app/(dashboard)/users/[id]/page.tsx', id: 'users.detail' },
];

for (const d of dynamicPages) {
  fs.mkdirSync(path.dirname(d.file), { recursive: true });
  fs.writeFileSync(d.file, pageContent(d.id));
  count += 1;
}

console.log(`Generated ${count} skeleton pages.`);
