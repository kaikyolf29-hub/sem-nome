import type { ChaveMensagem } from '#lib/i18n/tipos.ts';
import logoA from './logo-a.svg?raw';
import logoB from './logo-b.svg?raw';
import logoC from './logo-c.svg?raw';

export const logos: readonly {
	id: 'a' | 'b' | 'c';
	nome: ChaveMensagem;
	descricao: ChaveMensagem;
	svg: string;
}[] = [
	{ id: 'a', nome: 'marca.a.nome', descricao: 'marca.a.descricao', svg: logoA },
	{ id: 'b', nome: 'marca.b.nome', descricao: 'marca.b.descricao', svg: logoB },
	{ id: 'c', nome: 'marca.c.nome', descricao: 'marca.c.descricao', svg: logoC }
];
