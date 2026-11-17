<script lang="ts">
	import { page } from '$app/state';
	import Feed from '#lib/feed/Feed.svelte';
	import { localizar } from '#lib/navegacao/espacos.ts';
	import FaixaPrototipo from '#lib/prototipo/FaixaPrototipo.svelte';
	import { irParaPadrao } from '#lib/navegacao/ir-padrao.ts';

	const local = $derived(localizar(page.params.espaco ?? '', page.params.canal));

	$effect(() => {
		if (!local) irParaPadrao();
	});
</script>

<FaixaPrototipo />

{#if local && ['mercado', 'cripto', 'tecnologia'].includes(local.espaco.id)}
	<Feed espaco={local.espaco.id} canal={local.canal.id} />
{/if}
