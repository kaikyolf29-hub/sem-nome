<script lang="ts">
	import Landmark from '@lucide/svelte/icons/landmark';
	import type { FonteNoticia } from './tipos.ts';

	let { fonte, tamanho = 40 }: { fonte: FonteNoticia; tamanho?: number } = $props();

	// Letra de "jornal" (serifada) para veículos; prédio público para fontes oficiais.
	const letra = $derived(
		fonte.nome
			.replace(/^(o|a|the)\s+/i, '')
			.charAt(0)
			.toUpperCase()
	);
</script>

<span
	class="marca"
	class:oficial={fonte.primaria}
	style:width="{tamanho}px"
	style:height="{tamanho}px"
	aria-hidden="true"
>
	{#if fonte.primaria}
		<Landmark size={Math.round(tamanho * 0.48)} strokeWidth={1.75} />
	{:else}
		{letra}
	{/if}
</span>

<style>
	.marca {
		display: grid;
		place-items: center;
		flex: none;
		border-radius: 10px;
		background: var(--cartao);
		color: var(--texto);
		font-family: var(--fonte-manchete);
		font-size: 22px;
		font-weight: 600;
		line-height: 1;
	}

	.oficial {
		background: var(--destaque);
		color: var(--texto-sobre-destaque);
	}
</style>
