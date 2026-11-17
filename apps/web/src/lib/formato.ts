import { traduzir } from '#lib/i18n/index.ts';
import type { Idioma } from '#lib/i18n/tipos.ts';

const MENOS = '−';

export function formatarMoeda(valor: number, moeda: 'BRL' | 'USD', idioma: Idioma): string {
	return new Intl.NumberFormat(idioma, { style: 'currency', currency: moeda })
		.format(valor)
		.replace('-', MENOS);
}

export type Direcao = 'alta' | 'baixa' | 'estavel';

/** "+1,80%", "−0,42%" (U+2212) ou "0,00%"; |pct| < 0,005 conta como estável; sem valor, "—". */
export function formatarVariacao(pct: number, idioma: Idioma): { texto: string; direcao: Direcao } {
	if (!Number.isFinite(pct)) return { texto: '\u2014', direcao: 'estavel' };
	const direcao: Direcao = Math.abs(pct) < 0.005 ? 'estavel' : pct > 0 ? 'alta' : 'baixa';
	const numero = new Intl.NumberFormat(idioma, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(direcao === 'estavel' ? 0 : Math.abs(pct));
	const sinal = direcao === 'alta' ? '+' : direcao === 'baixa' ? MENOS : '';
	return { texto: `${sinal}${numero}%`, direcao };
}

const inicioDoDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "agora", "há 5 min", "há 2 h" (mesmo dia), "ontem" (dia anterior do calendário) ou data curta. */
export function tempoRelativo(data: Date, agora: Date, idioma: Idioma): string {
	const segundos = Math.max(0, (agora.getTime() - data.getTime()) / 1000);
	if (segundos < 60) return traduzir(idioma, 'tempo.agora');
	if (segundos < 3600) return traduzir(idioma, 'tempo.minutos', { n: Math.floor(segundos / 60) });
	const dias = Math.round((inicioDoDia(agora) - inicioDoDia(data)) / 86_400_000);
	if (dias === 0) return traduzir(idioma, 'tempo.horas', { n: Math.floor(segundos / 3600) });
	if (dias === 1) return traduzir(idioma, 'tempo.ontem');
	return new Intl.DateTimeFormat(idioma, {
		day: 'numeric',
		month: 'short',
		year: data.getFullYear() === agora.getFullYear() ? undefined : 'numeric'
	}).format(data);
}
