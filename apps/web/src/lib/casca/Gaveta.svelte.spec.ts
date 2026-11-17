import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import GavetaTeste from './GavetaTeste.svelte';

describe('Gaveta', () => {
	it('Esc chama onfechar', async () => {
		const onfechar = vi.fn();
		render(GavetaTeste, { abertaInicial: true, onfechar });
		await expect.element(page.getByRole('dialog', { name: 'Canais' })).toBeInTheDocument();
		await userEvent.keyboard('{Escape}');
		expect(onfechar).toHaveBeenCalled();
	});

	it('Tab no último volta ao primeiro (foco preso)', async () => {
		render(GavetaTeste, { abertaInicial: true });
		const primeiro = page.getByRole('button', { name: 'primeiro' });
		const ultimo = page.getByRole('button', { name: 'último' });
		(ultimo.element() as HTMLElement).focus();
		await userEvent.keyboard('{Tab}');
		await expect.element(primeiro).toHaveFocus();
	});

	it('ao fechar, o foco volta a quem abriu', async () => {
		render(GavetaTeste, { abertaInicial: false });
		const abrir = page.getByRole('button', { name: 'abrir' });
		await abrir.click();
		await expect.element(page.getByRole('dialog', { name: 'Canais' })).toBeInTheDocument();
		await userEvent.keyboard('{Escape}');
		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
		await expect.element(abrir).toHaveFocus();
	});
});
