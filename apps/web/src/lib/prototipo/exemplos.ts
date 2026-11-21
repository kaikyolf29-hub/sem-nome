import type { EspacoBanco, Noticia } from '#lib/feed/tipos.ts';
import type { ChaveMensagem } from '#lib/i18n/tipos.ts';

// Notícias de EXEMPLO do protótipo: veículos fictícios, fatos inventados, links que não saem do app.
// A faixa "Protótipo com notícias e números de exemplo" aparece sempre junto.

const GAZETA = {
	id: 'gazeta',
	nome: 'Gazeta do Pregão',
	url: 'https://example.com/',
	primaria: false,
	marca: { cor: '#2f6b4f', sigla: 'G' }
};
const MERCADO = {
	id: 'mercado-hoje',
	nome: 'Mercado Hoje',
	url: 'https://example.com/',
	primaria: false,
	marca: { cor: '#2c4a7a', sigla: 'MH' }
};
const RADAR = {
	id: 'radar-tech',
	nome: 'Radar Tech',
	url: 'https://example.com/',
	primaria: false,
	marca: { cor: '#1f6f78', icone: 'radar' as const }
};
const CRIPTO = {
	id: 'cripto-diario',
	nome: 'Cripto Diário',
	url: 'https://example.com/',
	primaria: false,
	marca: { cor: '#8a5a1f', icone: 'cripto' as const }
};
const OFICIAL = {
	id: 'oficial',
	nome: 'Fonte oficial (exemplo)',
	url: 'https://example.com/',
	primaria: true
};
const PRACA = {
	id: 'jornal-da-praca',
	nome: 'Jornal da Praça',
	url: 'https://example.com/',
	primaria: false,
	marca: { cor: '#4a5d23', sigla: 'JP' }
};
const PLANETA = {
	id: 'folha-do-planeta',
	nome: 'Folha do Planeta',
	url: 'https://example.com/',
	primaria: false,
	marca: { cor: '#2e5e8a', sigla: 'FP' }
};
const PLACAR = {
	id: 'placar-total',
	nome: 'Placar Total',
	url: 'https://example.com/',
	primaria: false,
	marca: { cor: '#6b4f2a', sigla: 'P' }
};

const minutosAtras = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

type Exemplo = Omit<Noticia, 'publicadoEm' | 'url'> & { minutos: number };

