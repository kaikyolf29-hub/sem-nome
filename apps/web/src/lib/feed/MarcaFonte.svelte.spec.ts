import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MarcaFonte from './MarcaFonte.svelte';

// PNG 1×1 válido, para não depender de rede.
const PIXEL =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

describe('MarcaFonte', () => {
	it('com logo, mostra a imagem da fonte no tamanho pedido, decorativa e sem distorcer', async () => {
		const { container } = render(MarcaFonte, {
			fonte: { nome: 'InfoMoney', url: '#', primaria: false, logo: PIXEL },
			tamanho: 28
		});
		const img = container.querySelector('img')!;
		expect(img).not.toBeNull();
		expect(img.getAttribute('alt')).toBe('');
		const caixa = img.getBoundingClientRect();
		expect([Math.round(caixa.width), Math.round(caixa.height)]).toEqual([28, 28]);
		expect(getComputedStyle(img).objectFit).toBe('cover');
		expect(parseFloat(getComputedStyle(container.querySelector('.marca-fonte')!).borderRadius)).toBeGreaterThan(0);
	});

	it('se a logo não carrega, volta para a inicial da fonte', async () => {
		const { container } = render(MarcaFonte, {
			fonte: { nome: 'Money Times', url: '#', primaria: false, logo: '/nao-existe.png' }
		});
		await expect.poll(() => container.querySelector('img')).toBeNull();
		expect(container.querySelector('.marca-fonte')!.textContent!.trim()).toBe('M');
	});

	it('fonte oficial com logo mostra a logo, não o prédio genérico', async () => {
		const { container } = render(MarcaFonte, {
			fonte: { nome: 'Banco Central do Brasil', url: '#', primaria: true, logo: PIXEL }
		});
		expect(container.querySelector('img')).not.toBeNull();
		expect(container.querySelector('svg')).toBeNull();
	});
});
