import { describe, expect, it } from 'vitest';
import { TEMAS, TEMAS_PADRAO } from './temas.ts';

describe('TEMAS', () => {
	it('tem 15 temas com ids únicos', () => {
		expect(TEMAS).toHaveLength(15);
		expect(new Set(TEMAS.map((t) => t.id)).size).toBe(15);
	});

	it('mundo junta geral e mercado', () => {
		expect(TEMAS.find((t) => t.id === 'mundo')?.origens).toEqual([
			{ espaco: 'geral', canal: 'mundo' },
			{ espaco: 'mercado', canal: 'mundo' }
		]);
	});

	it('origens dos temas fixos e gerais', () => {
		const o = (id: string) => TEMAS.find((t) => t.id === id)?.origens;
		expect(o('mercado')).toEqual([{ espaco: 'mercado', canal: 'manchetes' }]);
		expect(o('cripto')).toEqual([{ espaco: 'cripto', canal: null }]);
		expect(o('meio-ambiente')).toEqual([{ espaco: 'geral', canal: 'meio-ambiente' }]);
	});

	it('o padrão só tem temas que existem', () => {
		for (const id of TEMAS_PADRAO) expect(TEMAS.some((t) => t.id === id)).toBe(true);
	});
});
