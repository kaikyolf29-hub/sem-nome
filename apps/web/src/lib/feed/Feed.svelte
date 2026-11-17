<script lang="ts">
	import { tick } from 'svelte';
	import { t } from '#lib/i18n/index.ts';
	import type { IdEspaco } from '#lib/navegacao/espacos.ts';
	import { criarFeed } from '#lib/noticias/feed.svelte.ts';
	import { mercadoExemplo, noticiasDoCanal } from '#lib/prototipo/exemplos.ts';
	import CartaoNoticia from './CartaoNoticia.svelte';
	import EsqueletoFeed from './EsqueletoFeed.svelte';
	import FaixaMercado from './FaixaMercado.svelte';
	import Manchete from './Manchete.svelte';
	import TambemDestaque from './TambemDestaque.svelte';

	let { espaco, canal }: { espaco: IdEspaco; canal: string } = $props();

	// Protótipo: notícias de exemplo, sem rede. Site e app: as notícias de verdade.
	const real = __PROTOTIPO__ ? null : criarFeed();
	const CINCO_MINUTOS = 5 * 60_000;

	$effect(() => {
		void real?.carregar(espaco, canal);
	});

	$effect(() => {
		if (!real) return;
		const voltar = () => {
			if (document.visibilityState === 'visible') void real.atualizarSeVelho(CINCO_MINUTOS);
		};
		document.addEventListener('visibilitychange', voltar);
		return () => document.removeEventListener('visibilitychange', voltar);
	});

	const estado = $derived(real ? real.estado : 'pronto');

	// Depois de "Tentar de novo" o botão some: o foco vai para as notícias (ou volta ao botão, se falhar de novo).
	let coluna = $state<HTMLElement>();
	let botaoDeNovo = $state<HTMLButtonElement>();
	async function tentarDeNovo() {
		await real?.carregar(espaco, canal);
		await tick();
		if (real?.estado === 'erro') botaoDeNovo?.focus();
		else coluna?.focus();
	}
	const noticias = $derived(real ? real.noticias : noticiasDoCanal(espaco, canal));
	const geral = $derived(canal === 'manchetes' || canal === 'visao-geral');
	const destaque = $derived(geral ? noticias[0] : undefined);
	// Na capa (canal geral): a manchete, as 3 seguintes em "Também em destaque" e o resto na lista.
	const tambem = $derived(destaque ? noticias.slice(1, 4) : []);
	const resto = $derived(destaque ? noticias.slice(1 + tambem.length) : noticias);
	// "Agora" de referência dos horários ("há 5 min"): renova quando a lista muda.
	const agora = $derived.by(() => {
		void noticias;
		return new Date();
	});
</script>

{#if espaco === 'mercado' && geral}
	<FaixaMercado itens={mercadoExemplo} />
{/if}

<!-- Coluna de leitura no centro da área: sem vão de um lado só quando o painel fecha. -->
<div class="coluna" bind:this={coluna} tabindex="-1">
	{#if estado === 'carregando'}
		<EsqueletoFeed comManchete={geral} />
	{:else if estado === 'erro'}
		<div class="falha" role="alert">
			<p>{t(real?.erro === 'rede' ? 'feed.erroRede' : 'feed.erroServidor')}</p>
			<button type="button" bind:this={botaoDeNovo} onclick={tentarDeNovo}>
				{t('feed.tentarDeNovo')}
			</button>
		</div>
	{:else}
		{#if destaque}
			<div class="capa" class:com-tambem={tambem.length > 0}>
				<Manchete noticia={destaque} />
				{#if tambem.length > 0}<TambemDestaque noticias={tambem} {agora} />{/if}
			</div>
		{/if}

		{#if resto.length > 0}
			<div class="lista">
				{#each resto as noticia (noticia.id)}
					<CartaoNoticia {noticia} {agora} />
				{/each}
			</div>
		{:else if !destaque}
			<p class="vazio">{t('feed.vazio')}</p>
		{/if}
	{/if}
</div>

<style>
	.coluna {
		container-type: inline-size;
		max-width: 1180px;
		margin-inline: auto;
	}

	/* Foco posto pelo app (tabindex -1, fora do Tab): sem contorno em volta da coluna inteira. */
	.coluna:focus {
		outline: none;
	}

	.capa.com-tambem :global(.tambem) {
		border-top: 1px solid var(--borda);
	}

	/* Tela larga: capa de portal, manchete à esquerda e "Também em destaque" ao lado. */
	@container (min-width: 960px) {
		.capa.com-tambem {
			display: grid;
			grid-template-columns: minmax(0, 1.8fr) minmax(280px, 1fr);
			align-items: start;
		}

		.capa.com-tambem :global(.tambem) {
			margin-top: var(--espaco-8);
			padding-block: 0;
			border-top: 0;
			border-left: 1px solid var(--borda);
		}
	}

	/* Média: as três seguintes lado a lado, embaixo da manchete. */
	@container (min-width: 640px) and (max-width: 959.98px) {
		.capa.com-tambem :global(.tambem ul) {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: var(--espaco-5);
		}

		.capa.com-tambem :global(.tambem li + li) {
			border-top: 0;
		}

		.capa.com-tambem :global(.tambem article) {
			padding: 0;
		}
	}

	.lista {
		container: lista / inline-size;
		display: grid;
		gap: 2px;
		padding: var(--espaco-2) var(--espaco-2) var(--espaco-10);
		border-top: 1px solid var(--borda);
	}

	/* Celular: 4 px + o respiro do cartão (12 px) = 16 px, a mesma margem da manchete. */
	@media (max-width: 767.98px) {
		.lista {
			padding-inline: var(--espaco-1);
		}
	}

	.falha {
		display: grid;
		justify-items: center;
		gap: var(--espaco-4);
		max-width: 48ch;
		margin-inline: auto;
		padding: var(--espaco-10) var(--espaco-6);
		text-align: center;
	}

	.falha p {
		color: var(--texto);
		font-size: var(--tipo-medio);
	}

	.falha button {
		min-height: 44px;
		padding: 0 var(--espaco-5);
		border: 1px solid var(--borda);
		border-radius: 999px;
		background: var(--cartao);
		color: var(--texto);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	.falha button:hover {
		background: color-mix(in srgb, var(--texto) 6%, var(--cartao));
	}

	.vazio {
		max-width: 48ch;
		padding: var(--espaco-10) var(--espaco-6);
		color: var(--texto-fraco);
	}
</style>
