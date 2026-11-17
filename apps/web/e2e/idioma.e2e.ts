import { expect, test } from './apoio.ts';

test.describe('navegador em inglês', () => {
	test.use({ locale: 'en-US' });

	test('a página declara lang="en" e mostra os textos em inglês', async ({ page }) => {
		await page.goto('/mercado/manchetes');
		await expect(page.getByRole('heading', { level: 1, name: 'headlines' })).toBeVisible();
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	});
});
