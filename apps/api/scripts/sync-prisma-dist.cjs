const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../src/generated');
const dest = path.join(__dirname, '../dist/generated');

if (!fs.existsSync(src)) {
  console.warn('[sync-prisma-dist] src/generated not found — run prisma generate first.');
  process.exit(0);
}

function shouldCopy(relativePath) {
  if (relativePath.endsWith('.ts') || relativePath.endsWith('.tsx')) {
    return false;
  }
  return true;
}

function copyAssets(dir, relativeBase = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const relativePath = path.join(relativeBase, entry.name).replace(/\\/g, '/');
    const srcPath = path.join(dir, entry.name);
    const destPath = path.join(dest, relativePath);

    if (entry.isDirectory()) {
      copyAssets(srcPath, relativePath);
      continue;
    }

    if (!shouldCopy(relativePath)) {
      continue;
    }

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
  }
}

fs.mkdirSync(dest, { recursive: true });
copyAssets(src);
console.log('[sync-prisma-dist] copied Prisma runtime assets (wasm, mjs, json) → dist/generated');
