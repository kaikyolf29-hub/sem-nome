/** Espaço das notícias no banco: os três de notícias e o `geral`, dos temas gerais (fase 1B). */
export type EspacoBanco = 'mercado' | 'cripto' | 'tecnologia' | 'geral';

/** Forma da notícia que o banco da fase 1 vai seguir. */
export interface FonteNoticia {
	/** Identificador da fonte no banco (para esconder fontes). */
	id?: string;
	nome: string;
	url: string;
	primaria: boolean;
	/** Logo do próprio site (imagem quadrada em static/fontes). */
	logo?: string;
	/** Marca desenhada, para quem não tem logo (como os veículos de exemplo do protótipo). */
	marca?: { cor: string; sigla?: string; icone?: 'radar' | 'cripto' };
}

export interface AtivoLigado {
	ticker: string;
	motivo: string;
}

export interface Noticia {
	id: string;
	titulo: string;
	url: string;
	/** A primeira é a fonte do título e do link; as outras também cobriram o fato. */
	fontes: FonteNoticia[];
	/** ISO 8601. */
	publicadoEm: string;
	trecho: string;
	/** Idioma do título mostrado. */
	idioma?: 'pt-BR' | 'en';
	resumoIA?: string;
	temas: string[];
	/** 0 a 100. */
	impacto: number;
	bafafa: boolean;
	ativos: AtivoLigado[];
	espaco: EspacoBanco;
	canais: string[];
}
