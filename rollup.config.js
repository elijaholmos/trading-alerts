import { emptyDir } from 'rollup-plugin-empty-dir';

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
	input: 'src/index.js',
	output: [
		{
			dir: 'dist/cjs/',
			format: 'commonjs',
			exports: 'auto',
			preserveModules: true,
		},
		{
			dir: 'dist/esm/',
			format: 'module',
			exports: 'auto',
			preserveModules: true,
		},
	],
	external: ['puppeteer', 'ws', 'filesize', 'node:events', 'node:module', 'node:vm'],
	plugins: [emptyDir()],
};
