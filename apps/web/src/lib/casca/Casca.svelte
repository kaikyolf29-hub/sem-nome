<script lang="ts">
	import Menu from '@lucide/svelte/icons/menu';
	import PanelRight from '@lucide/svelte/icons/panel-right';
	import Search from '@lucide/svelte/icons/search';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { t } from '#lib/i18n/index.ts';
	import { localizar } from '#lib/navegacao/espacos.ts';
	import { NOME_APP } from '#lib/nome.ts';
	import BarraInferior from './BarraInferior.svelte';
	import Canais from './Canais.svelte';
	import { casca } from './casca.svelte.ts';
	import Gaveta from './Gaveta.svelte';
	import Trilho from './Trilho.svelte';

	let {
		children,
		painel,
		onbuscar = () => {}
	}: { children: Snippet; painel?: Snippet; onbuscar?: () => void } = $props();

	const local = $derived(localizar(page.params.espaco ?? '', page.params.canal));
	const titulo = $derived(local ? `#${t(local.canal.rotulo)} | ${NOME_APP}` : NOME_APP);
</script>

<svelte:head>
	<title>{titulo}</title>
</svelte:head>

<div class="casca" class:com-painel={casca.painelNaGrade && painel} class:celular={casca.celular}>
	{#if !casca.celular}
		<div class="col-trilho">
			<Trilho
				ativo={local?.espaco.id ?? null}
				onajustes={() => (casca.ajustesAberto = !casca.ajustesAberto)}
			/>
		</div>
		<div class="col-canais">
			{#if local}<Canais espaco={local.espaco} canalAtivo={local.canal.id} />{/if}
		</div>
	{/if}

	<main class="col-conteudo">
		<header class="topo">
			{#if casca.celular}
				<button
					class="icone"
					type="button"
					aria-label={t('casca.abrirCanais')}
					onclick={() => casca.abrir('canais')}
				>
					<Menu size={20} strokeWidth={1.75} />
				</button>
			{/if}
			{#if local}
				<h1 class="titulo">
					<span class="hash" aria-hidden="true">#</span>{t(local.canal.rotulo)}
				</h1>
			{/if}
			<div class="acoes">
				<button class="busca" type="button" onclick={onbuscar}>
					<Search size={16} strokeWidth={1.75} />
					<span class="busca-texto">{t('casca.buscar')}</span>
					<kbd class="atalho">Ctrl K</kbd>
				</button>
				{#if painel}
					<button
						class="icone"
						type="button"
						aria-label={casca.painelNaGrade ? t('casca.fecharPainel') : t('casca.abrirPainel')}
						aria-pressed={casca.painelNaGrade || casca.gaveta === 'painel'}
						onclick={() => casca.alternarPainel()}
					>
						<PanelRight size={20} strokeWidth={1.75} />
					</button>
				{/if}
			</div>
		</header>
		<div class="rolagem">
			{@render children()}
		</div>
	</main>

	{#if casca.painelNaGrade && painel}
		<aside class="col-painel" aria-label={t('casca.painel')}>
			{@render painel()}
		</aside>
	{/if}

	{#if casca.celular}
		<div class="col-barra">
			<BarraInferior ativo={local?.espaco.id ?? null} onvoce={() => casca.abrir('canais')} />
		</div>
	{/if}
</div>

{#if casca.celular && local}
	<Gaveta
		lado="esquerda"
		aberta={casca.gaveta === 'canais'}
		rotulo={t('casca.canais')}
		onfechar={() => casca.fechar()}
	>
		<Canais espaco={local.espaco} canalAtivo={local.canal.id} onescolher={() => casca.fechar()} />
	</Gaveta>
{/if}

{#if painel && !casca.painelNaGrade}
	<Gaveta
		lado="direita"
		aberta={casca.gaveta === 'painel'}
		rotulo={t('casca.painel')}
		onfechar={() => casca.fechar()}
	>
		<div class="painel-gaveta">{@render painel()}</div>
	</Gaveta>
{/if}

<style>
	.casca {
		display: grid;
		grid-template-columns: 72px 240px minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
		height: 100dvh;
		overflow: hidden;
	}

	.casca.com-painel {
		grid-template-columns: 72px 240px minmax(0, 1fr) 340px;
	}

	.casca.celular {
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr) auto;
	}

	.col-trilho,
	.col-canais {
		min-height: 0;
	}

	.col-conteudo {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		background: var(--conteudo);
	}

	.topo {
		display: flex;
		align-items: center;
		gap: var(--espaco-2);
		height: 48px;
		padding: 0 var(--espaco-3) 0 var(--espaco-4);
		border-bottom: 1px solid var(--borda);
		flex: none;
	}

	.celular .topo {
		padding-left: var(--espaco-1);
	}

	.titulo {
		min-width: 0;
		overflow: hidden;
		font-size: var(--tipo-medio);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.hash {
		margin-inline-end: 0.2em;
		color: var(--texto-fraco);
		font-weight: 500;
	}

	.acoes {
		display: flex;
		align-items: center;
		gap: var(--espaco-1);
		margin-left: auto;
	}

	.icone {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		padding: 0;
		border: 0;
		border-radius: var(--raio-medio);
		background: none;
		color: var(--texto-fraco);
	}

	.icone:hover,
	.icone[aria-pressed='true'] {
		background: color-mix(in srgb, var(--texto) 6%, transparent);
		color: var(--texto);
	}

	.busca {
		display: flex;
		align-items: center;
		gap: var(--espaco-2);
		height: 32px;
		padding: 0 6px 0 10px;
		border: 1px solid var(--borda);
		border-radius: 999px;
		background: var(--trilho);
		color: var(--texto-fraco);
		font-size: var(--tipo-pequeno);
	}

	.busca:hover {
		color: var(--texto);
	}

	.atalho {
		padding: 1px 6px;
		border-radius: 999px;
		background: var(--cartao);
		font-family: var(--fonte-ui);
		font-size: 11px;
	}

	.celular .busca {
		width: 40px;
		height: 40px;
		padding: 0;
		justify-content: center;
		border: 0;
		background: none;
	}

	.celular .busca-texto,
	.celular .atalho {
		display: none;
	}

	.rolagem {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	.col-painel {
		min-height: 0;
		overflow-y: auto;
		background: var(--canais);
		border-left: 1px solid var(--borda);
	}

	.painel-gaveta {
		width: 100%;
		overflow-y: auto;
	}
</style>
