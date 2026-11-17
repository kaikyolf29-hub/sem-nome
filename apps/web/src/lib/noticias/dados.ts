// Notícias de verdade: a função feed() do Supabase (supabase/migrations/*_noticias.sql), lida por GET
// com a chave publicável. Sem supabase-js, para a primeira tela continuar leve.
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

export async function buscarFeed(
	espaco: IdEspaco,
	canal: string,
	buscar: typeof fetch = fetch
): Promise<Noticia[]> {
	const parametros = new URLSearchParams({
		p_espaco: espaco,
		p_canal: canal,
		p_limite: String(LIMITE)
	});
	let resposta: Response;
	try {
		resposta = await buscar(`${SUPABASE_URL}/rest/v1/rpc/feed?${parametros}`, {
			method: 'GET',
			headers: { apikey: SUPABASE_CHAVE_PUBLICAVEL, Accept: 'application/json' }
		});
	} catch {
		throw new ErroFeed('rede');
	}
	if (!resposta.ok) throw new ErroFeed('servidor');
	const linhas: unknown = await resposta.json().catch(() => null);
	if (!Array.isArray(linhas)) throw new ErroFeed('servidor');

	return (linhas as CartaoBanco[]).map((l) => ({
		id: String(l.id),
		titulo: l.titulo,
		url: l.url,
		trecho: l.trecho ?? '',
		publicadoEm: l.publicadoEm,
		espaco,
		canais: l.canais ?? [],
		fontes: (l.fontes ?? []).map((f) => ({
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
