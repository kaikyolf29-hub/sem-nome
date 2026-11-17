import { expect, responderFeed, test } from './apoio.ts';

// Notícias como a coleta grava: sem campos de IA ainda, com a logo de cada fonte.
const fonte = (id: string, nome: string, primaria = false) => ({
	id,
	nome,
	site: `https://${id}.invalid`,
	logo: `/fontes/${id}.png`,
	primaria,
	url: `https://${id}.invalid/noticia`
});
const grupos = [
	{
		id: 1,
		titulo: 'Copom mantém a Selic em 15% e sinaliza cautela com serviços',
		url: 'https://bcb.invalid/noticia',
		trecho:
			'O comitê manteve a taxa básica e indicou que só deve cortar quando a inflação de serviços ceder.',
		publicadoEm: new Date(Date.now() - 20 * 60_000).toISOString(),
		idioma: 'pt-BR',
		canais: ['brasil', 'macro'],
		fontes: [fonte('bcb', 'Banco Central do Brasil', true), fonte('infomoney', 'InfoMoney')]
	},
	{
		id: 2,
		titulo: 'Dólar fecha em queda com entrada de capital estrangeiro',
		url: 'https://infomoney.invalid/noticia',
		trecho: 'A moeda americana recuou pelo terceiro dia.',
		publicadoEm: new Date(Date.now() - 50 * 60_000).toISOString(),
		idioma: 'pt-BR',
		canais: ['brasil', 'cambio', 'macro'],
		fontes: [fonte('infomoney', 'InfoMoney')]
	}
];

test('cartões reais: título, trecho, logo de cada fonte e "+1"', async ({ page }) => {
	await responderFeed(page, () => grupos);
	await page.goto('/mercado/macro');
	const cartao = page.locator('.lista article').first();
	await expect(cartao.getByRole('heading', { name: grupos[0].titulo })).toBeVisible();
	await expect(cartao.getByText(grupos[0].trecho)).toBeVisible();
	await expect(cartao.getByText('+1')).toBeVisible();
	await expect(cartao.locator('img').first()).toHaveAttribute('src', '/fontes/bcb.png');
	const ler = cartao.getByRole('link', { name: 'Ler na fonte' });
	await expect(ler).toHaveAttribute('href', grupos[0].url);
	await expect(ler).toHaveAttribute('target', '_blank');
	// Impacto só aparece quando a IA calcular (fase 2): nada de barrinhas "baixo" em tudo.
	await expect(page.locator('.impacto')).toHaveCount(0);
});

test('a manchete mostra a logo e o nome da fonte e, sem resumo da IA, o trecho', async ({
	page
}) => {
	await responderFeed(page, () => grupos);
	await page.goto('/mercado/manchetes');
	const manchete = page.locator('.manchete');
	await expect(manchete.getByRole('heading', { level: 2 })).toHaveText(grupos[0].titulo);
	await expect(manchete.locator('img')).toHaveAttribute('src', '/fontes/bcb.png');
	await expect(manchete.getByText('Banco Central do Brasil', { exact: true })).toBeVisible();
	await expect(manchete.getByText(grupos[0].trecho)).toBeVisible();
	await expect(page.locator('.tambem article').first()).toBeVisible();
	await expect(page.locator('.tambem .impacto, .tambem .rodape')).toHaveCount(0);
});

test('enquanto carrega, aparece o esqueleto ocupado; depois, as notícias', async ({ page }) => {
	let liberar = () => {};
	const pronto = new Promise<void>((r) => (liberar = r));
	await page.route('**/rest/v1/rpc/feed**', async (rota) => {
		await pronto;
		await rota.fulfill({ json: grupos });
	});
	await page.goto('/mercado/macro');
	const esqueleto = page.locator('[aria-busy="true"]');
	await expect(esqueleto).toBeVisible();
	await expect(esqueleto).toHaveAccessibleName('Carregando as notícias');
	liberar();
	await expect(page.getByRole('heading', { name: grupos[1].titulo })).toBeVisible();
	await expect(esqueleto).toHaveCount(0);
});

test('sem conexão: mensagem clara e "Tentar de novo" carrega as notícias', async ({ page }) => {
	let falhar = true;
	await page.route('**/rest/v1/rpc/feed**', (rota) =>
		falhar ? rota.abort('internetdisconnected') : rota.fulfill({ json: grupos })
	);
	await page.goto('/mercado/macro');
	await expect(page.getByText('Sem conexão com as notícias agora.')).toBeVisible();
	falhar = false;
	await page.getByRole('button', { name: 'Tentar de novo' }).click();
	await expect(page.getByRole('heading', { name: grupos[0].titulo })).toBeVisible();
	await expect(page.getByText('Sem conexão com as notícias agora.')).toHaveCount(0);
});

test('servidor com erro: mensagem própria', async ({ page }) => {
	await page.route('**/rest/v1/rpc/feed**', (rota) =>
		rota.fulfill({ status: 503, json: { message: 'x' } })
	);
	await page.goto('/mercado/macro');
	await expect(page.getByText('As notícias não carregaram.')).toBeVisible();
});

test('título de 200 caracteres em 320 px não cria rolagem para o lado', async ({
	page,
	isMobile
}) => {
	test.skip(isMobile, 'a largura é fixada aqui');
	await page.setViewportSize({ width: 320, height: 800 });
	const longo = {
		...grupos[1],
		titulo: 'Palavra '.repeat(25).trim(),
		fontes: [fonte('money-times', 'Money Times com um nome bem comprido')]
	};
	await responderFeed(page, () => [grupos[0], longo]);
	await page.goto('/mercado/manchetes');
	await expect(page.getByRole('heading', { name: longo.titulo })).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('a faixa do topo diz o que é real e o que ainda é exemplo', async ({ page }) => {
	await page.goto('/mercado/manchetes');
	await expect(page.getByRole('note')).toHaveText(
		'Notícias reais das fontes. Cotações, carteira e análises ainda são de exemplo.'
	);
});
