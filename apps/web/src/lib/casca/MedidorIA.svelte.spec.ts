import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { i18n } from '#lib/i18n/index.ts';
import MedidorIA from './MedidorIA.svelte';

describe('MedidorIA', () => {
	beforeEach(() => i18n.definir('pt-BR'));

	it('mostra o uso como medidor acessível', async () => {
		render(MedidorIA, { usoPct: 40, renovaEm: new Date('2026-11-17T15:20:00') });
		const medidor = page.getByRole('meter', { name: 'Uso da IA grátis' });
		await expect.element(medidor).toHaveAttribute('aria-valuenow', '40');
		await expect.element(page.getByText(/40%/)).toBeInTheDocument();
		await expect.element(page.getByText(/15:20/)).toBeInTheDocument();
	});
});