const lista: Exemplo[] = [
	{
		id: 'm1',
		minutos: 14,
		titulo: 'Copom mantém os juros e sinaliza cautela com a inflação de serviços',
		fontes: [OFICIAL, GAZETA, MERCADO, RADAR],
		trecho: 'Comunicado cita mercado de trabalho aquecido e expectativas acima da meta.',
		resumoIA:
			'O comitê manteve a taxa básica e indicou que só deve cortar quando a inflação de serviços ceder. Títulos atrelados à Selic seguem rendendo mais por mais tempo.',
		temas: ['juros', 'inflação'],
		impacto: 92,
		bafafa: true,
		ativos: [{ ticker: 'Tesouro Selic', motivo: 'rende pela taxa básica, que ficou parada' }],
		espaco: 'mercado',
		canais: ['manchetes', 'brasil', 'renda-fixa', 'macro']
	},
	{
		id: 'm2',
		minutos: 38,
		titulo: 'Petrobras divulga novo calendário de pagamento de dividendos',
		fontes: [OFICIAL, GAZETA],
		trecho: 'Pagamentos serão feitos em duas parcelas no próximo trimestre.',
		resumoIA:
			'A empresa confirmou as datas das duas parcelas e manteve a política de distribuição. Quem tiver a ação na data de corte recebe.',
		temas: ['dividendos'],
		impacto: 78,
		bafafa: false,
		ativos: [{ ticker: 'PETR4', motivo: 'você tem esta ação na carteira' }],
		espaco: 'mercado',
		canais: ['manchetes', 'brasil', 'acoes']
	},
	{
		id: 'm3',
		minutos: 55,
		titulo: 'Inflação americana desacelera e reforça aposta de corte de juros nos EUA',
		fontes: [OFICIAL, MERCADO, GAZETA],
		trecho: 'Índice de preços ao consumidor subiu menos que o esperado no mês.',
		resumoIA:
			'A inflação dos EUA veio abaixo das projeções, o que aumenta a chance de o banco central americano cortar juros. Bolsas e títulos longos reagiram em alta.',
		temas: ['inflação', 'EUA'],
		impacto: 86,
		bafafa: true,
		ativos: [],
		espaco: 'mercado',
		canais: ['manchetes', 'eua', 'mundo', 'macro']
	},
	{
		id: 'm4',
		minutos: 72,
		titulo: 'Dólar recua com entrada de capital estrangeiro na bolsa brasileira',
		fontes: [MERCADO],
		trecho: 'Moeda americana fechou em queda pelo terceiro dia seguido.',
		resumoIA:
			'O dólar caiu pelo terceiro dia com investidores estrangeiros comprando ações no Brasil. Ativos em dólar da carteira valem um pouco menos em reais.',
		temas: ['câmbio'],
		impacto: 64,
		bafafa: false,
		ativos: [{ ticker: 'IVVB11', motivo: 'ETF em dólar: a queda da moeda pesa em reais' }],
		espaco: 'mercado',
		canais: ['manchetes', 'brasil', 'cambio']
	},
	{
		id: 'm5',
		minutos: 95,
		titulo: 'Prévia da inflação brasileira vem abaixo do esperado',
		fontes: [OFICIAL, GAZETA],
		trecho: 'Alimentos e passagens aéreas puxaram a desaceleração.',
		resumoIA:
			'A prévia da inflação veio menor que a projeção, puxada por alimentos. Isso pode abrir espaço para cortes de juros mais à frente.',
		temas: ['inflação'],
		impacto: 68,
		bafafa: false,
		ativos: [],
		espaco: 'mercado',
		canais: ['brasil', 'macro']
	},
	{
		id: 'm6',
		minutos: 130,
		titulo: 'Petróleo sobe após grandes exportadores anunciarem corte de produção',
		fontes: [MERCADO, GAZETA],
		trecho: 'Barril avançou mais de 3% na sessão.',
		resumoIA:
			'O preço do petróleo subiu depois do anúncio de corte de produção. Petroleiras tendem a reagir, e combustíveis podem ficar mais caros.',
		temas: ['petróleo', 'commodities'],
		impacto: 70,
		bafafa: false,
		ativos: [{ ticker: 'PETR4', motivo: 'preço do petróleo mexe com a receita' }],
		espaco: 'mercado',
		canais: ['commodities', 'mundo']
	},
	{
		id: 'm7',
		minutos: 160,
		titulo: 'Bolsas americanas fecham perto da máxima com balanços de tecnologia',
		fontes: [MERCADO],
		trecho: 'Resultados acima do esperado sustentaram o índice amplo.',
		temas: ['EUA', 'balanços'],
		impacto: 58,
		bafafa: false,
		ativos: [],
		espaco: 'mercado',
		canais: ['eua']
	},
	{
		id: 'm8',
		minutos: 210,
		titulo: 'Fundos imobiliários de logística sobem com nova leva de contratos',
		fontes: [GAZETA],
		trecho: 'Galpões perto de grandes centros seguem com ocupação alta.',
		resumoIA:
			'FIIs de galpões logísticos subiram após anúncios de novos contratos de aluguel. A ocupação alta sustenta a renda mensal desses fundos.',
		temas: ['FIIs'],
		impacto: 46,
		bafafa: false,
		ativos: [{ ticker: 'HGLG11', motivo: 'você tem este fundo na carteira' }],
		espaco: 'mercado',
		canais: ['fiis']
	},
	{
		id: 'm9',
		minutos: 300,
		titulo: 'ETFs de renda fixa atraem volume recorde de aplicações no mês',
		fontes: [MERCADO],
		trecho: 'Produtos atrelados à inflação lideraram a captação.',
		temas: ['ETFs', 'renda fixa'],
		impacto: 38,
		bafafa: false,
		ativos: [],
		espaco: 'mercado',
		canais: ['etfs', 'renda-fixa']
	},
	{
		id: 'c1',
		minutos: 20,
		titulo: 'Stablecoin em dólar perde a paridade por algumas horas e volta a US$ 1',
		fontes: [CRIPTO, MERCADO],
		trecho: 'Resgates em massa pressionaram a moeda antes de a reserva ser reforçada.',
		resumoIA:
			'Uma stablecoin chegou a valer menos de US$ 1 por algumas horas e depois voltou ao normal. O episódio mostra o risco de reservas pouco transparentes.',
		temas: ['stablecoins'],
		impacto: 81,
		bafafa: true,
		ativos: [],
		espaco: 'cripto',
		canais: ['stablecoins', 'noticias']
	},
	{
		id: 'c2',
		minutos: 45,
		titulo: 'Bitcoin renova a máxima do mês com entrada em fundos de índice',
		fontes: [CRIPTO],
		trecho: 'Fundos negociados em bolsa somaram a maior captação semanal do ano.',
		resumoIA:
			'O bitcoin subiu para a máxima do mês com dinheiro novo entrando em fundos de índice. Movimentos assim costumam vir com mais volatilidade.',
		temas: ['bitcoin'],
		impacto: 72,
		bafafa: false,
		ativos: [{ ticker: 'BTC', motivo: 'você tem bitcoin na carteira' }],
		espaco: 'cripto',
		canais: ['noticias']
	},
	{
		id: 'c3',
		minutos: 90,
		titulo: 'Ágio do USDT em reais sobe e indica procura por dólar digital',
		fontes: [CRIPTO],
		trecho: 'Diferença contra o dólar oficial chegou ao maior nível em dois meses.',
		resumoIA:
			'O USDT está sendo negociado acima do dólar oficial no Brasil, sinal de mais gente buscando dólar por cripto.',
		temas: ['stablecoins', 'câmbio'],
		impacto: 55,
		bafafa: false,
		ativos: [],
		espaco: 'cripto',
		canais: ['stablecoins']
	},
	{
		id: 'c4',
		minutos: 180,
		titulo: 'Rede Ethereum conclui atualização sem interrupções',
		fontes: [CRIPTO, RADAR],
		trecho: 'Mudança reduz custo de transações em redes de segunda camada.',
		temas: ['ethereum'],
		impacto: 57,
		bafafa: false,
		ativos: [{ ticker: 'ETH', motivo: 'você tem ether na carteira' }],
		espaco: 'cripto',
		canais: ['noticias']
	},
	{
		id: 'c5',
		minutos: 400,
		titulo: 'Coleção de NFTs de arte generativa triplica o volume semanal',
		fontes: [CRIPTO],
		trecho: 'Preço mínimo da coleção subiu 40% em sete dias.',
		temas: ['NFT'],
		impacto: 34,
		bafafa: false,
		ativos: [],
		espaco: 'cripto',
		canais: ['nft']
	},
	{
		id: 't1',
		minutos: 25,
		titulo: 'Nvidia apresenta nova geração de chips para centros de dados de IA',
		fontes: [RADAR, MERCADO, GAZETA, OFICIAL, CRIPTO],
		trecho: 'Empresa promete o dobro de desempenho por watt em relação à geração anterior.',
		resumoIA:
			'A Nvidia mostrou chips novos para treinar e rodar modelos de IA, com mais desempenho por energia gasta. Fornecedores e clientes de nuvem acompanham de perto.',
		temas: ['chips', 'IA'],
		impacto: 88,
		bafafa: true,
		ativos: [
			{ ticker: 'NVDA', motivo: 'ação da Nvidia nos EUA' },
			{ ticker: 'NVDC34', motivo: 'BDR da Nvidia na B3' }
		],
		espaco: 'tecnologia',
		canais: ['chips', 'big-techs']
	},
	{
		id: 't2',
		minutos: 70,
		titulo: 'Modelo de IA aberto de 8 bilhões de parâmetros supera rivais maiores em português',
		fontes: [RADAR],
		trecho: 'Testes independentes avaliaram compreensão de texto e raciocínio.',
		resumoIA:
			'Um modelo aberto e pequeno teve resultados melhores que modelos maiores em testes em português. Modelos assim rodam no próprio computador.',
		temas: ['IA', 'código aberto'],
		impacto: 62,
		bafafa: false,
		ativos: [],
		espaco: 'tecnologia',
		canais: ['ia']
	},
	{
		id: 't3',
		minutos: 140,
		titulo: 'Big techs ampliam investimentos em energia para centros de dados de IA',
		fontes: [MERCADO, RADAR],
		trecho: 'Contratos de longo prazo com usinas somam dezenas de gigawatts.',
		resumoIA:
			'Grandes empresas de tecnologia estão fechando contratos de energia de longo prazo para alimentar a IA. O gasto pesa no caixa, mas garante capacidade.',
		temas: ['big techs', 'energia'],
		impacto: 66,
		bafafa: false,
		ativos: [
			{ ticker: 'MSFT', motivo: 'investimento citado na notícia' },
			{ ticker: 'GOOGL', motivo: 'investimento citado na notícia' }
		],
		espaco: 'tecnologia',
		canais: ['big-techs', 'ia']
	},
	{
		id: 't4',
		minutos: 240,
		titulo: 'Projeto de agente de programação ganha 4 mil estrelas no GitHub em dois dias',
		fontes: [RADAR],
		trecho: 'Ferramenta automatiza revisão de código e testes.',
		resumoIA: 'Um agente de programação de código aberto virou destaque no GitHub em dois dias.',
		temas: ['GitHub', 'agentes'],
		impacto: 50,
		bafafa: false,
		ativos: [],
		espaco: 'tecnologia',
		canais: ['github-radar']
	},
	{
		id: 't5',
		minutos: 360,
		titulo: 'Artigo propõe método para reduzir respostas inventadas em modelos de linguagem',
		fontes: [RADAR],
		trecho: 'Técnica verifica cada afirmação contra documentos de referência.',
		temas: ['IA', 'pesquisa'],
		impacto: 44,
		bafafa: false,
		ativos: [],
		espaco: 'tecnologia',
		canais: ['artigos', 'ia']
	},
	{
		id: 'g1',
		minutos: 9,
		titulo: 'Prefeituras ampliam horário de postos de saúde para a campanha de vacinação',
		fontes: [PRACA, OFICIAL],
		trecho: 'Unidades vão abrir aos sábados até o fim do mês em pelo menos 12 capitais.',
		temas: ['saúde'],
		impacto: 40,
		bafafa: false,
		ativos: [],
		espaco: 'geral',
		canais: ['brasil', 'saude']
	},
	{
		id: 'g2',
		minutos: 26,
		titulo: 'Cúpula do clima termina com acordo para financiar energia limpa em países pobres',
		fontes: [PLANETA, PRACA],
		trecho: 'Fundo deve começar a liberar recursos no segundo semestre do ano que vem.',
		temas: ['clima'],
		impacto: 55,
		bafafa: false,
		ativos: [],
		espaco: 'geral',
		canais: ['mundo', 'meio-ambiente']
	},
	{
		id: 'g3',
		minutos: 47,
		titulo: 'Seleção feminina vence na estreia e lidera o grupo da Copa América',
		fontes: [PLACAR],
		trecho: 'Gol no segundo tempo garantiu a vitória diante de um estádio lotado.',
		temas: ['futebol'],
		impacto: 35,
		bafafa: false,
		ativos: [],
		espaco: 'geral',
		canais: ['esportes']
	},
	{
		id: 'g4',
		minutos: 64,
		titulo: 'Câmara aprova projeto que muda as regras do transporte por aplicativo',
		fontes: [PRACA],
		trecho: 'Texto segue para o Senado e prevê uma contribuição mínima à previdência.',
		temas: ['política'],
		impacto: 50,
		bafafa: false,
		ativos: [],
		espaco: 'geral',
		canais: ['brasil', 'politica']
	},
	{
		id: 'g5',
		minutos: 88,
		titulo: 'Eleição antecipada no Japão deve definir o rumo da política econômica',
		fontes: [PLANETA],
		trecho: 'Pesquisas mostram disputa apertada entre os dois maiores partidos.',
		temas: ['eleições'],
		impacto: 45,
		bafafa: false,
		ativos: [],
		espaco: 'geral',
		canais: ['mundo']
	},
	{
		id: 'g6',
		minutos: 130,
		titulo: 'Pesquisadores brasileiros mapeiam novas espécies de sapos na Mata Atlântica',
		fontes: [PLANETA],
		trecho: 'Estudo descreve três espécies encontradas em áreas de serra.',
		temas: ['ciência'],
		impacto: 30,
		bafafa: false,
		ativos: [],
		espaco: 'geral',
		canais: ['ciencia', 'meio-ambiente']
	},
	{
		id: 'g7',
		minutos: 175,
		titulo: 'Corinthians anuncia reforço para o meio de campo na próxima temporada',
		fontes: [PLACAR],
		trecho: 'Jogador assina contrato de três anos e deve estrear em janeiro.',
		temas: ['futebol'],
		impacto: 25,
		bafafa: false,
		ativos: [],
		espaco: 'geral',
		canais: ['esportes']
	}
];

