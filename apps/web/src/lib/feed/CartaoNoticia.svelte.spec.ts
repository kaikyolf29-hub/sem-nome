import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { i18n } from '#lib/i18n/index.ts';
import CartaoNoticia from './CartaoNoticia.svelte';
import type { Noticia } from './tipos.ts';

const base: Noticia = {
	id: 't1',
	titulo: 'Título de teste',
	url: '#',
	fontes: [
		{ nome: 'Gazeta do Pregão', url: '#', primaria: false },
		{ nome: 'Mercado Hoje', url: '#', primaria: false },
		{ nome: 'Radar Tech', url: '#', primaria: false },
		{ nome: 'Fonte oficial (exemplo)', url: '#', primaria: true }
	],
	publicadoEm: new Date().toISOString(),
	trecho: 'Trecho curto da notícia.',
	resumoIA: 'Resumo de duas linhas feito pela IA.',
	temas: ['juros'],
	impacto: 70,
	bafafa: false,
	ativos: [{ ticker: 'PETR4', motivo: 'Você tem na carteira' }],
	espaco: 'mercado',
	canais: ['manchetes']
};

describe('CartaoNoticia', () => {
	beforeEach(() => i18n.definir('pt-BR'));

	it('com resumo mostra o selo "Gerado por IA"', async () => {
		render(CartaoNoticia, { noticia: base });
		await expect.element(page.getByText('Resumo por IA')).toBeInTheDocument();
	});

	it('mostra a primeira fonte da lista (a do título), mesmo que outra seja oficial', async () => {
		render(CartaoNoticia, {
			noticia: {
				...base,
				fontes: [
					{ nome: 'Agência Brasil', url: '#', primaria: false },
					{ nome: 'Federal Reserve', url: '#', primaria: true }
				]
			}
		});
		await expect.element(page.getByText('Agência Brasil', { exact: true })).toBeInTheDocument();
		await expect
			.element(page.getByText('Federal Reserve', { exact: true }))
			.not.toBeInTheDocument();
	});

	it('com 4 fontes mostra "+3"', async () => {
		render(CartaoNoticia, { noticia: base });
		await expect.element(page.getByText('+3')).toBeInTheDocument();
	});

	it('Salvar alterna aria-pressed', async () => {
		render(CartaoNoticia, { noticia: base });
		const salvar = page.getByRole('button', { name: 'Salvar' });
		await expect.element(salvar).toHaveAttribute('aria-pressed', 'false');
		await salvar.click();
		await expect.element(salvar).toHaveAttribute('aria-pressed', 'true');
	});

	it('sem resumo não há selo de IA', async () => {
		render(CartaoNoticia, { noticia: { ...base, resumoIA: undefined } });
		await expect.element(page.getByText('Título de teste')).toBeInTheDocument();
		await expect.element(page.getByText('Resumo por IA')).not.toBeInTheDocument();
	});

	it('mostra o chip "Afeta sua carteira" com o ticker', async () => {
		render(CartaoNoticia, { noticia: base });
		await expect.element(page.getByText('PETR4')).toBeInTheDocument();
	});
});
