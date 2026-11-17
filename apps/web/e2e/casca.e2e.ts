import { expect, test } from '@playwright/test';

test.describe('desktop', () => {
	test.skip(({ isMobile }) => isMobile, 'só no desktop');

	test('o trilho troca de espaço e a lista de canais acompanha', async ({ page }) => {
		await page.goto('/mercado/manchetes');
		await page
			.getByRole('navigation', { name: 'Espaços' })
			.getByRole('link', { name: 'Cripto' })
			.click();
		await expect(page).toHaveURL(/\/cripto\/visao-geral$/);
		const canais = page.getByRole('navigation', { name: 'Canais' });
		await expect(canais.getByRole('link', { name: /stablecoins/ })).toBeVisible();
		await expect(canais.getByRole('link', { name: /visão-geral/ })).toHaveAttribute(
			'aria-current',
			'page'
		);
	});
});

test.describe('celular', () => {
	test.skip(({ isMobile }) => !isMobile, 'só no celular');

	test('sem trilho, com barra inferior; gaveta abre, Esc fecha e devolve o foco', async ({
		page
	}) => {
		await page.goto('/mercado/manchetes');
		await expect(page.getByRole('navigation', { name: 'Espaços' })).toHaveCount(0);
		await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toBeVisible();
		const menu = page.getByRole('button', { name: 'Abrir canais' });
		await menu.click();
		const gaveta = page.getByRole('dialog', { name: 'Canais' });
		await expect(gaveta).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(gaveta).toHaveCount(0);
		await expect(menu).toBeFocused();
	});

	test('com movimento reduzido a gaveta aparece já no lugar', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/mercado/manchetes');
		await page.getByRole('button', { name: 'Abrir canais' }).click();
		const x = await page
			.getByRole('dialog', { name: 'Canais' })
			.evaluate((el) => el.getBoundingClientRect().left);
		expect(x).toBe(0);
	});

	test('escolher um canal na gaveta navega e fecha a gaveta', async ({ page }) => {
		await page.goto('/mercado/manchetes');
		await page.getByRole('button', { name: 'Abrir canais' }).click();
		await page
			.getByRole('dialog', { name: 'Canais' })
			.getByRole('link', { name: /câmbio/ })
			.click();
		await expect(page).toHaveURL(/\/mercado\/cambio$/);
		await expect(page.getByRole('dialog', { name: 'Canais' })).toHaveCount(0);
	});
});
