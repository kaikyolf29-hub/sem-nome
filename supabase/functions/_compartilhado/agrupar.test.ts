import { describe, expect, test } from 'bun:test';
import { assinatura, escolherGrupo, parecidas } from './agrupar.ts';
import type { ItemPronto } from './tipos.ts';

describe('assinatura', () => {
	test('minúsculas, sem acento, sem palavras vazias, únicas e em ordem', () => {
		expect(assinatura('Copom mantém a Selic em 15% e o mercado reage ao Copom')).toEqual([
			'15',
			'copom',
			'mantem',
			'mercado',
			'reage',
			'selic'
		]);
	});
	test('palavras vazias do inglês também saem', () => {
		expect(assinatura('The Fed holds rates as inflation cools')).toEqual(['cools', 'fed', 'holds', 'inflation', 'rates']);
	});
});

describe('parecidas', () => {
	test('a mesma história com títulos diferentes', () => {
		expect(
			parecidas(
				assinatura('Copom mantém Selic em 15% e sinaliza cautela'),
				assinatura('Copom mantém a Selic em 15% ao ano e sinaliza cautela com inflação')
			)
		).toBe(true);
	});
	test('histórias diferentes que começam igual', () => {
		expect(
			parecidas(assinatura('Ibovespa fecha em alta com bancos'), assinatura('Ibovespa fecha em alta com Vale'))
		).toBe(false);
	});
});

describe('escolherGrupo', () => {
	const item = (titulo: string, publicadoEm: string): ItemPronto => ({
		url: 'https://x.invalid/' + titulo.length,
		titulo,
		trecho: '',
		publicadoEm,
		idioma: 'pt-BR',
		espaco: 'mercado',
		canais: [],
		assinatura: assinatura(titulo)
	});
	const novo = item('Copom mantém a Selic em 15% ao ano e sinaliza cautela', '2026-11-17T12:00:00Z');

	test('junta com o grupo parecido mais próximo', () => {
		const recentes = [
			{ grupo_id: 7, assinatura: assinatura('Petrobras anuncia dividendos'), publicado_em: '2026-11-17T11:00:00Z' },
			{
				grupo_id: 9,
				assinatura: assinatura('Copom mantém Selic em 15% e sinaliza cautela'),
				publicado_em: '2026-11-17T11:30:00Z'
			}
		];
		expect(escolherGrupo(novo, recentes)).toBe(9);
	});
	test('não junta com a mesma frase de 40 horas antes', () => {
		const recentes = [
			{
				grupo_id: 3,
				assinatura: assinatura('Copom mantém Selic em 15% e sinaliza cautela'),
				publicado_em: '2026-11-15T20:00:00Z'
			}
		];
		expect(escolherGrupo(novo, recentes)).toBeNull();
	});
	test('sem parecida, grupo novo', () => {
		expect(escolherGrupo(novo, [])).toBeNull();
	});
});
