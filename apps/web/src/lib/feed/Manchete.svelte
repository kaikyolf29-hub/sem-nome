<script lang="ts">
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { tempoRelativo } from '#lib/formato.ts';
	import { i18n, t } from '#lib/i18n/index.ts';
	import ChipCarteira from './ChipCarteira.svelte';
	import MarcaFonte from './MarcaFonte.svelte';
	import SeloIA from './SeloIA.svelte';
	import type { Noticia } from './tipos.ts';

	let { noticia }: { noticia: Noticia } = $props();

	const data = $derived(new Date(noticia.publicadoEm));
	// A primeira fonte é a do título e do link mostrados (o banco põe ela na frente).
	const principal = $derived(noticia.fontes[0]);
	const fontes = $derived(
		new Intl.ListFormat(i18n.idioma, { type: 'conjunction' }).format(
			noticia.fontes.map((f) => f.nome)
		)
	);
</script>

<article class="manchete" aria-labelledby="manchete-{noticia.id}">
	<p class="meta">
		{#if principal}
			<MarcaFonte fonte={principal} tamanho={24} />
			<span class="fonte">{principal.nome}</span>
		{/if}
		{#if noticia.bafafa}<span class="marca-bafafa">{t('feed.bafafa')}</span>{/if}
		<time datetime={noticia.publicadoEm}>{tempoRelativo(data, new Date(), i18n.idioma)}</time>
	</p>

	<h2 id="manchete-{noticia.id}" class="titulo">{noticia.titulo}</h2>

	{#if noticia.resumoIA}
		<div class="resumo">
			<SeloIA />
			<p>{noticia.resumoIA}</p>
		</div>
	{:else if noticia.trecho}
		<p class="trecho">{noticia.trecho}</p>
	{/if}

	{#if noticia.fontes.length > 1}
		<p class="fontes">{t('feed.comInformacoes', { fontes })}</p>
	{/if}

	<div class="rodape">
		{#each noticia.ativos as ativo (ativo.ticker)}
			<ChipCarteira {ativo} />
		{/each}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- link externo para a fonte -->
		<a class="ler" href={noticia.url} target="_blank" rel="noopener noreferrer">
			<ExternalLink size={16} strokeWidth={1.75} aria-hidden="true" />
			{t('feed.lerNaFonte')}
		</a>
	</div>
</article>

<style>
	.manchete {
		display: grid;
		gap: var(--espaco-4);
		padding: var(--espaco-8) var(--espaco-6) var(--espaco-6);
	}

	.meta {
		display: flex;
		align-items: center;
		gap: var(--espaco-3);
		min-width: 0;
		color: var(--texto-fraco);
		font-size: var(--tipo-pequeno);
	}

	.meta :global(.marca-fonte) {
		border-radius: 7px;
	}

	/* Nome da fonte colado na logo (8 px), o resto da linha no espaço normal. */
	.fonte {
		min-width: 0;
		margin-left: calc(8px - var(--espaco-3));
		overflow: hidden;
		color: var(--texto);
		font-weight: 600;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.meta time {
		flex: none;
		white-space: nowrap;
	}

	.trecho {
		max-width: 62ch;
		color: var(--texto-fraco);
		font-size: var(--tipo-medio);
		line-height: 1.55;
	}

	.marca-bafafa {
		color: var(--bafafa);
		font-weight: 700;
	}

	.titulo {
		font-family: var(--fonte-manchete);
		font-size: clamp(28px, 3.4vw, 40px);
		font-weight: 600;
		line-height: 1.12;
		letter-spacing: -0.015em;
		text-wrap: balance;
		overflow-wrap: anywhere;
	}

	.resumo {
		display: grid;
		gap: 4px;
		max-width: 62ch;
	}

	.resumo p {
		font-size: var(--tipo-medio);
		line-height: 1.55;
	}

	.fontes {
		color: var(--texto-fraco);
		font-size: var(--tipo-pequeno);
	}

	.rodape {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--espaco-2);
	}

	.ler {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 40px;
		padding: 0 var(--espaco-4);
		border-radius: 999px;
		background: var(--destaque);
		color: var(--texto-sobre-destaque);
		font-weight: 600;
		text-decoration: none;
	}

	@media (max-width: 767.98px) {
		.manchete {
			padding: var(--espaco-6) var(--espaco-4) var(--espaco-4);
		}
	}
</style>
