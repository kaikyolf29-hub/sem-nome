<script lang="ts">
	import Coins from '@lucide/svelte/icons/coins';
	import Landmark from '@lucide/svelte/icons/landmark';
	import Radar from '@lucide/svelte/icons/radar';
	import type { FonteNoticia } from './tipos.ts';

	let { fonte, tamanho = 40 }: { fonte: FonteNoticia; tamanho?: number } = $props();

	// Fonte oficial: prédio público. Veículo com marca: a cor e o símbolo dele. Sem marca: a inicial, serifada.
	const letra = $derived(
		fonte.nome
			.replace(/^(o|a|the)\s+/i, '')
			.charAt(0)
			.toUpperCase()
	);
	const marca = $derived(fonte.marca);
	const icone = $derived(Math.round(tamanho * 0.5));
</script>

<span
	class="marca-fonte"
	class:oficial={fonte.primaria}
	class:sigla-longa={(marca?.sigla?.length ?? 1) > 1}
	style:width="{tamanho}px"
	style:height="{tamanho}px"
	style:background={!fonte.primaria && marca ? marca.cor : undefined}
	style:color={!fonte.primaria && marca ? '#ffffff' : undefined}
	style:font-size="{Math.round(tamanho * ((marca?.sigla?.length ?? 1) > 1 ? 0.36 : 0.55))}px"
	aria-hidden="true"
>
	{#if fonte.primaria}
		<Landmark size={icone} strokeWidth={1.75} />
	{:else if marca?.icone === 'radar'}
		<Radar size={icone} strokeWidth={2} />
	{:else if marca?.icone === 'cripto'}
		<Coins size={icone} strokeWidth={2} />
	{:else}
		{marca?.sigla ?? letra}
	{/if}
</span>

<style>
	.marca-fonte {
		display: grid;
		place-items: center;
		flex: none;
		border-radius: 10px;
		background: var(--cartao);
		color: var(--texto);
		font-family: var(--fonte-manchete);
		font-weight: 600;
		line-height: 1;
	}

	.sigla-longa {
		font-family: var(--fonte-ui);
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.oficial {
		background: var(--destaque);
		color: var(--texto-sobre-destaque);
	}
</style>
