// Notícias de verdade: o Worker (/api/feed e /api/busca, com cache na borda) e, se ele não responder,
// as funções feed() e buscar_noticias() do Supabase, lidas por GET com a chave publicável.
// Sem supabase-js, para a primeira tela continuar leve.
import type { AtivoLigado, Noticia } from '#lib/feed/tipos.ts';
import type { IdEspaco } from '#lib/navegacao/espacos.ts';
import { SUPABASE_CHAVE_PUBLICAVEL, SUPABASE_URL } from '#lib/supabase/config.ts';

export class ErroFeed extends Error {
	constructor(readonly tipo: 'rede' | 'servidor') {
		super(`feed: ${tipo}`);
	}
}

/** Um cartão como a função feed() devolve. Os campos da IA chegam na fase 2. */
interface CartaoBanco {
	id: number;
	titulo: string;
	url: string;
	trecho: string;
	idioma?: 'pt-BR' | 'en';
	publicadoEm: string;
	canais: string[];
	fontes: {
		id: string;
		nome: string;
		site: string;
		logo: string | null;
		primaria: boolean;
		url: string;
	}[];
	resumoIA?: string;
	impacto?: number;
	bafafa?: boolean;
	temas?: string[];
	ativos?: AtivoLigado[];
}

const LIMITE = 30;

/** Pede à borda (Worker). `null` se ela não respondeu uma lista JSON (rede, status ou página do site). */
async function pelaBorda(caminho: string, buscar: typeof fetch): Promise<CartaoBanco[] | null> {
	try {
		const resposta = await buscar(caminho, {
			method: 'GET',
			headers: { Accept: 'application/json' }
		});
		if (resposta.status !== 200) return null;
		const linhas: unknown = await resposta.json().catch(() => null);
		return Array.isArray(linhas) ? (linhas as CartaoBanco[]) : null;
	} catch {
		return null;
	}
}

async function peloBanco(funcao: string, parametros: URLSearchParams, buscar: typeof fetch) {
	let resposta: Response;
	try {
		resposta = await buscar(`${SUPABASE_URL}/rest/v1/rpc/${funcao}?${parametros}`, {
			method: 'GET',
			headers: { apikey: SUPABASE_CHAVE_PUBLICAVEL, Accept: 'application/json' }
		});
	} catch {
		throw new ErroFeed('rede');
	}
	if (!resposta.ok) throw new ErroFeed('servidor');
	const linhas: unknown = await resposta.json().catch(() => null);
	if (!Array.isArray(linhas)) throw new ErroFeed('servidor');
	return linhas as CartaoBanco[];
}

function paraNoticias(linhas: CartaoBanco[], espaco: IdEspaco): Noticia[] {
	return linhas.map((l) => ({
		id: String(l.id),
		titulo: l.titulo,
		url: l.url,
		trecho: l.trecho ?? '',
		idioma: l.idioma,
		publicadoEm: l.publicadoEm,
		espaco,
		canais: l.canais ?? [],
		fontes: (l.fontes ?? []).map((f) => ({
			id: f.id,
			nome: f.nome,
			url: f.url,
			primaria: f.primaria,
			logo: f.logo ?? undefined
		})),
		resumoIA: l.resumoIA,
		impacto: l.impacto ?? 0,
		bafafa: l.bafafa ?? false,
		temas: l.temas ?? [],
		ativos: l.ativos ?? []
	}));
}

export async function buscarFeed(
	espaco: IdEspaco,
	canal: string,
	buscar: typeof fetch = fetch
): Promise<Noticia[]> {
	const borda = new URLSearchParams({ espaco, canal, limite: String(LIMITE) });
	const direto = new URLSearchParams({
		p_espaco: espaco,
		p_canal: canal,
		p_limite: String(LIMITE)
	});
	const linhas =
		(await pelaBorda(`/api/feed?${borda}`, buscar)) ?? (await peloBanco('feed', direto, buscar));
	return paraNoticias(linhas, espaco);
}

/** Busca por frase nos últimos 30 dias, em todos os espaços. */
export async function buscarNoticias(
	termo: string,
	buscar: typeof fetch = fetch
): Promise<Noticia[]> {
	const borda = new URLSearchParams({ q: termo, limite: String(LIMITE) });
	const direto = new URLSearchParams({ p_termo: termo, p_limite: String(LIMITE) });
	const linhas =
		(await pelaBorda(`/api/busca?${borda}`, buscar)) ??
		(await peloBanco('buscar_noticias', direto, buscar));
	// A busca atravessa os espaços e o banco não diz de qual veio o cartão: 'mercado' é só o valor
	// exigido pelo tipo (o espaço 'geral' ainda não existe em IdEspaco; a tela de busca não o usa).
	return paraNoticias(linhas, 'mercado');
}
