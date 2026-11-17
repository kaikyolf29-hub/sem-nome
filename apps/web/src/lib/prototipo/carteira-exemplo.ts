import type { CotacoesUsd, Moeda } from '#lib/carteira/moedas.ts';
import type { ChaveMensagem } from '#lib/i18n/tipos.ts';

// Números de EXEMPLO do protótipo.
export const alocacaoExemplo: readonly { rotulo: ChaveMensagem; valor: number }[] = [
	{ rotulo: 'carteira.classes.acoesBr', valor: 38 },
	{ rotulo: 'carteira.classes.eua', valor: 22 },
	{ rotulo: 'carteira.classes.fiis', valor: 18 },
	{ rotulo: 'carteira.classes.rendaFixa', valor: 14 },
	{ rotulo: 'carteira.classes.cripto', valor: 6 },
	{ rotulo: 'carteira.classes.caixa', valor: 2 }
];

/** Onde o dinheiro de exemplo está, em cada moeda. */
export const posicoesPorMoeda: readonly { moeda: Moeda; valor: number }[] = [
	{ moeda: 'BRL', valor: 168_040.12 },
	{ moeda: 'USD', valor: 13_604.5 },
	{ moeda: 'EUR', valor: 1_250 }
];

/** Câmbio de exemplo: quanto 1 unidade vale em dólar. */
export const cotacoesExemplo: CotacoesUsd = {
	BRL: 1 / 5.41,
	USD: 1,
	EUR: 1.08,
	GBP: 1.27,
	JPY: 1 / 151.6,
	CHF: 1.13,
	CAD: 0.72,
	AUD: 0.65,
	CNY: 0.138,
	MXN: 0.058
};

export const resumoExemplo = {
	variacaoDia: 0.74,
	rendaMensal: 1_412.9,
	concentracao: { ativo: 'PETR4', pct: 23 },
	dozeMeses: [
		{ nome: 'suaCarteira', pct: 14.2 },
		{ nome: 'CDI', pct: 11.8 },
		{ nome: 'Ibovespa', pct: 9.6 },
		{ nome: 'S&P 500', pct: 21.3 }
	]
} as const;
