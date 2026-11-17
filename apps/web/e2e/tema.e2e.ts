import { expect, test } from './apoio.ts';

test('preferência salva vale antes da primeira pintura', async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem('mirante:tema', 'preto');
		document.addEventListener('DOMContentLoaded', () => {
			(window as unknown as { temaInicial: string }).temaInicial =
				document.documentElement.dataset.tema ?? '';
			(window as unknown as { fundoInicial: string }).fundoInicial = getComputedStyle(
				document.body
			).backgroundColor;
		});
	});
	await page.goto('/');
	expect(
		await page.evaluate(() => (window as unknown as { temaInicial: string }).temaInicial)
	).toBe('preto');
	expect(
		await page.evaluate(() => (window as unknown as { fundoInicial: string }).fundoInicial)
	).toBe('rgb(0, 0, 0)');
});

test('preferência "sistema" acompanha o sistema ao vivo', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'dark' });
	await page.goto('/');
	await expect(page.locator('html')).toHaveAttribute('data-tema', 'escuro');
	await page.emulateMedia({ colorScheme: 'light' });
	await expect(page.locator('html')).toHaveAttribute('data-tema', 'claro');
});

test('sem localStorage o app abre no tema do sistema', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(window, 'localStorage', {
			get() {
				throw new Error('bloqueado');
			}
		});
	});
	await page.emulateMedia({ colorScheme: 'light' });
	const erros: string[] = [];
	page.on('pageerror', (e) => erros.push(e.message));
	await page.goto('/');
	await expect(page.locator('html')).toHaveAttribute('data-tema', 'claro');
	expect(erros).toEqual([]);
});

test('preferência "claro" vale antes da primeira pintura mesmo com o sistema escuro', async ({
	page
}) => {
	await page.emulateMedia({ colorScheme: 'dark' });
	await page.addInitScript(() => {
		localStorage.setItem('mirante:tema', 'claro');
		document.addEventListener('DOMContentLoaded', () => {
			(window as unknown as { temaInicial: string }).temaInicial =
				document.documentElement.dataset.tema ?? '';
		});
	});
	await page.goto('/');
	expect(
		await page.evaluate(() => (window as unknown as { temaInicial: string }).temaInicial)
	).toBe('claro');
});
