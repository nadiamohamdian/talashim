const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../src/generated');
const dest = path.join(__dirname, '../dist/generated');

if (!fs.existsSync(src)) {
  console.warn('[sync-prisma-dist] src/generated not found — run prisma generate first.');
  process.exit(0);
}

fs.cpSync(src, dest, { recursive: true, force: true });
console.log('[sync-prisma-dist] copied src/generated → dist/generated');
