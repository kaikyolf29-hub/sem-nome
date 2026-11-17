import { describe, expect, it } from 'vitest';
import { caminhoSparkline } from './sparkline.ts';

describe('caminhoSparkline', () => {
	it('menos de dois valores não desenha', () => {
		expect(caminhoSparkline([], 100, 20)).toBe('');
		expect(caminhoSparkline([3], 100, 20)).toBe('');
	});

	it('valores iguais viram linha horizontal no meio', () => {
		expect(caminhoSparkline([5, 5, 5], 100, 20)).toBe('M0,10 L50,10 L100,10');
	});

	it('o menor fica embaixo e o maior em cima', () => {
		expect(caminhoSparkline([0, 10], 100, 20)).toBe('M0,20 L100,0');
	});
});
