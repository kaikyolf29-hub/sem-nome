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
	tempo: {
		agora: 'now',
		minutos: '{n} min ago',
		horas: '{n} h ago',
		ontem: 'yesterday'
	},
	feed: {
		lerNaFonte: 'Read at source',
		salvar: 'Save',
		geradoPorIA: 'AI summary',
		comInformacoes: 'Reporting from {fontes}',
		fonteOficial: 'Official source',
		fontePrimaria: 'Primary source',
		maisFontes: '+{n}',
		outrasFontes: 'and {n} more sources',
		afetaCarteira: 'Affects your portfolio',
		bafafa: 'Big news',
		manchete: 'Top story',
		mercadoAgora: 'Markets now',
		vazio: 'Nothing here yet. News for this channel shows up as soon as it arrives.',
		impacto: {
			baixo: 'Low impact',
			medio: 'Medium impact',
			alto: 'High impact'
		}
	},
	prototipo: {
		faixa: 'Prototype with sample news and numbers. Nothing here is real.'
	},
	painel: {
		titulo: 'Asset in focus',
		cotacao: 'Sample quote, 30 min delayed, at {hora}',
		ultimos30: 'Last 30 sessions',
		afetaCarteira: 'News affecting this asset',
		analista: 'Analyst',
		voce: 'You',
		fontes: 'Sources',
		citacao: 'Go to source {n}',
		aviso: 'For information only. Not investment advice.',
		perguntar: 'Ask about news or your portfolio',
		enviar: 'Send',
		enviarEmBreve: 'The analyst chat arrives in phase 4.'
	},
	paleta: {
		titulo: 'Search Mirante',
		campo: 'Search spaces, channels or news',
		vazio: 'Nothing found for "{q}".',
		resultados: 'Results',
		tipoEspaco: 'Space',
		tipoCanal: 'Channel',
		tipoNoticia: 'News',
		dica: 'Arrows to choose, Enter to open, Esc to close'
	},
	variacao: {
		alta: 'up {valor}',
		queda: 'down {valor}',
		estavel: 'flat at {valor}'
	}
};
