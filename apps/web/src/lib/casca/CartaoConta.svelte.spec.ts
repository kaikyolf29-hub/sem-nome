import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { criarSessao, type ClienteAuth } from '#lib/conta/sessao.svelte.ts';
import { i18n } from '#lib/i18n/index.ts';
import CartaoConta from './CartaoConta.svelte';

const endereco = { origin: 'https://mirante.exemplo', search: '', pathname: '/' };

function cliente(nome: string, extra: Partial<ClienteAuth> = {}): ClienteAuth {
	return {
		getSession: vi.fn(async () => ({
			data: {
				session: {
					user: {
						id: 'u1',
						email: 'ana@exemplo.com',
						user_metadata: {
							full_name: nome,
							avatar_url: 'data:image/gif;base64,R0lGODlhAQABAAAAACw='
						}
					}
				}
			},
			error: null
		})),
		onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
		signInWithOAuth: vi.fn(async () => ({ error: null })),
		signOut: vi.fn(async () => ({ error: null })),
		googleLigado: vi.fn(async () => true),
		token: vi.fn(async () => 'token-falso'),
		...extra
	};
}

describe('CartaoConta', () => {
	beforeEach(() => i18n.definir('pt-BR'));

	it('logado: mostra nome, e-mail e foto; o perfil tem Sair', async () => {
		const sessao = criarSessao(cliente('Ana Souza'), endereco);
		await sessao.iniciar();
		const { container } = render(CartaoConta, { sessao });
		await expect.element(page.getByText('Ana Souza').first()).toBeInTheDocument();
		await expect.element(page.getByText('ana@exemplo.com').first()).toBeInTheDocument();
		expect(container.querySelector('.conta img')?.getAttribute('alt')).toBe('');
		await expect
			.element(page.getByRole('button', { name: 'Entrar com Google' }))
			.not.toBeInTheDocument();
		await page.getByRole('button', { name: /Ana Souza/ }).click();
		await expect
			.element(
				page.getByRole('dialog', { name: 'Sua conta' }).getByRole('button', { name: 'Sair' })
			)
			.toBeInTheDocument();
	});

	it('nome muito longo corta com reticências, sem vazar do cartão', async () => {
		const sessao = criarSessao(
			cliente('Maria Eduarda Albuquerque de Figueiredo Cavalcanti Monteiro'),
			endereco
		);
		await sessao.iniciar();
		const { container } = render(CartaoConta, { sessao });
		const nome = container.querySelector('.conta .nome') as HTMLElement;
		const cartao = container.querySelector('.conta') as HTMLElement;
		expect(getComputedStyle(nome).textOverflow).toBe('ellipsis');
		expect(nome.getBoundingClientRect().right).toBeLessThanOrEqual(
			cartao.getBoundingClientRect().right
		);
	});

	it('Google desligado no Supabase: explica com texto claro', async () => {
		const sessao = criarSessao(
			{
				...cliente('x'),
				getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
				googleLigado: vi.fn(async () => false)
			},
			endereco
		);
		await sessao.iniciar();
		render(CartaoConta, { sessao });
		await page.getByRole('button', { name: 'Entrar com Google' }).click();
		await expect
			.element(page.getByRole('status'))
			.toHaveTextContent('O login com Google ainda não foi ligado. Tente de novo mais tarde.');
	});
});
