// Fontes conferidas, para o painel "Notícias e temas": a linha de fontes de cada tema e a lista de
// fontes que dá para esconder. Só é baixado junto com o painel.
import type { FonteNoticia } from '#lib/feed/tipos.ts';
import { noticiasExemplo } from '#lib/prototipo/exemplos.ts';
import { SUPABASE_CHAVE_PUBLICAVEL, SUPABASE_URL } from '#lib/supabase/config.ts';
import type { Tema } from './temas.ts';

export interface FonteLista {
	id: string;
	nome: string;
	logo: string | null;
	espaco: string;
	canais: string[];
	/** Marca desenhada (só nas fontes de exemplo do protótipo). */
	marca?: FonteNoticia['marca'];
	primaria?: boolean;
}

export interface GrupoFonte {
	nome: string;
	/** Todas as fontes com esse nome (a Agência Brasil tem uma por editoria). */
	ids: string[];
	fonte: FonteNoticia;
}

const CANAIS_GERAIS = new Set(['manchetes', 'visao-geral']);

export async function buscarFontes(buscar: typeof fetch = fetch): Promise<FonteLista[]> {
	const resposta = await buscar(
		`${SUPABASE_URL}/rest/v1/fontes?select=id,nome,logo,espaco,canais&ativa=eq.true&order=nome`,
		{ method: 'GET', headers: { apikey: SUPABASE_CHAVE_PUBLICAVEL, Accept: 'application/json' } }
	);
	if (!resposta.ok) throw new Error(`fontes: ${resposta.status}`);
	const linhas: unknown = await resposta.json();
	if (!Array.isArray(linhas)) throw new Error('fontes: resposta inválida');
	return linhas as FonteLista[];
}

/** Protótipo: as fontes das notícias de exemplo, sem rede. */
export function fontesDeExemplo(): FonteLista[] {
	// No banco, cada fonte é de um espaço; no exemplo um veículo aparece em vários: uma por espaço.
	const porId = new Map<string, FonteLista>();
	for (const n of noticiasExemplo) {
		for (const f of n.fontes) {
			const id = f.id ?? f.nome;
			const chave = `${id}|${n.espaco}`;
			const atual = porId.get(chave) ?? {
				id,
				nome: f.nome,
				logo: f.logo ?? null,
				espaco: n.espaco,
				canais: [],
				marca: f.marca,
				primaria: f.primaria
			};
			atual.canais = [...new Set([...atual.canais, ...n.canais])];
			porId.set(chave, atual);
		}
	}
	return [...porId.values()];
}

/** Nomes das fontes de um tema, na ordem das origens e sem repetir. */
export function fontesDoTema(tema: Tema, fontes: readonly FonteLista[]): string[] {
	const nomes: string[] = [];
	for (const o of tema.origens) {
		for (const f of fontes) {
			if (f.espaco !== o.espaco) continue;
			if (o.canal && !CANAIS_GERAIS.has(o.canal) && !f.canais.includes(o.canal)) continue;
			if (!nomes.includes(f.nome)) nomes.push(f.nome);
		}
	}
	return nomes;
}

/** Uma linha por nome de fonte, em ordem alfabética. */
export function agruparPorNome(fontes: readonly FonteLista[]): GrupoFonte[] {
	const grupos = new Map<string, GrupoFonte>();
	for (const f of fontes) {
		const g = grupos.get(f.nome);
		if (g) {
			if (!g.ids.includes(f.id)) g.ids.push(f.id);
		} else {
			grupos.set(f.nome, {
				nome: f.nome,
				ids: [f.id],
				fonte: {
					id: f.id,
					nome: f.nome,
					url: '',
					primaria: f.primaria ?? false,
					logo: f.logo ?? undefined,
					marca: f.marca
				}
			});
		}
	}
	return [...grupos.values()].sort((a, b) =>
		a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
	);
}
