import { describe, expect, it, vi } from 'vitest';
import { SUPABASE_URL } from '#lib/supabase/config.ts';
import { carregarDaConta, juntar, salvarNaConta } from './conta.ts';
import { PADRAO, type Preferencias } from './preferencias.ts';

function prefs(extra: Partial<Preferencias> = {}): Preferencias {
	return { ...PADRAO, temas: [], temasProprios: [], ...extra };
}

describe('juntar', () => {
	it('une listas sem repetir e limita os temas digitados a 5, da conta primeiro', () => {
		const local = prefs({
			temas: ['mundo', 'brasil'],
			temasProprios: ['d', 'e', 'f'],
			fontesOcultas: ['g1'],
			palavrasSilenciadas: ['bbb']
		});
		const conta = prefs({
			temas: ['brasil', 'ciencia'],
			temasProprios: ['a', 'b', 'c', 'd'],
			fontesOcultas: ['g1', 'ge'],
			palavrasSilenciadas: ['copa'],
			idioma: 'pt'
		});
		const r = juntar(local, conta);
		expect(r.temas).toEqual(['mundo', 'brasil', 'ciencia']);
		expect(r.temasProprios).toEqual(['a', 'b', 'c', 'd', 'e']);
		expect(r.fontesOcultas).toEqual(['g1', 'ge']);
		expect(r.palavrasSilenciadas).toEqual(['bbb', 'copa']);
		expect(r.idioma).toBe('pt');
	});

	it('sem conta, mantém o aparelho; escolheu vale se qualquer um escolheu', () => {
		const local = prefs({ idioma: 'pt', escolheu: true, temasProprios: ['x'] });
		expect(juntar(local, null)).toEqual(local);
		expect(juntar(prefs(), prefs({ escolheu: true })).escolheu).toBe(true);
		expect(juntar(prefs(), prefs()).escolheu).toBe(false);
	});
});

describe('salvarNaConta', () => {
	it('faz upsert com token, apikey e corpo em snake_case', async () => {
		const buscar = vi.fn(async () => new Response(null, { status: 201 }));
		const p = prefs({
			temas: ['mundo'],
			temasProprios: ['energia solar'],
			fontesOcultas: ['g1'],
			palavrasSilenciadas: ['copa'],
			idioma: 'pt',
			escolheu: true
		});
		await salvarNaConta('tok', 'u1', p, buscar as unknown as typeof fetch);
		const [url, init] = buscar.mock.calls[0] as unknown as [string, RequestInit];
		expect(url).toBe(`${SUPABASE_URL}/rest/v1/preferencias`);
		expect(init.method).toBe('POST');
		const h = init.headers as Record<string, string>;
		expect(h.Authorization).toBe('Bearer tok');
		expect(h.Prefer).toBe('resolution=merge-duplicates');
		expect(h.apikey).toBeTruthy();
		expect(JSON.parse(init.body as string)).toEqual({
			id: 'u1',
			temas: ['mundo'],
			temas_proprios: ['energia solar'],
			fontes_ocultas: ['g1'],
			palavras_silenciadas: ['copa'],
			idioma: 'pt',
			escolheu: true
		});
	});

	it('lança erro em status fora de 2xx e em falha de rede', async () => {
		const ruim = vi.fn(async () => new Response('x', { status: 401 }));
		await expect(
			salvarNaConta('t', 'u', prefs(), ruim as unknown as typeof fetch)
		).rejects.toThrow();
		const rede = vi.fn(async () => {
			throw new TypeError('rede');
		});
		await expect(
			salvarNaConta('t', 'u', prefs(), rede as unknown as typeof fetch)
		).rejects.toThrow();
	});
});

describe('carregarDaConta', () => {
	const resposta = (corpo: unknown, status = 200) =>
		vi.fn(async () => new Response(JSON.stringify(corpo), { status }));

	it('lista vazia vira null e manda os cabeçalhos', async () => {
		const buscar = resposta([]);
		expect(await carregarDaConta('tok', buscar as unknown as typeof fetch)).toBeNull();
		const [url, init] = buscar.mock.calls[0] as unknown as [string, RequestInit];
		expect(url).toBe(`${SUPABASE_URL}/rest/v1/preferencias?select=*`);
		const h = init.headers as Record<string, string>;
		expect(h.Authorization).toBe('Bearer tok');
		expect(h.apikey).toBeTruthy();
	});

	it('uma linha vira Preferencias', async () => {
		const buscar = resposta([
			{
				id: 'u1',
				temas: ['mundo'],
				temas_proprios: ['a'],
				fontes_ocultas: ['g1'],
				palavras_silenciadas: ['copa'],
				idioma: 'pt',
				escolheu: true,
				atualizado_em: '2026-11-17T00:00:00Z'
			}
		]);
		expect(await carregarDaConta('tok', buscar as unknown as typeof fetch)).toEqual({
			temas: ['mundo'],
			temasProprios: ['a'],
			fontesOcultas: ['g1'],
			palavrasSilenciadas: ['copa'],
			idioma: 'pt',
			escolheu: true
		});
	});

	it('status de erro lança', async () => {
		await expect(
			carregarDaConta('t', resposta({ message: 'x' }, 401) as unknown as typeof fetch)
		).rejects.toThrow();
	});
});
