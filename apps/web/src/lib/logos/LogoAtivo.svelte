<script lang="ts">
	import { logoAtivo } from './logos.ts';

	let { ticker, tamanho = 20 }: { ticker: string; tamanho?: number } = $props();

	const logo = $derived(logoAtivo(ticker));
</script>

<span
	class="logo-ativo"
	data-logo={logo.tipo}
	style:width="{tamanho}px"
	style:height="{tamanho}px"
	style:background={logo.cor}
	style:font-size="{Math.round(
		tamanho * (logo.tipo === 'sigla' && logo.sigla.length > 1 ? 0.4 : 0.5)
	)}px"
	aria-hidden="true"
>
	{#if logo.tipo === 'marca'}
		<svg viewBox="0 0 24 24" width={Math.round(tamanho * 0.58)} height={Math.round(tamanho * 0.58)}>
			<path d={logo.caminho} />
		</svg>
	{:else}
		{logo.sigla}
	{/if}
</span>

<style>
	.logo-ativo {
		display: inline-grid;
		place-items: center;
		flex: none;
		border-radius: 50%;
		color: #ffffff;
		font-weight: 700;
		line-height: 1;
		letter-spacing: 0.01em;
	}

	svg {
		display: block;
		fill: #ffffff;
	}
</style>
