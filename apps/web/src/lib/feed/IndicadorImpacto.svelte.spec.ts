import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { i18n } from '#lib/i18n/index.ts';
import IndicadorImpacto from './IndicadorImpacto.svelte';

const acesas = (c: HTMLElement) => c.querySelectorAll('.barra.acesa').length;

describe('IndicadorImpacto', () => {
	beforeEach(() => i18n.definir('pt-BR'));

	it('85 dá 5 barras e "Impacto alto"', async () => {
		const { container } = render(IndicadorImpacto, { valor: 85 });
		await expect.element(page.getByRole('img', { name: 'Impacto alto' })).toBeInTheDocument();
		expect(acesas(container)).toBe(5);
	});

	it('10 dá 1 barra e "Impacto baixo"', async () => {
		const { container } = render(IndicadorImpacto, { valor: 10 });
		await expect.element(page.getByRole('img', { name: 'Impacto baixo' })).toBeInTheDocument();
		expect(acesas(container)).toBe(1);
	});

	it('55 dá 3 barras e "Impacto médio"', async () => {
		const { container } = render(IndicadorImpacto, { valor: 55 });
		await expect.element(page.getByRole('img', { name: 'Impacto médio' })).toBeInTheDocument();
		expect(acesas(container)).toBe(3);
	});
});
