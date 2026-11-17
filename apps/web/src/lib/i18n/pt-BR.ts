/** Catálogo fonte (pt-BR). Toda chave nova entra aqui e em en.ts; o compilador confere a paridade. */
export const ptBR = {
	comum: {
		ola: 'Olá, {nome}',
		emBreve: 'Este canal chega na fase {fase} do Mirante.',
		emBreveTitulo: 'Em construção'
	},
	espacos: {
		mercado: 'Mercado',
		carteira: 'Carteira',
		cripto: 'Cripto',
		daytrade: 'Day trade',
		tecnologia: 'Tecnologia & IA',
		agenda: 'Agenda',
		salvos: 'Salvos'
	},
	grupos: {
		destaques: 'Destaques',
		regioes: 'Regiões',
		ativos: 'Ativos',
		economia: 'Economia',
		noticias: 'Notícias',
		projetos: 'Projetos'
	},
	canais: {
		mercado: {
			manchetes: 'manchetes',
			resumoDoDia: 'resumo-do-dia',
			brasil: 'brasil',
			eua: 'eua',
			mundo: 'mundo',
			acoes: 'ações',
			fiis: 'fiis',
			etfs: 'etfs',
			rendaFixa: 'renda-fixa',
			cambio: 'câmbio',
			commodities: 'commodities',
			macro: 'macro'
		},
		carteira: {
			visaoGeral: 'visão-geral',
			proventos: 'proventos',
			imposto: 'imposto',
			diario: 'diário'
		},
		cripto: {
			visaoGeral: 'visão-geral',
			stablecoins: 'stablecoins',
			nft: 'nft',
			noticias: 'notícias'
		},
		daytrade: {
			grafico: 'gráfico',
			treino: 'treino',
			operacoes: 'operações'
		},
		tecnologia: {
			ia: 'ia',
			chips: 'chips',
			bigTechs: 'big-techs',
			githubRadar: 'github-radar',
			artigos: 'artigos'
		},
		agenda: {
			semana: 'semana',
			balancos: 'balanços',
			dividendos: 'dividendos',
			economia: 'economia'
		},
		salvos: {
			tudo: 'tudo'
		}
	},
	casca: {
		espacos: 'Espaços',
		ajustes: 'Ajustes',
		inicio: 'Início',
		alertas: 'Alertas',
		voce: 'Você',
		irInicio: 'Mirante, ir para o início',
		abrirCanais: 'Abrir canais',
		abrirPainel: 'Abrir painel',
		fecharPainel: 'Fechar painel',
		canais: 'Canais',
		buscar: 'Buscar ou perguntar',
		painel: 'Painel',
		navegacaoCelular: 'Navegação principal',
		usoIA: 'IA grátis: {pct}% usado, renova às {hora}',
		usoIARotulo: 'Uso da IA grátis',
		visitante: 'Visitante',
		entrar: 'Entrar com Google',
		entrarEmBreve: 'O login chega na próxima etapa'
	},
	tempo: {
		agora: 'agora',
		minutos: 'há {n} min',
		horas: 'há {n} h',
		ontem: 'ontem'
	},
	feed: {
		lerNaFonte: 'Ler na fonte',
		salvar: 'Salvar',
		geradoPorIA: 'Resumo por IA',
		comInformacoes: 'Com informações de {fontes}',
		fonteOficial: 'Fonte oficial',
		fontePrimaria: 'Fonte primária',
		maisFontes: '+{n}',
		outrasFontes: 'e mais {n} fontes',
		afetaCarteira: 'Afeta sua carteira',
		bafafa: 'Bafafá',
		manchete: 'Manchete',
		mercadoAgora: 'Mercado agora',
		vazio: 'Nada por aqui ainda. As notícias deste canal aparecem assim que chegarem.',
		impacto: {
			baixo: 'Impacto baixo',
			medio: 'Impacto médio',
			alto: 'Impacto alto'
		}
	},
	prototipo: {
		faixa: 'Protótipo com notícias e números de exemplo. Nada aqui é real.'
	},
	painel: {
		titulo: 'Ativo em foco',
		cotacao: 'Cotação de exemplo, atraso de 30 min, às {hora}',
		ultimos30: 'Últimos 30 pregões',
		afetaCarteira: 'Notícias que afetam este ativo',
		analista: 'Analista',
		voce: 'Você',
		fontes: 'Fontes',
		citacao: 'Ir para a fonte {n}',
		aviso: 'Informativo. Não é recomendação de investimento.',
		perguntar: 'Pergunte sobre notícias ou sua carteira',
		enviar: 'Enviar',
		enviarEmBreve: 'O chat do analista chega na fase 4.'
	},
	paleta: {
		titulo: 'Buscar no Mirante',
		campo: 'Buscar espaços, canais ou notícias',
		vazio: 'Nada encontrado para "{q}".',
		resultados: 'Resultados',
		tipoEspaco: 'Espaço',
		tipoCanal: 'Canal',
		tipoNoticia: 'Notícia',
		dica: 'Setas para escolher, Enter para abrir, Esc para fechar'
	},
	carteira: {
		titulo: 'Carteira de exemplo',
		alocacao: 'Alocação por classe',
		patrimonio: 'Patrimônio',
		hoje: 'Hoje',
		rendaMensal: 'Renda mensal estimada',
		dozeMeses: 'Rentabilidade em 12 meses',
		suaCarteira: 'Sua carteira',
		concentracao: '{ativo} já é {pct}% da carteira, acima do limite de 20% que você definiu.',
		classes: {
			acoesBr: 'Ações Brasil',
			fiis: 'Fundos imobiliários',
			eua: 'Ações EUA',
			rendaFixa: 'Renda fixa',
			cripto: 'Cripto',
			caixa: 'Caixa'
		}
	},
	variacao: {
		alta: 'alta de {valor}',
		queda: 'queda de {valor}',
		estavel: 'estável em {valor}'
	}
} as const;
