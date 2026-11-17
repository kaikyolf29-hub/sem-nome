import { expect, test } from './apoio.ts';

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

test('a pessoa escolhe a moeda principal e vê o que há em cada moeda', async ({ page }) => {
	await page.goto('/carteira/visao-geral');
	const porMoeda = page.getByRole('region', { name: 'Por moeda' });
	await expect(porMoeda.getByText('Dólar americano')).toBeVisible();
	await expect(porMoeda.getByText('moeda principal')).toBeVisible();
	await page.getByRole('button', { name: /Ver em/ }).click();
	await page.getByRole('option', { name: /Dólar americano/ }).click();
	await expect(page.locator('.patrimonio')).toContainText('US$');
	// A escolha fica lembrada ao voltar.
	await page.reload();
	await expect(page.getByRole('button', { name: /Ver em/ })).toContainText('USD');
	await expect(page.locator('.patrimonio')).toContainText('US$');
});
