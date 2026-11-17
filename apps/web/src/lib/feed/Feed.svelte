<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import type { IdEspaco } from '#lib/navegacao/espacos.ts';
	import { mercadoExemplo, noticiasDoCanal } from '#lib/prototipo/exemplos.ts';
	import CartaoNoticia from './CartaoNoticia.svelte';
	import FaixaMercado from './FaixaMercado.svelte';
	import Manchete from './Manchete.svelte';

	let { espaco, canal }: { espaco: IdEspaco; canal: string } = $props();

	const noticias = $derived(noticiasDoCanal(espaco, canal));
	const geral = $derived(canal === 'manchetes' || canal === 'visao-geral');
	const destaque = $derived(geral ? noticias[0] : undefined);
	const resto = $derived(destaque ? noticias.slice(1) : noticias);
	const agora = new Date();
</script>

{#if espaco === 'mercado' && geral}
	<FaixaMercado itens={mercadoExemplo} />
{/if}

{#if destaque}
	<Manchete noticia={destaque} />
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

<style>
	.lista {
		display: grid;
		gap: 2px;
		max-width: 820px;
		padding: var(--espaco-2) var(--espaco-2) var(--espaco-10);
		border-top: 1px solid var(--borda);
	}

	.vazio {
		max-width: 48ch;
		padding: var(--espaco-10) var(--espaco-6);
		color: var(--texto-fraco);
	}
</style>
