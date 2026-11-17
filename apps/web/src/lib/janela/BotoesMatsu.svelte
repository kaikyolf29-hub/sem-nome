<!--
	Bolinhas do Matsu OS, com os valores do "GUIA: versão Matsu dos apps do Kaiky" (14/11/2026):
	círculos de 14 px em botões de 18 px, 4 px entre os botões; símbolos só com o mouse em cima do grupo;
	cinza sem foco (cor do texto a 20% no escuro, 16% no claro); apertar escurece (brilho 82%).
-->
<script lang="ts">
	import { t } from '#lib/i18n/index.ts';

	let {
		focada,
		maximizada,
		lado,
		tema,
		onfechar,
		onminimizar,
		ontelacheia
	}: {
		focada: boolean;
		maximizada: boolean;
		lado: 'esquerda' | 'direita';
		tema: 'claro' | 'escuro';
		onfechar: () => void;
		onminimizar: () => void;
		ontelacheia: () => void;
	} = $props();

	type Id = 'fechar' | 'minimizar' | 'telaCheia';
	const ordem = $derived<Id[]>(
		lado === 'esquerda'
			? ['fechar', 'minimizar', 'telaCheia']
			: ['minimizar', 'telaCheia', 'fechar']
	);
	const acoes = $derived({ fechar: onfechar, minimizar: onminimizar, telaCheia: ontelacheia });
	const rotulo = (id: Id) =>
		id === 'telaCheia'
			? t(maximizada ? 'janela.sairTelaCheia' : 'janela.telaCheia')
			: t(`janela.${id}`);

	let dica = $state<Id | null>(null);
	let espera: ReturnType<typeof setTimeout> | undefined;

	function entrar(id: Id) {
		clearTimeout(espera);
		espera = setTimeout(() => (dica = id), 700);
	}

	function sair() {
		clearTimeout(espera);
		dica = null;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="botoes {tema}" class:sem-foco={!focada} ondblclick={(e) => e.stopPropagation()}>
	{#each ordem as id (id)}
		<button
			type="button"
			class={id}
			aria-label={rotulo(id)}
			onclick={acoes[id]}
			onpointerenter={() => entrar(id)}
			onpointerleave={sair}
		>
			<span class="bolinha">
				<svg class="simbolo" viewBox="0 0 14 14" aria-hidden="true">
					{#if id === 'fechar'}
						<path d="M4.5 4.5l5 5M9.5 4.5l-5 5" />
					{:else if id === 'minimizar'}
						<path d="M3.8 7h6.4" />
					{:else}
						<path class="cheio" d="M4 4h4.4L4 8.4z" />
						<path class="cheio" d="M10 10H5.6L10 5.6z" />
					{/if}
				</svg>
			</span>
			{#if dica === id}<span class="dica" role="tooltip">{rotulo(id)}</span>{/if}
		</button>
	{/each}
</div>

<style>
	.botoes {
		--contorno: rgb(0 0 0 / 0.18);
		--cinza: color-mix(in srgb, var(--texto) 20%, transparent);
		display: flex;
		gap: 4px;
	}

	.botoes.claro {
		--contorno: rgb(0 0 0 / 0.1);
		--cinza: color-mix(in srgb, var(--texto) 16%, transparent);
	}

	button {
		position: relative;
		display: grid;
		place-items: center;
		width: 18px;
		height: 18px;
		padding: 0;
		border: 0;
		background: none;
	}

	.bolinha {
		display: block;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		box-shadow: inset 0 0 0 1px var(--contorno);
		transition:
			background-color 140ms ease,
			filter 140ms ease;
	}

	.fechar .bolinha {
		background: #ff5f57;
		--simbolo: #4d0000;
	}

	.minimizar .bolinha {
		background: #febc2e;
		--simbolo: #995700;
	}

	.telaCheia .bolinha {
		background: #28c840;
		--simbolo: #006500;
	}

	.simbolo {
		display: block;
		width: 14px;
		height: 14px;
		opacity: 0;
		transform: scale(0.4);
		transition:
			opacity 200ms var(--mola),
			transform 200ms var(--mola);
	}

	.simbolo path {
		fill: none;
		stroke: var(--simbolo);
		stroke-width: 1.35;
		stroke-linecap: round;
	}

	.simbolo path.cheio {
		fill: var(--simbolo);
		stroke: none;
	}

	.botoes:hover .simbolo {
		opacity: 1;
		transform: scale(1);
	}

	button:active .bolinha {
		filter: brightness(0.82);
	}

	/* Janela em segundo plano: cinza, sem contorno; as cores voltam com o mouse. */
	.sem-foco:not(:hover) .bolinha {
		background: var(--cinza);
		box-shadow: none;
	}

	.dica {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		z-index: 70;
		padding: 4px 8px;
		border-radius: 6px;
		background: var(--destaque);
		color: var(--texto-sobre-destaque);
		font-size: 12px;
		white-space: nowrap;
		pointer-events: none;
	}
</style>
