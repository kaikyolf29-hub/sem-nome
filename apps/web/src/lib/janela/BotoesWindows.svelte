<!-- Botões do Windows 11: 46 px de largura, ícones finos de 10 px, fechar #C42B1C com X branco. -->
<script lang="ts">
	import { t } from '#lib/i18n/index.ts';

	let {
		focada,
		maximizada,
		onfechar,
		onminimizar,
		onmaximizar
	}: {
		focada: boolean;
		maximizada: boolean;
		onfechar: () => void;
		onminimizar: () => void;
		onmaximizar: () => void;
	} = $props();
</script>

<div class="botoes" class:sem-foco={!focada}>
	<button type="button" aria-label={t('janela.minimizar')} onclick={onminimizar}>
		<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M0 5.5h10" /></svg>
	</button>
	<button
		type="button"
		aria-label={t(maximizada ? 'janela.restaurar' : 'janela.maximizar')}
		onclick={onmaximizar}
	>
		<svg viewBox="0 0 10 10" aria-hidden="true">
			{#if maximizada}
				<path d="M2.5 2.5V0.5h7v7h-2M0.5 2.5h7v7h-7z" />
			{:else}
				<path d="M0.5 0.5h9v9h-9z" />
			{/if}
		</svg>
	</button>
	<button type="button" class="fechar" aria-label={t('janela.fechar')} onclick={onfechar}>
		<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M0.5 0.5l9 9M9.5 0.5l-9 9" /></svg>
	</button>
</div>

<style>
	.botoes {
		display: flex;
		height: 100%;
	}

	button {
		display: grid;
		place-items: center;
		width: 46px;
		height: 100%;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--texto);
		transition: background-color 100ms linear;
	}

	svg {
		width: 10px;
		height: 10px;
	}

	path {
		fill: none;
		stroke: currentColor;
		stroke-width: 1;
	}

	button:hover {
		background: color-mix(in srgb, var(--texto) 6%, transparent);
	}

	.fechar:hover {
		background: #c42b1c;
		color: #ffffff;
	}

	.sem-foco button:not(:hover) svg {
		opacity: 0.45;
	}
</style>
