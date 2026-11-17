import { describe, expect, it } from 'vitest';
import { razaoContraste } from './contraste.ts';

describe('razaoContraste', () => {
	it('preto sobre branco dá 21', () => {
		expect(razaoContraste('#000000', '#ffffff')).toBeCloseTo(21, 2);
	});

	it('cinza #777 sobre branco dá 4,48', () => {
		expect(razaoContraste('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
	});

	it('é simétrica', () => {
		expect(razaoContraste('#ffffff', '#123456')).toBeCloseTo(
			razaoContraste('#123456', '#ffffff'),
			10
		);
	});
});
