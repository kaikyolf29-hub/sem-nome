import { SUPABASE_CHAVE_PUBLICAVEL, SUPABASE_URL } from '#lib/supabase/config.ts';
import type { Preferencias } from './preferencias.ts';

const ENDERECO = `${SUPABASE_URL}/rest/v1/preferencias`;
const MAX_PROPRIOS = 5;

interface Linha {
	temas?: string[];
	temas_proprios?: string[];
	fontes_ocultas?: string[];
	palavras_silenciadas?: string[];
	idioma?: string;
	escolheu?: boolean;
}

const unir = (...listas: string[][]) => [...new Set(listas.flat())];

export async function carregarDaConta(
	token: string,
	buscar: typeof fetch = fetch
): Promise<Preferencias | null> {
	const r = await buscar(`${ENDERECO}?select=*`, {
		headers: { apikey: SUPABASE_CHAVE_PUBLICAVEL, Authorization: `Bearer ${token}` }
	});
	if (!r.ok) throw new Error(`preferencias: carregar falhou (${r.status})`);
	const linhas = (await r.json()) as Linha[];
	const l = linhas[0];
	if (!l) return null;
	return {
		temas: l.temas ?? [],
		temasProprios: l.temas_proprios ?? [],
		fontesOcultas: l.fontes_ocultas ?? [],
		palavrasSilenciadas: l.palavras_silenciadas ?? [],
		idioma: l.idioma === 'pt' ? 'pt' : 'pt-en',
		escolheu: l.escolheu === true
	};
}

export async function salvarNaConta(
	token: string,
	id: string,
	p: Preferencias,
	buscar: typeof fetch = fetch
): Promise<void> {
	const r = await buscar(ENDERECO, {
		method: 'POST',
		headers: {
			apikey: SUPABASE_CHAVE_PUBLICAVEL,
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			Prefer: 'resolution=merge-duplicates'
		},
		body: JSON.stringify({
			id,
			temas: p.temas,
			temas_proprios: p.temasProprios,
			fontes_ocultas: p.fontesOcultas,
			palavras_silenciadas: p.palavrasSilenciadas,
			idioma: p.idioma,
			escolheu: p.escolheu,
			// O banco só preenche sozinho na primeira gravação; nas seguintes, quem salva diz quando foi.
			atualizado_em: new Date().toISOString()
		})
	});
	if (!r.ok) throw new Error(`preferencias: salvar falhou (${r.status})`);
}

/** Une o que está no aparelho com o que está na conta (conta primeiro nos temas digitados). */
export function juntar(local: Preferencias, conta: Preferencias | null): Preferencias {
	if (!conta) return { ...local };
	return {
		temas: unir(local.temas, conta.temas),
		temasProprios: unir(conta.temasProprios, local.temasProprios).slice(0, MAX_PROPRIOS),
		fontesOcultas: unir(local.fontesOcultas, conta.fontesOcultas),
		palavrasSilenciadas: unir(local.palavrasSilenciadas, conta.palavrasSilenciadas),
		idioma: conta.idioma,
		escolheu: local.escolheu || conta.escolheu
	};
}
