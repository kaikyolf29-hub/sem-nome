// Tipos da coleta de notícias. Mesmos nomes das colunas do banco (supabase/migrations/*_noticias.sql).

export type TipoFonte = 'rss' | 'atom' | 'ibge';
export type Espaco = 'mercado' | 'cripto' | 'tecnologia';
export type Idioma = 'pt-BR' | 'en';

export interface Fonte {
	id: string;
	nome: string;
	tipo: TipoFonte;
	endereco: string;
	idioma: Idioma;
	primaria: boolean;
	espaco: Espaco;
	canais: string[];
	intervalo_min: number;
}

/** O que sai do feed, antes de limpar. */
export interface ItemBruto {
	titulo: string;
	url: string;
	trecho: string;
	/** Data como veio da fonte; null quando não veio. */
	publicadoEm: string | null;
}

/** Notícia limpa, pronta para gravar. */
export interface ItemPronto {
	url: string;
	titulo: string;
	trecho: string;
	/** ISO 8601 em UTC. */
	publicadoEm: string;
	idioma: Idioma;
	espaco: Espaco;
	canais: string[];
	assinatura: string[];
}