export const noticiasExemplo: readonly Noticia[] = lista.map(({ minutos, ...n }) => ({
	...n,
	// A primeira fonte é a mostrada no cartão: no protótipo, a oficial vai na frente.
	fontes: [...n.fontes].sort((a, b) => Number(b.primaria) - Number(a.primaria)),
	url: `https://example.com/mirante/${n.id}`,
	publicadoEm: minutosAtras(minutos)
}));

const CANAIS_GERAIS = new Set(['manchetes', 'visao-geral']);

/**
 * Notícias de um canal: o canal geral do espaço (ou nenhum canal) mostra tudo por impacto; os outros,
 * as do canal por hora.
 */
export function noticiasDoCanal(espaco: EspacoBanco | string, canal: string | null): Noticia[] {
	const doEspaco = noticiasExemplo.filter((n) => n.espaco === espaco);
	if (canal === null || CANAIS_GERAIS.has(canal))
		return [...doEspaco].sort((a, b) => b.impacto - a.impacto);
	return doEspaco
		.filter((n) => n.canais.includes(canal))
		.sort((a, b) => b.publicadoEm.localeCompare(a.publicadoEm));
}

/** Cotações de exemplo para a faixa do mercado (nomes pelo catálogo, números pelo idioma). */
export const mercadoExemplo = [
	{ nome: 'mercado.ibovespa', valor: 128_412, formato: 'pontos', pct: 0.84 },
	{ nome: 'mercado.dolar', valor: 5.41, formato: 'BRL', pct: -0.62 },
	{ nome: 'mercado.sp500', valor: 5_982, formato: 'pontos', pct: 0.31 },
	{ nome: 'mercado.bitcoin', valor: 97_240, formato: 'USD0', pct: 2.15 },
	{ nome: 'mercado.petroleo', valor: 78.3, formato: 'USD', pct: 3.12 }
] as const satisfies readonly {
	nome: ChaveMensagem;
	valor: number;
	formato: 'pontos' | 'BRL' | 'USD' | 'USD0';
	pct: number;
}[];

