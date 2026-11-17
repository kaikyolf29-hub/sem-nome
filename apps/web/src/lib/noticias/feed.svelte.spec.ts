import { describe, expect, it } from 'vitest';
import type { Noticia } from '#lib/feed/tipos.ts';
import type { IdEspaco } from '#lib/navegacao/espacos.ts';
import { ErroFeed } from './dados.ts';
import { criarFeed } from './feed.svelte.ts';

const noticia = (id: string): Noticia => ({
	id,
	titulo: `Notícia ${id}`,
	url: 'https://x.invalid/' + id,
	fontes: [],
	publicadoEm: '2026-11-17T12:00:00Z',
	trecho: '',
	temas: [],
	impacto: 0,
	bafafa: false,
	ativos: [],
	espaco: 'mercado',
	canais: []
});

/** Busca falsa: cada pedido espera a gente mandar a resposta. */
function buscaControlada() {
	const pendentes: {
		canal: string;
		responder: (n: Noticia[]) => void;
		falhar: (e: unknown) => void;
	}[] = [];
	const buscar = (_espaco: IdEspaco, canal: string) =>
		new Promise<Noticia[]>((responder, falhar) => pendentes.push({ canal, responder, falhar }));
	return { buscar, pendentes };
}

describe('criarFeed', () => {
	it('começa carregando e fica pronto com as notícias', async () => {
		const { buscar, pendentes } = buscaControlada();
		const feed = criarFeed(buscar);
		const carregou = feed.carregar('mercado', 'manchetes');
		expect(feed.estado).toBe('carregando');
		pendentes[0].responder([noticia('a')]);
		await carregou;
		expect(feed.estado).toBe('pronto');
		expect(feed.noticias.map((n) => n.id)).toEqual(['a']);
	});

	it('resposta atrasada do canal antigo não substitui o canal novo', async () => {
		const { buscar, pendentes } = buscaControlada();
		const feed = criarFeed(buscar);
		const antigo = feed.carregar('mercado', 'cambio');
		const novo = feed.carregar('mercado', 'macro');
		pendentes[1].responder([noticia('macro')]);
		await novo;
		pendentes[0].responder([noticia('cambio')]);
		await antigo;
		expect(feed.noticias.map((n) => n.id)).toEqual(['macro']);
	});

	it('falha sem notícias na tela: estado de erro com o motivo', async () => {
		const { buscar, pendentes } = buscaControlada();
		const feed = criarFeed(buscar);
		const p = feed.carregar('mercado', 'manchetes');
		pendentes[0].falhar(new ErroFeed('rede'));
		await p;
		expect(feed.estado).toBe('erro');
		expect(feed.erro).toBe('rede');
	});

	it('falha ao atualizar o mesmo canal: as notícias que já estão na tela ficam', async () => {
		const { buscar, pendentes } = buscaControlada();
		const feed = criarFeed(buscar);
		const primeira = feed.carregar('mercado', 'manchetes');
		pendentes[0].responder([noticia('a')]);
		await primeira;
		const segunda = feed.carregar('mercado', 'manchetes');
		expect(feed.estado).toBe('pronto');
		pendentes[1].falhar(new ErroFeed('servidor'));
		await segunda;
		expect(feed.estado).toBe('pronto');
		expect(feed.noticias.map((n) => n.id)).toEqual(['a']);
	});

	it('atualizarSeVelho só busca de novo depois do tempo pedido', async () => {
		const { buscar, pendentes } = buscaControlada();
		let agora = 1_000_000;
		const feed = criarFeed(buscar, () => agora);
		const p = feed.carregar('mercado', 'manchetes');
		pendentes[0].responder([noticia('a')]);
		await p;
		void feed.atualizarSeVelho(5 * 60_000);
		expect(pendentes).toHaveLength(1);
		agora += 5 * 60_000 + 1;
		void feed.atualizarSeVelho(5 * 60_000);
		expect(pendentes).toHaveLength(2);
		expect(pendentes[1].canal).toBe('manchetes');
	});
});
