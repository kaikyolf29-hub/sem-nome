import { expect, test } from '@playwright/test';

test('a raiz leva para as manchetes do mercado', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveURL(/\/mercado\/manchetes$/);
});

test('endereço errado ou antigo leva para as manchetes', async ({ page }) => {
	await page.goto('/espaco-que-nao-existe');
	await expect(page).toHaveURL(/\/mercado\/manchetes$/);
	await page.goto('/mercado/xyz');
	await expect(page).toHaveURL(/\/mercado\/manchetes$/);
});

test('canal existente mostra o título do canal', async ({ page }) => {
	await page.goto('/cripto/nft');
	await expect(page.getByRole('heading', { level: 1, name: 'nft' })).toBeVisible();
});