/** Ativo de exemplo do painel de contexto. */
export const ativoExemplo = {
	ticker: 'PETR4',
	nome: 'Petrobras PN',
	preco: 38.42,
	pct: 1.8,
	serie: [
		35.1, 35.4, 35.2, 35.8, 36.1, 35.9, 36.4, 36.2, 36.8, 37.1, 36.7, 36.9, 37.4, 37.2, 37.6, 37.3,
		37.0, 37.5, 37.9, 37.6, 37.8, 38.1, 37.7, 37.9, 38.3, 38.0, 37.8, 38.1, 37.7, 38.42
	]
} as const;

/** Conversa de exemplo do analista (texto com citações [1] e [2]). */
export const chatExemplo = {
	pergunta: 'Por que a PETR4 subiu hoje?',
	resposta: [
		{
			texto: 'Dois fatos ajudam a explicar. A empresa confirmou o calendário de dividendos\u00a0',
			citacao: 1
		},
		{
			texto:
				' e o petróleo subiu mais de 3% depois do anúncio de corte de produção dos grandes exportadores\u00a0',
			citacao: 2
		},
		{
			texto:
				'. Um dia de alta não diz muito sobre o longo prazo: preço do petróleo, política de dividendos e decisões do governo como acionista continuam sendo os principais riscos.'
		}
	],
	fontes: ['m2', 'm6']
} as const;
