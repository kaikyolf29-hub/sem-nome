import { describe, expect, it } from 'vitest';
import { SUPABASE_CHAVE_PUBLICAVEL, SUPABASE_URL } from '#lib/supabase/config.ts';
import { buscarFeed, buscarNoticias, ErroFeed } from './dados.ts';

const linha = {
	id: 42,
	titulo: 'Copom mantém a Selic em 15%',
	url: 'https://www.bcb.gov.br/detalhenoticia/1',
	trecho: 'O comitê manteve a taxa básica.',
	publicadoEm: '2026-11-17T12:00:00+00:00',
	idioma: 'pt-BR',
	canais: ['brasil', 'macro'],
	fontes: [
		{
			id: 'bcb',
			nome: 'Banco Central do Brasil',
			site: 'https://www.bcb.gov.br',
			logo: '/fontes/bcb.png',
			primaria: true,
			url: 'https://www.bcb.gov.br/detalhenoticia/1'
		},
		{
			id: 'infomoney',
			nome: 'InfoMoney',
			site: 'https://www.infomoney.com.br',
			logo: '/fontes/infomoney.png',
			primaria: false,
			url: 'https://www.infomoney.com.br/x'
		}
	]
};

const responde = (corpo: unknown, status = 200) =>
	(async () => new Response(JSON.stringify(corpo), { status })) as unknown as typeof fetch;

describe('buscarFeed', () => {
	it('pede a função feed por GET, com a chave publicável', async () => {
		let pedido: [string, RequestInit | undefined] = ['', undefined];
		const buscar = (async (url: string, init?: RequestInit) => {
			if (url.startsWith('/api/')) return new Response('x', { status: 404 });
			pedido = [url, init];
			return new Response('[]');
		}) as unknown as typeof fetch;
		await buscarFeed('mercado', 'macro', buscar);
		expect(pedido[0]).toBe(
			`${SUPABASE_URL}/rest/v1/rpc/feed?p_espaco=mercado&p_canal=macro&p_limite=30`
		);
		expect(new Headers(pedido[1]?.headers).get('apikey')).toBe(SUPABASE_CHAVE_PUBLICAVEL);
		expect(pedido[1]?.method ?? 'GET').toBe('GET');
	});

	it('transforma cada grupo em notícia, com as fontes na ordem do banco (a primária primeiro)', async () => {
		const [n] = await buscarFeed('mercado', 'manchetes', responde([linha]));
		expect(n).toMatchObject({
			id: '42',
			titulo: 'Copom mantém a Selic em 15%',
			url: 'https://www.bcb.gov.br/detalhenoticia/1',
			trecho: 'O comitê manteve a taxa básica.',
			publicadoEm: '2026-11-17T12:00:00+00:00',
			espaco: 'mercado',
			canais: ['brasil', 'macro'],
			impacto: 0,
			bafafa: false,
			ativos: [],
			temas: []
		});
		expect(n.resumoIA).toBeUndefined();
		expect(n.fontes.map((f) => [f.nome, f.primaria, f.logo])).toEqual([
			['Banco Central do Brasil', true, '/fontes/bcb.png'],
			['InfoMoney', false, '/fontes/infomoney.png']
		]);
	});

	it('campos da IA (fase 2), quando vierem, já entram no cartão', async () => {
		const [n] = await buscarFeed(
			'mercado',
			'manchetes',
			responde([
				{
					...linha,
					resumoIA: 'Resumo.',
					impacto: 80,
					bafafa: true,
					temas: ['juros'],
					ativos: [{ ticker: 'PETR4', motivo: 'x' }]
				}
			])
		);
		expect(n).toMatchObject({ resumoIA: 'Resumo.', impacto: 80, bafafa: true, temas: ['juros'] });
		expect(n.ativos).toHaveLength(1);
	});

	it('erro do servidor e falta de rede viram erros claros', async () => {
		await expect(
			buscarFeed('mercado', 'manchetes', responde({ message: 'x' }, 500))
		).rejects.toMatchObject({ tipo: 'servidor' });
		const semRede = (async () => {
			throw new TypeError('Failed to fetch');
		}) as unknown as typeof fetch;
		const erro = await buscarFeed('mercado', 'manchetes', semRede).catch((e) => e);
		expect(erro).toBeInstanceOf(ErroFeed);
		expect(erro.tipo).toBe('rede');
	});

	it('resposta que não é lista vira erro do servidor', async () => {
		await expect(buscarFeed('mercado', 'manchetes', responde({ oi: 1 }))).rejects.toMatchObject({
			tipo: 'servidor'
		});
	});
});

