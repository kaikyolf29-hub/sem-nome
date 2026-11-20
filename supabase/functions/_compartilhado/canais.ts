// Espaço e canais de cada notícia, por palavras (a IA da fase 2 refina depois).
// Os padrões são expressões aplicadas ao texto sem acento e em minúsculas, como palavra inteira.
// Fora de propósito: "vale" (vale a pena), "meta" (meta fiscal), "ira" (irá) e "ai" (aí).
import { semAcento, temPalavra } from './texto.ts';
import type { Espaco, Fonte } from './tipos.ts';

export const CRIPTO = [
	'bitcoins?',
	'btc',
	'ethereum',
	'ether',
	'eth',
	'cripto\\w*',
	'crypto\\w*',
	'stablecoins?',
	'nfts?',
	'blockchain',
	'solana',
	'binance',
	'xrp',
	'tether',
	'usdt',
	'usdc',
	'defi',
	'memecoins?',
	'altcoins?',
	'coinbase',
	'web3'
];
export const STABLECOINS = ['stablecoins?', 'tether', 'usdt', 'usdc', 'drex'];
export const NFT = ['nfts?'];

export const MERCADO: Record<string, readonly string[]> = {
	acoes: [
		'acoes',
		'acao',
		'ibovespa',
		'ibov',
		'bolsas?(?! familia)',
		'b3',
		'dividendos?',
		'jcp',
		'ipos?',
		'petrobras',
		'itau',
		'bradesco',
		'ambev',
		'embraer',
		'nasdaq',
		'dow jones',
		's&p ?500',
		'[a-z]{4}(?:3|4|5|6)'
	],
	fiis: ['fiis?', 'fundos? imobiliarios?', 'fundos? de investimento imobiliario', 'ifix'],
	etfs: ['etfs?', 'fundos? de indices?'],
	'renda-fixa': [
		'renda fixa',
		'tesouro direto',
		'tesouro selic',
		'tesouro ipca',
		'cdbs?',
		'lcis?',
		'lcas?',
		'debentures?',
		'titulos? publicos?',
		'poupanca',
		'treasuries',
		'treasury yields?'
	],
	cambio: ['dolar', 'euro', 'cambio', 'ptax', 'iene', 'libra esterlina', 'yuan', 'moeda americana'],
	commodities: [
		'petroleo',
		'brent',
		'wti',
		'minerio',
		'ouro',
		'soja',
		'milho',
		'cafe',
		'acucar',
		'commodities?',
		'gas natural',
		'cobre',
		'boi gordo',
		'opep'
	],
	macro: [
		'selic',
		'copom',
		'juros',
		'inflacao',
		'ipca',
		'igp-?m',
		'pib',
		'desemprego',
		'fiscal',
		'arcabouco',
		'banco central',
		'fed',
		'federal reserve',
		'bce',
		'fomc',
		'payroll',
		'recessao',
		'divida publica',
		'politica monetaria',
		'orcamento',
		'arrecadacao',
		'interest rates?',
		'inflation',
		'gdp'
	],
	eua: [
		'eua',
		'estados unidos',
		'fed',
		'federal reserve',
		'fomc',
		'wall street',
		'trump',
		'casa branca',
		'nasdaq',
		'dow jones',
		'treasury',
		'treasuries',
		'united states'
	],
	mundo: [
		'china',
		'chines(?:a|es)?',
		'europa',
		'europeus?',
		'zona do euro',
		'japao',
		'argentina',
		'russia',
		'ucrania',
		'bce',
		'opep',
		'fmi',
		'banco mundial',
		'g20',
		'g7',
		'oriente medio',
		'israel',
		'alemanha',
		'reino unido',
		'india',
		'mexico'
	]
};

const IA_COMUM = [
	'chatgpt',
	'openai',
	'gpt-?\\d\\w*',
	'gemini',
	'claude',
	'anthropic',
	'llms?',
	'copilot',
	'deepseek',
	'grok',
	'machine learning'
];
export const IA_PT = ['ias?', 'inteligencias? artificia(?:l|is)', 'aprendizado de maquina', 'modelos? de linguagem', ...IA_COMUM];
export const IA_EN = ['ai', 'artificial intelligence', 'genai', ...IA_COMUM];
export const CHIPS = [
	'chips?',
	'semicondutor(?:es)?',
	'semiconductors?',
	'nvidia',
	'amd',
	'intel',
	'tsmc',
	'qualcomm',
	'gpus?',
	'processador(?:es)?',
	'processors?',
	'asml',
	'micron',
	'broadcom'
];
export const BIG_TECHS = [
	'apple',
	'google',
	'alphabet',
	'microsoft',
	'amazon',
	'aws',
	'meta platforms',
	'facebook',
	'instagram',
	'whatsapp',
	'zuckerberg',
	'iphone',
	'android',
	'tesla',
	'netflix'
];

const ordenados = (canais: Set<string>) => [...canais].sort();

/** Espaço e canais. Notícia sobre cripto vai para o espaço cripto, venha de onde vier. */
export function classificar(fonte: Fonte, titulo: string, trecho: string): { espaco: Espaco; canais: string[] } {
	const noTitulo = semAcento(titulo);
	const emTudo = semAcento(`${titulo} ${trecho}`);

	if (fonte.espaco === 'cripto' || temPalavra(noTitulo, CRIPTO)) {
		const canais = new Set(fonte.espaco === 'cripto' ? fonte.canais : []);
		canais.add('noticias');
		if (temPalavra(emTudo, STABLECOINS)) canais.add('stablecoins');
		if (temPalavra(emTudo, NFT)) canais.add('nft');
		return { espaco: 'cripto', canais: ordenados(canais) };
	}

	// O canal vem só do título: o trecho cita muita coisa de passagem. Fonte geral fica só com o canal do tema.
	const canais = new Set(fonte.canais);
	if (fonte.espaco === 'mercado') {
		for (const [canal, padroes] of Object.entries(MERCADO)) if (temPalavra(noTitulo, padroes)) canais.add(canal);
	} else if (fonte.espaco === 'tecnologia') {
		if (temPalavra(noTitulo, fonte.idioma === 'en' ? IA_EN : IA_PT)) canais.add('ia');
		if (temPalavra(noTitulo, CHIPS)) canais.add('chips');
		if (temPalavra(noTitulo, BIG_TECHS)) canais.add('big-techs');
	}
	return { espaco: fonte.espaco, canais: ordenados(canais) };
}
