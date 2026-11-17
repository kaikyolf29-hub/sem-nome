// Uma rodada de coleta: lê as fontes vencidas, grava as notícias novas e reagenda cada fonte.
// Sem dependência do Supabase: o banco entra por uma interface (BancoColeta), o que deixa testar.
import { escolherGrupo, type Recente } from '../_compartilhado/agrupar.ts';
import { lerFeed } from '../_compartilhado/ler.ts';
import { prepararItem } from '../_compartilhado/normalizar.ts';
import type { Espaco, Fonte, ItemPronto } from '../_compartilhado/tipos.ts';

export const IDENTIFICACAO = 'MiranteBot/0.1 (+https://mirante.mirante-mercado.workers.dev)';
const TEMPO_PEDIDO_MS = 10_000;
const MAX_NOVOS_POR_FONTE = 30;
const LOTE_URLS = 25;
const ESPERA_MAXIMA_MIN = 24 * 60;
const JANELA_RECENTES_MS = 72 * 60 * 60 * 1000;
/** O cron roda a cada 5 min e a busca sai segundos depois: sem folga, cada fonte pularia uma rodada. */
const FOLGA_MS = 2 * 60_000;

export interface EstadoFonte {
	etag: string | null;
	modificado: string | null;
	ultima_coleta: string | null;
	proxima_coleta: string;
	erros_seguidos: number;
	ultimo_erro: string | null;
	itens_ultima: number | null;
}

export interface FonteComEstado extends Fonte {
	estado: EstadoFonte;
}

export interface NovaNoticia extends ItemPronto {
	grupo_id: number;
	fonte_id: string;
}

export interface BancoColeta {
	/** Fontes ativas com a próxima coleta até `ate`, da mais atrasada para a menos. */
	fontesVencidas(ate: Date): Promise<FonteComEstado[]>;
	/** Notícias do espaço publicadas desde a data, para agrupar as novas com as parecidas. */
	recentes(desde: Date, espaco: Espaco): Promise<Recente[]>;
	urlsExistentes(urls: string[]): Promise<Set<string>>;
	/** Cria o grupo de um fato novo e devolve o id. */
	criarGrupo(item: ItemPronto): Promise<number>;
	inserir(itens: NovaNoticia[]): Promise<void>;
	salvarEstado(fonte_id: string, estado: Partial<EstadoFonte>): Promise<void>;
}

export interface Resumo {
	fontes: { id: string; status: number | 'erro'; novos: number }[];
	ms: number;
}

class ErroHttp extends Error {
	constructor(readonly status: number) {
		super(`HTTP ${status}`);
	}
}

const minutosDepois = (data: Date, minutos: number) => new Date(data.getTime() + minutos * 60_000).toISOString();

async function coletarFonte(
	db: BancoColeta,
	fonte: FonteComEstado,
	buscar: typeof fetch,
	agora: Date,
	recentesDe: (espaco: Espaco) => Promise<Recente[]>
): Promise<{ status: number; novos: number; estado: Partial<EstadoFonte> }> {
	const cabecalhos: Record<string, string> = {
		'User-Agent': IDENTIFICACAO,
		Accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, application/json;q=0.9, */*;q=0.5'
	};
	if (fonte.estado.etag) cabecalhos['If-None-Match'] = fonte.estado.etag;
	if (fonte.estado.modificado) cabecalhos['If-Modified-Since'] = fonte.estado.modificado;

	const resposta = await buscar(fonte.endereco, {
		headers: cabecalhos,
		redirect: 'follow',
		signal: AbortSignal.timeout(TEMPO_PEDIDO_MS)
	});
	if (resposta.status === 304) return { status: 304, novos: 0, estado: { itens_ultima: 0 } };
	if (!resposta.ok) throw new ErroHttp(resposta.status);

	const prontos = new Map<string, ItemPronto>();
	for (const bruto of lerFeed(await resposta.text(), fonte.tipo)) {
		const item = prepararItem(bruto, fonte, agora);
		if (item && !prontos.has(item.url)) prontos.set(item.url, item);
	}
	// Em lotes: as URLs vão no endereço do pedido ao banco, que tem tamanho máximo.
	const urls = [...prontos.keys()];
	const existentes = new Set<string>();
	for (let i = 0; i < urls.length; i += LOTE_URLS) {
		for (const url of await db.urlsExistentes(urls.slice(i, i + LOTE_URLS))) existentes.add(url);
	}
	const novos = [...prontos.values()].filter((i) => !existentes.has(i.url)).slice(0, MAX_NOVOS_POR_FONTE);

	const gravar: NovaNoticia[] = [];
	for (const item of novos) {
		// Só agrupa com notícias do mesmo espaço: uma de mercado não some dentro de um grupo de tecnologia.
		const recentes = await recentesDe(item.espaco);
		const grupo_id = escolherGrupo(item, recentes) ?? (await db.criarGrupo(item));
		recentes.push({ grupo_id, assinatura: item.assinatura, publicado_em: item.publicadoEm });
		gravar.push({ ...item, grupo_id, fonte_id: fonte.id });
	}
	if (gravar.length > 0) await db.inserir(gravar);

	return {
		status: resposta.status,
		novos: gravar.length,
		estado: {
			etag: resposta.headers.get('etag'),
			modificado: resposta.headers.get('last-modified'),
			itens_ultima: gravar.length
		}
	};
}

/** Coleta as fontes vencidas até acabar ou até passar de `limiteMs`. Erro numa fonte não para as outras. */
export async function rodada(
	db: BancoColeta,
	buscar: typeof fetch = fetch,
	agora: () => Date = () => new Date(),
	limiteMs = 25_000
): Promise<Resumo> {
	const inicio = agora();
	const fontes = await db.fontesVencidas(new Date(inicio.getTime() + FOLGA_MS));
	const resumo: Resumo = { fontes: [], ms: 0 };

	// As notícias recentes só descem do banco quando há notícia nova, uma vez por espaço (economiza a cota).
	const recentesPorEspaco = new Map<Espaco, Recente[]>();
	const recentesDe = async (espaco: Espaco) => {
		let lista = recentesPorEspaco.get(espaco);
		if (!lista) {
			lista = await db.recentes(new Date(inicio.getTime() - JANELA_RECENTES_MS), espaco);
			recentesPorEspaco.set(espaco, lista);
		}
		return lista;
	};

	for (const fonte of fontes) {
		if (agora().getTime() - inicio.getTime() > limiteMs) break;
		const momento = agora();
		try {
			const r = await coletarFonte(db, fonte, buscar, momento, recentesDe);
			await db.salvarEstado(fonte.id, {
				...r.estado,
				ultima_coleta: momento.toISOString(),
				proxima_coleta: minutosDepois(momento, fonte.intervalo_min),
				erros_seguidos: 0,
				ultimo_erro: null
			});
			resumo.fontes.push({ id: fonte.id, status: r.status, novos: r.novos });
		} catch (erro) {
			const erros = fonte.estado.erros_seguidos + 1;
			await db.salvarEstado(fonte.id, {
				ultima_coleta: momento.toISOString(),
				proxima_coleta: minutosDepois(momento, Math.min(fonte.intervalo_min * 2 ** erros, ESPERA_MAXIMA_MIN)),
				erros_seguidos: erros,
				ultimo_erro: String(erro instanceof Error ? erro.message : erro).slice(0, 500)
			});
			resumo.fontes.push({ id: fonte.id, status: erro instanceof ErroHttp ? erro.status : 'erro', novos: 0 });
		}
	}
	resumo.ms = agora().getTime() - inicio.getTime();
	return resumo;
}
