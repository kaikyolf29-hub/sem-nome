import { AuthClient } from '@supabase/auth-js';
import type { ClienteAuth } from '#lib/conta/sessao.svelte.ts';
import { SUPABASE_CHAVE_PUBLICAVEL, SUPABASE_URL } from './config.ts';

/** Cliente de login do navegador; null no protótipo de arquivo único (sem rede) e fora do navegador. */
export function criarClienteAuth(): ClienteAuth | null {
	if (__PROTOTIPO__ || typeof window === 'undefined') return null;
	const auth = new AuthClient({
		url: `${SUPABASE_URL}/auth/v1`,
		headers: { apikey: SUPABASE_CHAVE_PUBLICAVEL },
		storageKey: 'mirante:sessao',
		flowType: 'pkce',
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true
	});
	return {
		getSession: () => auth.getSession(),
		onAuthStateChange: (cb) => auth.onAuthStateChange((evento, sessao) => cb(evento, sessao)),
		signInWithOAuth: (o) => auth.signInWithOAuth(o),
		signOut: () => auth.signOut(),
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
