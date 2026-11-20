import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

// Protótipo: um arquivo HTML único (roteador por hash, tudo embutido) para publicar sem servidor.
const prototipo = Boolean(process.env.PROTOTIPO);
const chromium = process.env.CHROMIUM_PATH || undefined;

export default defineConfig({
	define: { __PROTOTIPO__: JSON.stringify(prototipo) },
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({
				fallback: 'index.html',
				pages: prototipo ? 'build-prototipo' : 'build',
				assets: prototipo ? 'build-prototipo' : 'build'
			}),
			// Sem procurar versão nova em _app/version.json (o protótipo abre de um arquivo, sem servidor).
			version: { pollInterval: 0 },
			router: { type: prototipo ? 'hash' : 'pathname' },
			output: { bundleStrategy: prototipo ? 'inline' : 'split' }
		})
	],
	build: prototipo ? { assetsInlineLimit: 100_000_000 } : {},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright({ launchOptions: { executablePath: chromium } }),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}', 'worker/**/*.spec.ts'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
