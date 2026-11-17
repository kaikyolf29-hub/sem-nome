import { tema } from '#lib/design/tema.svelte.ts';

export type ModoJanela = 'navegador' | 'matsu' | 'windows';

function criarJanela() {
	let modo = $state<ModoJanela>('navegador');
	let focada = $state(typeof document === 'undefined' ? true : document.hasFocus());
	let maximizada = $state(false);

	if (typeof window !== 'undefined') {
		// No protótipo o foco vem da aba; no app instalado (fase 7) virá do processo principal.
		window.addEventListener('focus', () => (focada = true));
		window.addEventListener('blur', () => (focada = false));
	}

	return {
		get modo() {
			return modo;
		},
		set modo(m: ModoJanela) {
			modo = m;
			tema.matsu = m === 'matsu';
		},
		get focada() {
			return focada;
		},
		get maximizada() {
			return maximizada;
		},
		set maximizada(v: boolean) {
			maximizada = v;
		}
	};
}

export const janela = criarJanela();
