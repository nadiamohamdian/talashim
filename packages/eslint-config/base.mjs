import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const defaultIgnores = [
  '**/node_modules/**',
  '**/.turbo/**',
  '**/.next/**',
  '**/coverage/**',
  '**/dist/**',
  '**/*.tsbuildinfo'
];

export function createBaseConfig({
  tsconfigRootDir = process.cwd(),
  ignores = [],
  extraConfigs = []
} = {}) {
  return [
    {
      ignores: [...defaultIgnores, ...ignores]
    },
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    prettier,
    {
      files: ['**/*.{js,cjs,mjs,ts,tsx}'],
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir
        }
      },
      rules: {
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports'
          }
        ],
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_'
          }
        ]
      }
    },
    ...extraConfigs
  ];
}

export default createBaseConfig;
