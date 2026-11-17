/** As 10 moedas que a pessoa pode escolher como principal (pedido do dono, 17/11/2026). */
export const MOEDAS = [
	'BRL',
	'USD',
	'EUR',
	'GBP',
	'JPY',
	'CHF',
	'CAD',
	'AUD',
	'CNY',
	'MXN'
] as const;
export type Moeda = (typeof MOEDAS)[number];

/** Quanto 1 unidade de cada moeda vale em dólar: o dólar é a ponte das conversões. */
export type CotacoesUsd = Record<Moeda, number>;

export const CHAVE_MOEDA = 'mirante:moeda';

export function converter(valor: number, de: Moeda, para: Moeda, usdPor: CotacoesUsd): number {
	if (de === para) return valor;
	return (valor * usdPor[de]) / usdPor[para];
}

export interface FatiaMoeda {
	moeda: Moeda;
	/** Soma na própria moeda. */
	original: number;
	/** A mesma soma na moeda principal. */
	convertido: number;
	pct: number;
}

/** Patrimônio total na moeda principal e quanto há em cada moeda (maior primeiro). */
export function consolidar(
	posicoes: readonly { moeda: Moeda; valor: number }[],
	principal: Moeda,
	usdPor: CotacoesUsd
): { total: number; porMoeda: FatiaMoeda[] } {
	const somas = new Map<Moeda, number>();
	for (const p of posicoes)
		if (p.valor > 0) somas.set(p.moeda, (somas.get(p.moeda) ?? 0) + p.valor);
	const lista = [...somas].map(([moeda, original]) => ({
		moeda,
		original,
		convertido: converter(original, moeda, principal, usdPor)
	}));
	const total = lista.reduce((s, m) => s + m.convertido, 0);
	return {
		total,
		porMoeda: lista
			.map((m) => ({ ...m, pct: total > 0 ? (m.convertido / total) * 100 : 0 }))
			.sort((a, b) => b.convertido - a.convertido)
	};
}

export function lerMoedaPrincipal(armazenamento: Pick<Storage, 'getItem'> | null): Moeda {
	try {
		const v = armazenamento?.getItem(CHAVE_MOEDA);
		return MOEDAS.includes(v as Moeda) ? (v as Moeda) : 'BRL';
	} catch {
		return 'BRL';
	}
}

export function salvarMoedaPrincipal(
	armazenamento: Pick<Storage, 'setItem'> | null,
	moeda: Moeda
): void {
	try {
		armazenamento?.setItem(CHAVE_MOEDA, moeda);
	} catch {
		// Armazenamento bloqueado: a escolha vale só nesta visita.
	}
}
