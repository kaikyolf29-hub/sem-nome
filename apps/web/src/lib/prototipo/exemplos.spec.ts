import { describe, expect, it } from 'vitest';
import { noticiasDoCanal, noticiasExemplo } from './exemplos.ts';

describe('exemplos', () => {
	it('cobre o que o protótipo precisa mostrar', () => {
		expect(noticiasExemplo.length).toBeGreaterThanOrEqual(18);
		expect(noticiasExemplo.filter((n) => n.bafafa).length).toBeGreaterThanOrEqual(2);
		expect(noticiasExemplo.filter((n) => n.ativos.length > 0).length).toBeGreaterThanOrEqual(4);
		expect(noticiasExemplo.some((n) => n.fontes.length >= 4)).toBe(true);
		for (const e of ['mercado', 'cripto', 'tecnologia'])
			expect(
				noticiasExemplo.some((n) => n.espaco === e),
				e
			).toBe(true);
		expect(noticiasExemplo.every((n) => n.url === '#')).toBe(true);
	});

	it('o canal geral ordena por impacto; os outros filtram pelo canal', () => {
		const geral = noticiasDoCanal('mercado', 'manchetes');
		expect(geral[0].impacto).toBeGreaterThanOrEqual(geral[1].impacto);
		expect(noticiasDoCanal('cripto', 'nft').every((n) => n.canais.includes('nft'))).toBe(true);
		expect(noticiasDoCanal('mercado', 'xyz')).toEqual([]);
	});
});
