import type { ptBR } from './pt-BR.ts';

export type Idioma = 'pt-BR' | 'en';

type Forma<T> = { readonly [K in keyof T]: T[K] extends string ? string : Forma<T[K]> };

/** Mesma forma do catálogo pt-BR, com valores string: en.ts precisa ter todas as chaves. */
export type Mensagens = Forma<typeof ptBR>;

type Caminhos<T, P extends string = ''> = {
	[K in keyof T & string]: T[K] extends string ? `${P}${K}` : Caminhos<T[K], `${P}${K}.`>;
}[keyof T & string];

export type ChaveMensagem = Caminhos<typeof ptBR>;
