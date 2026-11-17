// Agrupamento por fato: a mesma história em fontes diferentes vira um cartão só.
import { semAcento } from './texto.ts';
import type { ItemPronto } from './tipos.ts';

export const PALAVRAS_VAZIAS = new Set(
	(
		'a o os as um uma uns umas de do da dos das em no na nos nas ao aos à às e ou que se por para pra com sem ' +
		'mais menos muito como sobre entre apos ate desde pelo pela pelos pelas seu sua seus suas ele ela eles elas ' +
		'isso este esta esse essa diz dizem ser sao foi vai tem ter ja nao sim ano anos dia hoje ontem agora veja ' +
		'the of to in on for and or with as at by from is are be was were its it an new says say after over into ' +
		'about than that this these those will would can could has have had not but up out more most how why what'
	).split(' ')
);

/** Palavras que identificam o título: sem acento, sem palavras vazias, únicas e em ordem. */
export function assinatura(titulo: string): string[] {
	const palavras = semAcento(titulo)
		.split(/[^a-z0-9]+/)
		.filter((p) => (/^\d+$/.test(p) ? p.length >= 2 : p.length >= 3) && !PALAVRAS_VAZIAS.has(p));
	return [...new Set(palavras)].sort();
}

function comuns(a: readonly string[], b: readonly string[]): number {
	const conjunto = new Set(a);
	return b.reduce((n, p) => n + (conjunto.has(p) ? 1 : 0), 0);
}

function semelhanca(a: readonly string[], b: readonly string[]): number {
	const iguais = comuns(a, b);
	return iguais / (a.length + b.length - iguais || 1);
}

/** Mesma história: pelo menos 4 palavras em comum e metade de tudo igual (Jaccard ≥ 0,5). */
export function parecidas(a: readonly string[], b: readonly string[]): boolean {
	return comuns(a, b) >= 4 && semelhanca(a, b) >= 0.5;
}

export interface Recente {
	grupo_id: number;
	assinatura: string[];
	publicado_em: string;
}

const JANELA_MS = 36 * 60 * 60 * 1000;

/** O grupo parecido mais próximo, publicado até 36 h antes ou depois; null para grupo novo. */
export function escolherGrupo(item: ItemPronto, recentes: readonly Recente[]): number | null {
	const quando = Date.parse(item.publicadoEm);
	let melhor: { id: number; nota: number } | null = null;
	for (const r of recentes) {
		if (Math.abs(Date.parse(r.publicado_em) - quando) > JANELA_MS) continue;
		if (!parecidas(item.assinatura, r.assinatura)) continue;
		const nota = semelhanca(item.assinatura, r.assinatura);
		if (!melhor || nota > melhor.nota) melhor = { id: r.grupo_id, nota };
	}
	return melhor?.id ?? null;
}
