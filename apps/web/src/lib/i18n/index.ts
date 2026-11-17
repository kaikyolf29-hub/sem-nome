import { en } from './en.ts';
import { ptBR } from './pt-BR.ts';
import type { ChaveMensagem, Idioma, Mensagens } from './tipos.ts';

export type { ChaveMensagem, Idioma, Mensagens } from './tipos.ts';

const catalogos: Record<Idioma, Mensagens> = { 'pt-BR': ptBR, en };

/** pt-BR quando o primeiro idioma preferido é português; senão inglês (guia Matsu, seção 7). */
export function idiomaInicial(preferidos: readonly string[]): Idioma {
	const primeiro = preferidos[0];
	return !primeiro || primeiro.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
}

export function existeChave(chave: string): boolean {
	return typeof buscar(catalogos['pt-BR'], chave) === 'string';
}

function buscar(catalogo: Mensagens, chave: string): unknown {
	return chave
		.split('.')
		.reduce<unknown>((no, parte) => (no as Record<string, unknown>)?.[parte], catalogo);
}

/** Texto da chave no idioma, com {parametros} trocados. */
export function traduzir(
	idioma: Idioma,
	chave: ChaveMensagem,
	params?: Record<string, string | number>
): string {
	const texto = buscar(catalogos[idioma], chave);
	if (typeof texto !== 'string') return chave;
	return params
		? texto.replace(/\{(\w+)\}/g, (m, k) => (k in params ? String(params[k]) : m))
		: texto;
}

export { i18n, t } from './estado.svelte.ts';
