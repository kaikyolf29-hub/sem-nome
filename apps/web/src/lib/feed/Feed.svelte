<script lang="ts">
	import { criarFeed, vigiarVolta } from '#lib/noticias/feed.svelte.ts';
	import { buscarFeed } from '#lib/noticias/dados.ts';
	import { mercadoExemplo, noticiasDoCanal } from '#lib/prototipo/exemplos.ts';
	import ColunaFeed from './ColunaFeed.svelte';
	import FaixaMercado from './FaixaMercado.svelte';
	import type { EspacoBanco } from './tipos.ts';

	let { espaco, canal }: { espaco: EspacoBanco; canal: string } = $props();

	// Protótipo: notícias de exemplo, sem rede. Site e app: as notícias de verdade.
	const real = __PROTOTIPO__ ? null : criarFeed(buscarFeed);

	$effect(() => {
		void real?.carregar(espaco, canal);
	});

	$effect(() => vigiarVolta(real));

	const geral = $derived(canal === 'manchetes' || canal === 'visao-geral');
</script>

{#if espaco === 'mercado' && geral}
	<FaixaMercado itens={mercadoExemplo} />
{/if}

<ColunaFeed
	estado={real ? real.estado : 'pronto'}
	erro={real?.erro}
	noticias={real ? real.noticias : noticiasDoCanal(espaco, canal)}
	capa={geral}
	ontentar={async () => {
		await real?.carregar(espaco, canal);
	}}
/>
