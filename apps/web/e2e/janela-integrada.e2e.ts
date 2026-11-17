import { expect, test, type Page } from './apoio.ts';

async function verComo(page: Page, modo: string) {
	await page
		.getByRole('button', { name: 'Ajustes', exact: true })
		.or(page.getByRole('button', { name: 'Ajustes do protótipo' }))
		.first()
		.click();
	await page.getByText(modo, { exact: true }).click();
	await page.getByRole('button', { name: 'Fechar ajustes' }).click();
}

async function caixaJanela(page: Page) {
	return (await page.locator('.moldura').boundingBox())!;
}

test.describe('barra de título integrada (como nos apps nativos)', () => {
	test('Matsu: bolinhas no canto de cima à esquerda, dentro do app, sem faixa com o nome', async ({
		page
	}) => {
		await page.goto('/mercado/manchetes');
		await verComo(page, 'Matsu OS');
		const janela = await caixaJanela(page);
		const fechar = (await page.getByRole('button', { name: 'Fechar', exact: true }).boundingBox())!;
		expect(fechar.x - janela.x).toBeCloseTo(14 + 1, 0);
		expect(fechar.y - janela.y).toBeLessThan(48);
		// Nenhuma faixa separada repetindo o nome do app.
		await expect(page.locator('.moldura').getByText('Mirante', { exact: true })).toHaveCount(0);
		// O primeiro elemento do app (topo) começa colado no topo da janela.
		const topoConteudo = (await page.locator('main .topo').boundingBox())!;
		expect(topoConteudo.y - janela.y).toBeLessThanOrEqual(1);
	});

	test('Windows: botões no canto de cima à direita, dentro do app, sem faixa com o nome', async ({
		page
	}) => {
		await page.goto('/mercado/manchetes');
		await verComo(page, 'Windows');
		const janela = await caixaJanela(page);
		const fechar = (await page.getByRole('button', { name: 'Fechar', exact: true }).boundingBox())!;
		expect(janela.x + janela.width - (fechar.x + fechar.width)).toBeLessThanOrEqual(2);
		expect(fechar.y - janela.y).toBeLessThanOrEqual(1);
		await expect(page.locator('.moldura').getByText('Mirante', { exact: true })).toHaveCount(0);
		// Os botões do app no topo não ficam embaixo dos botões da janela.
		const busca = (await page.getByRole('button', { name: 'Buscar ou perguntar' }).boundingBox())!;
		const minimizar = (await page.getByRole('button', { name: 'Minimizar' }).boundingBox())!;
		expect(busca.x + busca.width).toBeLessThanOrEqual(minimizar.x);
	});
});
