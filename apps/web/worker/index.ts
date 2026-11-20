// Entrada do Worker "mirante": /api/* passa pela borda (com cache); o resto é o site estático.
import { responder } from './borda.ts';

interface Ambiente {
	ASSETS: { fetch: (pedido: Request) => Promise<Response> };
}

interface Contexto {
	waitUntil: (p: Promise<unknown>) => void;
}

export default {
	async fetch(pedido: Request, env: Ambiente, ctx: Contexto): Promise<Response> {
		if (new URL(pedido.url).pathname.startsWith('/api/')) {
			const cache = (caches as unknown as { default: Cache }).default;
			return responder(pedido, {
				buscar: fetch,
				cache,
				esperar: (p) => ctx.waitUntil(p)
			});
		}
		return env.ASSETS.fetch(pedido);
	}
};
