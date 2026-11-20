<script lang="ts">
	// Coluna de notícias, igual em todos os feeds: carregando, erro, capa (manchete + "Também em
	// destaque") e lista. Os filtros da pessoa (fontes, idioma, palavras) valem aqui, no app inteiro.
	import { tick, type Snippet } from 'svelte';
	import { t } from '#lib/i18n/index.ts';
	import { preferencias } from '#lib/preferencias/estado.svelte.ts';
	import { aplicarFiltros } from '#lib/preferencias/filtros.ts';
	import CartaoNoticia from './CartaoNoticia.svelte';
	import EsqueletoFeed from './EsqueletoFeed.svelte';
	import Manchete from './Manchete.svelte';
	import TambemDestaque from './TambemDestaque.svelte';
	import type { Noticia } from './tipos.ts';

	let {
		estado,
		erro = null,
		noticias,
		capa,
		ontentar,
		vazio
	}: {
		estado: 'carregando' | 'pronto' | 'erro';
		erro?: 'rede' | 'servidor' | null;
		noticias: Noticia[];
		/** Mostra a manchete e "Também em destaque" (canal geral). */
		capa: boolean;
		ontentar: () => Promise<void>;
		/** O que aparece sem notícias (por padrão, o aviso geral). */
		vazio?: Snippet;
	} = $props();

	// Depois de "Tentar de novo" o botão some: o foco vai para as notícias (ou volta ao botão, se falhar de novo).
	let coluna = $state<HTMLElement>();
	let botaoDeNovo = $state<HTMLButtonElement>();
	async function tentarDeNovo() {
		await ontentar();
		await tick();
		if (estado === 'erro') botaoDeNovo?.focus();
		else coluna?.focus();
	}

	const visiveis = $derived(aplicarFiltros(noticias, preferencias.atual));
	const destaque = $derived(capa ? visiveis[0] : undefined);
	// Na capa: a manchete, as 3 seguintes em "Também em destaque" e o resto na lista.
	const tambem = $derived(destaque ? visiveis.slice(1, 4) : []);
	const resto = $derived(destaque ? visiveis.slice(1 + tambem.length) : visiveis);
	// "Agora" de referência dos horários ("há 5 min"): renova quando a lista muda.
	const agora = $derived.by(() => {
		void visiveis;
		return new Date();
	});
</script>

<!-- Coluna de leitura no centro da área: sem vão de um lado só quando o painel fecha. -->
<div class="coluna" bind:this={coluna} tabindex="-1">
	{#if estado === 'carregando'}
		<EsqueletoFeed comManchete={capa} />
	{:else if estado === 'erro'}
		<div class="falha" role="alert">
			<p>{t(erro === 'rede' ? 'feed.erroRede' : 'feed.erroServidor')}</p>
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
			{#if vazio}{@render vazio()}{:else}<p class="vazio">{t('feed.vazio')}</p>{/if}
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
