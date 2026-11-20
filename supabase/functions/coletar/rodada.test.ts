import { describe, expect, test } from 'bun:test';
import type { Recente } from '../_compartilhado/agrupar.ts';
import type { Espaco, ItemPronto } from '../_compartilhado/tipos.ts';
import { rodada, type BancoColeta, type EstadoFonte, type FonteComEstado, type NovaNoticia } from './rodada.ts';

const agora = new Date('2026-11-17T12:00:00Z');

const estado = (e: Partial<EstadoFonte> = {}): EstadoFonte => ({
	etag: null,
	modificado: null,
	ultima_coleta: null,
	proxima_coleta: '2026-11-17T11:55:00Z',
	erros_seguidos: 0,
	ultimo_erro: null,
	itens_ultima: null,
	...e
});

const fonte = (id: string, e: Partial<EstadoFonte> = {}): FonteComEstado => ({
	id,
	nome: id,
	tipo: 'rss',
	endereco: `https://${id}.invalid/feed`,
	idioma: 'pt-BR',
	primaria: false,
	espaco: 'mercado',
	canais: ['brasil'],
	intervalo_min: 10,
	estado: estado(e)
});

const rss = (...itens: [string, string][]) =>
	`<?xml version="1.0"?><rss version="2.0"><channel><title>x</title>${itens
		.map(([t, u]) => `<item><title>${t}</title><link>${u}</link><pubDate>Tue, 17 Nov 2026 11:30:00 GMT</pubDate></item>`)
		.join('')}</channel></rss>`;

function bancoFalso(fontes: FonteComEstado[], existentes: string[] | Record<string, Espaco> = []) {
	const mapa = new Map<string, Espaco>(
		Array.isArray(existentes) ? existentes.map((u) => [u, 'mercado'] as [string, Espaco]) : Object.entries(existentes)
	);
	const acrescentadas: [string, string[]][] = [];
	const estados = new Map<string, Partial<EstadoFonte>>();
	const inseridas: NovaNoticia[] = [];
	const grupos: ItemPronto[] = [];
	const pedidosRecentes: string[] = [];
	const limites: Date[] = [];
	const db: BancoColeta = {
		fontesVencidas: async (ate) => (limites.push(ate), fontes),
		recentes: async (_desde, espaco): Promise<Recente[]> => (pedidosRecentes.push(espaco), []),
		urlsExistentes: async (urls) => new Map(urls.filter((u) => mapa.has(u)).map((u) => [u, mapa.get(u)!])),
		acrescentarCanais: async (url, canais) => void acrescentadas.push([url, canais]),
		criarGrupo: async (item) => grupos.push(item),
		inserir: async (itens) => void inseridas.push(...itens),
		salvarEstado: async (id, e) => void estados.set(id, e)
	};
	return { db, estados, inseridas, grupos, pedidosRecentes, limites, acrescentadas };
}

const resposta = (corpo: string, status = 200, cabecalhos: Record<string, string> = {}) =>
	new Response(status === 304 ? null : corpo, { status, headers: cabecalhos });

