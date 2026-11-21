import { describe, expect, it } from 'vitest';
import { PADRAO, type Preferencias } from './preferencias.ts';
import { exemplosParaVoce, planoDoCanal } from './para-voce.ts';

const com = (p: Partial<Preferencias>): Preferencias => ({ ...PADRAO, ...p });

describe('planoDoCanal', () => {
	it('tudo junta as origens de todos os temas, sem repetir, e as buscas', () => {
		const plano = planoDoCanal('tudo', com({ temasProprios: ['corinthians'] }));
		expect(plano.origens).toEqual([
			{ espaco: 'mercado', canal: 'manchetes' },
			{ espaco: 'tecnologia', canal: null },
			{ espaco: 'geral', canal: 'brasil' },
			{ espaco: 'geral', canal: 'mundo' },
			{ espaco: 'mercado', canal: 'mundo' }
		]);
		expect(plano.termos).toEqual(['corinthians']);
	});

	it('um tema usa só as suas origens', () => {
		expect(planoDoCanal('mundo', PADRAO)).toEqual({
			origens: [
				{ espaco: 'geral', canal: 'mundo' },
				{ espaco: 'mercado', canal: 'mundo' }
			],
			termos: []
		});
	});

	it('um tema digitado usa a busca pelo termo', () => {
		const p = com({ temasProprios: ['energia solar'] });
		expect(planoDoCanal('busca-energia-solar', p)).toEqual({
			origens: [],
			termos: ['energia solar']
		});
	});

	it('canal desconhecido não pede nada', () => {
		expect(planoDoCanal('xyz', PADRAO)).toEqual({ origens: [], termos: [] });
	});
});

describe('exemplosParaVoce (protótipo, sem rede)', () => {
	it('tudo mistura os temas sem repetir cartão', () => {
		const lista = exemplosParaVoce('tudo', PADRAO);
		expect(lista.length).toBeGreaterThan(8);
		expect(new Set(lista.map((n) => n.id)).size).toBe(lista.length);
		expect(lista.some((n) => n.espaco === 'geral')).toBe(true);
	});

	it('tema digitado procura no título e no trecho, sem acento', () => {
		const p = com({ temasProprios: ['petrobras', 'nada parecido'] });
		expect(exemplosParaVoce('busca-petrobras', p).length).toBeGreaterThan(0);
		expect(exemplosParaVoce('busca-nada-parecido', p)).toEqual([]);
	});
});
