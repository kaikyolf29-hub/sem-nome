import { describe, expect, it } from 'vitest';
import { SUPABASE_CHAVE_PUBLICAVEL, SUPABASE_URL } from '#lib/supabase/config.ts';
import { responder } from './borda.ts';

function cacheFalso() {
	const guardado = new Map<string, Response>();
	const cache = {
		match: async (pedido: Request | string) =>
			guardado.get(typeof pedido === 'string' ? pedido : pedido.url)?.clone(),
		put: async (pedido: Request | string, resposta: Response) => {
			guardado.set(typeof pedido === 'string' ? pedido : pedido.url, resposta.clone());
		}
	} as unknown as Cache;
	return { cache, guardado };
}

function montar(status = 200, corpo: unknown = [{ id: 1 }]) {
	const { cache, guardado } = cacheFalso();
	const pedidos: { url: string; init?: RequestInit }[] = [];
	const buscar = (async (url: string, init?: RequestInit) => {
		pedidos.push({ url, init });
		return new Response(JSON.stringify(corpo), { status });
	}) as unknown as typeof fetch;
	const esperando: Promise<unknown>[] = [];
	const dep = { buscar, cache, esperar: (p: Promise<unknown>) => void esperando.push(p) };
	const chamar = async (caminho: string) => {
		const r = await responder(new Request(`https://mirante.exemplo${caminho}`), dep);
		await Promise.all(esperando);
		return r;
	};
	return { chamar, pedidos, guardado };
}

describe('responder: /api/feed', () => {
	it('pede ao Supabase uma vez e o segundo pedido sai do cache', async () => {
		const { chamar, pedidos } = montar();
		const a = await chamar('/api/feed?espaco=geral&canal=esportes');
		expect(a.status).toBe(200);
		expect(a.headers.get('Cache-Control')).toBe('public, max-age=60');
		expect(await a.json()).toEqual([{ id: 1 }]);
		expect(pedidos).toHaveLength(1);
		expect(pedidos[0].url).toBe(
			`${SUPABASE_URL}/rest/v1/rpc/feed?p_espaco=geral&p_canal=esportes&p_limite=30`
		);
		expect(new Headers(pedidos[0].init?.headers).get('apikey')).toBe(SUPABASE_CHAVE_PUBLICAVEL);
		const b = await chamar('/api/feed?espaco=geral&canal=esportes');
		expect(await b.json()).toEqual([{ id: 1 }]);
		expect(pedidos).toHaveLength(1);
	});

	it('sem canal não manda p_canal; a ordem dos parâmetros não muda a chave', async () => {
		const { chamar, pedidos, guardado } = montar();
		await chamar('/api/feed?limite=10&espaco=mercado');
		await chamar('/api/feed?espaco=mercado&limite=10&canal=');
		expect(pedidos).toHaveLength(1);
		expect(pedidos[0].url).toBe(`${SUPABASE_URL}/rest/v1/rpc/feed?p_espaco=mercado&p_limite=10`);
		expect([...guardado.keys()]).toHaveLength(1);
	});

	it.each([
		'/api/feed?espaco=x',
		'/api/feed',
		'/api/feed?espaco=geral&canal=Esportes!',
		'/api/feed?espaco=geral&limite=0',
		'/api/feed?espaco=geral&limite=61',
		'/api/feed?espaco=geral&limite=abc',
		'/api/busca?q=a',
		'/api/busca?q=' + 'a'.repeat(41),
		'/api/busca'
	])('parâmetro inválido (%s) devolve 400 em JSON, sem pedir ao Supabase', async (caminho) => {
		const { chamar, pedidos } = montar();
		const r = await chamar(caminho);
		expect(r.status).toBe(400);
		expect(r.headers.get('Content-Type')).toContain('application/json');
		expect(pedidos).toHaveLength(0);
	});

	it('outra rota devolve 404', async () => {
		const { chamar } = montar();
		expect((await chamar('/api/outra')).status).toBe(404);
	});

	it('chama o fetch solto, como a Cloudflare exige (fetch como método de outro objeto quebra lá)', async () => {
		const { cache } = cacheFalso();
		// Igual ao fetch dos Workers: com `this` de outro objeto, lança "Illegal invocation".
		const buscar = async function (this: unknown) {
			if (this !== undefined && this !== globalThis) throw new TypeError('Illegal invocation');
			return new Response('[]');
		} as unknown as typeof fetch;
		const r = await responder(new Request('https://m.exemplo/api/feed?espaco=geral'), {
			buscar,
			cache,
			esperar: () => {}
		});
		expect(r.status).toBe(200);
	});

	it('Supabase com erro devolve 502 e não guarda; falha de rede também', async () => {
		const { chamar, guardado } = montar(500, { message: 'x' });
		const r = await chamar('/api/feed?espaco=geral');
		expect(r.status).toBe(502);
		// O status da origem vai junto (sem o corpo dela), para achar a causa sem expor nada.
		expect(await r.json()).toEqual({ erro: 'origem com erro', status: 500 });
		expect(guardado.size).toBe(0);

		const { cache, guardado: g2 } = cacheFalso();
		const buscar = (async () => {
			throw new TypeError('Failed to fetch');
		}) as unknown as typeof fetch;
		const r2 = await responder(new Request('https://m.exemplo/api/feed?espaco=geral'), {
			buscar,
			cache,
			esperar: () => {}
		});
		expect(r2.status).toBe(502);
		expect(g2.size).toBe(0);
	});
});

describe('responder: /api/busca', () => {
	it('"  Energia SOLAR" e "energia solar" usam a mesma chave', async () => {
		const { chamar, pedidos, guardado } = montar();
		const a = await chamar('/api/busca?q=' + encodeURIComponent('  Energia SOLAR'));
		expect(a.headers.get('Cache-Control')).toBe('public, max-age=120');
		await chamar('/api/busca?q=energia%20solar');
		await chamar('/api/busca?q=Energia+%20solar');
		expect(pedidos).toHaveLength(1);
		expect(guardado.size).toBe(1);
		expect(pedidos[0].url).toBe(
			`${SUPABASE_URL}/rest/v1/rpc/buscar_noticias?p_termo=energia+solar&p_limite=30`
		);
	});

	it('tira acentos do termo', async () => {
		const { chamar, pedidos } = montar();
		await chamar('/api/busca?q=' + encodeURIComponent('Petróleo'));
		expect(pedidos[0].url).toContain('p_termo=petroleo');
	});
});
