import type { Mensagens } from './tipos.ts';

export const en: Mensagens = {
	comum: {
		ola: 'Hi, {nome}',
		emBreve: 'This channel arrives in phase {fase} of Mirante.',
		emBreveTitulo: 'Under construction'
	},
	espacos: {
		paraVoce: 'For you',
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
		projetos: 'Projects',
		temas: 'Topics'
	},
	canais: {
		paraVoce: {
			tudo: 'all',
			mercado: 'markets',
			cripto: 'crypto',
			tecnologia: 'tech-and-ai',
			brasil: 'brazil',
			politica: 'politics',
			mundo: 'world',
			esportes: 'sports',
			ciencia: 'science',
			saude: 'health',
			educacao: 'education',
			cultura: 'culture',
			meioAmbiente: 'environment',
			justica: 'justice',
			carros: 'cars',
			viagem: 'travel',
			temaDigitado: 'topic'
		},
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
		mais: 'More',
		irInicio: 'Mirante, go home',
		abrirCanais: 'Open channels',
		abrirPainel: 'Open panel',
		fecharPainel: 'Close panel',
		canais: 'Channels',
		buscar: 'Search or ask',
		painel: 'Panel',
		navegacaoCelular: 'Main navigation',
		usoIA: 'Free AI',
		usado: '{pct}% used',
		renovaAs: 'Resets at {hora}',
		usoIARotulo: 'Free AI usage',
		visitante: 'Guest',
		semConta: 'No account',
		suaConta: 'Your account',
		entrarGoogle: 'Sign in with Google',
		contaTexto: 'Sign in to keep your portfolio, alerts and saved items on all your devices.',
		entrar: 'Sign in with Google',
		entrarEmBreve: 'Google sign-in coming soon'
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
		tambemDestaque: 'Also leading',
		mercadoAgora: 'Markets now',
		carregando: 'Loading the news',
		erroRede: 'No connection to the news right now.',
		erroServidor: "The news didn't load.",
		tentarDeNovo: 'Try again',
		vazio: 'Nothing here yet. News for this channel shows up as soon as it arrives.',
		impacto: {
			baixo: 'Low impact',
			medio: 'Medium impact',
			alto: 'High impact'
		}
	},
	aviso: {
		dadosReais: 'Real news from the sources. Quotes, portfolio and analysis are still examples.'
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
		verLogos: 'See the three logo options',
		noticiasTemas: 'News and topics'
	},
	painel: {
		titulo: 'Asset in focus',
		cotacao: 'Sample quote, 30 min delayed, at {hora}',
		ultimos30: 'Last 30 sessions',
		afetaCarteira: 'News affecting this asset',
		analista: 'Analyst',
		respostaIA: 'AI answer',
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
	mercado: {
		ibovespa: 'Ibovespa',
		dolar: 'Dollar',
		sp500: 'S&P 500',
		bitcoin: 'Bitcoin',
		petroleo: 'Oil'
	},
	conta: {
		emBreve: 'Google sign-in arrives in the next stage.',
		erroProvedor: 'Google sign-in is not turned on yet. Please try again later.',
		erroCancelado: 'Sign-in was cancelled on the Google screen.',
		erroRede: 'No internet connection. Check it and try again.',
		erroGenerico: 'Could not sign in right now. Please try again shortly.',
		sair: 'Sign out',
		entrando: 'Opening Google'
	},
	temas: {
		mercado: 'Markets',
		cripto: 'Crypto',
		tecnologia: 'Technology & AI',
		brasil: 'Brazil',
		politica: 'Politics',
		mundo: 'World',
		esportes: 'Sports',
		ciencia: 'Science',
		saude: 'Health',
		educacao: 'Education',
		cultura: 'Culture & entertainment',
		meioAmbiente: 'Environment',
		justica: 'Justice',
		carros: 'Cars',
		viagem: 'Travel'
	},
	paraVoce: {
		semResultado: 'No news about “{termo}” from our sources yet.',
		semResultadoDica: 'As soon as one of them publishes, it shows up here.',
		semTemas: 'You haven’t picked any topics yet.',
		adicionarTema: 'Add topic',
		escolherTemas: 'Pick topics'
	},
	painelTemas: {
		titulo: 'News and topics',
		tituloPrimeira: 'What do you want to see?',
		explicacaoPrimeira: 'Check the subjects for your home. You can change them anytime.',
		temas: 'Topics',
		criar: 'Create my topic',
		criarAjuda: 'A team, a company, a city. Up to 5 topics.',
		campoTema: 'New topic',
		exemploTema: 'Corinthians, solar energy',
		adicionar: 'Add',
		tirar: 'Remove',
		tirarTema: 'Remove the topic {termo}',
		limite: 'You already have 5 topics. Remove one to add another.',
		invalido: 'Type 2 to 40 letters.',
		repetido: 'This topic is already on your list.',
		adicionado: '“{termo}” was added to your home.',
		filtros: 'Filters',
		filtrosAjuda: 'They apply to all news in the app.',
		idioma: 'News language',
		soPortugues: 'Portuguese only',
		portuguesIngles: 'Portuguese and English',
		silenciadas: 'Muted words',
		silenciadasAjuda: 'News with these words in the title or summary won’t show up.',
		campoPalavra: 'Word or phrase',
		silenciar: 'Mute',
		tirarPalavra: 'Show {palavra} again',
		palavraRepetida: 'This word is already muted.',
		palavraLimite: 'You reached the limit of 50 words.',
		fontes: 'Sources',
		fontesAjuda: 'Uncheck the sources you don’t want to see.',
		fontesCarregando: 'Loading sources',
		fontesErro: 'Sources didn’t load right now. Close and open again to retry.',
		maisFontes: '{lista} and {n} more',
		pular: 'Skip',
		pronto: 'Done',
		fechar: 'Close'
	},
	variacao: {
		alta: 'up {valor}',
		queda: 'down {valor}',
		estavel: 'flat at {valor}'
	}
};
