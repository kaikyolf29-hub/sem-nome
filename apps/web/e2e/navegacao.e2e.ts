import { expect, test } from './apoio.ts';

test('a raiz leva para "Para você"', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveURL(/\/para-voce\/tudo$/);
});

test('endereço errado ou antigo leva para "Para você"', async ({ page }) => {
	await page.goto('/espaco-que-nao-existe');
	await expect(page).toHaveURL(/\/para-voce\/tudo$/);
	await page.goto('/mercado/xyz');
	await expect(page).toHaveURL(/\/para-voce\/tudo$/);
	await page.goto('/a/b/c');
	await expect(page).toHaveURL(/\/para-voce\/tudo$/);
});

test('o título da aba mostra o canal', async ({ page }) => {
	await page.goto('/cripto/stablecoins');
	await expect(page).toHaveTitle('#stablecoins | Mirante');
});

test('canal existente mostra o título do canal', async ({ page }) => {
	await page.goto('/cripto/nft');
	await expect(page.getByRole('heading', { level: 1, name: 'nft' })).toBeVisible();
});
