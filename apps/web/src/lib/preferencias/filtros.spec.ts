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
	it('tira a fonte escondida e descarta o cartão que fica sem fonte', () => {
		const duas = n('a', {
			fontes: [
				{ id: 'g1', nome: 'g1', url: 'u', primaria: false },
				{ id: 'dw', nome: 'dw', url: 'u', primaria: false }
			]
		});
		const so = n('b', { fonte: 'g1' });
		const r = aplicarFiltros([duas, so], { ...PADRAO, fontesOcultas: ['g1'] });
		expect(r.map((x) => x.id)).toEqual(['a']);
		expect(r[0].fontes.map((f) => f.id)).toEqual(['dw']);
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

	it('a mesma primeira fonte não aparece mais de duas vezes seguidas se houver outra', () => {
		const lista = [
			n('1', { publicadoEm: '2026-11-17T12:05:00Z' }),
			n('2', { publicadoEm: '2026-11-17T12:04:00Z' }),
			n('3', { publicadoEm: '2026-11-17T12:03:00Z' }),
			n('4', { publicadoEm: '2026-11-17T12:02:00Z', fonte: 'dw' })
		];
		const r = juntarFeeds([lista]);
		expect(r.map((x) => x.id)).toEqual(['1', '2', '4', '3']);
	});

	it('sem alternativa, mantém a ordem', () => {
		const lista = ['1', '2', '3'].map((id, i) =>
			n(id, { publicadoEm: `2026-11-17T12:0${5 - i}:00Z` })
		);
		expect(juntarFeeds([lista]).map((x) => x.id)).toEqual(['1', '2', '3']);
	});
});
