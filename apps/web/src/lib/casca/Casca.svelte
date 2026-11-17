<script lang="ts">
	import Menu from '@lucide/svelte/icons/menu';
	import PanelRight from '@lucide/svelte/icons/panel-right';
	import Search from '@lucide/svelte/icons/search';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
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
	import PaletaComandos from '#lib/paleta/PaletaComandos.svelte';
	import ControlesJanela from '#lib/janela/ControlesJanela.svelte';
	import { janela } from '#lib/janela/janela.svelte.ts';
	import PainelPrototipo from '#lib/prototipo/PainelPrototipo.svelte';

	let { children, painel }: { children: Snippet; painel?: Snippet } = $props();

	let paletaAberta = $state(false);

	function aoTeclar(e: KeyboardEvent) {
		// Ctrl+K / ⌘K abre a paleta de qualquer lugar, inclusive com o foco num campo.
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			paletaAberta = true;
		}
	}

	const local = $derived(localizar(page.params.espaco ?? '', page.params.canal));
	const titulo = $derived(local ? `#${t(local.canal.rotulo)} | ${NOME_APP}` : NOME_APP);
</script>

<svelte:window onkeydown={aoTeclar} />

<svelte:head>
	<title>{titulo}</title>
</svelte:head>

<div
	class="moldura {janela.modo}"
	class:maximizada={janela.maximizada}
	class:sem-foco={!janela.focada}
>
	<div class="casca" class:com-painel={casca.painelNaGrade && painel} class:celular={casca.celular}>
		{#if janela.modo !== 'navegador'}<ControlesJanela />{/if}
		{#if !casca.celular}
			<div class="col-trilho">
				<Trilho ativo={local?.espaco.id ?? null} />
			</div>
			<div class="col-canais">
				{#if local}<Canais espaco={local.espaco} canalAtivo={local.canal.id} />{/if}
			</div>
		{/if}

		<main class="col-conteudo">
			<!-- svelte-ignore a11y_no_static_element_interactions (duplo clique na faixa de cima maximiza, como numa janela) -->
			<header
				class="topo"
				data-tauri-drag-region
				ondblclick={(e) => {
					if (janela.modo !== 'navegador' && e.target === e.currentTarget)
						janela.maximizada = !janela.maximizada;
				}}
			>
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
					<button
						class="busca"
						type="button"
						aria-label={t('casca.buscar')}
						aria-keyshortcuts="Control+K Meta+K"
						onclick={() => (paletaAberta = true)}
					>
						<Search size={16} strokeWidth={1.75} />
						<span class="busca-texto">{t('casca.buscar')}</span>
						<kbd class="atalho">Ctrl K</kbd>
					</button>
					{#if casca.celular}
						<button
							class="icone"
							type="button"
							aria-label={t('prototipo.ajustes')}
							aria-expanded={casca.ajustesAberto}
							onclick={() => (casca.ajustesAberto = !casca.ajustesAberto)}
						>
							<SlidersHorizontal size={20} strokeWidth={1.75} />
						</button>
					{/if}
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
				<BarraInferior ativo={local?.espaco.id ?? null} onmais={() => casca.abrir('canais')} />
			</div>
		{/if}

		<!-- Camadas por cima ficam dentro da casca: no "Ver como" elas não cobrem a barra de título. -->
		{#if casca.celular && local}
			<Gaveta
				lado="esquerda"
				aberta={casca.gaveta === 'canais'}
				rotulo={t('casca.canais')}
				onfechar={() => casca.fechar()}
			>
				<div class="gaveta-espacos">
					<Trilho ativo={local.espaco.id} />
					<Canais
						espaco={local.espaco}
						canalAtivo={local.canal.id}
						onescolher={() => casca.fechar()}
					/>
				</div>
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

		<PaletaComandos aberta={paletaAberta} onfechar={() => (paletaAberta = false)} />
		<PainelPrototipo />
	</div>
</div>

<style>
	.moldura {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		overflow: hidden;
	}

	/* "Ver como" no protótipo: janela simulada do Matsu OS (cantos de 10 px, borda de 1 px) ou do Windows. */
	.moldura.matsu,
	.moldura.windows {
		height: calc(100dvh - 48px);
		margin: 24px;
		border: 1px solid rgb(255 255 255 / 0.13);
		border-radius: 10px;
		box-shadow: 0 24px 80px rgb(0 0 0 / 0.45);
	}

	:global([data-tema='matsu-claro']) .moldura.matsu,
	:global([data-tema='claro']) .moldura.windows {
		border-color: rgb(0 0 0 / 0.14);
	}

	.moldura.windows {
		border-radius: 8px;
	}

	:global(body:has(.moldura.matsu, .moldura.windows)) {
		background: color-mix(in srgb, var(--trilho) 70%, #000);
	}

	.moldura.maximizada {
		height: 100dvh;
		margin: 0;
		border: 0;
		border-radius: 0;
	}

	/* No "Ver como", camadas fixas (gavetas, busca, ajustes) se prendem à área da janela. */
	.moldura.matsu .casca,
	.moldura.windows .casca {
		transform: translateZ(0);
	}

	.gaveta-espacos {
		display: flex;
		width: 100%;
		height: 100%;
		background: var(--canais);
	}

	.gaveta-espacos :global(.trilho) {
		flex: none;
	}

	/* Barra de título integrada: o app vai até o topo e reserva o lugar dos botões da janela. */
	.moldura.matsu .col-trilho :global(.trilho) {
		padding-top: 52px;
	}

	.moldura.matsu .celular .topo {
		padding-left: 84px;
	}

	.moldura.windows .casca:not(.com-painel) .topo {
		padding-right: 150px;
	}

	.moldura.windows .col-painel::before {
		content: '';
		display: block;
		height: 48px;
	}

	.casca {
		position: relative;
		display: grid;
		grid-template-columns: 72px 240px minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
		flex: 1;
		min-height: 0;
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

	.celular .icone {
		width: 44px;
		height: 44px;
	}

	.celular .busca {
		width: 44px;
		height: 44px;
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