/** Um fetch que registra os pedidos: /api responde `api`, o Supabase responde `banco`. */
function roteado(api: () => Response | Promise<Response>, banco: unknown = []) {
	const urls: string[] = [];
	const buscar = (async (url: string) => {
		urls.push(url);
		if (url.startsWith('/api/')) return api();
		return new Response(JSON.stringify(banco));
	}) as unknown as typeof fetch;
	return { buscar, urls };
}

const html = () =>
	new Response('<!doctype html><title>Mirante</title>', {
		headers: { 'Content-Type': 'text/html' }
	});

describe('buscarFeed: pela borda (/api) primeiro', () => {
	it('/api com lista JSON não chama o Supabase', async () => {
		const { buscar, urls } = roteado(() => new Response(JSON.stringify([linha])));
		const [n] = await buscarFeed('cripto', 'defi', buscar);
		expect(n.id).toBe('42');
		expect(urls).toEqual(['/api/feed?espaco=cripto&canal=defi&limite=30']);
	});

	it('/api devolvendo a página (text/html, como no vite preview) cai no Supabase', async () => {
		const { buscar, urls } = roteado(html, [linha]);
		const [n] = await buscarFeed('mercado', 'macro', buscar);
		expect(n.id).toBe('42');
		expect(urls).toEqual([
			'/api/feed?espaco=mercado&canal=macro&limite=30',
			`${SUPABASE_URL}/rest/v1/rpc/feed?p_espaco=mercado&p_canal=macro&p_limite=30`
		]);
	});

	it('/api fora do ar (rede ou 502) cai no Supabase', async () => {
		for (const api of [
			() => {
				throw new TypeError('Failed to fetch');
			},
			() => new Response('{}', { status: 502 }),
			() => new Response('{"oi":1}')
		]) {
			const { buscar, urls } = roteado(api, [linha]);
			expect(await buscarFeed('mercado', 'macro', buscar)).toHaveLength(1);
			expect(urls).toHaveLength(2);
		}
	});

	it('o cartão traz o idioma e o id de cada fonte', async () => {
		const [n] = await buscarFeed('mercado', 'manchetes', responde([linha]));
		expect(n.idioma).toBe('pt-BR');
		expect(n.fontes.map((f) => f.id)).toEqual(['bcb', 'infomoney']);
	});
});

describe('buscarNoticias', () => {
	it('pede /api/busca e, se falhar, rpc/buscar_noticias', async () => {
		const ok = roteado(() => new Response(JSON.stringify([linha])));
		expect(await buscarNoticias('energia solar', ok.buscar)).toHaveLength(1);
		expect(ok.urls).toEqual(['/api/busca?q=energia+solar&limite=30']);

		const queda = roteado(html, [linha]);
		const [n] = await buscarNoticias('Petróleo', queda.buscar);
		expect(n.espaco).toBeDefined();
		expect(queda.urls).toEqual([
			'/api/busca?q=Petr%C3%B3leo&limite=30',
			`${SUPABASE_URL}/rest/v1/rpc/buscar_noticias?p_termo=Petr%C3%B3leo&p_limite=30`
		]);
	});

	it('Supabase com erro ou sem rede vira ErroFeed', async () => {
		const buscar = (async (url: string) =>
			url.startsWith('/api/')
				? html()
				: new Response('x', { status: 500 })) as unknown as typeof fetch;
		await expect(buscarNoticias('solar', buscar)).rejects.toMatchObject({ tipo: 'servidor' });
		const semRede = (async () => {
			throw new TypeError('x');
		}) as unknown as typeof fetch;
		await expect(buscarNoticias('solar', semRede)).rejects.toMatchObject({ tipo: 'rede' });
	});
});
