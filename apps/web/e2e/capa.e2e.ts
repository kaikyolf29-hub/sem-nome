import { expect, test } from '@playwright/test';

test.describe('capa do portal em tela larga', () => {
	test.skip(({ isMobile }) => isMobile, 'tela larga');

	test('manchete e "Também em destaque" lado a lado, e a lista usa a largura toda', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1600, height: 1000 });
		await page.goto('/mercado/manchetes');
		await page.getByRole('button', { name: 'Fechar painel' }).click();
		const manchete = (await page.locator('article.manchete').boundingBox())!;
		const destaques = (await page
			.getByRole('region', { name: 'Também em destaque' })
			.boundingBox())!;
		expect(destaques.x).toBeGreaterThanOrEqual(manchete.x + manchete.width - 1);
		// O título da seção alinha com a primeira linha da manchete.
		const linhaManchete = (await page.locator('.manchete .meta').boundingBox())!;
		const tituloTambem = (await page.locator('#tambem-titulo').boundingBox())!;
		expect(Math.abs(tituloTambem.y - linhaManchete.y)).toBeLessThanOrEqual(2);
		// Sem vão à direita na lista: os botões ficam perto da borda direita da coluna.
		const coluna = (await page.locator('.coluna').boundingBox())!;
		const salvar = (await page
			.locator('article.noticia')
			.first()
			.getByRole('button', { name: 'Salvar' })
			.boundingBox())!;
		expect(coluna.x + coluna.width - (salvar.x + salvar.width)).toBeLessThan(40);
	});
});

test('no celular, "Também em destaque" vem depois da manchete', async ({ page, isMobile }) => {
	test.skip(!isMobile, 'celular');
	await page.goto('/mercado/manchetes');
	const manchete = (await page.locator('article.manchete').boundingBox())!;
	const destaques = (await page.getByRole('region', { name: 'Também em destaque' }).boundingBox())!;
	expect(destaques.y).toBeGreaterThanOrEqual(manchete.y + manchete.height - 1);
});

test('notícias mostram a logo da fonte e dos ativos', async ({ page }) => {
	await page.goto('/tecnologia/chips');
	const cartao = page.locator('article.noticia').first();
	await expect(cartao.locator('.marca-fonte')).toBeVisible();
	// Nvidia tem a marca real; o BDR também.
	await expect(cartao.locator('.logo-ativo[data-logo="marca"]').first()).toBeVisible();
	await page.goto('/mercado/acoes');
	await expect(page.locator('.logo-ativo[data-logo="sigla"]').first()).toContainText('P');
});
