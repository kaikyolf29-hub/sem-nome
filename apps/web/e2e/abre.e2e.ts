import { expect, test } from '@playwright/test';

test('abre e mostra o nome', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/Mirante/);
});
