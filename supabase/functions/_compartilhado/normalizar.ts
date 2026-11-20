// Limpeza de cada item: texto sem HTML, link canônico, data confiável, canais e assinatura.
import { assinatura } from './agrupar.ts';
import { classificar } from './canais.ts';
import { decodificarEntidades, semAcento } from './texto.ts';
import type { Fonte, ItemBruto, ItemPronto } from './tipos.ts';

const RASTREIO = /^(utm_.*|fbclid|gclid|mc_cid|mc_eid|ref|amp|cmpid|xtor)$/i;

/** https, sem parâmetros de rastreio, sem âncora e sem o /amp do fim. Lança erro se não for http(s). */
export function urlCanonica(url: string): string {
	const u = new URL(url.trim());
	if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error(`endereço não é http: ${url}`);
	u.protocol = 'https:';
	u.hash = '';
	for (const chave of [...u.searchParams.keys()]) if (RASTREIO.test(chave)) u.searchParams.delete(chave);
	u.pathname = u.pathname.replace(/\/amp(\/?)$/, '$1') || '/';
	return u.toString();
}

const RODAPES = [
	/\s*The post .*? appeared first on .*$/i,
	/\s*O post .*? apareceu primeiro em .*$/i,
	/\s*Veja mais not[ií]cias sobre .*$/i,
	/\s*Fonte:\s.*$/,
	/\s*(Continue reading|Leia mais|Read more)\b.*$/i,
	/\s*\[(…|\.\.\.)\]\s*$/
];

/** Sem tags, com entidades decodificadas, sem espaços invisíveis e sem rodapé automático. */
export function limparTexto(html: string): string {
	let t = html
		.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
		.replace(/<br\s*\/?>|<\/(p|div|li|h\d)>/gi, ' ')
		.replace(/<[^>]*>/g, '');
	t = decodificarEntidades(t)
		.replace(/[\u200b-\u200d\u2060\ufeff]/g, '')
		.replace(/[\s\u00a0]+/g, ' ')
		.trim();
	for (const rodape of RODAPES) t = t.replace(rodape, '');
	return t.trim();
}

/** Até `max` caracteres, cortando na última palavra inteira e terminando em "…". */
export function trecho(html: string, max = 280): string {
	const t = limparTexto(html);
	if (t.length <= max) return t;
	const corte = t.slice(0, max);
	const espaco = corte.lastIndexOf(' ');
	return corte.slice(0, espaco > max * 0.6 ? espaco : max).replace(/[\s,.;:–—-]+$/, '') + '…';
}

const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

function dataConfiavel(valor: string | null, agora: Date): Date {
	const quando = valor ? new Date(valor) : null;
	if (!quando || Number.isNaN(quando.getTime())) return agora;
	return quando.getTime() > agora.getTime() + 60 * 60 * 1000 ? agora : quando;
}

const comparavel = (s: string) => semAcento(s).replace(/[^a-z0-9]+/g, ' ').trim();

/** Notícia pronta para gravar, ou null se faltar título ou link, se for velha ou se não couber no espaço. */
export function prepararItem(bruto: ItemBruto, fonte: Fonte, agora: Date): ItemPronto | null {
	const titulo = limparTexto(bruto.titulo);
	if (!titulo) return null;
	let url: string;
	try {
		url = urlCanonica(bruto.url);
	} catch {
		return null;
	}
	const quando = dataConfiavel(bruto.publicadoEm, agora);
	if (agora.getTime() - quando.getTime() > SETE_DIAS_MS) return null;

	let resumo = trecho(bruto.trecho);
	if (comparavel(resumo) === comparavel(titulo)) resumo = '';

	const { espaco, canais } = classificar(fonte, titulo, resumo);
	if (espaco === 'tecnologia' && canais.length === 0) return null;

	return {
		url,
		titulo,
		trecho: resumo,
		publicadoEm: quando.toISOString(),
		idioma: fonte.idioma,
		espaco,
		canais,
		assinatura: assinatura(titulo)
	};
}
