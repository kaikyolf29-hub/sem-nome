import { describe, expect, it } from 'vitest';
import { agruparPorNome, buscarFontes, fontesDoTema, type FonteLista } from './fontes.ts';
import { TEMAS } from './temas.ts';
import { SUPABASE_URL } from '#lib/supabase/config.ts';

const f = (id: string, nome: string, espaco: string, canais: string[]): FonteLista => ({
	id,
	nome,
	logo: null,
	espaco,
	canais
});
const lista = [
	f('infomoney', 'InfoMoney', 'mercado', ['brasil', 'acoes']),
	f('ab-int', 'Agência Brasil', 'mercado', ['mundo']),
	f('g1-mundo', 'g1 Mundo', 'geral', ['mundo']),
	f('bbc', 'BBC News Brasil', 'geral', ['mundo']),
	f('ab-esp', 'Agência Brasil', 'geral', ['esportes']),
	f('ge', 'ge', 'geral', ['esportes']),
	f('tecnoblog', 'Tecnoblog', 'tecnologia', ['ia'])
];
const tema = (id: string) => TEMAS.find((t) => t.id === id)!;

describe('fontes do painel', () => {
	it('cada tema mostra as fontes das suas origens, sem repetir nomes', () => {
		expect(fontesDoTema(tema('mundo'), lista)).toEqual([
			'g1 Mundo',
			'BBC News Brasil',
			'Agência Brasil'
		]);
		expect(fontesDoTema(tema('mercado'), lista)).toEqual(['InfoMoney', 'Agência Brasil']);
		expect(fontesDoTema(tema('tecnologia'), lista)).toEqual(['Tecnoblog']);
		expect(fontesDoTema(tema('carros'), lista)).toEqual([]);
	});

	it('a lista de fontes junta as do mesmo nome, em ordem alfabética', () => {
		const grupos = agruparPorNome(lista);
		expect(grupos.map((g) => g.nome)).toEqual([
			'Agência Brasil',
			'BBC News Brasil',
			'g1 Mundo',
			'ge',
			'InfoMoney',
			'Tecnoblog'
		]);
		expect(grupos[0].ids).toEqual(['ab-int', 'ab-esp']);
	});

	it('pede só as fontes ativas, com a chave publicável; erro vira exceção', async () => {
		let url = '';
		const ok = (async (u: string) => {
			url = u;
			return new Response(JSON.stringify(lista));
		}) as unknown as typeof fetch;
		expect(await buscarFontes(ok)).toHaveLength(7);
		expect(url).toBe(
			`${SUPABASE_URL}/rest/v1/fontes?select=id,nome,logo,espaco,canais&ativa=eq.true&order=nome`
		);
		const falha = (async () => new Response('x', { status: 500 })) as unknown as typeof fetch;
		await expect(buscarFontes(falha)).rejects.toThrow();
	});
});
