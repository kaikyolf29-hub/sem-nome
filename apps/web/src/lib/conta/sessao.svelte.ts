import type { ChaveMensagem } from '#lib/i18n/tipos.ts';
import { mensagemDeErro } from './erros.ts';

export interface SessaoAuth {
	user: {
		id: string;
		email?: string;
		user_metadata?: { full_name?: string; name?: string; avatar_url?: string; picture?: string };
	};
}

type ErroAuth = { message?: string; code?: string } | null;

/** A parte do cliente de login que o Mirante usa (troca fácil por um falso nos testes). */
export interface ClienteAuth {
	getSession(): Promise<{ data: { session: SessaoAuth | null }; error: ErroAuth }>;
	onAuthStateChange(cb: (evento: string, sessao: SessaoAuth | null) => void): {
		data: { subscription: { unsubscribe(): void } };
	};
	signInWithOAuth(o: {
		provider: 'google';
		options: { redirectTo: string };
	}): Promise<{ error: ErroAuth }>;
	signOut(): Promise<{ error: ErroAuth }>;
	/** O access token da sessão atual, ou null sem sessão. */
	token(): Promise<string | null>;
	/** Se o provedor Google está ligado no Supabase (evita mandar a pessoa a uma página de erro). */
	googleLigado(): Promise<boolean>;
}

export interface Usuario {
	id: string;
	nome: string;
	email: string;
	avatarUrl: string | null;
}

interface Endereco {
	origin: string;
	search: string;
	pathname: string;
}

const PARAMS_DE_RETORNO = ['code', 'error', 'error_code', 'error_description', 'state'];

function paraUsuario(s: SessaoAuth | null): Usuario | null {
	if (!s) return null;
	const m = s.user.user_metadata ?? {};
	return {
		id: s.user.id,
		nome: m.full_name ?? m.name ?? s.user.email ?? '',
		email: s.user.email ?? '',
		avatarUrl: m.avatar_url ?? m.picture ?? null
	};
}

export function criarSessao(cliente: ClienteAuth | null, endereco: Endereco) {
	let usuario = $state<Usuario | null>(null);
	let carregando = $state(cliente !== null);
	let erro = $state<ChaveMensagem | null>(null);

	function limparRetornoDaUrl() {
		if (typeof history === 'undefined' || typeof location === 'undefined') return;
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- URL só de leitura e troca, não é estado da tela
		const url = new URL(location.href);
		if (!PARAMS_DE_RETORNO.some((p) => url.searchParams.has(p))) return;
		for (const p of PARAMS_DE_RETORNO) url.searchParams.delete(p);
		history.replaceState(history.state, '', url.pathname + url.search + url.hash);
	}

	return {
		get usuario() {
			return usuario;
		},
		get carregando() {
			return carregando;
		},
		get erro() {
			return erro;
		},
		limparErro() {
			erro = null;
		},
		async iniciar() {
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- leitura única dos parâmetros de volta do Google
			const params = new URLSearchParams(endereco.search);
			if (params.has('error')) erro = mensagemDeErro({ code: params.get('error') ?? undefined });
			if (!cliente) return;
			try {
				const { data, error } = await cliente.getSession();
				if (error) erro = mensagemDeErro(error);
				usuario = paraUsuario(data.session);
				cliente.onAuthStateChange((_evento, s) => (usuario = paraUsuario(s)));
			} catch (e) {
				erro = mensagemDeErro(e as ErroAuth);
			} finally {
				carregando = false;
				limparRetornoDaUrl();
			}
		},
		async entrarComGoogle() {
			erro = null;
			if (!cliente) {
				erro = 'conta.emBreve';
				return;
			}
			try {
				if (!(await cliente.googleLigado())) {
					erro = 'conta.erroProvedor';
					return;
				}
				const { error } = await cliente.signInWithOAuth({
					provider: 'google',
					options: { redirectTo: `${endereco.origin}/` }
				});
				if (error) erro = mensagemDeErro(error);
			} catch (e) {
				erro = mensagemDeErro(e as ErroAuth);
			}
		},
		async token() {
			return cliente ? cliente.token() : null;
		},
		async sair() {
			if (!cliente) return;
			const { error } = await cliente.signOut();
			if (error) erro = mensagemDeErro(error);
			else usuario = null;
		}
	};
}

export type Sessao = ReturnType<typeof criarSessao>;