describe('rodada de coleta', () => {
	test('304 não insere nada e só reagenda no intervalo', async () => {
		const { db, estados, inseridas } = bancoFalso([fonte('a', { etag: '"v1"' })]);
		let cabecalhoEnviado = '';
		const buscar = (async (_url: string, init?: RequestInit) => {
			cabecalhoEnviado = new Headers(init?.headers).get('if-none-match') ?? '';
			return resposta('', 304);
		}) as typeof fetch;
		const r = await rodada(db, buscar, () => agora);
		expect(cabecalhoEnviado).toBe('"v1"');
		expect(inseridas).toHaveLength(0);
		expect(r.fontes).toEqual([{ id: 'a', status: 304, novos: 0 }]);
		expect(estados.get('a')!.proxima_coleta).toBe('2026-11-17T12:10:00.000Z');
	});

	test('500 soma o erro, espera em dobro (20 min) e a fonte seguinte continua', async () => {
		const { db, estados, inseridas } = bancoFalso([fonte('ruim'), fonte('boa')]);
		const buscar = (async (url: string) =>
			url.includes('ruim')
				? resposta('erro', 500)
				: resposta(rss(['Dólar fecha em queda', 'https://boa.invalid/1']), 200, { etag: '"e2"' })) as typeof fetch;
		const r = await rodada(db, buscar, () => agora);
		expect(r.fontes.map((f) => f.status)).toEqual([500, 200]);
		expect(estados.get('ruim')).toMatchObject({ erros_seguidos: 1, proxima_coleta: '2026-11-17T12:20:00.000Z' });
		expect(estados.get('boa')).toMatchObject({ erros_seguidos: 0, etag: '"e2"', itens_ultima: 1 });
		expect(inseridas).toHaveLength(1);
	});

	test('falha de rede também conta como erro, sem derrubar a rodada', async () => {
		const { db, estados } = bancoFalso([fonte('fora', { erros_seguidos: 3 })]);
		const buscar = (async () => {
			throw new TypeError('fetch failed');
		}) as typeof fetch;
		const r = await rodada(db, buscar, () => agora);
		expect(r.fontes).toEqual([{ id: 'fora', status: 'erro', novos: 0 }]);
		// 10 min × 2⁴ = 160 min.
		expect(estados.get('fora')).toMatchObject({ erros_seguidos: 4, proxima_coleta: '2026-11-17T14:40:00.000Z' });
	});

	test('URL que já está no banco não entra de novo', async () => {
		const { db, inseridas } = bancoFalso([fonte('a')], ['https://a.invalid/velha']);
		const buscar = (async () =>
			resposta(
				rss(['Notícia velha sobre o Ibovespa', 'https://a.invalid/velha'], ['Notícia nova sobre o dólar', 'https://a.invalid/nova'])
			)) as typeof fetch;
		await rodada(db, buscar, () => agora);
		expect(inseridas.map((n) => n.url)).toEqual(['https://a.invalid/nova']);
	});

	test('a mesma história em duas fontes cai no mesmo grupo', async () => {
		const { db, inseridas, grupos } = bancoFalso([fonte('a'), fonte('b')]);
		const buscar = (async (url: string) =>
			url.includes('a.invalid')
				? resposta(rss(['Copom mantém Selic em 15% e sinaliza cautela', 'https://a.invalid/1']))
				: resposta(rss(['Copom mantém a Selic em 15% ao ano e sinaliza cautela', 'https://b.invalid/1']))) as typeof fetch;
		await rodada(db, buscar, () => agora);
		expect(grupos).toHaveLength(1);
		expect(inseridas.map((n) => [n.fonte_id, n.grupo_id])).toEqual([
			['a', 1],
			['b', 1]
		]);
	});

	test('passou do tempo limite: para antes da próxima fonte', async () => {
		const { db } = bancoFalso([fonte('a'), fonte('b')]);
		let relogio = agora.getTime();
		const buscar = (async () => {
			relogio += 30_000;
			return resposta(rss());
		}) as typeof fetch;
		const r = await rodada(db, buscar, () => new Date(relogio), 25_000);
		expect(r.fontes.map((f) => f.id)).toEqual(['a']);
	});

	test('pergunta ao banco em lotes de até 25 URLs, para o endereço do pedido não estourar', async () => {
		const { db } = bancoFalso([fonte('a')]);
		const lotes: number[] = [];
		const original = db.urlsExistentes;
		db.urlsExistentes = async (urls) => (lotes.push(urls.length), original(urls));
		const cem = Array.from({ length: 100 }, (_, i): [string, string] => [`Notícia ${i} do mercado brasileiro`, `https://a.invalid/${i}`]);
		await rodada(db, (async () => resposta(rss(...cem))) as typeof fetch, () => agora);
		expect(lotes).toEqual([25, 25, 25, 25]);
	});

	test('fonte que vence daqui a pouco já entra (o cron roda a cada 5 min e a busca atrasa segundos)', async () => {
		const { db, limites } = bancoFalso([]);
		await rodada(db, (async () => resposta(rss())) as typeof fetch, () => agora);
		expect(limites[0].toISOString()).toBe('2026-11-17T12:02:00.000Z');
	});

	test('sem fonte vencida ou sem notícia nova, não baixa as notícias recentes do banco', async () => {
		const vazio = bancoFalso([]);
		await rodada(vazio.db, (async () => resposta(rss())) as typeof fetch, () => agora);
		expect(vazio.pedidosRecentes).toHaveLength(0);
		const semNovidade = bancoFalso([fonte('a', { etag: '"v1"' })]);
		await rodada(semNovidade.db, (async () => resposta('', 304)) as typeof fetch, () => agora);
		expect(semNovidade.pedidosRecentes).toHaveLength(0);
	});

	test('agrupa só dentro do mesmo espaço e pede as recentes uma vez por espaço', async () => {
		const tec: FonteComEstado = { ...fonte('tec'), espaco: 'tecnologia', canais: [] };
		const { db, grupos, pedidosRecentes } = bancoFalso([fonte('a'), fonte('b'), tec]);
		const titulo = 'Nvidia anuncia novo chip de inteligência artificial para data centers';
		const buscar = (async (url: string) =>
			resposta(rss([titulo, url.replace('/feed', '/1')]))) as typeof fetch;
		await rodada(db, buscar, () => agora);
		expect(pedidosRecentes).toEqual(['mercado', 'tecnologia']);
		// a e b (mercado) juntam; a de tecnologia vira outro grupo.
		expect(grupos).toHaveLength(2);
	});

	test('no máximo 30 notícias novas por fonte numa rodada', async () => {
		const { db, inseridas } = bancoFalso([fonte('a')]);
		const muitos = Array.from({ length: 45 }, (_, i): [string, string] => [
			`Notícia ${i} sobre o mercado brasileiro número ${i}`,
			`https://a.invalid/${i}`
		]);
		await rodada(db, (async () => resposta(rss(...muitos))) as typeof fetch, () => agora);
		expect(inseridas).toHaveLength(30);
	});

	test('mesma URL já gravada no mesmo espaço: acrescenta os canais e não insere', async () => {
		const url = 'https://g1.invalid/materia';
		const g1pol: FonteComEstado = { ...fonte('g1-politica'), espaco: 'geral', canais: ['politica'] };
		const { db, inseridas, acrescentadas } = bancoFalso([g1pol], { [url]: 'geral' });
		await rodada(db, (async () => resposta(rss(['Câmara aprova projeto de lei', url]))) as typeof fetch, () => agora);
		expect(acrescentadas).toEqual([[url, ['politica']]]);
		expect(inseridas).toHaveLength(0);
	});

	test('URL gravada em outro espaço: nada muda', async () => {
		const url = 'https://g1.invalid/materia';
		const g1pol: FonteComEstado = { ...fonte('g1-politica'), espaco: 'geral', canais: ['politica'] };
		const { db, inseridas, acrescentadas } = bancoFalso([g1pol], { [url]: 'mercado' });
		await rodada(db, (async () => resposta(rss(['Câmara aprova projeto de lei', url]))) as typeof fetch, () => agora);
		expect(acrescentadas).toHaveLength(0);
		expect(inseridas).toHaveLength(0);
	});
});
