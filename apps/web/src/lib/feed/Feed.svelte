<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import type { IdEspaco } from '#lib/navegacao/espacos.ts';
	import { mercadoExemplo, noticiasDoCanal } from '#lib/prototipo/exemplos.ts';
	import CartaoNoticia from './CartaoNoticia.svelte';
	import FaixaMercado from './FaixaMercado.svelte';
	import Manchete from './Manchete.svelte';
	import TambemDestaque from './TambemDestaque.svelte';

	let { espaco, canal }: { espaco: IdEspaco; canal: string } = $props();

	const noticias = $derived(noticiasDoCanal(espaco, canal));
	const geral = $derived(canal === 'manchetes' || canal === 'visao-geral');
	const destaque = $derived(geral ? noticias[0] : undefined);
	// Na capa (canal geral): a manchete, as 3 seguintes em "Também em destaque" e o resto na lista.
	const tambem = $derived(destaque ? noticias.slice(1, 4) : []);
	const resto = $derived(destaque ? noticias.slice(1 + tambem.length) : noticias);
	const agora = new Date();
</script>

{#if espaco === 'mercado' && geral}
	<FaixaMercado itens={mercadoExemplo} />
{/if}

<!-- Coluna de leitura no centro da área: sem vão de um lado só quando o painel fecha. -->
<div class="coluna">
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
</div>

<style>
	.coluna {
		container-type: inline-size;
		max-width: 1180px;
		margin-inline: auto;
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

	.vazio {
		max-width: 48ch;
		padding: var(--espaco-10) var(--espaco-6);
		color: var(--texto-fraco);
	}
</style>
