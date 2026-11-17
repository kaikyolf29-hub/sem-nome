/**
 * Fonte única do visual do Mirante. `bun run tokens` gera `tokens.gerado.css`,
 * e um teste garante que o CSS está em dia.
 * Regras (spec, seção 10): cinzas neutros (nunca azulados), um destaque neutro,
 * vermelho só na marca, alta/baixa com contraste AA.
 */
export type NomeTema = 'claro' | 'escuro' | 'preto' | 'matsu-claro' | 'matsu-escuro';

export interface PaletaTema {
	trilho: string;
	canais: string;
	conteudo: string;
	cartao: string;
	cartaoHover: string;
	borda: string;
	texto: string;
	textoFraco: string;
	destaque: string;
	textoSobreDestaque: string;
	alta: string;
	baixa: string;
	bafafa: string;
	foco: string;
}

const altaEscuro = '#4cc38a';
const baixaEscuro = '#ff7a7a';
const bafafaEscuro = '#f5a524';
const altaClaro = '#0f6e44';
const baixaClaro = '#b8232b';
const bafafaClaro = '#9a4a06';

export const temas: Record<NomeTema, PaletaTema> = {
	escuro: {
		trilho: '#141416',
		canais: '#1b1b1e',
		conteudo: '#212124',
		cartao: '#2a2a2e',
		cartaoHover: '#313136',
		borda: 'rgba(255,255,255,0.08)',
		texto: '#f2f2f3',
		textoFraco: '#a6a6ad',
		destaque: '#f2f2f3',
		textoSobreDestaque: '#141416',
		alta: altaEscuro,
		baixa: baixaEscuro,
		bafafa: bafafaEscuro,
		foco: '#f2f2f3'
	},
	preto: {
		trilho: '#000000',
		canais: '#0a0a0b',
		conteudo: '#000000',
		cartao: '#141416',
		cartaoHover: '#1c1c1f',
		borda: 'rgba(255,255,255,0.09)',
		texto: '#f2f2f3',
		textoFraco: '#a1a1a8',
		destaque: '#f2f2f3',
		textoSobreDestaque: '#000000',
		alta: altaEscuro,
		baixa: baixaEscuro,
		bafafa: bafafaEscuro,
		foco: '#f2f2f3'
	},
	claro: {
		trilho: '#e8e8eb',
		canais: '#f0f0f2',
		conteudo: '#f7f7f8',
		cartao: '#ffffff',
		cartaoHover: '#f2f2f4',
		borda: 'rgba(0,0,0,0.09)',
		texto: '#1a1a1e',
		textoFraco: '#5c5c66',
		destaque: '#1a1a1e',
		textoSobreDestaque: '#ffffff',
		alta: altaClaro,
		baixa: baixaClaro,
		bafafa: bafafaClaro,
		foco: '#1a1a1e'
	},
	// Matsu OS: guia "versão Matsu dos apps do Kaiky" (14/11/2026), vidro sólido.
	'matsu-escuro': {
		trilho: '#202022',
		canais: '#202022',
		conteudo: '#1a1a1b',
		cartao: '#262628',
		cartaoHover: '#2c2c2e',
		borda: 'rgba(255,255,255,0.07)',
		texto: '#ffffff',
		textoFraco: '#a0a0a8',
		destaque: '#ffffff',
		textoSobreDestaque: '#141416',
		alta: altaEscuro,
		baixa: baixaEscuro,
		bafafa: bafafaEscuro,
		foco: '#ffffff'
	},
	'matsu-claro': {
		trilho: '#f3f3f5',
		canais: '#f3f3f5',
		conteudo: '#f8f8f9',
		cartao: '#fafafb',
		cartaoHover: '#f1f1f3',
		borda: 'rgba(26,26,30,0.08)',
		texto: '#1a1a1e',
		textoFraco: '#6e6e78',
		destaque: '#1a1a1e',
		textoSobreDestaque: '#ffffff',
		alta: altaClaro,
		baixa: baixaClaro,
		bafafa: bafafaClaro,
		foco: '#1a1a1e'
	}
};

/** Vermelho da marca: só na logo, na tela de abertura e em /marca. */
export const marca = { base: '#E62E2D', degradeDe: '#FF3B30', degradeAte: '#C81D11' } as const;

export const raios = { pequeno: 6, medio: 9, grande: 12, enorme: 16, pilula: 999 } as const;

export const espacamentos = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const;

export const tipos = {
	legenda: 12,
	pequeno: 13,
	corpo: 14,
	medio: 16,
	titulo: 18,
	grande: 22,
	manchete: 30,
	destaque: 36
} as const;

export const movimento = {
	rapido: 140,
	medio: 200,
	lento: 250,
	curva: 'cubic-bezier(0.22, 1, 0.36, 1)',
	mola: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
} as const;
