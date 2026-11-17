<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import { tema } from '#lib/design/tema.svelte.ts';
	import { NOME_APP } from '#lib/nome.ts';
	import BotoesMatsu from './BotoesMatsu.svelte';
	import BotoesWindows from './BotoesWindows.svelte';
	import { janela } from './janela.svelte.ts';

	const alternar = () => (janela.maximizada = !janela.maximizada);
	const nada = () => {};
	const temaMatsu = $derived(tema.nome === 'matsu-claro' ? 'claro' : 'escuro');
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="barra {janela.modo}" data-tauri-drag-region ondblclick={alternar}>
	{#if janela.modo === 'matsu'}
		<div class="matsu-botoes">
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
	{/if}
	<span class="nome" data-tauri-drag-region>
		<img src={favicon} alt="" width="16" height="16" />
		{NOME_APP}
	</span>
	{#if janela.modo === 'windows'}
		<div class="windows-botoes">
			<BotoesWindows
				focada={janela.focada}
				maximizada={janela.maximizada}
				onfechar={nada}
				onminimizar={nada}
				onmaximizar={alternar}
			/>
		</div>
	{/if}
</div>

<style>
	.barra {
		display: flex;
		align-items: center;
		gap: var(--espaco-3);
		height: 48px;
		background: var(--trilho);
		border-bottom: 1px solid var(--borda);
		user-select: none;
		flex: none;
	}

	.barra.windows {
		height: 40px;
		padding-left: var(--espaco-4);
	}

	.matsu-botoes {
		padding-left: 14px;
	}

	.nome {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: var(--tipo-pequeno);
		font-weight: 600;
	}

	.nome img {
		border-radius: 4px;
	}

	.windows-botoes {
		height: 100%;
		margin-left: auto;
	}
</style>
