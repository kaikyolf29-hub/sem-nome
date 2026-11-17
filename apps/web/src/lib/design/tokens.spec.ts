import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { razaoContraste } from './contraste.ts';
import { gerarCss } from './gerar-css.ts';
import { marca, temas, type NomeTema, type PaletaTema } from './tokens.ts';

const nomes = Object.keys(temas) as NomeTema[];
const fundos: (keyof PaletaTema)[] = ['trilho', 'canais', 'conteudo', 'cartao'];
const textos: (keyof PaletaTema)[] = ['texto', 'textoFraco', 'alta', 'baixa', 'bafafa'];

function rgb(hex: string): [number, number, number] {
	const h = hex.replace('#', '');
	return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

describe('tokens', () => {
	it('tem os cinco temas', () => {
		expect(nomes.sort()).toEqual(['claro', 'escuro', 'matsu-claro', 'matsu-escuro', 'preto']);
	});

	it.each(nomes)(
		'texto, textoFraco, alta, baixa e bafafa têm contraste ≥ 4,5 sobre os fundos (%s)',
		(nome) => {
			const t = temas[nome];
			for (const k of textos)
				for (const f of fundos) {
					const r = razaoContraste(t[k] as string, t[f] as string);
					expect(r, `${nome}: ${k} sobre ${f} = ${r.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
				}
		}
	);

	it.each(nomes)('neutros não são azulados (%s)', (nome) => {
		const t = temas[nome];
		for (const k of ['trilho', 'canais', 'conteudo', 'cartao', 'cartaoHover', 'texto'] as const) {
			const [r, g, b] = rgb(t[k]);
			expect(Math.max(r, g, b) - Math.min(r, g, b), `${nome}.${k} = ${t[k]}`).toBeLessThanOrEqual(
				6
			);
		}
	});

	it('vermelho da marca não aparece na paleta dos temas', () => {
		const vermelhos = [marca.base, marca.degradeDe, marca.degradeAte].map((c) => c.toLowerCase());
		for (const nome of nomes)
			for (const valor of Object.values(temas[nome]).flat())
				expect(vermelhos).not.toContain(String(valor).toLowerCase());
	});

	it('CSS gerado está em dia (rode `bun run tokens`)', () => {
		expect(readFileSync('src/lib/design/tokens.gerado.css', 'utf8')).toBe(gerarCss());
	});
});
