// Base de todos os testes de tela: a função feed() do Supabase responde com as notícias de exemplo
// do protótipo, no mesmo formato do banco. Assim os testes usam o caminho real do app, sem rede.
// A borda (/api/...) devolve a página do site, como no vite preview, e o app cai no Supabase.
// A busca dos temas digitados volta vazia e a lista de fontes vem dos exemplos.
// Um teste pode trocar a resposta chamando page.route de novo (a rota mais nova vale primeiro).
import { test as base, expect, type Page, type Route } from '@playwright/test';
import type { Noticia } from '../src/lib/feed/tipos.ts';
import { noticiasDoCanal, noticiasExemplo } from '../src/lib/prototipo/exemplos.ts';

/** Notícias no formato da função feed() (o id da fonte é o nome, como no banco de testes). */
export function noFormatoDoBanco(noticias: readonly Noticia[]) {
	return noticias.map((n) => ({
		id: n.id,
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

/** Notícias de exemplo de um espaço do banco (sem canal: o espaço inteiro). */
export function cartoesDeExemplo(espaco: string, canal: string | null) {
	return noFormatoDoBanco(noticiasDoCanal(espaco, canal));
}

export async function responderFeed(
	page: Page,
	montar: (espaco: string, canal: string | null) => unknown
) {
	await page.route('**/rest/v1/rpc/feed**', (rota: Route) => {
		const url = new URL(rota.request().url());
		const espaco = url.searchParams.get('p_espaco') ?? 'mercado';
		const canal = url.searchParams.get('p_canal');
		return rota.fulfill({ json: montar(espaco, canal) });
	});
}

export async function responderBusca(page: Page, montar: (termo: string) => unknown) {
	await page.route('**/rest/v1/rpc/buscar_noticias**', (rota: Route) => {
		const termo = new URL(rota.request().url()).searchParams.get('p_termo') ?? '';
		return rota.fulfill({ json: montar(termo) });
	});
}

/** Fontes de exemplo no formato de /rest/v1/fontes (id = nome, como nos cartões). */
export function fontesDeExemplo() {
	const porId = new Map<
		string,
		{ id: string; nome: string; logo: null; espaco: string; canais: string[] }
	>();
	for (const n of noticiasExemplo) {
		for (const f of n.fontes) {
			const f0 = porId.get(f.nome) ?? {
				id: f.nome,
				nome: f.nome,
				logo: null,
				espaco: n.espaco,
				canais: []
			};
			f0.canais = [...new Set([...f0.canais, ...n.canais])];
			porId.set(f.nome, f0);
		}
	}
	return [...porId.values()].sort((a, b) => a.nome.localeCompare(b.nome));
}

/** Guarda preferências no aparelho antes de abrir a página. */
export async function comPreferencias(page: Page, p: Record<string, unknown>) {
	await page.addInitScript(
		(v) => {
			localStorage.setItem('mirante:preferencias', v);
		},
		JSON.stringify({ escolheu: true, ...p })
	);
}

export const test = base.extend<{ feedDeExemplo: void }>({
	feedDeExemplo: [
		async ({ page }, usar) => {
			await page.route('**/api/**', (rota: Route) =>
				rota.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Mirante</title>' })
			);
			await responderFeed(page, cartoesDeExemplo);
			await responderBusca(page, () => []);
			await page.route('**/rest/v1/fontes**', (rota: Route) =>
				rota.fulfill({ json: fontesDeExemplo() })
			);
			await usar();
		},
		{ auto: true }
	]
});

export { expect, type Page };
