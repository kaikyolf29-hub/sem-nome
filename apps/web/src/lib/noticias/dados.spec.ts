import { describe, expect, it } from 'vitest';
import { SUPABASE_CHAVE_PUBLICAVEL, SUPABASE_URL } from '#lib/supabase/config.ts';
import { buscarFeed, ErroFeed } from './dados.ts';

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
