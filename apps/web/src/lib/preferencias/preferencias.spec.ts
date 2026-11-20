import { describe, expect, it } from 'vitest';
import {
	PADRAO,
	adicionarTemaProprio,
	gravarLocal,
	lerLocal,
	normalizarTermo,
	type Preferencias
} from './preferencias.ts';

const falso = (valor: string | null) => ({ getItem: () => valor });
const quebrado = {
	getItem: () => {
		throw new Error('bloqueado');
	}
};

describe('normalizarTermo', () => {
	it('minúsculas, sem acento, espaços únicos', () => {
		expect(normalizarTermo('  Energia  SOLAR ')).toBe('energia solar');
		expect(normalizarTermo('Petróleo')).toBe('petroleo');
	});
	it('fora de 2 a 40 caracteres vira null', () => {
		expect(normalizarTermo('a')).toBeNull();
		expect(normalizarTermo('   ')).toBeNull();
		expect(normalizarTermo('x'.repeat(41))).toBeNull();
		expect(normalizarTermo('x'.repeat(40))).not.toBeNull();
	});
});

describe('lerLocal', () => {
	it('conteúdo estragado ou armazenamento com erro usa o padrão', () => {
		expect(lerLocal(falso('{x'))).toEqual(PADRAO);
		expect(lerLocal(quebrado)).toEqual(PADRAO);
		expect(lerLocal(null)).toEqual(PADRAO);
		expect(lerLocal(falso(null))).toEqual(PADRAO);
	});
	it('aproveita o que é válido e troca o resto pelo padrão', () => {
		const p = lerLocal(
			falso(
				JSON.stringify({
					temas: ['cripto', 'inexistente'],
					idioma: 'xx',
					escolheu: true,
					fontesOcultas: 3
				})
			)
		);
		expect(p.temas).toEqual(['cripto']);
		expect(p.idioma).toBe(PADRAO.idioma);
		expect(p.escolheu).toBe(true);
		expect(p.fontesOcultas).toEqual([]);
	});
	it('o que se grava volta igual', () => {
		let guardado: string | null = null;
		const p: Preferencias = {
			...PADRAO,
			temas: ['esportes'],
			palavrasSilenciadas: ['x1'],
			escolheu: true
		};
		gravarLocal(p, { setItem: (_k: string, v: string) => (guardado = v) });
		expect(lerLocal(falso(guardado))).toEqual(p);
	});
	it('gravar com erro não lança', () => {
		expect(() =>
			gravarLocal(PADRAO, {
				setItem: () => {
					throw new Error('cheio');
				}
			} as unknown as Storage)
		).not.toThrow();
	});
});

describe('adicionarTemaProprio', () => {
	it('adiciona normalizado', () => {
		const r = adicionarTemaProprio(PADRAO, ' Energia SOLAR');
		expect(r).not.toBeTypeOf('string');
		expect((r as Preferencias).temasProprios).toEqual(['energia solar']);
	});
	it('recusa repetido, inválido e o 6º', () => {
		const p = adicionarTemaProprio(PADRAO, 'energia solar') as Preferencias;
		expect(adicionarTemaProprio(p, 'Energia solar')).toBe('repetido');
		expect(adicionarTemaProprio(p, 'a')).toBe('invalido');
		let q = PADRAO;
		for (const t of ['um tema', 'dois tema', 'tres tema', 'quatro tema', 'cinco tema']) {
			q = adicionarTemaProprio(q, t) as Preferencias;
		}
		expect(q.temasProprios).toHaveLength(5);
		expect(adicionarTemaProprio(q, 'seis tema')).toBe('limite');
	});
});
