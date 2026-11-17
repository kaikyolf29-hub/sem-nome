import { page, userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { i18n } from '#lib/i18n/index.ts';
import BotoesWindows from './BotoesWindows.svelte';

const props = (extra = {}) => ({
	focada: true,
	maximizada: false,
	onfechar: vi.fn(),
	onminimizar: vi.fn(),
	onmaximizar: vi.fn(),
	...extra
});

describe('BotoesWindows (Windows 11)', () => {
	beforeEach(() => i18n.definir('pt-BR'));

	it('cada botão tem 46 px de largura', async () => {
		const { container } = render(BotoesWindows, props());
		for (const b of container.querySelectorAll('button'))
			expect(b.getBoundingClientRect().width).toBe(46);
	});

	it('o fechar fica vermelho #C42B1C com o mouse em cima', async () => {
		const { container } = render(BotoesWindows, props());
		await userEvent.hover(page.getByRole('button', { name: 'Fechar' }));
		await new Promise((r) => setTimeout(r, 150));
		expect(getComputedStyle(container.querySelector('.fechar')!).backgroundColor).toBe(
			'rgb(196, 43, 28)'
		);
	});

	it('maximizada, o botão do meio vira Restaurar', async () => {
		render(BotoesWindows, props({ maximizada: true }));
		await expect.element(page.getByRole('button', { name: 'Restaurar' })).toBeInTheDocument();
	});
});
