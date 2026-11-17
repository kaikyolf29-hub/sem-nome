import { expect, test } from '@playwright/test';

// Com o painel "Ativo em foco" fechado, a coluna de leitura fica no centro: sem vão gigante de um lado só.
for (const [rota, seletor] of [
	['/mercado/manchetes', '.coluna'],
	['/tecnologia/chips', '.coluna'],
	['/carteira/visao-geral', 'div.carteira'],
	['/daytrade/grafico', '.vazio']
] as const) {
	test(`coluna centralizada em ${rota} com o painel fechado`, async ({ page, isMobile }) => {
		test.skip(isMobile, 'tela larga');
		await page.setViewportSize({ width: 1600, height: 900 });
		await page.goto(rota);
		await page.getByRole('button', { name: 'Fechar painel' }).click();
		const area = (await page.locator('main .rolagem').boundingBox())!;
		const coluna = (await page.locator(seletor).first().boundingBox())!;
		const esquerda = coluna.x - area.x;
		const direita = area.x + area.width - (coluna.x + coluna.width);
		expect(Math.abs(esquerda - direita), `${esquerda} x ${direita}`).toBeLessThanOrEqual(16);
	});
}
