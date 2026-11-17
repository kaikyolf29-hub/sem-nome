import { expect, test } from '@playwright/test';

test.describe('paleta Ctrl+K', () => {
	test.skip(({ isMobile }) => isMobile, 'atalho de teclado: desktop');

	test('abre mesmo com o foco num campo, sem perder o que foi digitado', async ({ page }) => {
		await page.goto('/mercado/manchetes');
		const campo = page.getByRole('textbox', { name: 'Pergunte sobre notícias ou sua carteira' });
		await campo.fill('abc');
		await campo.press('Control+k');
		await expect(page.getByRole('dialog', { name: 'Buscar no Mirante' })).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog', { name: 'Buscar no Mirante' })).toHaveCount(0);
		await expect(campo).toHaveValue('abc');
		await expect(campo).toBeFocused();
	});

	test('digitar e Enter navega para o canal', async ({ page }) => {
		await page.goto('/mercado/manchetes');
		await expect(page.getByRole('heading', { level: 1, name: 'manchetes' })).toBeVisible();
		await page.keyboard.press('Control+k');
		await page.getByRole('combobox', { name: 'Buscar espaços, canais ou notícias' }).fill('stable');
		await page.keyboard.press('Enter');
		await expect(page).toHaveURL(/\/cripto\/stablecoins$/);
		await expect(page.getByRole('dialog', { name: 'Buscar no Mirante' })).toHaveCount(0);
	});

	test('o botão de busca do topo abre a paleta', async ({ page }) => {
		await page.goto('/mercado/manchetes');
		await page.getByRole('button', { name: /Buscar ou perguntar/ }).click();
		await expect(page.getByRole('dialog', { name: 'Buscar no Mirante' })).toBeVisible();
	});
});

test('o painel de contexto mostra o ativo e o aviso', async ({ page, isMobile }) => {
	await page.goto('/mercado/manchetes');
	if (isMobile) await page.getByRole('button', { name: 'Abrir painel' }).click();
	await expect(page.getByRole('heading', { name: 'PETR4' })).toBeVisible();
	await expect(page.getByText('Informativo. Não é recomendação de investimento.')).toBeVisible();
});
