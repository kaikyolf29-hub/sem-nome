import { comPreferencias, expect, noFormatoDoBanco, responderBusca, test } from './apoio.ts';
import { noticiasExemplo } from '../src/lib/prototipo/exemplos.ts';

// Quem já escolheu os temas (escolheu: true) não vê a primeira visita: estes testes olham o espaço.
test.describe('Para você', () => {
	test('/ leva a /para-voce/tudo', async ({ page }) => {
		await comPreferencias(page, {});
		await page.goto('/');
		await expect(page).toHaveURL(/\/para-voce\/tudo$/);
		await expect(page.getByRole('heading', { level: 1, name: 'tudo' })).toBeVisible();
	});

	test('"Início" no celular leva a /para-voce/tudo', async ({ page, isMobile }) => {
		test.skip(!isMobile, 'barra do celular');
		await comPreferencias(page, {});
		await page.goto('/cripto/nft');
		await page
			.getByRole('navigation', { name: 'Navegação principal' })
			.getByRole('link', { name: 'Início' })
			.click();
		await expect(page).toHaveURL(/\/para-voce\/tudo$/);
	});

	test('com os temas padrão: "Para você" primeiro no trilho e os canais dos temas', async ({
		page,
		isMobile
	}) => {
		test.skip(isMobile, 'trilho e canais da tela larga');
		await comPreferencias(page, {});
		await page.goto('/para-voce/tudo');
		const trilho = page.getByRole('navigation', { name: 'Espaços' });
		await expect(trilho.getByRole('listitem').first().getByRole('link')).toHaveAccessibleName(
			'Para você'
		);
		const canais = page.getByRole('navigation', { name: 'Canais' });
		await expect(canais.getByRole('link')).toHaveText([
			/tudo/,
			/mercado/,
			/tecnologia-e-ia/,
			/brasil/,
			/mundo/
		]);
		await expect(canais.getByRole('button', { name: 'Adicionar tema' })).toBeVisible();
	});

	test('tudo pede as origens dos temas e não repete um cartão de duas origens', async ({
		page
	}) => {
		await comPreferencias(page, {});
		const pedidos: string[] = [];
		page.on('request', (r) => {
			const url = new URL(r.url());
			if (url.pathname.endsWith('/rpc/feed')) {
				const canal = url.searchParams.get('p_canal');
				pedidos.push(`${url.searchParams.get('p_espaco')}${canal ? `/${canal}` : ''}`);
			}
		});
		await page.goto('/para-voce/tudo');
		await expect(page.locator('.lista .noticia').first()).toBeVisible();
		expect([...new Set(pedidos)].sort()).toEqual(
			['geral/brasil', 'geral/mundo', 'mercado/mundo', 'mercado/manchetes', 'tecnologia'].sort()
		);
		// "Inflação americana…" está em mercado/manchetes e em mercado/mundo: aparece uma vez só.
		await expect(page.getByText(/Inflação americana desacelera/)).toHaveCount(1);
	});

	test('tema digitado sem resultado diz isso com clareza', async ({ page }) => {
		await comPreferencias(page, { temasProprios: ['corinthians'] });
		await page.goto('/para-voce/busca-corinthians');
		await expect(page.getByRole('heading', { level: 1, name: 'corinthians' })).toBeVisible();
		await expect(
			page.getByText('Ainda não há notícias sobre “corinthians” nas nossas fontes.')
		).toBeVisible();
	});

	test('tema digitado com resultado mostra as notícias da busca', async ({ page }) => {
		await comPreferencias(page, { temasProprios: ['petrobras'] });
		await responderBusca(page, () =>
			noFormatoDoBanco(noticiasExemplo.filter((n) => n.titulo.includes('Petrobras')))
		);
		await page.goto('/para-voce/busca-petrobras');
		await expect(
			page.locator('.coluna').getByText(/Petrobras divulga novo calendário/)
		).toBeVisible();
	});

	test('um canal que a pessoa tirou leva para tudo', async ({ page }) => {
		await comPreferencias(page, { temas: ['mercado'] });
		await page.goto('/para-voce/esportes');
		await expect(page).toHaveURL(/\/para-voce\/tudo$/);
	});

	test('fonte escondida some também de /mercado/manchetes', async ({ page }) => {
		await comPreferencias(page, { fontesOcultas: ['Gazeta do Pregão'] });
		await page.goto('/mercado/manchetes');
		await expect(page.locator('.lista .noticia').first()).toBeVisible();
		await expect(page.getByText('Gazeta do Pregão', { exact: true })).toHaveCount(0);
		await expect(page.getByText('Mercado Hoje').first()).toBeVisible();
	});

	test('a 320 px nada passa da largura', async ({ page }) => {
		await comPreferencias(page, { temasProprios: ['energia solar'] });
		await page.setViewportSize({ width: 320, height: 640 });
		for (const rota of ['/para-voce/tudo', '/para-voce/mundo', '/para-voce/busca-energia-solar']) {
			await page.goto(rota);
			await expect(page.locator('main')).toBeVisible();
			const [scroll, cliente] = await page.evaluate(() => [
				document.documentElement.scrollWidth,
				document.documentElement.clientWidth
			]);
			expect(scroll, rota).toBeLessThanOrEqual(cliente);
		}
	});
});
