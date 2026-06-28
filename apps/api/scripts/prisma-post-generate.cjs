const fs = require('fs');
const path = require('path');

const prismaDir = path.join(__dirname, '../src/generated/prisma');

if (!fs.existsSync(prismaDir)) {
  console.warn('[prisma-post-generate] generated prisma dir missing — skip');
  process.exit(0);
}

for (const stale of ['index.d.ts', 'index.js', 'client.d.ts', 'client.js']) {
  const filePath = path.join(prismaDir, stale);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

const indexTs = path.join(prismaDir, 'index.ts');
if (fs.existsSync(indexTs)) {
  fs.unlinkSync(indexTs);
}

const packageJsonPath = path.join(prismaDir, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  pkg.main = 'client.ts';
  pkg.types = 'client.ts';
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
}

console.log('[prisma-post-generate] Prisma 7 client ready (import @/generated/prisma → client.ts)');
