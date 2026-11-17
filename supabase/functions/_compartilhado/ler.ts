// Lê o que a fonte respondeu (RSS 2.0, RSS 1.0/RDF, Atom ou o JSON de notícias do IBGE).
import { XMLParser } from 'fast-xml-parser';
import type { ItemBruto, TipoFonte } from './tipos.ts';

const leitor = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: '@',
	textNodeName: '#texto',
	parseTagValue: false,
	parseAttributeValue: false,
	trimValues: true,
	processEntities: true,
	htmlEntities: false,
	isArray: (nome) => nome === 'item' || nome === 'entry' || nome === 'link'
});

type No = Record<string, unknown>;

/** Texto de um nó, venha como string, como { '#texto': ... } ou como lista. */
function texto(valor: unknown): string {
	if (valor == null) return '';
	if (typeof valor === 'string' || typeof valor === 'number') return String(valor);
	if (Array.isArray(valor)) return texto(valor[0]);
	if (typeof valor === 'object') return texto((valor as No)['#texto']);
	return '';
}

function linkAtom(links: unknown): string {
	const lista = (Array.isArray(links) ? links : [links]) as (No | string)[];
	const alternativo =
		lista.find((l) => typeof l === 'object' && (!l['@rel'] || l['@rel'] === 'alternate')) ?? lista[0];
	if (typeof alternativo === 'string') return alternativo;
	return texto(alternativo?.['@href']);
}

function paraHttps(url: string): string {
	return url.trim().replace(/^http:\/\//i, 'https://');
}

function deXml(conteudo: string): ItemBruto[] {
	let raiz: No;
	try {
		raiz = leitor.parse(conteudo) as No;
	} catch {
		return [];
	}
	const rss = raiz.rss as No | undefined;
	const rdf = raiz['rdf:RDF'] as No | undefined;
	const atom = raiz.feed as No | undefined;

	if (atom) {
		return ((atom.entry as No[]) ?? []).map((e) => ({
			titulo: texto(e.title),
			url: paraHttps(linkAtom(e.link)),
			trecho: texto(e.summary) || texto(e.content),
			publicadoEm: texto(e.published) || texto(e.updated) || null
		}));
	}
	const itens = ((rss?.channel as No | undefined)?.item ?? rdf?.item ?? []) as No[];
	return itens.map((i) => ({
		titulo: texto(i.title),
		url: paraHttps(texto(i.link) || texto(i.guid)),
		trecho: texto(i.description) || texto(i['content:encoded']),
		publicadoEm: texto(i.pubDate) || texto(i['dc:date']) || null
	}));
}

/** "16/11/2026 04:29:43" no horário de Brasília (UTC-3, sem horário de verão desde 2019). */
function dataIbge(valor: string): string | null {
	const m = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/.exec(valor.trim());
	if (!m) return null;
	const [, dia, mes, ano, h, min, s] = m;
	return new Date(`${ano}-${mes}-${dia}T${h}:${min}:${s}-03:00`).toISOString();
}

function deIbge(conteudo: string): ItemBruto[] {
	let dados: { items?: No[] };
	try {
		dados = JSON.parse(conteudo);
	} catch {
		return [];
	}
	return (dados.items ?? []).map((i) => ({
		titulo: texto(i.titulo),
		url: paraHttps(texto(i.link)),
		trecho: texto(i.introducao),
		publicadoEm: dataIbge(texto(i.data_publicacao))
	}));
}

/** Itens da resposta. O formato XML é descoberto pelo conteúdo; resposta estranha vira lista vazia. */
export function lerFeed(conteudo: string, tipo: TipoFonte): ItemBruto[] {
	if (!conteudo.trim()) return [];
	const itens = tipo === 'ibge' ? deIbge(conteudo) : deXml(conteudo);
	return itens.filter((i) => i.titulo && /^https:\/\//.test(i.url));
}
