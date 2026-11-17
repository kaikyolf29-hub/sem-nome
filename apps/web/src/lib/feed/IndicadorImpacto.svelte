<script lang="ts">
	import { t } from '#lib/i18n/index.ts';

	let { valor }: { valor: number } = $props();

	const acesas = $derived(Math.max(1, Math.min(5, Math.ceil(valor / 20))));
	const rotulo = $derived(
		t(valor <= 40 ? 'feed.impacto.baixo' : valor <= 70 ? 'feed.impacto.medio' : 'feed.impacto.alto')
	);
</script>

<span class="impacto" role="img" aria-label={rotulo} title={rotulo}>
	{#each [1, 2, 3, 4, 5] as n (n)}
		<span class="barra" class:acesa={n <= acesas} style:height="{4 + n * 2}px"></span>
	{/each}
</span>

<style>
	.impacto {
		display: inline-flex;
		align-items: flex-end;
		gap: 2px;
		height: 14px;
	}

	.barra {
		width: 3px;
		border-radius: 1px;
		background: var(--borda);
	}

	.barra.acesa {
		background: var(--texto-fraco);
	}
</style>
