import { expect, test } from './apoio.ts';

test.describe('painel do protótipo', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/mercado/manchetes');
		await page
			.getByRole('button', { name: 'Ajustes', exact: true })
			.or(page.getByRole('button', { name: 'Ajustes do protótipo' }))
			.first()
			.click();
	});

	test('"Ver como Matsu OS" mostra as bolinhas e usa o tema Matsu', async ({ page }) => {
		await page.getByText('Matsu OS', { exact: true }).click();
		await expect(page.getByRole('button', { name: 'Fechar', exact: true })).toBeVisible();
		await expect(page.locator('html')).toHaveAttribute('data-tema', /^matsu-/);
	});

	test('"Ver como Windows" mostra os botões do Windows', async ({ page }) => {
		await page.getByText('Windows', { exact: true }).click();
		await expect(page.getByRole('button', { name: 'Maximizar' })).toBeVisible();
	});

	test('tema Preto e manchete Inter', async ({ page }) => {
		await page.getByText('Preto', { exact: true }).click();
		await expect(page.locator('html')).toHaveAttribute('data-tema', 'preto');
		await page.getByText('Inter', { exact: true }).click();
		const fonte = await page.evaluate(() =>
			getComputedStyle(document.documentElement).getPropertyValue('--fonte-manchete')
		);
		expect(fonte).toContain('Inter');
	});

	test('idioma English troca os textos', async ({ page }) => {
		await page.getByText('English', { exact: true }).click();
		await expect(page.getByRole('heading', { level: 1, name: 'headlines' })).toBeVisible();
	});
});
