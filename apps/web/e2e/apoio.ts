// Base de todos os testes de tela: a função feed() do Supabase responde com as notícias de exemplo
// do protótipo, no mesmo formato do banco. Assim os testes usam o caminho real do app, sem rede.
// Um teste pode trocar a resposta chamando page.route de novo (a rota mais nova vale primeiro).
import { test as base, expect, type Page, type Route } from '@playwright/test';
import { noticiasDoCanal } from '../src/lib/prototipo/exemplos.ts';
import type { IdEspaco } from '../src/lib/navegacao/espacos.ts';

/** Notícias de exemplo no formato da função feed(), com os campos da IA que chegam na fase 2. */
export function cartoesDeExemplo(espaco: IdEspaco, canal: string) {
	return noticiasDoCanal(espaco, canal).map((n, i) => ({
		id: i + 1,
		titulo: n.titulo,
		url: n.url,
		trecho: n.trecho,
		publicadoEm: n.publicadoEm,
		idioma: 'pt-BR',
		canais: n.canais,
		fontes: n.fontes.map((f) => ({
			id: f.nome,
			nome: f.nome,
			site: f.url,
			logo: null,
			primaria: f.primaria,
			url: f.url
		})),
		resumoIA: n.resumoIA,
		impacto: n.impacto,
		bafafa: n.bafafa,
		temas: n.temas,
		ativos: n.ativos
	}));
}

export async function responderFeed(
	page: Page,
	montar: (espaco: IdEspaco, canal: string) => unknown
) {
	await page.route('**/rest/v1/rpc/feed**', (rota: Route) => {
		const url = new URL(rota.request().url());
		const espaco = (url.searchParams.get('p_espaco') ?? 'mercado') as IdEspaco;
		const canal = url.searchParams.get('p_canal') ?? '';
		return rota.fulfill({ json: montar(espaco, canal) });
	});
}

export const test = base.extend<{ feedDeExemplo: void }>({
	feedDeExemplo: [
		async ({ page }, usar) => {
			await responderFeed(page, cartoesDeExemplo);
			await usar();
		},
		{ auto: true }
	]
});

export { expect, type Page };
