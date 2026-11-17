<script lang="ts">
	import { tempoRelativo } from '#lib/formato.ts';
	import { i18n, t } from '#lib/i18n/index.ts';
	import IndicadorImpacto from './IndicadorImpacto.svelte';
	import MarcaFonte from './MarcaFonte.svelte';
	import type { Noticia } from './tipos.ts';

	let { noticias, agora = new Date() }: { noticias: readonly Noticia[]; agora?: Date } = $props();
</script>

<section class="tambem" aria-labelledby="tambem-titulo">
	<h2 id="tambem-titulo" class="titulo-secao">{t('feed.tambemDestaque')}</h2>
	<ul role="list">
		{#each noticias as n (n.id)}
			{@const fonte = n.fontes.find((f) => f.primaria) ?? n.fontes[0]}
			<li>
				<article aria-labelledby="tambem-{n.id}">
					<p class="meta">
						<MarcaFonte {fonte} tamanho={22} />
						<span class="fonte">{fonte.nome}</span>
						<time datetime={n.publicadoEm}
							>{tempoRelativo(new Date(n.publicadoEm), agora, i18n.idioma)}</time
						>
					</p>
					<h3 id="tambem-{n.id}">
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- link externo para a fonte -->
						<a href={n.url} target="_blank" rel="noopener noreferrer">{n.titulo}</a>
					</h3>
					<p class="rodape">
						<IndicadorImpacto valor={n.impacto} />
						{#if n.bafafa}<span class="marca-bafafa">{t('feed.bafafa')}</span>{/if}
					</p>
				</article>
			</li>
		{/each}
	</ul>
</section>

<style>
	.tambem {
		display: grid;
		align-content: start;
		gap: var(--espaco-4);
		padding: var(--espaco-6) var(--espaco-6) var(--espaco-6);
	}

	.titulo-secao {
		color: var(--texto-fraco);
		font-size: var(--tipo-pequeno);
		font-weight: 600;
	}

	ul {
		display: grid;
		gap: 0;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li + li {
		border-top: 1px solid var(--borda);
	}

	article {
		display: grid;
		gap: 6px;
		padding: var(--espaco-4) 0;
	}

	li:first-child article {
		padding-top: 0;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
	}

	.meta :global(.marca-fonte) {
		border-radius: 6px;
	}

	.fonte {
		min-width: 0;
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

	h3 {
		font-family: var(--fonte-manchete);
		font-size: 19px;
		font-weight: 600;
		line-height: 1.25;
		overflow-wrap: anywhere;
	}

	h3 a {
		color: inherit;
		text-decoration: none;
	}

	h3 a:hover {
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}

	.rodape {
		display: flex;
		align-items: center;
		gap: var(--espaco-3);
	}

	.marca-bafafa {
		color: var(--bafafa);
		font-size: var(--tipo-legenda);
		font-weight: 700;
	}
</style>
