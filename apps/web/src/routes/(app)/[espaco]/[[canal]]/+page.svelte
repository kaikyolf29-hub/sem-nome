<script lang="ts">
	import { page } from '$app/state';
	import ResumoCarteira from '#lib/carteira/ResumoCarteira.svelte';
	import Feed from '#lib/feed/Feed.svelte';
	import EstadoVazio from '#lib/ui/EstadoVazio.svelte';
	import { localizar } from '#lib/navegacao/espacos.ts';
	import FaixaPrototipo from '#lib/prototipo/FaixaPrototipo.svelte';
	import { irParaPadrao } from '#lib/navegacao/ir-padrao.ts';

	const local = $derived(localizar(page.params.espaco ?? '', page.params.canal));

	// Fase do Mirante em que cada espaço sem conteúdo chega (spec, seção 16).
	const fases: Record<string, number> = { carteira: 3, daytrade: 5, agenda: 6, salvos: 1 };

	$effect(() => {
		if (!local) irParaPadrao();
	});
</script>

<FaixaPrototipo />

{#if local}
	{#if ['mercado', 'cripto', 'tecnologia'].includes(local.espaco.id)}
		<Feed espaco={local.espaco.id} canal={local.canal.id} />
	{:else if local.espaco.id === 'carteira' && local.canal.id === 'visao-geral'}
		<ResumoCarteira />
	{:else}
		<EstadoVazio fase={fases[local.espaco.id] ?? 1} />
	{/if}
{/if}
