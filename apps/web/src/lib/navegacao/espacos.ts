import type { ChaveMensagem } from '#lib/i18n/tipos.ts';
import { PADRAO, type Preferencias } from '#lib/preferencias/preferencias.ts';
import { TEMAS } from '#lib/preferencias/temas.ts';

export type IdEspaco =
	'para-voce' | 'mercado' | 'carteira' | 'cripto' | 'daytrade' | 'tecnologia' | 'agenda' | 'salvos';

export interface Canal {
	id: string;
	rotulo: ChaveMensagem;
	grupo?: ChaveMensagem;
	/** Nome escrito pela pessoa (tema digitado): aparece no lugar do rótulo. */
	nome?: string;
}

export interface Espaco {
	id: IdEspaco;
	rotulo: ChaveMensagem;
	/** Nome do ícone lucide. */
	icone: string;
	canais: readonly Canal[];
}

export const DESTINO_PADRAO = { espaco: 'para-voce', canal: 'tudo' } as const;

/** Prefixo do id do canal de um tema digitado (`busca-energia-solar`). */
export const PREFIXO_BUSCA = 'busca-';

const PARA_VOCE: Espaco = {
	id: 'para-voce',
	rotulo: 'espacos.paraVoce',
	icone: 'house',
	canais: [{ id: 'tudo', rotulo: 'canais.paraVoce.tudo' }]
};

/** Rótulo do canal de cada tema da lista (nomes de canal, em minúsculas, como no resto do app). */
const CANAL_DO_TEMA: Record<string, ChaveMensagem> = {
	mercado: 'canais.paraVoce.mercado',
	cripto: 'canais.paraVoce.cripto',
	tecnologia: 'canais.paraVoce.tecnologia',
	brasil: 'canais.paraVoce.brasil',
	politica: 'canais.paraVoce.politica',
	mundo: 'canais.paraVoce.mundo',
	esportes: 'canais.paraVoce.esportes',
	ciencia: 'canais.paraVoce.ciencia',
	saude: 'canais.paraVoce.saude',
	educacao: 'canais.paraVoce.educacao',
	cultura: 'canais.paraVoce.cultura',
	'meio-ambiente': 'canais.paraVoce.meioAmbiente',
	justica: 'canais.paraVoce.justica',
	carros: 'canais.paraVoce.carros',
	viagem: 'canais.paraVoce.viagem'
};

