import {
	armazenamentoLocal,
	lerPreferencia,
	resolverTema,
	salvarPreferencia,
	type PreferenciaTema
} from './tema.ts';

const consulta = '(prefers-color-scheme: dark)';

function criarTema() {
	const noNavegador = typeof window !== 'undefined';
	const midia = noNavegador ? window.matchMedia(consulta) : null;

	let preferencia = $state<PreferenciaTema>(lerPreferencia(armazenamentoLocal()));
	let sistemaEscuro = $state(midia?.matches ?? true);
	let matsu = $state(false);
	const nome = $derived(resolverTema(preferencia, sistemaEscuro, matsu));

	midia?.addEventListener('change', (e) => (sistemaEscuro = e.matches));

	if (noNavegador) {
		$effect.root(() => {
			$effect(() => {
				document.documentElement.dataset.tema = nome;
			});
		});
	}

	return {
		get preferencia() {
			return preferencia;
		},
		get matsu() {
			return matsu;
		},
		set matsu(v: boolean) {
			matsu = v;
		},
		get nome() {
			return nome;
		},
		definir(p: PreferenciaTema) {
			preferencia = p;
			salvarPreferencia(armazenamentoLocal(), p);
		}
	};
}

export const tema = criarTema();
