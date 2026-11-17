<!--
	Botões da janela integrados ao próprio app, como nos apps nativos (sem faixa separada com o nome):
	no Matsu, as bolinhas no canto de cima à esquerda; no Windows, os três botões no canto de cima à direita.
-->
<script lang="ts">
	import { tema } from '#lib/design/tema.svelte.ts';
	import BotoesMatsu from './BotoesMatsu.svelte';
	import BotoesWindows from './BotoesWindows.svelte';
	import { janela } from './janela.svelte.ts';

	const alternar = () => (janela.maximizada = !janela.maximizada);
	const nada = () => {};
	const temaMatsu = $derived(tema.nome === 'matsu-claro' ? 'claro' : 'escuro');
</script>

{#if janela.modo === 'matsu'}
	<div class="controles matsu">
		<BotoesMatsu
			focada={janela.focada}
			maximizada={janela.maximizada}
			lado="esquerda"
			tema={temaMatsu}
			onfechar={nada}
			onminimizar={nada}
			ontelacheia={alternar}
		/>
	</div>
{:else if janela.modo === 'windows'}
	<div class="controles windows">
		<BotoesWindows
			focada={janela.focada}
			maximizada={janela.maximizada}
			onfechar={nada}
			onminimizar={nada}
			onmaximizar={alternar}
		/>
	</div>
{/if}

<style>
	.controles {
		position: absolute;
		z-index: 65;
	}

	/* Guia Matsu: primeira bolinha a 14 px da borda, centrada na faixa de 48 px do topo. */
	.matsu {
		top: 15px;
		left: 14px;
	}

	.windows {
		top: 0;
		right: 0;
		height: 48px;
	}
</style>
