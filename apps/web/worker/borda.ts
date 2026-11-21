// Lógica do Worker de borda: /api/feed e /api/busca repassam ao Supabase e guardam a resposta
// no cache da Cloudflare, para os pedidos repetidos não gastarem a saída grátis do banco.
import { SUPABASE_CHAVE_PUBLICAVEL, SUPABASE_URL } from '../src/lib/supabase/config.ts';

export interface Dependencias {
	buscar: typeof fetch;
	cache: Cache;
	esperar: (p: Promise<unknown>) => void;
}

const ESPACOS = ['mercado', 'cripto', 'tecnologia', 'geral'];
const CANAL = /^[a-z0-9-]{0,40}$/;
const LIMITE_PADRAO = 30;
const SEGUNDOS_FEED = 60;
const SEGUNDOS_BUSCA = 120;

const json = (corpo: unknown, status: number, cabecalhos: Record<string, string> = {}) =>
	new Response(JSON.stringify(corpo), {
		status,
		headers: { 'Content-Type': 'application/json; charset=utf-8', ...cabecalhos }
	});

const invalido = (campo: string) => json({ erro: `parametro invalido: ${campo}` }, 400);

/** Minúsculas, sem acento, espaços únicos (mesma regra do app e do banco). */
function normalizarTermo(texto: string): string {
	return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function lerLimite(bruto: string | null): number | null {
	if (bruto === null) return LIMITE_PADRAO;
	if (!/^\d{1,3}$/.test(bruto)) return null;
	const n = Number(bruto);
	return n >= 1 && n <= 60 ? n : null;
}

interface Consulta {
	/** Caminho e parâmetros canônicos (ordem fixa): a chave do cache. */
	chave: string;
	/** Função do banco e seus parâmetros. */
	rpc: string;
	parametros: URLSearchParams;
	segundos: number;
}

function montarConsulta(url: URL): Consulta | Response {
	const limite = lerLimite(url.searchParams.get('limite'));
	if (limite === null) return invalido('limite');

	if (url.pathname === '/api/feed') {
		const espaco = url.searchParams.get('espaco') ?? '';
		if (!ESPACOS.includes(espaco)) return invalido('espaco');
		const canal = url.searchParams.get('canal') ?? '';
		if (!CANAL.test(canal)) return invalido('canal');
		const chave = new URLSearchParams({ espaco });
		const parametros = new URLSearchParams({ p_espaco: espaco });
		if (canal) {
			chave.set('canal', canal);
			parametros.set('p_canal', canal);
		}
		chave.set('limite', String(limite));
		parametros.set('p_limite', String(limite));
		return { chave: `/api/feed?${chave}`, rpc: 'feed', parametros, segundos: SEGUNDOS_FEED };
	}

	const termo = normalizarTermo(url.searchParams.get('q') ?? '');
	if (termo.length < 2 || termo.length > 40) return invalido('q');
	return {
		chave: `/api/busca?${new URLSearchParams({ q: termo, limite: String(limite) })}`,
		rpc: 'buscar_noticias',
		parametros: new URLSearchParams({ p_termo: termo, p_limite: String(limite) }),
		segundos: SEGUNDOS_BUSCA
	};
}

export async function responder(pedido: Request, dep: Dependencias): Promise<Response> {
	const url = new URL(pedido.url);
	if (url.pathname !== '/api/feed' && url.pathname !== '/api/busca') {
		return json({ erro: 'nao encontrado' }, 404);
	}
	if (pedido.method !== 'GET' && pedido.method !== 'HEAD') {
		return json({ erro: 'metodo nao permitido' }, 405, { Allow: 'GET, HEAD' });
	}
	const consulta = montarConsulta(url);
	if (consulta instanceof Response) return consulta;

	const chaveCache = new Request(`${url.origin}${consulta.chave}`);
	const guardada = await dep.cache.match(chaveCache);
	if (guardada) return guardada;

	// Solto do objeto: nos Workers, fetch chamado como método de outro objeto lança "Illegal invocation".
	const { buscar } = dep;
	let origem: Response;
	try {
		origem = await buscar(`${SUPABASE_URL}/rest/v1/rpc/${consulta.rpc}?${consulta.parametros}`, {
			method: 'GET',
			headers: { apikey: SUPABASE_CHAVE_PUBLICAVEL, Accept: 'application/json' }
		});
	} catch {
		return json({ erro: 'origem indisponivel' }, 502);
	}
	if (origem.status !== 200) return json({ erro: 'origem com erro', status: origem.status }, 502);

	const corpo = await origem.text();
	const resposta = new Response(corpo, {
		status: 200,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': `public, max-age=${consulta.segundos}`
		}
	});
	dep.esperar(dep.cache.put(chaveCache, resposta.clone()));
	return resposta;
}
