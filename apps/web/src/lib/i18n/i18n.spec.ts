import { describe, expect, it } from 'vitest';
import { en } from './en.ts';
import { idiomaInicial, traduzir } from './index.ts';
import { ptBR } from './pt-BR.ts';

function folhas(obj: object, prefixo = ''): [string, unknown][] {
	return Object.entries(obj).flatMap(([k, v]) =>
		typeof v === 'object' && v !== null ? folhas(v, `${prefixo}${k}.`) : [[`${prefixo}${k}`, v]]
	);
}

describe('idiomaInicial', () => {
	it('português vira pt-BR, o resto inglês', () => {
		expect(idiomaInicial(['pt-PT'])).toBe('pt-BR');
		expect(idiomaInicial(['en-US', 'pt-BR'])).toBe('en');
		expect(idiomaInicial([])).toBe('pt-BR');
	});
});

describe('traduzir', () => {
	it('troca os parâmetros', () => {
		expect(traduzir('pt-BR', 'comum.ola', { nome: 'Ana' })).toBe('Olá, Ana');
		expect(traduzir('en', 'comum.ola', { nome: 'Ana' })).toBe('Hi, Ana');
	});
});

describe('catálogos', () => {
	it('mesmas chaves e nenhum texto vazio', () => {
		const pt = folhas(ptBR);
		const ing = folhas(en);
		expect(ing.map(([k]) => k).sort()).toEqual(pt.map(([k]) => k).sort());
		for (const [k, v] of [...pt, ...ing]) expect(String(v).trim(), k).not.toBe('');
	});

	it('os mesmos {parametros} nos dois idiomas', () => {
		const params = (v: unknown) => [...String(v).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
		const ing = new Map(folhas(en));
		for (const [k, v] of folhas(ptBR)) expect(params(ing.get(k)), k).toEqual(params(v));
	});
});
