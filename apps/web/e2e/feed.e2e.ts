import { expect, test } from '@playwright/test';

test('manchetes mostram a manchete e a lista de notícias', async ({ page }) => {
	await page.goto('/mercado/manchetes');
	await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
	expect(await page.locator('article.noticia').count()).toBeGreaterThanOrEqual(5);
	await expect(
		page.getByRole('region', { name: 'Também em destaque' }).getByRole('article')
	).toHaveCount(3);
	await expect(page.getByRole('note')).toContainText('Protótipo');
});

test('sem rolagem horizontal numa tela de 320 px', async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 640 });
	for (const rota of ['/mercado/manchetes', '/tecnologia/chips', '/cripto/stablecoins']) {
		await page.goto(rota);
		await expect(page.locator('main')).toBeVisible();
		const [scroll, cliente] = await page.evaluate(() => [
			document.documentElement.scrollWidth,
			document.documentElement.clientWidth
		]);
		expect(scroll, rota).toBeLessThanOrEqual(cliente);
	}
});
