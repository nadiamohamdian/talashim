import { createNextConfig } from '../../packages/eslint-config/nextjs.mjs';

export default createNextConfig({
  tsconfigRootDir: import.meta.dirname,
});
