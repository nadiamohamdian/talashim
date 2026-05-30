import { execSync } from 'child_process';
try {
  execSync('pnpm --silent exec husky install', { stdio: 'inherit' });
} catch (e) {
  // noop during CI or when husky isn't available locally
}
