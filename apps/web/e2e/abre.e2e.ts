import { expect, test } from './apoio.ts';

test('abre e mostra o nome', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/Mirante/);
});
