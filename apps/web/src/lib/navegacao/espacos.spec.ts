import { describe, expect, it } from 'vitest';
import { existeChave } from '#lib/i18n/index.ts';
import { PADRAO, type Preferencias } from '#lib/preferencias/preferencias.ts';
import { DESTINO_PADRAO, espacoParaVoce, espacosApp, localizar } from './espacos.ts';

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

	it('tem os oito espaços na ordem do spec, com "Para você" primeiro', () => {
		expect(espacosApp.map((e) => e.id)).toEqual([
			'para-voce',
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

const com = (p: Partial<Preferencias>): Preferencias => ({ ...PADRAO, ...p });

describe('Para você', () => {
	it('é o destino padrão', () => {
		expect(DESTINO_PADRAO).toEqual({ espaco: 'para-voce', canal: 'tudo' });
	});

	it('canais: tudo, um por tema escolhido (na ordem da lista) e um por tema digitado', () => {
		const e = espacoParaVoce(
			com({ temas: ['tecnologia', 'mercado', 'esportes'], temasProprios: ['energia solar'] })
		);
		expect(e.id).toBe('para-voce');
		expect(e.canais.map((c) => c.id)).toEqual([
			'tudo',
			'mercado',
			'tecnologia',
			'esportes',
			'busca-energia-solar'
		]);
		expect(e.canais.at(-1)?.nome).toBe('energia solar');
		for (const c of e.canais) expect(existeChave(c.rotulo), c.rotulo).toBe(true);
	});

	it('termos com sinais viram ids de endereço limpos e sem repetir', () => {
		const e = espacoParaVoce(com({ temas: [], temasProprios: ['s&p 500', 's p 500'] }));
		const ids = e.canais.map((c) => c.id);
		expect(ids).toEqual(['tudo', 'busca-s-p-500', 'busca-s-p-500-2']);
	});

	it('localizar acha os canais da pessoa; um canal tirado dá null (a rota leva para tudo)', () => {
		const p = com({ temas: ['esportes'], temasProprios: ['corinthians'] });
		expect(localizar('para-voce', undefined, p)?.canal.id).toBe('tudo');
		expect(localizar('para-voce', 'esportes', p)?.canal.id).toBe('esportes');
		expect(localizar('para-voce', 'busca-corinthians', p)?.canal.nome).toBe('corinthians');
		expect(localizar('para-voce', 'mercado', p)).toBeNull();
		expect(localizar('para-voce', 'mercado')?.canal.id).toBe('mercado');
	});
});
