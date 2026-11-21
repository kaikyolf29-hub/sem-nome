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

// g1 e ge: depois da foto vêm a legenda e, às vezes, o crédito ("John Minchillo/AP", "g1");
// o texto começa depois. No meio, avisos da casa ("Tem alguma sugestão de reportagem?").
const GLOBO = /^(g1|ge)(-|$)/;
const FOTO_NO_COMECO = /^\s*<img\b[^>]*>\s*(?:<br\s*\/?>)?/i;
const AVISO_GLOBO = /^\+\s|Adicione o (g1|ge)\b|Tem alguma sugest/i;
const pareceCredito = (linha: string) => linha.length <= 60 && !/[.!?:;\u2026]$/.test(linha);

export function semLegendaGlobo(html: string): string {
	const foto = FOTO_NO_COMECO.exec(html);
	if (!foto) return html;
	const linhas = html
		.slice(foto[0].length)
		.split('\n')
		.map((l) => l.trim())
		.filter((l) => l && !AVISO_GLOBO.test(l));
	if (linhas.length > 1) linhas.shift();
	if (linhas.length > 1 && pareceCredito(linhas[0])) linhas.shift();
	return linhas.join('\n');
}

// Conteúdo automático ou de propaganda: previsão do tempo por cidade, palpites de aposta e ofertas de loja.
const RUIDO = [
	/^previsao do tempo (hoje|para amanha)\b/,
	/^palpites? e dicas\b/,
	/\bem promocao (na|no) (amazon|mercado livre|shopee|aliexpress|magalu|kabum)\b/
];
const ehRuido = (titulo: string) => RUIDO.some((r) => r.test(semAcento(titulo)));

const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

function dataConfiavel(valor: string | null, agora: Date): Date {
	const quando = valor ? new Date(valor) : null;
	if (!quando || Number.isNaN(quando.getTime())) return agora;
	return quando.getTime() > agora.getTime() + 60 * 60 * 1000 ? agora : quando;
}

const comparavel = (s: string) => semAcento(s).replace(/[^a-z0-9]+/g, ' ').trim();

/** Notícia pronta para gravar, ou null se faltar título ou link, se for velha, ruído ou fora do espaço. */
export function prepararItem(bruto: ItemBruto, fonte: Fonte, agora: Date): ItemPronto | null {
	const titulo = limparTexto(bruto.titulo);
	if (!titulo || ehRuido(titulo)) return null;
	let url: string;
	try {
		url = urlCanonica(bruto.url);
	} catch {
		return null;
	}
	const quando = dataConfiavel(bruto.publicadoEm, agora);
	if (agora.getTime() - quando.getTime() > SETE_DIAS_MS) return null;

	let resumo = trecho(GLOBO.test(fonte.id) ? semLegendaGlobo(bruto.trecho) : bruto.trecho);
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
