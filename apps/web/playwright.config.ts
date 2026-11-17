import { defineConfig, devices } from '@playwright/test';

const executablePath = process.env.CHROMIUM_PATH || undefined;

export default defineConfig({
	testMatch: '**/*.e2e.{ts,js}',
	testDir: 'e2e',
	use: { trace: 'off', launchOptions: { executablePath } },
	webServer: { command: 'bun run build && bun run preview --port 4173', port: 4173 },
	projects: [
		{ name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
		{ name: 'celular', use: { ...devices['Pixel 7'] } }
	]
});
