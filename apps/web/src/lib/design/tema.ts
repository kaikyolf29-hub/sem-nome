import type { NomeTema } from './tokens.ts';

export type PreferenciaTema = 'sistema' | 'claro' | 'escuro' | 'preto';

export const CHAVE_TEMA = 'mirante:tema';

const VALIDAS: readonly PreferenciaTema[] = ['sistema', 'claro', 'escuro', 'preto'];

/**
 * Tema efetivo. No Matsu OS só existem claro e escuro (o "preto" vira escuro).
 * O script inline de src/app.html repete esta regra (sem o Matsu); o e2e tema.e2e.ts garante que concordam.
 */
export function resolverTema(
	pref: PreferenciaTema,
	sistemaEscuro: boolean,
	matsu: boolean
): NomeTema {
	const escuro = pref === 'sistema' ? sistemaEscuro : pref !== 'claro';
	if (matsu) return escuro ? 'matsu-escuro' : 'matsu-claro';
	if (pref === 'preto') return 'preto';
	return escuro ? 'escuro' : 'claro';
}

export function lerPreferencia(armazenamento: Pick<Storage, 'getItem'> | null): PreferenciaTema {
	try {
		const valor = armazenamento?.getItem(CHAVE_TEMA);
		return VALIDAS.includes(valor as PreferenciaTema) ? (valor as PreferenciaTema) : 'sistema';
	} catch {
		return 'sistema';
	}
}

export function salvarPreferencia(
	armazenamento: Pick<Storage, 'setItem'> | null,
	pref: PreferenciaTema
): void {
	try {
		armazenamento?.setItem(CHAVE_TEMA, pref);
	} catch {
		// Aba anônima ou armazenamento bloqueado: o tema vale só nesta visita.
	}
}

/** localStorage, ou null quando o navegador o bloqueia. */
export function armazenamentoLocal(): Storage | null {
	try {
		return typeof localStorage === 'undefined' ? null : localStorage;
	} catch {
		return null;
	}
}
