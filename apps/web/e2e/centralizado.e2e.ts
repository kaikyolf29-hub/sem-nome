import { expect, test } from './apoio.ts';

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

// Na capa, a manchete, o "Também em destaque" (quando fica embaixo dela) e a logo da fonte na
// lista começam na mesma linha da esquerda, em todas as larguras.
for (const largura of [320, 390, 768, 1024, 1280, 1440, 1600]) {
	test(`capa alinhada à esquerda em ${largura}px`, async ({ page, isMobile }) => {
		test.skip(isMobile, 'as larguras já cobrem o celular');
		await page.setViewportSize({ width: largura, height: 900 });
		await page.goto('/mercado/manchetes');
		// As notícias chegam depois da tela: mede só com os cartões na tela.
		await expect(page.locator('.lista .noticia').first()).toBeVisible();
		const caixa = async (seletor: string) => (await page.locator(seletor).first().boundingBox())!;
		const manchete = await caixa('.manchete .titulo');
		const tambem = await caixa('.tambem .titulo-secao');
		const logoLista = await caixa('.lista .noticia .avatar');
		if (tambem.y > manchete.y + manchete.height) {
			expect(Math.round(tambem.x), 'também em destaque').toBe(Math.round(manchete.x));
		}
		expect(Math.round(logoLista.x), 'logo da fonte na lista').toBe(Math.round(manchete.x));
	});
}

// "Também em destaque" embaixo da manchete: o mesmo respiro em cima e embaixo, sem vão sobrando.
for (const largura of [320, 390, 768]) {
	test(`também em destaque com respiro igual em ${largura}px`, async ({ page, isMobile }) => {
		test.skip(isMobile, 'as larguras já cobrem o celular');
		await page.setViewportSize({ width: largura, height: 900 });
		await page.goto('/mercado/manchetes');
		await expect(page.locator('.tambem li').last()).toBeVisible();
		const bloco = (await page.locator('.tambem').boundingBox())!;
		const titulo = (await page.locator('.tambem .titulo-secao').boundingBox())!;
		const ultimo = (await page
			.locator('.tambem li:last-child article > :last-child')
			.boundingBox())!;
		const cima = titulo.y - bloco.y;
		const baixo = bloco.y + bloco.height - (ultimo.y + ultimo.height);
		expect(Math.abs(cima - baixo), `${cima} x ${baixo}`).toBeLessThanOrEqual(2);
	});
}

// "Adicionar tema" no fim dos canais de "Para você": o texto começa na mesma linha dos nomes dos canais.
test('"Adicionar tema" alinhado com os nomes dos canais', async ({ page, isMobile }) => {
	test.skip(isMobile, 'canais da tela larga');
	await page.addInitScript(() =>
		localStorage.setItem('mirante:preferencias', JSON.stringify({ escolheu: true }))
	);
	await page.goto('/para-voce/tudo');
	const canais = page.getByRole('navigation', { name: 'Canais' });
	const nome = (await canais.locator('a.canal .nome').first().boundingBox())!;
	const adicionar = (await canais.locator('.adicionar .nome').boundingBox())!;
	expect(Math.round(adicionar.x)).toBe(Math.round(nome.x));
});

// Painel de temas: nomes, caixas de seleção e o botão "Pronto" em colunas retas, em todas as larguras.
for (const largura of [320, 390, 768, 1024, 1440]) {
	test(`painel de temas alinhado em ${largura}px`, async ({ page, isMobile }) => {
		test.skip(isMobile, 'as larguras já cobrem o celular');
		await page.setViewportSize({ width: largura, height: 900 });
		await page.goto('/para-voce/tudo');
		const painel = page.getByRole('dialog', { name: 'O que você quer ver?' });
		await expect(painel.locator('.detalhe').first()).toBeVisible();
		const xs = async (seletor: string, lado: 'esquerda' | 'direita') =>
			painel.locator(seletor).evaluateAll((els, l) => {
				return els.map((el) => {
					const r = el.getBoundingClientRect();
					return Math.round(l === 'esquerda' ? r.left : r.right);
				});
			}, lado);
		const titulo = (await xs('h2', 'esquerda'))[0];
		expect(new Set(await xs('h3', 'esquerda'))).toEqual(new Set([titulo]));
		expect(new Set(await xs('.linhas .icone', 'esquerda'))).toEqual(new Set([titulo]));
		expect(new Set(await xs('.linhas .nome', 'esquerda')).size).toBe(1);
		const caixas = new Set(await xs('.linhas .caixa', 'direita'));
		expect(caixas.size).toBe(1);
		expect([...caixas][0]).toBe((await xs('.rodape .principal', 'direita'))[0]);
	});
}
