import globals from 'globals';
import { createBaseConfig } from './base.mjs';

export function createNestConfig({
  tsconfigRootDir = process.cwd(),
  ignores = []
} = {}) {
  return [
    ...createBaseConfig({
      tsconfigRootDir,
      ignores: ['dist/**', 'src/generated/**', ...ignores]
    }),
    {
      files: ['**/*.ts'],
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest
        },
        parserOptions: {
          projectService: true,
          tsconfigRootDir
        }
      },
      rules: {
        '@typescript-eslint/require-await': 'off'
      }
    },
    {
      files: ['**/*.spec.ts', 'test/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off'
      }
    }
  ];
}

export default createNestConfig;
