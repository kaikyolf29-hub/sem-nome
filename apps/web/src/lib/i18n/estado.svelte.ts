import { idiomaInicial, traduzir } from './index.ts';
import type { ChaveMensagem, Idioma } from './tipos.ts';

function criarI18n() {
	let idioma = $state<Idioma>(
		idiomaInicial(typeof navigator === 'undefined' ? [] : (navigator.languages ?? []))
	);
	return {
		get idioma() {
			return idioma;
		},
		definir(i: Idioma) {
			idioma = i;
			if (typeof document !== 'undefined') document.documentElement.lang = i;
		}
	};
}

export const i18n = criarI18n();

/** Texto no idioma atual (reativo dentro de componentes). */
export function t(chave: ChaveMensagem, params?: Record<string, string | number>): string {
	return traduzir(i18n.idioma, chave, params);
}
