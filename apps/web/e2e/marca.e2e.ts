import { expect, test } from './apoio.ts';

test('a página da marca mostra as três opções sem a casca do app', async ({ page }) => {
	await page.goto('/marca');
	await expect(page.getByRole('heading', { level: 1, name: /três opções/ })).toBeVisible();
	for (const nome of ['A. Gráfico em M', 'B. Horizonte', 'C. Binóculo'])
		await expect(page.getByRole('heading', { level: 2, name: nome })).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Espaços' })).toHaveCount(0);
});

test('o painel do protótipo leva até a página da marca', async ({ page }) => {
	await page.goto('/mercado/manchetes');
	await page
		.getByRole('button', { name: 'Ajustes', exact: true })
		.or(page.getByRole('button', { name: 'Ajustes do protótipo' }))
		.first()
		.click();
	await page.getByRole('link', { name: 'Ver as três opções de logo' }).click();
	await expect(page).toHaveURL(/\/marca$/);
});
