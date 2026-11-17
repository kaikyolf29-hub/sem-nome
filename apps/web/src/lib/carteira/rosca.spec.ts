import { describe, expect, it } from 'vitest';
import { arcos } from './rosca.ts';

describe('arcos', () => {
	it('divide o círculo pelo valor de cada fatia, começando no topo', () => {
		expect(
			arcos([
				{ rotulo: 'a', valor: 1 },
				{ rotulo: 'b', valor: 3 }
			])
		).toEqual([
			{ rotulo: 'a', pct: 25, inicio: 0, fim: 90 },
			{ rotulo: 'b', pct: 75, inicio: 90, fim: 360 }
		]);
	});

	it('vazio ou só zeros não desenha nada', () => {
		expect(arcos([])).toEqual([]);
		expect(arcos([{ rotulo: 'a', valor: 0 }])).toEqual([]);
	});

	it('ignora fatias negativas ou zeradas', () => {
		expect(
			arcos([
				{ rotulo: 'a', valor: 2 },
				{ rotulo: 'b', valor: 0 },
				{ rotulo: 'c', valor: -1 }
			]).map((a) => a.rotulo)
		).toEqual(['a']);
	});

	it('os percentuais somam 100', () => {
		const soma = arcos(
			[3.3, 7.1, 1.9, 12.4, 0.6, 5].map((valor, i) => ({ rotulo: String(i), valor }))
		)
			.map((a) => a.pct)
			.reduce((x, y) => x + y, 0);
		expect(soma).toBeCloseTo(100, 9);
	});
});
