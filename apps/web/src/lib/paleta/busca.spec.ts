import { describe, expect, it } from 'vitest';
import { buscarComandos, type ItemComando } from './busca.ts';

const itens: ItemComando[] = [
	{ id: 'espaco:mercado', rotulo: 'Mercado', tipo: 'espaco', destino: '/mercado/manchetes' },
	{ id: 'canal:mercado/cambio', rotulo: 'câmbio', tipo: 'canal', destino: '/mercado/cambio' },
	{
		id: 'canal:mercado/commodities',
		rotulo: 'commodities',
		tipo: 'canal',
		destino: '/mercado/commodities'
	},
	{
		id: 'canal:cripto/stablecoins',
		rotulo: 'stablecoins',
		tipo: 'canal',
		destino: '/cripto/stablecoins'
	},
	...Array.from({ length: 10 }, (_, i) => ({
		id: `noticia:${i}`,
		rotulo: `Notícia ${i} sobre mercado de câmbio`,
		tipo: 'noticia' as const,
		destino: '/mercado/manchetes'
	}))
];

describe('buscarComandos', () => {
	it('ignora acentos e prioriza o começo da palavra', () => {
		expect(buscarComandos('cambio', itens)[0].id).toBe('canal:mercado/cambio');
	});

	it('consulta vazia devolve os 8 primeiros', () => {
		expect(buscarComandos('', itens)).toHaveLength(8);
	});

	it('sem resultado devolve lista vazia', () => {
		expect(buscarComandos('zzz', itens)).toEqual([]);
	});

	it('acha pelo meio da palavra também, depois dos que começam', () => {
		const r = buscarComandos('coin', itens);
		expect(r.map((x) => x.id)).toEqual(['canal:cripto/stablecoins']);
	});
});
