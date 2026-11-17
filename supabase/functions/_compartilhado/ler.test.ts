import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { lerFeed } from './ler.ts';
import type { TipoFonte } from './tipos.ts';

const amostra = (nome: string) => readFileSync(join(import.meta.dir, 'amostras', nome), 'utf8');

describe('lerFeed com respostas gravadas', () => {
	const casos: [string, TipoFonte][] = [
		['bcb.atom.xml', 'atom'],
		['fed.rss.xml', 'rss'],
		['infomoney.rss.xml', 'rss'],
		['the-verge.atom.xml', 'atom'],
		['coindesk.rss.xml', 'rss'],
		['ibge.json', 'ibge']
	];

	for (const [arquivo, tipo] of casos) {
		test(`${arquivo}: 10 ou mais itens, todos com título e link https`, () => {
			const itens = lerFeed(amostra(arquivo), tipo);
			expect(itens.length).toBeGreaterThanOrEqual(10);
			for (const item of itens) {
				expect(item.titulo.trim().length).toBeGreaterThan(5);
				expect(item.url).toStartWith('https://');
			}
		});
	}

	test('o formato vem do conteúdo, não do tipo cadastrado (Atom cadastrado como rss)', () => {
		expect(lerFeed(amostra('the-verge.atom.xml'), 'rss').length).toBeGreaterThanOrEqual(10);
	});

	test('Atom do Banco Central traz a data de cada notícia', () => {
		const itens = lerFeed(amostra('bcb.atom.xml'), 'atom');
		for (const item of itens) expect(Number.isNaN(Date.parse(item.publicadoEm ?? ''))).toBe(false);
	});

	test('IBGE: data de Brasília vira a hora certa em UTC e o link vira https', () => {
		const texto = JSON.stringify({
			items: [
				{
					titulo: 'IBGE recebe homenagem',
					introducao: 'A Assembleia realizou uma sessão especial.',
					data_publicacao: '16/11/2026 04:29:43',
					link: 'http://agenciadenoticias.ibge.gov.br/agencia-noticias/48647-ibge'
				}
			]
		});
		const [item] = lerFeed(texto, 'ibge');
		expect(item.publicadoEm).toBe('2026-11-16T07:29:43.000Z');
		expect(item.url).toBe('https://agenciadenoticias.ibge.gov.br/agencia-noticias/48647-ibge');
		expect(item.trecho).toBe('A Assembleia realizou uma sessão especial.');
	});

	test('texto que não é feed não quebra: devolve lista vazia', () => {
		expect(lerFeed('<html><body>Fora do ar</body></html>', 'rss')).toEqual([]);
		expect(lerFeed('{"erro": true}', 'ibge')).toEqual([]);
		expect(lerFeed('', 'atom')).toEqual([]);
	});
});
