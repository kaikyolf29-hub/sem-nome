<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import { NOME_APP } from '#lib/nome.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<title>{NOME_APP}</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
