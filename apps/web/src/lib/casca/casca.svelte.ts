import { MediaQuery } from 'svelte/reactivity';

export type QualGaveta = 'canais' | 'painel' | null;

function criarCasca() {
	let gaveta = $state<QualGaveta>(null);
	let painelAberto = $state(true);
	let ajustesAberto = $state(false);
	const celular = new MediaQuery('max-width: 767.98px', false);
	const largo = new MediaQuery('min-width: 1280px', true);

	return {
		get gaveta() {
			return gaveta;
		},
		/** Painel de contexto fixo na grade (telas ≥ 1280 px). */
		get painelNaGrade() {
			return largo.current && painelAberto;
		},
		get painelAberto() {
			return painelAberto;
		},
		get celular() {
			return celular.current;
		},
		get largo() {
			return largo.current;
		},
		get ajustesAberto() {
			return ajustesAberto;
		},
		set ajustesAberto(v: boolean) {
			ajustesAberto = v;
		},
		abrir(g: Exclude<QualGaveta, null>) {
			gaveta = g;
		},
		fechar() {
			gaveta = null;
		},
		/** Em tela larga alterna o painel na grade; nas outras abre a gaveta da direita. */
		alternarPainel() {
			if (largo.current) painelAberto = !painelAberto;
			else gaveta = gaveta === 'painel' ? null : 'painel';
		}
	};
}

export const casca = criarCasca();
