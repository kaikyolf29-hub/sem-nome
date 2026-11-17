import type { Mensagens } from './tipos.ts';

export const en: Mensagens = {
	comum: {
		ola: 'Hi, {nome}',
		emBreve: 'This channel arrives in phase {fase} of Mirante.',
		emBreveTitulo: 'Under construction'
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
		usoIA: 'Free AI: {pct}% used',
		renovaAs: 'Resets at {hora}',
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
		faixa: 'Prototype with sample news and numbers. Nothing here is real.',
		ajustes: 'Prototype settings',
		fechar: 'Close settings',
		tema: 'Theme',
		temaSistema: 'System',
		temaClaro: 'Light',
		temaEscuro: 'Dark',
		temaPreto: 'Black',
		verComo: 'View as',
		navegador: 'Browser',
		matsu: 'Matsu OS',
		windows: 'Windows',
		manchete: 'Headline',
		serifada: 'Serif',
		semSerifa: 'Inter',
		idioma: 'Language',
		verLogos: 'See the three logo options'
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
	carteira: {
		titulo: 'Sample portfolio',
		alocacao: 'Allocation by asset class',
		patrimonio: 'Net worth',
		verEm: 'Show in',
		porMoeda: 'By currency',
		moedaPrincipal: 'main currency',
		emPrincipal: 'worth {valor}',
		cambio: 'Sample exchange rates from today at {hora}.',
		hoje: 'Today',
		rendaMensal: 'Estimated monthly income',
		dozeMeses: '12-month return',
		suaCarteira: 'Your portfolio',
		concentracao: '{ativo} is now {pct}% of the portfolio, above the 20% limit you set.',
		classes: {
			acoesBr: 'Brazilian stocks',
			fiis: 'Real estate funds',
			eua: 'US stocks',
			rendaFixa: 'Fixed income',
			cripto: 'Crypto',
			caixa: 'Cash'
		}
	},
	janela: {
		fechar: 'Close',
		minimizar: 'Minimize',
		telaCheia: 'Full screen',
		sairTelaCheia: 'Exit full screen',
		maximizar: 'Maximize',
		restaurar: 'Restore'
	},
	marca: {
		titulo: 'Mirante logo: three options',
		explicacao: 'All in the Matsu OS icon format, which works on any system. Pick one: A, B or C.',
		tamanhos: 'Sizes',
		fundos: 'Light, dark and black backgrounds',
		doca: 'In the dock',
		barraTarefas: 'In the taskbar',
		voltar: 'Back to the app',
		a: {
			nome: 'A. Chart M',
			descricao: "Mirante's M drawn as a rising chart line."
		},
		b: {
			nome: 'B. Horizon',
			descricao: 'The sun rising over the horizon, with signal waves: seeing it all from above.'
		},
		c: {
			nome: 'C. Binoculars',
			descricao:
				'The binoculars of someone at the lookout. Friendly and easy to read at small sizes.'
		}
	},
	variacao: {
		alta: 'up {valor}',
		queda: 'down {valor}',
		estavel: 'flat at {valor}'
	}
};
