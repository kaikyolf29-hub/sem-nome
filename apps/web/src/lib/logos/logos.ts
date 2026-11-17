import { siBitcoin, siEthereum, siGoogle, siNvidia, siTether } from 'simple-icons';

// Logos dos ativos: a marca real quando existe no simple-icons (licença CC0) e, quando não existe,
// uma logo própria com a sigla do ativo numa cor fixa. No app real, logos de ações da B3 virão do
// provedor de cotações; as dos veículos de notícia, do próprio site deles.

export type LogoAtivo =
	| { tipo: 'marca'; nome: string; caminho: string; cor: string }
	| { tipo: 'sigla'; sigla: string; cor: string };

const marcas: Record<string, { title: string; path: string; hex: string }> = {
	BTC: siBitcoin,
	ETH: siEthereum,
	USDT: siTether,
	NVDA: siNvidia,
	NVDC34: siNvidia,
	GOOGL: siGoogle,
	GOOG: siGoogle
};

/** Cores calmas para as logos próprias (todas com contraste ≥ 3 para a sigla branca). */
const CORES = [
	'#3d5a80',
	'#2f6b4f',
	'#7a4b2a',
	'#5b4b8a',
	'#8a3b4f',
	'#2c6a7a',
	'#6b5b2c',
	'#4a5568'
];

function hash(texto: string): number {
	let h = 0;
	for (const c of texto) h = (h * 31 + c.charCodeAt(0)) >>> 0;
	return h;
}

/** Sigla curta: uma letra para tickers da B3 com 4 letras + número; duas para os demais. */
function sigla(ticker: string): string {
	const palavras = ticker.trim().split(/\s+/);
	if (palavras.length > 1) return (palavras[0][0] + palavras[1][0]).toUpperCase();
	const letras = ticker.replace(/[^a-z]/gi, '').toUpperCase();
	if (/^[A-Z]{4}\d$/.test(ticker)) return letras[0];
	return letras.slice(0, 2);
}

export function logoAtivo(ticker: string): LogoAtivo {
	const m = marcas[ticker.toUpperCase()];
	if (m) return { tipo: 'marca', nome: m.title, caminho: m.path, cor: `#${m.hex}` };
	return { tipo: 'sigla', sigla: sigla(ticker), cor: CORES[hash(ticker) % CORES.length] };
}
