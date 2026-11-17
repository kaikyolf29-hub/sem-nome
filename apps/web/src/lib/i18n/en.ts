import type { Mensagens } from './tipos.ts';

export const en: Mensagens = {
	comum: {
		ola: 'Hi, {nome}'
	},
	espacos: {
		mercado: 'Markets',
		carteira: 'Portfolio',
		cripto: 'Crypto',
		daytrade: 'Day trading',
		tecnologia: 'Tech & AI',
		agenda: 'Calendar',
		salvos: 'Saved'
	},
	grupos: {
		destaques: 'Highlights',
		regioes: 'Regions',
		ativos: 'Assets',
		economia: 'Economy',
		noticias: 'News',
		projetos: 'Projects'
	},
	canais: {
		mercado: {
			manchetes: 'headlines',
			resumoDoDia: 'daily-brief',
			brasil: 'brazil',
			eua: 'us',
			mundo: 'world',
			acoes: 'stocks',
			fiis: 'reits',
			etfs: 'etfs',
			rendaFixa: 'fixed-income',
			cambio: 'fx',
			commodities: 'commodities',
			macro: 'macro'
		},
		carteira: {
			visaoGeral: 'overview',
			proventos: 'dividends',
			imposto: 'taxes',
			diario: 'journal'
		},
		cripto: {
			visaoGeral: 'overview',
			stablecoins: 'stablecoins',
			nft: 'nft',
			noticias: 'news'
		},
		daytrade: {
			grafico: 'chart',
			treino: 'practice',
			operacoes: 'trades'
		},
		tecnologia: {
			ia: 'ai',
			chips: 'chips',
			bigTechs: 'big-tech',
			githubRadar: 'github-radar',
			artigos: 'papers'
		},
		agenda: {
			semana: 'week',
			balancos: 'earnings',
			dividendos: 'dividends',
			economia: 'economy'
		},
		salvos: {
			tudo: 'all'
		}
	},
	casca: {
		espacos: 'Spaces',
		ajustes: 'Settings',
		inicio: 'Home',
		alertas: 'Alerts',
		voce: 'You',
		irInicio: 'Mirante, go home',
		abrirCanais: 'Open channels',
		abrirPainel: 'Open panel',
		fecharPainel: 'Close panel',
		canais: 'Channels',
		buscar: 'Search or ask',
		painel: 'Panel',
		navegacaoCelular: 'Main navigation',
		usoIA: 'Free AI: {pct}% used, resets at {hora}',
		usoIARotulo: 'Free AI usage',
		visitante: 'Guest',
		entrar: 'Sign in with Google',
		entrarEmBreve: 'Sign-in arrives in the next stage'
	},
	variacao: {
		alta: 'up {valor}',
		queda: 'down {valor}',
		estavel: 'flat at {valor}'
	}
};
