import { page, userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { i18n } from '#lib/i18n/index.ts';
import BotoesMatsu from './BotoesMatsu.svelte';

const props = (extra = {}) => ({
	focada: true,
	maximizada: false,
	lado: 'esquerda' as const,
	tema: 'escuro' as const,
	onfechar: vi.fn(),
	onminimizar: vi.fn(),
	ontelacheia: vi.fn(),
	...extra
});

const caixa = (el: Element) => el.getBoundingClientRect();

describe('BotoesMatsu (guia Matsu, 14/11/2026)', () => {
	beforeEach(() => i18n.definir('pt-BR'));

	it('botões de 18×18 com bolinhas de 14×14 e 4 px entre os botões', async () => {
		const { container } = render(BotoesMatsu, props());
		const botoes = [...container.querySelectorAll('button')];
		expect(botoes).toHaveLength(3);
		for (const b of botoes) {
			expect(caixa(b).width).toBe(18);
			expect(caixa(b).height).toBe(18);
			const bolinha = b.querySelector('.bolinha')!;
			expect(caixa(bolinha).width).toBe(14);
			expect(caixa(bolinha).height).toBe(14);
		}
		expect(caixa(botoes[1]).left - caixa(botoes[0]).right).toBe(4);
	});

	it('símbolos só aparecem com o mouse em cima (nas três juntas)', async () => {
		const { container } = render(BotoesMatsu, props());
		const simbolos = [...container.querySelectorAll('.simbolo')];
		for (const s of simbolos) expect(getComputedStyle(s).opacity).toBe('0');
		await userEvent.hover(page.getByRole('button', { name: 'Minimizar' }));
		await new Promise((r) => setTimeout(r, 260));
		for (const s of simbolos) expect(getComputedStyle(s).opacity).toBe('1');
	});

	it('sem foco ficam cinza e voltam a ter cor com o mouse', async () => {
		const { container } = render(BotoesMatsu, props({ focada: false }));
		const fechar = container.querySelector('.fechar .bolinha')!;
		expect(getComputedStyle(fechar).backgroundColor).not.toBe('rgb(255, 95, 87)');
		await userEvent.hover(page.getByRole('button', { name: 'Fechar' }));
		await new Promise((r) => setTimeout(r, 200));
		expect(getComputedStyle(fechar).backgroundColor).toBe('rgb(255, 95, 87)');
	});

	it('rótulos e o de tela cheia muda quando maximizada', async () => {
		render(BotoesMatsu, props({ maximizada: true }));
		await expect.element(page.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Minimizar' })).toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: 'Sair da tela cheia' }))
			.toBeInTheDocument();
	});

	it('clicar no primeiro chama onfechar', async () => {
		const p = props();
		render(BotoesMatsu, p);
		await page.getByRole('button', { name: 'Fechar' }).click();
		expect(p.onfechar).toHaveBeenCalled();
	});
});
