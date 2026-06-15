import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['.private-worktrees/**', 'dist/**', 'node_modules/**', 'src/parser/file_inputs.ts'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['src/tests/*.mjs'],
        languageOptions: {
            globals: {
                console: 'readonly',
                fetch: 'readonly',
                WebSocket: 'readonly',
            },
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {jsx: true},
            },
            globals: {
                document: 'readonly',
                window: 'readonly',
                FileReader: 'readonly',
                React: 'readonly',
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
        },
    },
);
