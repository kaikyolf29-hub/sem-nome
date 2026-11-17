import type { Idioma } from '#lib/i18n/tipos.ts';

const MENOS = '−';

export function formatarMoeda(valor: number, moeda: 'BRL' | 'USD', idioma: Idioma): string {
	return new Intl.NumberFormat(idioma, { style: 'currency', currency: moeda }).format(valor);
}

export type Direcao = 'alta' | 'baixa' | 'estavel';

/** "+1,80%", "−0,42%" (U+2212) ou "0,00%"; |pct| < 0,005 conta como estável. */
export function formatarVariacao(pct: number, idioma: Idioma): { texto: string; direcao: Direcao } {
	const direcao: Direcao = Math.abs(pct) < 0.005 ? 'estavel' : pct > 0 ? 'alta' : 'baixa';
	const numero = new Intl.NumberFormat(idioma, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(direcao === 'estavel' ? 0 : Math.abs(pct));
	const sinal = direcao === 'alta' ? '+' : direcao === 'baixa' ? MENOS : '';
	return { texto: `${sinal}${numero}%`, direcao };
}

const textosTempo = {
	'pt-BR': {
		agora: 'agora',
		min: (n: number) => `há ${n} min`,
		h: (n: number) => `há ${n} h`,
		ontem: 'ontem'
	},
	en: {
		agora: 'now',
		min: (n: number) => `${n} min ago`,
		h: (n: number) => `${n} h ago`,
		ontem: 'yesterday'
	}
} as const;

/** "agora", "há 5 min", "há 2 h", "ontem" ou data curta ("12 de nov."). */
export function tempoRelativo(data: Date, agora: Date, idioma: Idioma): string {
	const segundos = Math.max(0, (agora.getTime() - data.getTime()) / 1000);
	const tx = textosTempo[idioma];
	if (segundos < 60) return tx.agora;
	if (segundos < 3600) return tx.min(Math.floor(segundos / 60));
	if (segundos < 86_400) return tx.h(Math.floor(segundos / 3600));
	if (segundos < 172_800) return tx.ontem;
	return new Intl.DateTimeFormat(idioma, { day: 'numeric', month: 'short' }).format(data);
}
