<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import Variacao from '#lib/ui/Variacao.svelte';

	let { itens }: { itens: readonly { nome: string; valor: string; pct: number }[] } = $props();
</script>

<section class="faixa-mercado" aria-label={t('feed.mercadoAgora')}>
	<ul role="list">
		{#each itens as item (item.nome)}
			<li>
				<span class="nome">{item.nome}</span>
				<span class="valor numero">{item.valor}</span>
				<Variacao pct={item.pct} />
			</li>
		{/each}
	</ul>
</section>

<style>
	.faixa-mercado {
		position: relative;
		border-bottom: 1px solid var(--borda);
		overflow-x: auto;
		scrollbar-width: none;
	}

	ul {
		display: flex;
		gap: var(--espaco-6);
		margin: 0;
		padding: var(--espaco-3) var(--espaco-4);
		list-style: none;
		width: max-content;
	}

	li {
		display: grid;
		grid-template-columns: auto auto;
		gap: 0 var(--espaco-2);
		align-items: baseline;
	}

	.nome {
		grid-column: 1 / -1;
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
		font-weight: 600;
	}

	.valor {
		font-size: var(--tipo-medio);
		font-weight: 600;
	}

	li :global(.variacao) {
		font-size: var(--tipo-pequeno);
	}
</style>
