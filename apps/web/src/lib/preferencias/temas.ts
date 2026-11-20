import type { ChaveMensagem } from '#lib/i18n/index.ts';

export interface Tema {
	id: string;
	rotulo: ChaveMensagem;
	icone: string;
	origens: { espaco: 'mercado' | 'cripto' | 'tecnologia' | 'geral'; canal: string | null }[];
}

const geral = (canal: string) => [{ espaco: 'geral' as const, canal }];

export const TEMAS: readonly Tema[] = [
	{
		id: 'mercado',
		rotulo: 'temas.mercado',
		icone: 'newspaper',
		origens: [{ espaco: 'mercado', canal: 'manchetes' }]
	},
	{
		id: 'cripto',
		rotulo: 'temas.cripto',
		icone: 'bitcoin',
		origens: [{ espaco: 'cripto', canal: null }]
	},
	{
		id: 'tecnologia',
		rotulo: 'temas.tecnologia',
		icone: 'cpu',
		origens: [{ espaco: 'tecnologia', canal: null }]
	},
	{ id: 'brasil', rotulo: 'temas.brasil', icone: 'map', origens: geral('brasil') },
	{ id: 'politica', rotulo: 'temas.politica', icone: 'landmark', origens: geral('politica') },
	{
		id: 'mundo',
		rotulo: 'temas.mundo',
		icone: 'globe',
		origens: [...geral('mundo'), { espaco: 'mercado', canal: 'mundo' }]
	},
	{ id: 'esportes', rotulo: 'temas.esportes', icone: 'trophy', origens: geral('esportes') },
	{ id: 'ciencia', rotulo: 'temas.ciencia', icone: 'flask-conical', origens: geral('ciencia') },
	{ id: 'saude', rotulo: 'temas.saude', icone: 'heart-pulse', origens: geral('saude') },
	{ id: 'educacao', rotulo: 'temas.educacao', icone: 'graduation-cap', origens: geral('educacao') },
	{ id: 'cultura', rotulo: 'temas.cultura', icone: 'clapperboard', origens: geral('cultura') },
	{
		id: 'meio-ambiente',
		rotulo: 'temas.meioAmbiente',
		icone: 'leaf',
		origens: geral('meio-ambiente')
	},
	{ id: 'justica', rotulo: 'temas.justica', icone: 'scale', origens: geral('justica') },
	{ id: 'carros', rotulo: 'temas.carros', icone: 'car', origens: geral('carros') },
	{ id: 'viagem', rotulo: 'temas.viagem', icone: 'plane', origens: geral('viagem') }
];

export const TEMAS_PADRAO: string[] = ['mercado', 'brasil', 'mundo', 'tecnologia'];
