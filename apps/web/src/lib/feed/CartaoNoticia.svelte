<script lang="ts">
	import Bookmark from '@lucide/svelte/icons/bookmark';
	import BookmarkCheck from '@lucide/svelte/icons/bookmark-check';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { tempoRelativo } from '#lib/formato.ts';
	import { i18n, t } from '#lib/i18n/index.ts';
	import ChipCarteira from './ChipCarteira.svelte';
	import { iniciais } from './fontes.ts';
	import IndicadorImpacto from './IndicadorImpacto.svelte';
	import SeloFonte from './SeloFonte.svelte';
	import SeloIA from './SeloIA.svelte';
	import type { Noticia } from './tipos.ts';

	let { noticia, agora = new Date() }: { noticia: Noticia; agora?: Date } = $props();

	let salva = $state(false);
	const principal = $derived(noticia.fontes.find((f) => f.primaria) ?? noticia.fontes[0]);
	const outras = $derived(noticia.fontes.length - 1);
	const data = $derived(new Date(noticia.publicadoEm));
</script>

<article class="noticia" class:bafafa={noticia.bafafa} aria-labelledby="titulo-{noticia.id}">
	<span class="avatar" class:primaria={principal.primaria} aria-hidden="true">
		{iniciais(principal.nome)}
	</span>

	<div class="corpo">
		<p class="meta">
			<span class="fonte">{principal.nome}</span>
			{#if principal.primaria}<SeloFonte />{/if}
			{#if outras > 0}
				<span class="mais" aria-hidden="true">{t('feed.maisFontes', { n: outras })}</span>
				<span class="so-leitor">{t('feed.outrasFontes', { n: outras })}</span>
			{/if}
			<time class="tempo" datetime={noticia.publicadoEm}
				>{tempoRelativo(data, agora, i18n.idioma)}</time
			>
			{#if noticia.bafafa}<span class="marca-bafafa">{t('feed.bafafa')}</span>{/if}
		</p>

		<h3 id="titulo-{noticia.id}" class="titulo">{noticia.titulo}</h3>

		{#if noticia.resumoIA}
			<div class="resumo">
				<SeloIA />
				<p>{noticia.resumoIA}</p>
			</div>
		{:else}
			<p class="trecho">{noticia.trecho}</p>
		{/if}

		{#if noticia.ativos.length > 0}
			<div class="ativos">
				{#each noticia.ativos as ativo (ativo.ticker)}
					<ChipCarteira {ativo} />
				{/each}
			</div>
		{/if}

		<div class="rodape">
			<IndicadorImpacto valor={noticia.impacto} />
			{#each noticia.temas as tema (tema)}
				<span class="tema">{tema}</span>
			{/each}
			<span class="espaco"></span>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- link externo para a fonte -->
			<a class="acao" href={noticia.url} target="_blank" rel="noopener noreferrer">
				<ExternalLink size={15} strokeWidth={1.75} aria-hidden="true" />
				{t('feed.lerNaFonte')}
			</a>
			<button class="acao" type="button" aria-pressed={salva} onclick={() => (salva = !salva)}>
				{#if salva}
					<BookmarkCheck size={15} strokeWidth={1.75} aria-hidden="true" />
				{:else}
					<Bookmark size={15} strokeWidth={1.75} aria-hidden="true" />
				{/if}
				{t('feed.salvar')}
			</button>
		</div>
	</div>
</article>

<style>
	.noticia {
		position: relative;
		display: grid;
		grid-template-columns: 40px minmax(0, 1fr);
		gap: var(--espaco-3);
		padding: var(--espaco-3) var(--espaco-4);
		border-radius: var(--raio-medio);
		transition: background-color var(--dur-rapido) var(--curva);
	}

	.noticia:hover {
		background: color-mix(in srgb, var(--texto) 3%, transparent);
	}

	.noticia.bafafa::before {
		content: '';
		position: absolute;
		left: 0;
		top: var(--espaco-3);
		bottom: var(--espaco-3);
		width: 3px;
		border-radius: 2px;
		background: var(--bafafa);
	}

	.avatar {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--cartao);
		color: var(--texto-fraco);
		font-size: var(--tipo-pequeno);
		font-weight: 700;
	}

	.avatar.primaria {
		background: var(--destaque);
		color: var(--texto-sobre-destaque);
	}

	.corpo {
		display: grid;
		gap: 6px;
		min-width: 0;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 2px 8px;
		font-size: var(--tipo-pequeno);
	}

	.fonte {
		font-weight: 700;
	}

	.mais {
		color: var(--texto-fraco);
		font-weight: 600;
	}

	.tempo {
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
	}

	.marca-bafafa {
		color: var(--bafafa);
		font-size: var(--tipo-legenda);
		font-weight: 700;
	}

	.titulo {
		display: -webkit-box;
		overflow: hidden;
		font-size: var(--tipo-medio);
		line-height: 1.35;
		overflow-wrap: anywhere;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
	}

	.resumo {
		display: grid;
		gap: 2px;
		padding: var(--espaco-2) var(--espaco-3);
		border-radius: var(--raio-medio);
		background: var(--cartao);
	}

	.resumo p,
	.trecho {
		display: -webkit-box;
		overflow: hidden;
		color: var(--texto-fraco);
		overflow-wrap: anywhere;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}

	.resumo p {
		color: var(--texto);
	}

	.ativos {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.rodape {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 10px;
		margin-top: 2px;
	}

	.tema {
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
	}

	.espaco {
		flex: 1;
	}

	.acao {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 32px;
		padding: 0 10px;
		border: 0;
		border-radius: var(--raio-medio);
		background: none;
		color: var(--texto-fraco);
		font-size: var(--tipo-pequeno);
		font-weight: 600;
		text-decoration: none;
	}

	.acao:hover,
	.acao[aria-pressed='true'] {
		background: color-mix(in srgb, var(--texto) 6%, transparent);
		color: var(--texto);
	}

	@media (max-width: 767.98px) {
		.noticia {
			grid-template-columns: 32px minmax(0, 1fr);
			padding: var(--espaco-3);
		}

		.avatar {
			width: 32px;
			height: 32px;
			font-size: 11px;
		}

		.acao {
			min-height: 44px;
		}
	}
</style>
