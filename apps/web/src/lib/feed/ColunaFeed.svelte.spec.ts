import { page } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { i18n } from '#lib/i18n/index.ts';
import { preferencias } from '#lib/preferencias/estado.svelte.ts';
import { PADRAO } from '#lib/preferencias/preferencias.ts';
import ColunaFeed from './ColunaFeed.svelte';
import type { Noticia } from './tipos.ts';

const noticia: Noticia = {
	id: 'c1',
	titulo: 'Final da Copa tem ingressos esgotados',
	url: '#',
	fontes: [{ id: 'ge', nome: 'ge', url: '#', primaria: false }],
	publicadoEm: new Date().toISOString(),
	trecho: 'Trecho.',
	temas: [],
	impacto: 0,
	bafafa: false,
	ativos: [],
	espaco: 'mercado',
	canais: []
};

describe('ColunaFeed', () => {
	beforeEach(() => i18n.definir('pt-BR'));
	afterEach(() => preferencias.substituir({ ...PADRAO }));

	it('notícias que existem, mas os filtros esconderam: diz isso (não "ainda não há")', async () => {
		preferencias.substituir({ ...PADRAO, palavrasSilenciadas: ['copa'] });
		render(ColunaFeed, {
			estado: 'pronto',
			noticias: [noticia],
			capa: false,
			ontentar: async () => {}
		});
		await expect
			.element(page.getByText('Há notícias aqui, mas os seus filtros esconderam todas.'))
			.toBeInTheDocument();
		await expect.element(page.getByText(/Nada por aqui ainda/)).not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Mudar filtros' })).toBeInTheDocument();
	});

	it('sem notícia nenhuma, continua o aviso de vazio', async () => {
		render(ColunaFeed, { estado: 'pronto', noticias: [], capa: false, ontentar: async () => {} });
		await expect.element(page.getByText(/Nada por aqui ainda/)).toBeInTheDocument();
	});
});
