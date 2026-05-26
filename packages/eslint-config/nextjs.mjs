import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import globals from 'globals';
import { createBaseConfig } from './base.mjs';

export function createNextConfig({
  tsconfigRootDir = process.cwd(),
  ignores = []
} = {}) {
  return [
    ...createBaseConfig({
      tsconfigRootDir,
      ignores: ['next-env.d.ts', ...ignores],
      extraConfigs: [...nextVitals, ...nextTypescript]
    }),
    {
      files: ['**/*.{js,mjs,ts,tsx}'],
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node
        },
        parserOptions: {
          projectService: true,
          tsconfigRootDir
        }
      }
    }
  ];
}

export default createNextConfig;
