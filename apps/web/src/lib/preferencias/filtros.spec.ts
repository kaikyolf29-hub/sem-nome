import { describe, expect, it } from 'vitest';
import type { Noticia } from '#lib/feed/tipos.ts';
import { aplicarFiltros, juntarFeeds } from './filtros.ts';
import { PADRAO } from './preferencias.ts';

function n(id: string, extra: Partial<Noticia> & { fonte?: string } = {}): Noticia {
	const { fonte = 'g1', ...resto } = extra;
	return {
		id,
		titulo: `Título ${id}`,
		url: `https://x/${id}`,
		fontes: [{ id: fonte, nome: fonte, url: 'https://x', primaria: false }],
		publicadoEm: '2026-11-17T12:00:00Z',
		trecho: 'trecho',
		temas: [],
		impacto: 0,
		bafafa: false,
		ativos: [],
		espaco: 'mercado',
		canais: [],
		...resto
	};
}

describe('aplicarFiltros', () => {
	it('fonte escondida que é a principal do cartão tira o cartão (o título e o link são dela)', () => {
		const cartao = {
			...n('1'),
			fontes: [
				{ id: 'bbc', nome: 'BBC', url: 'https://bbc/1', primaria: false },
				{ id: 'dw', nome: 'DW', url: 'https://dw/1', primaria: false }
			]
		};
		expect(aplicarFiltros([cartao], { ...PADRAO, fontesOcultas: ['bbc'] })).toHaveLength(0);
		expect(
			aplicarFiltros([cartao], { ...PADRAO, fontesOcultas: ['dw'] })[0].fontes.map((f) => f.id)
		).toEqual(['bbc']);
	});

	it('tira a fonte escondida e descarta o cartão que fica sem fonte', () => {
		const duas = n('a', {
			fontes: [
				{ id: 'g1', nome: 'g1', url: 'u', primaria: false },
				{ id: 'dw', nome: 'dw', url: 'u', primaria: false }
			]
		});
		const so = n('b', { fonte: 'dw' });
		const r = aplicarFiltros([duas, so], { ...PADRAO, fontesOcultas: ['dw'] });
		expect(r.map((x) => x.id)).toEqual(['a']);
		expect(r[0].fontes.map((f) => f.id)).toEqual(['g1']);
	});

	it('idioma pt tira inglês; pt-en mantém', () => {
		const lista = [n('a', { idioma: 'en' }), n('b', { idioma: 'pt-BR' }), n('c')];
		expect(aplicarFiltros(lista, { ...PADRAO, idioma: 'pt' }).map((x) => x.id)).toEqual(['b', 'c']);
		expect(aplicarFiltros(lista, { ...PADRAO, idioma: 'pt-en' })).toHaveLength(3);
	});

	it('frase silenciada precisa vir inteira, sem acento', () => {
		const lista = [
			n('a', { titulo: 'Bolsa Família sobe em dezembro' }),
			n('b', { titulo: 'Bolsa de valores fecha em alta' }),
			n('c', { trecho: 'o programa BOLSA FAMILIA muda' }),
			n('d', { titulo: 'Bolsa Familiar nova' })
		];
		const r = aplicarFiltros(lista, { ...PADRAO, palavrasSilenciadas: ['bolsa familia'] });
		expect(r.map((x) => x.id)).toEqual(['b', 'd']);
	});
});

describe('juntarFeeds', () => {
	it('tira repetido e ordena do mais novo para o mais antigo', () => {
		const r = juntarFeeds([
			[
				n('a', { publicadoEm: '2026-11-17T10:00:00Z' }),
				n('b', { publicadoEm: '2026-11-17T12:00:00Z' })
			],
			[
				n('a', { publicadoEm: '2026-11-17T10:00:00Z' }),
				n('c', { publicadoEm: '2026-11-17T11:00:00Z' })
			]
		]);
		expect(r.map((x) => x.id)).toEqual(['b', 'c', 'a']);
	});

	it('a mesma marca não aparece duas vezes seguidas se houver outra', () => {
		const lista = [
			n('1', { publicadoEm: '2026-11-17T12:05:00Z' }),
			n('2', { publicadoEm: '2026-11-17T12:04:00Z' }),
			n('3', { publicadoEm: '2026-11-17T12:03:00Z', fonte: 'dw' }),
			n('4', { publicadoEm: '2026-11-17T12:02:00Z', fonte: 'bbc' })
		];
		expect(juntarFeeds([lista]).map((x) => x.id)).toEqual(['1', '3', '2', '4']);
	});

	it('seções do mesmo veículo (mesma logo) contam como a mesma marca', () => {
		const comLogo = (id: string, fonte: string, logo: string, hora: string) => ({
			...n(id, { publicadoEm: `2026-11-17T12:${hora}:00Z` }),
			fontes: [{ id: fonte, nome: fonte, url: 'https://x', primaria: false, logo }]
		});
		const lista = [
			comLogo('1', 'g1', '/fontes/g1.png', '05'),
			comLogo('2', 'g1-saude', '/fontes/g1.png', '04'),
			comLogo('3', 'g1-mundo', '/fontes/g1.png', '03'),
			comLogo('4', 'dw-brasil', '/fontes/dw-brasil.png', '02')
		];
		expect(juntarFeeds([lista]).map((x) => x.id)).toEqual(['1', '4', '2', '3']);
	});

	it('sem alternativa, mantém a ordem', () => {
		const lista = ['1', '2', '3'].map((id, i) =>
			n(id, { publicadoEm: `2026-11-17T12:0${5 - i}:00Z` })
		);
		expect(juntarFeeds([lista]).map((x) => x.id)).toEqual(['1', '2', '3']);
	});
});
