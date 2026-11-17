<script lang="ts">
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { tempoRelativo } from '#lib/formato.ts';
	import { i18n, t } from '#lib/i18n/index.ts';
	import ChipCarteira from './ChipCarteira.svelte';
	import SeloFonte from './SeloFonte.svelte';
	import SeloIA from './SeloIA.svelte';
	import type { Noticia } from './tipos.ts';

	let { noticia }: { noticia: Noticia } = $props();

	const data = $derived(new Date(noticia.publicadoEm));
</script>

<article class="manchete" aria-labelledby="manchete-{noticia.id}">
	<p class="meta">
		{#if noticia.bafafa}<span class="marca-bafafa">{t('feed.bafafa')}</span>{/if}
		<time datetime={noticia.publicadoEm}>{tempoRelativo(data, new Date(), i18n.idioma)}</time>
	</p>

	<h2 id="manchete-{noticia.id}" class="titulo">{noticia.titulo}</h2>

	{#if noticia.resumoIA}
		<div class="resumo">
			<SeloIA />
			<p>{noticia.resumoIA}</p>
		</div>
	{/if}

	<ul class="fontes" role="list">
		{#each noticia.fontes as fonte (fonte.nome)}
			<li class:primaria={fonte.primaria}>
				{fonte.nome}{#if fonte.primaria}<SeloFonte />{/if}
			</li>
		{/each}
	</ul>

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
		max-width: 760px;
		padding: var(--espaco-8) var(--espaco-6) var(--espaco-6);
	}

	.meta {
		display: flex;
		gap: var(--espaco-3);
		color: var(--texto-fraco);
		font-size: var(--tipo-pequeno);
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
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.fontes li {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 3px 10px;
		border-radius: 999px;
		background: var(--cartao);
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
		font-weight: 600;
	}

	.fontes li.primaria {
		color: var(--texto);
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
