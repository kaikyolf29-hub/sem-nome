import { describe, expect, it } from 'vitest';
import {
	consolidar,
	converter,
	MOEDAS,
	lerMoedaPrincipal,
	salvarMoedaPrincipal
} from './moedas.ts';

// Quanto 1 unidade de cada moeda vale em dólar (exemplo).
const usdPor = {
	BRL: 0.2,
	USD: 1,
	EUR: 1.1,
	GBP: 1.3,
	JPY: 0.0065,
	CHF: 1.15,
	CAD: 0.73,
	AUD: 0.66,
	CNY: 0.14,
	MXN: 0.055
};

describe('MOEDAS', () => {
	it('tem as 10 moedas principais, começando pelo real', () => {
		expect(MOEDAS).toEqual(['BRL', 'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY', 'MXN']);
	});
});

describe('converter', () => {
	it('converte pelo dólar como ponte', () => {
		expect(converter(100, 'USD', 'BRL', usdPor)).toBeCloseTo(500, 9);
		expect(converter(500, 'BRL', 'EUR', usdPor)).toBeCloseTo(90.909090909, 6);
		expect(converter(42, 'EUR', 'EUR', usdPor)).toBe(42);
	});
});

describe('consolidar', () => {
	const posicoes = [
		{ moeda: 'BRL' as const, valor: 1000 },
		{ moeda: 'USD' as const, valor: 100 },
		{ moeda: 'BRL' as const, valor: 500 },
		{ moeda: 'EUR' as const, valor: 0 }
	];

	it('soma tudo na moeda principal e agrupa por moeda (maior primeiro)', () => {
		const r = consolidar(posicoes, 'BRL', usdPor);
		expect(r.total).toBeCloseTo(2000, 9);
		expect(r.porMoeda.map((m) => m.moeda)).toEqual(['BRL', 'USD']);
		expect(r.porMoeda[0]).toMatchObject({
			moeda: 'BRL',
			original: 1500,
			convertido: 1500,
			pct: 75
		});
		expect(r.porMoeda[1].convertido).toBeCloseTo(500, 9);
		expect(r.porMoeda[1].pct).toBeCloseTo(25, 9);
	});

	it('trocar a moeda principal muda o total, não a fatia', () => {
		const r = consolidar(posicoes, 'USD', usdPor);
		expect(r.total).toBeCloseTo(400, 9);
		expect(r.porMoeda[1].pct).toBeCloseTo(25, 9);
	});

	it('sem posições, total zero e lista vazia', () => {
		expect(consolidar([], 'BRL', usdPor)).toEqual({ total: 0, porMoeda: [] });
	});
});

describe('moeda principal salva', () => {
	it('lê o padrão, valores inválidos e armazenamento bloqueado como BRL', () => {
		expect(lerMoedaPrincipal(null)).toBe('BRL');
		expect(lerMoedaPrincipal({ getItem: () => 'XYZ' })).toBe('BRL');
		expect(lerMoedaPrincipal({ getItem: () => 'EUR' })).toBe('EUR');
		expect(
			lerMoedaPrincipal({
				getItem: () => {
					throw new Error('bloqueado');
				}
			})
		).toBe('BRL');
	});

	it('salvar falha calado e grava na chave mirante:moeda', () => {
		const gravado: Record<string, string> = {};
		salvarMoedaPrincipal({ setItem: (k: string, v: string) => (gravado[k] = v) }, 'USD');
		expect(gravado).toEqual({ 'mirante:moeda': 'USD' });
		expect(() =>
			salvarMoedaPrincipal(
				{
					setItem: () => {
						throw new Error();
					}
				},
				'USD'
			)
		).not.toThrow();
	});
});
