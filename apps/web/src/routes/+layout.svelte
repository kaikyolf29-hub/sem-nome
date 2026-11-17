<script lang="ts">
	import '@fontsource-variable/inter/wght.css';
	import '@fontsource-variable/jetbrains-mono/wght.css';
	import '@fontsource-variable/newsreader/wght.css';
	import '#lib/design/tokens.gerado.css';
	import '#lib/design/base.css';
	import favicon from '#lib/assets/favicon.svg';
	import { tema } from '#lib/design/tema.svelte.ts';
	import type { LayoutProps } from './$types';

	// Liga o estado do tema (escuta o sistema e escreve data-tema).
	void tema.nome;

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
