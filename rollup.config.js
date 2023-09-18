import multiInput from 'rollup-plugin-multi-input';

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
	plugins: [multiInput.default()],
	input: 'src/**/*.js',
	output: [
		{
			dir: 'dist/cjs/',
			format: 'commonjs',
			exports: 'auto',
		},
		{
			dir: 'dist/esm/',
			format: 'module',
			exports: 'auto',
		},
	],
	external: ['puppeteer', 'ws', 'filesize', 'node:events', 'node:module', 'node:vm'],
};
