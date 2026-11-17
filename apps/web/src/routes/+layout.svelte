<script lang="ts">
	import '@fontsource-variable/inter/wght.css';
	import '@fontsource-variable/jetbrains-mono/wght.css';
	import '@fontsource-variable/newsreader/wght.css';
	import '#lib/design/tokens.gerado.css';
	import '#lib/design/base.css';
	import favicon from '#lib/assets/favicon.svg';
	import { NOME_APP } from '#lib/nome.ts';
	import { tema } from '#lib/design/tema.svelte.ts';

	// Liga o estado do tema (escuta o sistema e escreve data-tema).
	void tema.nome;
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<title>{NOME_APP}</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
