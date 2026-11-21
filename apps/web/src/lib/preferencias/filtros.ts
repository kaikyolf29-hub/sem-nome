import type { Noticia } from '#lib/feed/tipos.ts';
import { normalizarTermo, type Preferencias } from './preferencias.ts';

function palavras(texto: string): string {
	const limpo = texto
		.normalize('NFD')
		.replace(/\p{M}+/gu, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.trim();
	return ` ${limpo} `;
}

export function aplicarFiltros(noticias: Noticia[], p: Preferencias): Noticia[] {
	const ocultas = new Set(p.fontesOcultas);
	const termos = p.palavrasSilenciadas
		.map((x) => normalizarTermo(x))
		.filter((x): x is string => x !== null)
		.map((x) => ` ${palavras(x).trim()} `);
	const saida: Noticia[] = [];
	for (const n of noticias) {
		if (p.idioma === 'pt' && n.idioma === 'en') continue;
		// A principal escondida tira o cartão: o título, o trecho e o link são dela.
		const principal = n.fontes[0]?.id;
		if (principal && ocultas.has(principal)) continue;
		const fontes = ocultas.size ? n.fontes.filter((f) => !f.id || !ocultas.has(f.id)) : n.fontes;
		if (fontes.length === 0) continue;
		if (termos.length) {
			const texto = palavras(`${n.titulo} ${n.trecho}`);
			if (termos.some((t) => texto.includes(t))) continue;
		}
		saida.push(fontes === n.fontes ? n : { ...n, fontes });
	}
	return saida;
}

// A marca é o que a pessoa vê repetido: seções do mesmo veículo (g1, g1 Saúde, g1 Mundo) têm a mesma logo.
const marcaDe = (n: Noticia) => n.fontes[0]?.logo ?? n.fontes[0]?.id ?? n.fontes[0]?.nome ?? '';

/** Junta as listas sem repetir, da mais nova para a mais antiga, sem a mesma marca duas vezes seguidas. */
export function juntarFeeds(listas: Noticia[][]): Noticia[] {
	const vistos = new Set<string>();
	const todas: Noticia[] = [];
	for (const l of listas) {
		for (const n of l) {
			if (vistos.has(n.id)) continue;
			vistos.add(n.id);
			todas.push(n);
		}
	}
	const pendentes = todas.sort((a, b) => Date.parse(b.publicadoEm) - Date.parse(a.publicadoEm));
	const saida: Noticia[] = [];
	while (pendentes.length) {
		const anterior = saida.length ? marcaDe(saida[saida.length - 1]) : null;
		const alternativa = anterior === null ? 0 : pendentes.findIndex((n) => marcaDe(n) !== anterior);
		saida.push(pendentes.splice(Math.max(alternativa, 0), 1)[0]);
	}
	return saida;
}
