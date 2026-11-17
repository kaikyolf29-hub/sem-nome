import { criarClienteAuth } from '#lib/supabase/cliente.ts';
import { criarSessao } from './sessao.svelte.ts';

const enderecoAtual =
	typeof location === 'undefined'
		? { origin: '', search: '', pathname: '/' }
		: { origin: location.origin, search: location.search, pathname: location.pathname };

/** Sessão única do app (a conta da pessoa). */
export const sessao = criarSessao(criarClienteAuth(), enderecoAtual);
