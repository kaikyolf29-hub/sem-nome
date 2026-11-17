import type { IdEspaco } from '#lib/navegacao/espacos.ts';

/** Forma da notícia que o banco da fase 1 vai seguir. */
export interface FonteNoticia {
	nome: string;
	url: string;
	primaria: boolean;
}

export interface AtivoLigado {
	ticker: string;
	motivo: string;
}

export interface Noticia {
	id: string;
	titulo: string;
	url: string;
	fontes: FonteNoticia[];
	/** ISO 8601. */
	publicadoEm: string;
	trecho: string;
	resumoIA?: string;
	temas: string[];
	/** 0 a 100. */
	impacto: number;
	bafafa: boolean;
	ativos: AtivoLigado[];
	espaco: IdEspaco;
	canais: string[];
}
