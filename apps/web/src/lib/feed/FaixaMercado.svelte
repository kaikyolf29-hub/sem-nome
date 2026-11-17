<script lang="ts">
	import { formatarMoeda } from '#lib/formato.ts';
	import { i18n, t, type ChaveMensagem } from '#lib/i18n/index.ts';
	import Variacao from '#lib/ui/Variacao.svelte';

	type Item = {
		nome: ChaveMensagem;
		valor: number;
		formato: 'pontos' | 'BRL' | 'USD' | 'USD0';
		pct: number;
	};
	let { itens }: { itens: readonly Item[] } = $props();

	function valor(item: Item): string {
		if (item.formato === 'pontos')
			return new Intl.NumberFormat(i18n.idioma, { maximumFractionDigits: 0 }).format(item.valor);
		if (item.formato === 'USD0')
			return new Intl.NumberFormat(i18n.idioma, {
				style: 'currency',
				currency: 'USD',
				maximumFractionDigits: 0
			}).format(item.valor);
		return formatarMoeda(item.valor, item.formato, i18n.idioma);
	}

	// Só vira parada do Tab quando há o que rolar (celular).
	let rolo: HTMLElement | undefined = $state();
	let rolavel = $state(false);
	$effect(() => {
		if (!rolo) return;
		const medir = () => (rolavel = rolo!.scrollWidth > rolo!.clientWidth + 1);
		const obs = new ResizeObserver(medir);
		obs.observe(rolo);
		medir();
		return () => obs.disconnect();
	});
</script>

<div class="faixa-mercado">
	<!-- svelte-ignore a11y_no_noninteractive_tabindex (área que rola de lado precisa ser alcançável pelo teclado) -->
	<div
		bind:this={rolo}
		class="rolo"
		role="region"
		aria-label={t('feed.mercadoAgora')}
		tabindex={rolavel ? 0 : undefined}
	>
		<ul role="list">
			{#each itens as item (item.nome)}
				<li>
					<span class="nome">{t(item.nome)}</span>
					<span class="valor numero">{valor(item)}</span>
					<Variacao pct={item.pct} />
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.faixa-mercado {
		position: relative;
		container-type: inline-size;
		border-bottom: 1px solid var(--borda);
	}

	.rolo:focus-visible {
		outline-offset: -2px;
	}

	.rolo {
		position: relative;
		overflow-x: auto;
		scrollbar-width: none;
		/* Estreito: rola de lado, com a borda esmaecida mostrando que há mais. */
		mask-image: linear-gradient(to right, #000 calc(100% - 32px), transparent);
	}

	ul {
		display: flex;
		gap: var(--espaco-6);
		width: max-content;
		margin: 0;
		padding: var(--espaco-3) var(--espaco-8) var(--espaco-3) var(--espaco-4);
		list-style: none;
	}

	li {
		display: grid;
		gap: 2px;
		min-width: 0;
	}

	.nome {
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
		font-weight: 600;
	}

	.valor {
		font-size: var(--tipo-medio);
		font-weight: 600;
		white-space: nowrap;
	}

	li :global(.variacao) {
		font-size: var(--tipo-pequeno);
	}

	/* Largo o bastante: colunas iguais, tudo à vista, nada sobrando numa linha sozinho. */
	@container (min-width: 600px) {
		.rolo {
			mask-image: none;
		}

		ul {
			display: grid;
			grid-template-columns: repeat(5, minmax(max-content, 1fr));
			width: auto;
			padding-right: var(--espaco-4);
		}
	}
</style>
