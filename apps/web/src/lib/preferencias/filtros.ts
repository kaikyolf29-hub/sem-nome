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

const fonteDe = (n: Noticia) => n.fontes[0]?.id ?? n.fontes[0]?.nome ?? '';

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
		const f1 = saida.length >= 1 ? fonteDe(saida[saida.length - 1]) : null;
		const f2 = saida.length >= 2 ? fonteDe(saida[saida.length - 2]) : null;
		const bloqueada = f1 !== null && f1 === f2 ? f1 : null;
		let i = 0;
		if (bloqueada !== null && fonteDe(pendentes[0]) === bloqueada) {
			const alt = pendentes.findIndex((n) => fonteDe(n) !== bloqueada);
			if (alt > 0) i = alt;
		}
		saida.push(pendentes.splice(i, 1)[0]);
	}
	return saida;
}
