import { TEMAS, TEMAS_PADRAO } from './temas.ts';

export interface Preferencias {
	temas: string[];
	temasProprios: string[];
	fontesOcultas: string[];
	palavrasSilenciadas: string[];
	idioma: 'pt' | 'pt-en';
	escolheu: boolean;
}

export const PADRAO: Preferencias = {
	temas: [...TEMAS_PADRAO],
	temasProprios: [],
	fontesOcultas: [],
	palavrasSilenciadas: [],
	idioma: 'pt-en',
	escolheu: false
};

const CHAVE = 'mirante:preferencias';
const MAX_PROPRIOS = 5;

function padrao(): Preferencias {
	return {
		...PADRAO,
		temas: [...PADRAO.temas],
		temasProprios: [],
		fontesOcultas: [],
		palavrasSilenciadas: []
	};
}

/** Minúsculas, sem acento e com espaços únicos; `null` fora de 2 a 40 caracteres. */
export function normalizarTermo(texto: string): string | null {
	const t = texto
		.normalize('NFD')
		.replace(/\p{M}+/gu, '')
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.trim();
	return t.length >= 2 && t.length <= 40 ? t : null;
}

function lista(v: unknown): string[] | null {
	return Array.isArray(v) && v.every((x) => typeof x === 'string') ? (v as string[]) : null;
}

function armazenamentoPadrao(): Pick<Storage, 'getItem'> | null {
	try {
		return typeof localStorage === 'undefined' ? null : localStorage;
	} catch {
		return null;
	}
}

export function lerLocal(armazenamento?: Pick<Storage, 'getItem'> | null): Preferencias {
	const base = padrao();
	const arm = armazenamento === undefined ? armazenamentoPadrao() : armazenamento;
	if (!arm) return base;
	let bruto: unknown;
	try {
		const texto = arm.getItem(CHAVE);
		if (texto === null) return base;
		bruto = JSON.parse(texto);
	} catch {
		return base;
	}
	if (typeof bruto !== 'object' || bruto === null || Array.isArray(bruto)) return base;
	const o = bruto as Record<string, unknown>;
	const ids = new Set(TEMAS.map((t) => t.id));
	const temas = lista(o.temas);
	if (temas) base.temas = [...new Set(temas.filter((id) => ids.has(id)))];
	const proprios = lista(o.temasProprios);
	if (proprios) {
		const vistos = new Set<string>();
		for (const p of proprios) {
			const n = normalizarTermo(p);
			if (n && !vistos.has(n) && vistos.size < MAX_PROPRIOS) vistos.add(n);
		}
		base.temasProprios = [...vistos];
	}
	const ocultas = lista(o.fontesOcultas);
	if (ocultas) base.fontesOcultas = ocultas;
	const silenciadas = lista(o.palavrasSilenciadas);
	if (silenciadas) {
		base.palavrasSilenciadas = [
			...new Set(silenciadas.map(normalizarTermo).filter((x): x is string => x !== null))
		];
	}
	if (o.idioma === 'pt' || o.idioma === 'pt-en') base.idioma = o.idioma;
	if (typeof o.escolheu === 'boolean') base.escolheu = o.escolheu;
	return base;
}

export function gravarLocal(
	p: Preferencias,
	armazenamento?: Pick<Storage, 'setItem'> | null
): void {
	try {
		const arm =
			armazenamento === undefined
				? typeof localStorage === 'undefined'
					? null
					: localStorage
				: armazenamento;
		arm?.setItem(CHAVE, JSON.stringify(p));
	} catch {
		// armazenamento bloqueado ou cheio: segue só em memória
	}
}

export function adicionarTemaProprio(
	p: Preferencias,
	texto: string
): Preferencias | 'invalido' | 'limite' | 'repetido' {
	const termo = normalizarTermo(texto);
	if (termo === null) return 'invalido';
	if (p.temasProprios.includes(termo)) return 'repetido';
	if (p.temasProprios.length >= MAX_PROPRIOS) return 'limite';
	return { ...p, temasProprios: [...p.temasProprios, termo] };
}
