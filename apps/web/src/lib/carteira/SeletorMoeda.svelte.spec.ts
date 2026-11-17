import { page, userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { i18n } from '#lib/i18n/index.ts';
import SeletorMoeda from './SeletorMoeda.svelte';

describe('SeletorMoeda', () => {
	beforeEach(() => i18n.definir('pt-BR'));

	it('mostra a moeda atual e abre a lista com as 10 moedas', async () => {
		render(SeletorMoeda, { valor: 'BRL', onescolher: vi.fn() });
		const botao = page.getByRole('button', { name: /Ver em/ });
		await expect.element(botao).toHaveTextContent('BRL');
		await expect.element(botao).toHaveAttribute('aria-expanded', 'false');
		await botao.click();
		await expect.element(botao).toHaveAttribute('aria-expanded', 'true');
		const lista = page.getByRole('listbox');
		await expect.element(lista).toBeInTheDocument();
		expect(lista.element().querySelectorAll('[role="option"]')).toHaveLength(10);
		await expect
			.element(page.getByRole('option', { name: /Real brasileiro/ }))
			.toHaveAttribute('aria-selected', 'true');
	});

	it('setas e Enter escolhem; a lista fecha e o foco volta ao botão', async () => {
		const onescolher = vi.fn();
		render(SeletorMoeda, { valor: 'BRL', onescolher });
		const botao = page.getByRole('button', { name: /Ver em/ });
		await botao.click();
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{Enter}');
		expect(onescolher).toHaveBeenCalledWith('USD');
		await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
		await expect.element(botao).toHaveFocus();
	});

	it('Esc fecha sem escolher', async () => {
		const onescolher = vi.fn();
		render(SeletorMoeda, { valor: 'EUR', onescolher });
		await page.getByRole('button', { name: /Ver em/ }).click();
		await userEvent.keyboard('{Escape}');
		await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
		expect(onescolher).not.toHaveBeenCalled();
	});

	it('clicar numa opção escolhe', async () => {
		const onescolher = vi.fn();
		render(SeletorMoeda, { valor: 'BRL', onescolher });
		await page.getByRole('button', { name: /Ver em/ }).click();
		await page.getByRole('option', { name: /Iene japonês/ }).click();
		expect(onescolher).toHaveBeenCalledWith('JPY');
	});
});
