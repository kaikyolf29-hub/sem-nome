<script lang="ts">
	import '@fontsource-variable/inter/wght.css';
	import '@fontsource-variable/jetbrains-mono/wght.css';
	import '@fontsource-variable/newsreader/wght.css';
	import '#lib/design/tokens.gerado.css';
	import '#lib/design/base.css';
	import faviconSvg from '#lib/assets/favicon.svg?raw';
	import { tema } from '#lib/design/tema.svelte.ts';
	import { sessao } from '#lib/conta/estado.svelte.ts';
	import { preferencias } from '#lib/preferencias/estado.svelte.ts';
	import { ligarConta } from '#lib/preferencias/ligar-conta.svelte.ts';
	import type { LayoutProps } from './$types';

	// Liga o estado do tema (escuta o sistema e escreve data-tema).
	void tema.nome;

	// Lê a sessão salva (ou a volta do Google) uma vez, ao abrir o app.
	$effect(() => {
		sessao.iniciar();
	});

	// Com a conta ligada, as escolhas de notícias seguem a pessoa em qualquer aparelho.
	ligarConta(sessao, preferencias);

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href="data:image/svg+xml,{encodeURIComponent(faviconSvg)}" />
</svelte:head>

{@render children()}
