<script lang="ts">
	import Casca from '#lib/casca/Casca.svelte';
	import PainelContexto from '#lib/painel/PainelContexto.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<Casca>
	{#snippet painel()}<PainelContexto />{/snippet}
	{@render children()}
</Casca>
