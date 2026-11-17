import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { i18n } from '#lib/i18n/index.ts';
import Variacao from './Variacao.svelte';

describe('Variacao', () => {
	beforeEach(() => i18n.definir('pt-BR'));

	it('alta tem seta, sinal, texto para leitor de tela e classe', async () => {
		const { container } = render(Variacao, { pct: 1.8 });
		await expect.element(page.getByText('alta de 1,80%')).toBeInTheDocument();
		const el = container.querySelector('.variacao')!;
		expect(el.textContent).toContain('▲');
		expect(el.textContent).toContain('+1,80%');
		expect(el.classList.contains('alta')).toBe(true);
	});

	it('queda tem seta para baixo e menos tipográfico', async () => {
		const { container } = render(Variacao, { pct: -0.42 });
		await expect.element(page.getByText('queda de 0,42%')).toBeInTheDocument();
		expect(container.querySelector('.variacao')!.textContent).toContain('▼−0,42%');
	});

	it('estável tem ponto', async () => {
		const { container } = render(Variacao, { pct: 0 });
		await expect.element(page.getByText('estável em 0,00%')).toBeInTheDocument();
		expect(container.querySelector('.variacao')!.textContent).toContain('•0,00%');
	});
});
