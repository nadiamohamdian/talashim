import { createNestConfig } from '../../packages/eslint-config/nestjs.mjs';

export default createNestConfig({
  tsconfigRootDir: import.meta.dirname,
});
