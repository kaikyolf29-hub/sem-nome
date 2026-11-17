import { page, userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { i18n } from '#lib/i18n/index.ts';
import Trilho from './Trilho.svelte';

describe('Trilho', () => {
	beforeEach(() => i18n.definir('pt-BR'));

	it('mostra os 7 espaços', async () => {
		render(Trilho, { ativo: 'mercado' });
		const nav = page.getByRole('navigation', { name: 'Espaços' });
		await expect.element(nav).toBeInTheDocument();
		for (const nome of [
			'Mercado',
			'Carteira',
			'Cripto',
			'Day trade',
			'Tecnologia & IA',
			'Agenda',
			'Salvos'
		])
			await expect.element(page.getByRole('link', { name: nome })).toBeInTheDocument();
		expect(nav.element().querySelectorAll('a.botao')).toHaveLength(7);
	});

	it('o espaço ativo tem aria-current="page"', async () => {
		render(Trilho, { ativo: 'cripto' });
		await expect
			.element(page.getByRole('link', { name: 'Cripto' }))
			.toHaveAttribute('aria-current', 'page');
		await expect
			.element(page.getByRole('link', { name: 'Mercado' }))
			.not.toHaveAttribute('aria-current');
	});

	it('setas movem o foco entre os itens (tabindex rotativo)', async () => {
		render(Trilho, { ativo: 'mercado' });
		const mercado = page.getByRole('link', { name: 'Mercado' });
		const carteira = page.getByRole('link', { name: 'Carteira' });
		(mercado.element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(carteira).toHaveFocus();
		await userEvent.keyboard('{ArrowUp}');
		await expect.element(mercado).toHaveFocus();
		await expect.element(carteira).toHaveAttribute('tabindex', '-1');
	});
});
