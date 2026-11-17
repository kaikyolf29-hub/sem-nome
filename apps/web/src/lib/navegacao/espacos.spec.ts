import { describe, expect, it } from 'vitest';
import { existeChave } from '#lib/i18n/index.ts';
import { espacosApp, localizar } from './espacos.ts';

describe('espacosApp', () => {
	it('ids únicos de espaço e de canal dentro do espaço', () => {
		const ids = espacosApp.map((e) => e.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const e of espacosApp) {
			const canais = e.canais.map((c) => c.id);
			expect(new Set(canais).size, e.id).toBe(canais.length);
		}
	});

	it('todo rótulo existe no catálogo pt-BR', () => {
		for (const e of espacosApp) {
			expect(existeChave(e.rotulo), e.rotulo).toBe(true);
			for (const c of e.canais) {
				expect(existeChave(c.rotulo), c.rotulo).toBe(true);
				if (c.grupo) expect(existeChave(c.grupo), c.grupo).toBe(true);
			}
		}
	});

	it('tem os sete espaços na ordem do spec', () => {
		expect(espacosApp.map((e) => e.id)).toEqual([
			'mercado',
			'carteira',
			'cripto',
			'daytrade',
			'tecnologia',
			'agenda',
			'salvos'
		]);
	});
});

describe('localizar', () => {
	it('sem canal devolve o primeiro', () => {
		expect(localizar('mercado')?.canal.id).toBe('manchetes');
	});

	it('acha canal existente', () => {
		expect(localizar('cripto', 'nft')?.canal.id).toBe('nft');
	});

	it('espaço ou canal inexistente dá null', () => {
		expect(localizar('xyz')).toBeNull();
		expect(localizar('mercado', 'xyz')).toBeNull();
	});
});
