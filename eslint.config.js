import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
	{
		files: ['src/**/*.{js,ts}'],
		languageOptions: {
			parser: typescriptParser,
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		plugins: {
			'@typescript-eslint': typescriptPlugin,
		},
		rules: {
			...js.configs.recommended.rules,
			...typescriptPlugin.configs.recommended.rules,
			'semi': ['error', 'always'],
			'quotes': ['error', 'single'],
		},
	},
];
