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

export const resumoExemplo = {
	patrimonio: 248_310.42,
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
