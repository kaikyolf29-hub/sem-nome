import { describe, expect, it } from 'vitest';
import { lerPreferencia, resolverTema, salvarPreferencia } from './tema.ts';

describe('resolverTema', () => {
	it('segue o sistema', () => {
		expect(resolverTema('sistema', true, false)).toBe('escuro');
		expect(resolverTema('sistema', false, false)).toBe('claro');
	});

	it('respeita a escolha fixa', () => {
		expect(resolverTema('preto', false, false)).toBe('preto');
		expect(resolverTema('claro', true, false)).toBe('claro');
	});

	it('no Matsu só existem claro e escuro', () => {
		expect(resolverTema('preto', false, true)).toBe('matsu-escuro');
		expect(resolverTema('claro', true, true)).toBe('matsu-claro');
		expect(resolverTema('sistema', true, true)).toBe('matsu-escuro');
		expect(resolverTema('sistema', false, true)).toBe('matsu-claro');
	});
});

describe('lerPreferencia', () => {
	it('sem armazenamento dá "sistema"', () => {
		expect(lerPreferencia(null)).toBe('sistema');
	});

	it('armazenamento bloqueado não quebra', () => {
		const bloqueado = {
			getItem: () => {
				throw new Error('bloqueado');
			}
		};
		expect(lerPreferencia(bloqueado)).toBe('sistema');
	});

	it('valor inválido dá "sistema"', () => {
		expect(lerPreferencia({ getItem: () => 'roxo' })).toBe('sistema');
	});

	it('lê valor válido', () => {
		expect(lerPreferencia({ getItem: () => 'preto' })).toBe('preto');
	});
});

describe('salvarPreferencia', () => {
	it('falha calada com armazenamento bloqueado', () => {
		const bloqueado = {
			setItem: () => {
				throw new Error('bloqueado');
			}
		};
		expect(() => salvarPreferencia(bloqueado, 'preto')).not.toThrow();
		expect(() => salvarPreferencia(null, 'preto')).not.toThrow();
	});

	it('grava na chave mirante:tema', () => {
		const gravado: Record<string, string> = {};
		salvarPreferencia({ setItem: (k: string, v: string) => (gravado[k] = v) }, 'claro');
		expect(gravado).toEqual({ 'mirante:tema': 'claro' });
	});
});
