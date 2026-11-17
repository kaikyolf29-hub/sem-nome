import { describe, expect, it, vi } from 'vitest';
import { criarSessao, type ClienteAuth, type SessaoAuth } from './sessao.svelte.ts';

const sessaoGoogle: SessaoAuth = {
	user: {
		id: 'u1',
		email: 'ana@exemplo.com',
		user_metadata: { full_name: 'Ana Souza', avatar_url: 'https://foto.exemplo/ana.png' }
	}
};

function clienteFalso(extra: Partial<ClienteAuth> = {}) {
	let ouvinte: ((evento: string, sessao: SessaoAuth | null) => void) | undefined;
	const cliente: ClienteAuth = {
		getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
		onAuthStateChange: vi.fn((cb) => {
			ouvinte = cb;
			return { data: { subscription: { unsubscribe: vi.fn() } } };
		}),
		signInWithOAuth: vi.fn(async () => ({ error: null })),
		signOut: vi.fn(async () => ({ error: null })),
		googleLigado: vi.fn(async () => true),
		...extra
	};
	return { cliente, avisar: (e: string, s: SessaoAuth | null) => ouvinte?.(e, s) };
}

const endereco = (busca = '') => ({
	origin: 'https://mirante.exemplo',
	search: busca,
	pathname: '/mercado/manchetes'
});

describe('sessao', () => {
	it('com sessão salva, preenche o usuário com nome, e-mail e foto do Google', async () => {
		const { cliente } = clienteFalso({
			getSession: vi.fn(async () => ({ data: { session: sessaoGoogle }, error: null }))
		});
		const s = criarSessao(cliente, endereco());
		await s.iniciar();
		expect(s.usuario).toEqual({
			id: 'u1',
			nome: 'Ana Souza',
			email: 'ana@exemplo.com',
			avatarUrl: 'https://foto.exemplo/ana.png'
		});
		expect(s.carregando).toBe(false);
	});

	it('ao sair em outra aba (SIGNED_OUT), volta a visitante', async () => {
		const { cliente, avisar } = clienteFalso({
			getSession: vi.fn(async () => ({ data: { session: sessaoGoogle }, error: null }))
		});
		const s = criarSessao(cliente, endereco());
		await s.iniciar();
		avisar('SIGNED_OUT', null);
		expect(s.usuario).toBeNull();
	});

	it('entrar com Google vai ao Google e volta para o site', async () => {
		const { cliente } = clienteFalso();
		const s = criarSessao(cliente, endereco());
		await s.entrarComGoogle();
		expect(cliente.signInWithOAuth).toHaveBeenCalledWith({
			provider: 'google',
			options: { redirectTo: 'https://mirante.exemplo/' }
		});
	});

	it('com o Google desligado no Supabase, não sai do site e explica', async () => {
		const { cliente } = clienteFalso({ googleLigado: vi.fn(async () => false) });
		const s = criarSessao(cliente, endereco());
		await s.entrarComGoogle();
		expect(cliente.signInWithOAuth).not.toHaveBeenCalled();
		expect(s.erro).toBe('conta.erroProvedor');
	});

	it('voltando do Google com erro na URL, mostra a mensagem certa', async () => {
		const { cliente } = clienteFalso();
		const s = criarSessao(cliente, endereco('?error=access_denied&error_description=cancelado'));
		await s.iniciar();
		expect(s.erro).toBe('conta.erroCancelado');
	});

	it('sem cliente (protótipo), avisa que o login chega na próxima etapa e não quebra', async () => {
		const s = criarSessao(null, endereco());
		await s.iniciar();
		await s.entrarComGoogle();
		expect(s.erro).toBe('conta.emBreve');
		expect(s.usuario).toBeNull();
	});

	it('sair chama o Supabase e volta a visitante', async () => {
		const { cliente } = clienteFalso({
			getSession: vi.fn(async () => ({ data: { session: sessaoGoogle }, error: null }))
		});
		const s = criarSessao(cliente, endereco());
		await s.iniciar();
		await s.sair();
		expect(cliente.signOut).toHaveBeenCalled();
		expect(s.usuario).toBeNull();
	});
});
