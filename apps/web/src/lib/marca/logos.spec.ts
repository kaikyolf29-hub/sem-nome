import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const permitidas = new Set(['#ff3b30', '#c81d11', '#ffffff']);

describe.each(['a', 'b', 'c'])('logo %s (formato Matsu)', (id) => {
	const svg = readFileSync(`src/lib/marca/logo-${id}.svg`, 'utf8');

	it('quadro de 256 × 256', () => {
		expect(svg).toContain('viewBox="0 0 256 256"');
	});

	it('quadrado de 224 px com cantos de 58 px e degradê vermelho', () => {
		expect(svg).toMatch(
			/<rect x="16" y="16" width="224" height="224" rx="58"[^>]*fill="url\(#degrade\)"/
		);
		expect(svg.toUpperCase()).toContain('#FF3B30');
		expect(svg.toUpperCase()).toContain('#C81D11');
	});

	it('linha clara de 3 px na borda', () => {
		expect(svg).toContain('stroke-width="3"');
	});

	it('fora do degradê, só branco', () => {
		const cores = new Set((svg.match(/#[0-9a-f]{6}/gi) ?? []).map((c) => c.toLowerCase()));
		const sobra = [...cores].filter((c) => !permitidas.has(c));
		expect(sobra).toEqual([]);
	});
});