/** "Para você" de cada pessoa: `tudo`, um canal por tema escolhido e um por tema digitado. */
export function espacoParaVoce(p: Preferencias): Espaco {
	const escolhidos = new Set(p.temas);
	const canais: Canal[] = [...PARA_VOCE.canais];
	for (const tema of TEMAS) {
		if (escolhidos.has(tema.id)) {
			canais.push({ id: tema.id, rotulo: CANAL_DO_TEMA[tema.id], grupo: 'grupos.temas' });
		}
	}
	const usados = new Set(canais.map((c) => c.id));
	for (const termo of p.temasProprios) {
		const base =
			PREFIXO_BUSCA + (termo.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tema');
		let id = base;
		for (let n = 2; usados.has(id); n++) id = `${base}-${n}`;
		usados.add(id);
		canais.push({ id, rotulo: 'canais.paraVoce.temaDigitado', grupo: 'grupos.temas', nome: termo });
	}
	return { ...PARA_VOCE, canais };
}

export const espacosApp: readonly Espaco[] = [
	PARA_VOCE,
	{
		id: 'mercado',
		rotulo: 'espacos.mercado',
		icone: 'newspaper',
		canais: [
			{ id: 'manchetes', rotulo: 'canais.mercado.manchetes', grupo: 'grupos.destaques' },
			{ id: 'resumo-do-dia', rotulo: 'canais.mercado.resumoDoDia', grupo: 'grupos.destaques' },
			{ id: 'brasil', rotulo: 'canais.mercado.brasil', grupo: 'grupos.regioes' },
			{ id: 'eua', rotulo: 'canais.mercado.eua', grupo: 'grupos.regioes' },
			{ id: 'mundo', rotulo: 'canais.mercado.mundo', grupo: 'grupos.regioes' },
			{ id: 'acoes', rotulo: 'canais.mercado.acoes', grupo: 'grupos.ativos' },
			{ id: 'fiis', rotulo: 'canais.mercado.fiis', grupo: 'grupos.ativos' },
			{ id: 'etfs', rotulo: 'canais.mercado.etfs', grupo: 'grupos.ativos' },
			{ id: 'renda-fixa', rotulo: 'canais.mercado.rendaFixa', grupo: 'grupos.ativos' },
			{ id: 'cambio', rotulo: 'canais.mercado.cambio', grupo: 'grupos.ativos' },
			{ id: 'commodities', rotulo: 'canais.mercado.commodities', grupo: 'grupos.ativos' },
			{ id: 'macro', rotulo: 'canais.mercado.macro', grupo: 'grupos.economia' }
		]
	},
	{
		id: 'carteira',
		rotulo: 'espacos.carteira',
		icone: 'chart-pie',
		canais: [
			{ id: 'visao-geral', rotulo: 'canais.carteira.visaoGeral' },
			{ id: 'proventos', rotulo: 'canais.carteira.proventos' },
			{ id: 'imposto', rotulo: 'canais.carteira.imposto' },
			{ id: 'diario', rotulo: 'canais.carteira.diario' }
		]
	},
	{
		id: 'cripto',
		rotulo: 'espacos.cripto',
		icone: 'bitcoin',
		canais: [
			{ id: 'visao-geral', rotulo: 'canais.cripto.visaoGeral' },
			{ id: 'stablecoins', rotulo: 'canais.cripto.stablecoins' },
			{ id: 'nft', rotulo: 'canais.cripto.nft' },
			{ id: 'noticias', rotulo: 'canais.cripto.noticias' }
		]
	},
	{
		id: 'daytrade',
		rotulo: 'espacos.daytrade',
		icone: 'chart-candlestick',
		canais: [
			{ id: 'grafico', rotulo: 'canais.daytrade.grafico' },
			{ id: 'treino', rotulo: 'canais.daytrade.treino' },
			{ id: 'operacoes', rotulo: 'canais.daytrade.operacoes' }
		]
	},
	{
		id: 'tecnologia',
		rotulo: 'espacos.tecnologia',
		icone: 'cpu',
		canais: [
			{ id: 'ia', rotulo: 'canais.tecnologia.ia', grupo: 'grupos.noticias' },
			{ id: 'chips', rotulo: 'canais.tecnologia.chips', grupo: 'grupos.noticias' },
			{ id: 'big-techs', rotulo: 'canais.tecnologia.bigTechs', grupo: 'grupos.noticias' },
			{ id: 'github-radar', rotulo: 'canais.tecnologia.githubRadar', grupo: 'grupos.projetos' },
			{ id: 'artigos', rotulo: 'canais.tecnologia.artigos', grupo: 'grupos.projetos' }
		]
	},
	{
		id: 'agenda',
		rotulo: 'espacos.agenda',
		icone: 'calendar',
		canais: [
			{ id: 'semana', rotulo: 'canais.agenda.semana' },
			{ id: 'balancos', rotulo: 'canais.agenda.balancos' },
			{ id: 'dividendos', rotulo: 'canais.agenda.dividendos' },
			{ id: 'economia', rotulo: 'canais.agenda.economia' }
		]
	},
	{
		id: 'salvos',
		rotulo: 'espacos.salvos',
		icone: 'bookmark',
		canais: [{ id: 'tudo', rotulo: 'canais.salvos.tudo' }]
	}
];

/**
 * Espaço e canal pelos ids da rota; sem canal, o primeiro do espaço. null se não existir.
 * Os canais de "Para você" vêm das preferências da pessoa.
 */
export function localizar(
	espaco: string,
	canal?: string,
	p: Preferencias = PADRAO
): { espaco: Espaco; canal: Canal } | null {
	const e = espaco === 'para-voce' ? espacoParaVoce(p) : espacosApp.find((x) => x.id === espaco);
	if (!e) return null;
	const c = canal ? e.canais.find((x) => x.id === canal) : e.canais[0];
	return c ? { espaco: e, canal: c } : null;
}

/** Parâmetros da rota /[espaco]/[[canal]]: o canal dado ou o primeiro do espaço. Use com resolve(). */
export function paramsCanal(espaco: IdEspaco, canal?: string): { espaco: string; canal: string } {
	const e = espacosApp.find((x) => x.id === espaco)!;
	return { espaco: e.id, canal: canal ?? e.canais[0].id };
}
