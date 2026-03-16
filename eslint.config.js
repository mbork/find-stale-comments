import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default [
	...tseslint.configs.recommended,
	...tseslint.configs.stylistic,
	stylistic.configs.customize({
		indent: 'tab',
		quotes: 'single',
		semi: true,
	}),
	{
		rules: {
			'@stylistic/object-curly-spacing': ['error', 'never'],
			'@stylistic/max-len': ['error', {code: 100}],
		},
	},
	{
		ignores: ['tests/fixtures/**'],
	},
];
