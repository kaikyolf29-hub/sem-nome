import type { ClienteAuth } from '#lib/conta/sessao.svelte.ts';
import { SUPABASE_CHAVE_PUBLICAVEL, SUPABASE_URL } from './config.ts';

const CHAVE_SESSAO = 'mirante:sessao';

type Auth = InstanceType<(typeof import('@supabase/auth-js'))['AuthClient']>;

/**
 * Cliente de login do navegador; null no protótipo de arquivo único (sem rede) e fora do navegador.
 * O código do login (Supabase Auth) só é baixado quando precisa: com sessão salva, na volta do Google
 * ou quando a pessoa clica em "Entrar". Assim a primeira tela abre mais rápido.
 */
export function criarClienteAuth(): ClienteAuth | null {
	if (__PROTOTIPO__ || typeof window === 'undefined') return null;

	let instancia: Promise<Auth> | null = null;
	const carregar = () =>
		(instancia ??= import('@supabase/auth-js').then(
			({ AuthClient }) =>
				new AuthClient({
					url: `${SUPABASE_URL}/auth/v1`,
					headers: { apikey: SUPABASE_CHAVE_PUBLICAVEL },
					storageKey: CHAVE_SESSAO,
					flowType: 'pkce',
					persistSession: true,
					autoRefreshToken: true,
					detectSessionInUrl: true
				})
		));

	const precisaAgora = () => {
		try {
			if (localStorage.getItem(CHAVE_SESSAO)) return true;
		} catch {
			// Armazenamento bloqueado: segue sem sessão salva.
		}
		return new URLSearchParams(location.search).has('code');
	};

	return {
		async getSession() {
			if (!precisaAgora()) return { data: { session: null }, error: null };
			return (await carregar()).getSession();
		},
		onAuthStateChange(cb) {
			let assinatura: { unsubscribe(): void } | undefined;
			let cancelado = false;
			const ligar = () =>
				carregar().then((auth) => {
					if (!cancelado) assinatura = auth.onAuthStateChange((e, s) => cb(e, s)).data.subscription;
				});
			if (precisaAgora()) ligar();
			return {
				data: {
					subscription: {
						unsubscribe() {
							cancelado = true;
							assinatura?.unsubscribe();
						}
					}
				}
			};
		},
		async signInWithOAuth(o) {
			return (await carregar()).signInWithOAuth(o);
		},
		async signOut() {
			if (!instancia) return { error: null };
			return (await carregar()).signOut();
		},
		async googleLigado() {
			try {
				const r = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
					headers: { apikey: SUPABASE_CHAVE_PUBLICAVEL }
				});
				if (!r.ok) return false;
				const config = (await r.json()) as { external?: { google?: boolean } };
				return Boolean(config.external?.google);
			} catch {
				return false;
			}
		}
	};
}
