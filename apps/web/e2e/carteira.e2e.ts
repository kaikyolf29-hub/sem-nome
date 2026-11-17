import { expect, test } from '@playwright/test';

test('a carteira de exemplo mostra patrimônio, rosca e alerta de concentração', async ({
	page
}) => {
	await page.goto('/carteira/visao-geral');
	await expect(page.getByText('Patrimônio').first()).toBeVisible();
	await expect(
		page.getByRole('img', { name: /Alocação por classe: Ações Brasil 38%/ })
	).toBeVisible();
	await expect(page.getByRole('status')).toContainText('PETR4');
});

test('canal sem conteúdo mostra em que fase chega', async ({ page }) => {
	await page.goto('/daytrade/grafico');
	await expect(page.getByText('Este canal chega na fase 5 do Mirante.')).toBeVisible();
});

test('com movimento reduzido a rosca aparece completa sem animar', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/carteira/visao-geral');
	const offset = await page
		.locator('path.fatia')
		.first()
		.evaluate((el) => getComputedStyle(el).strokeDashoffset);
	expect(offset).toBe('0px');
});
