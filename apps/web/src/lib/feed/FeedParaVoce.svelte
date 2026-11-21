<script lang="ts">
	// "Para você": `tudo` junta os temas e as buscas da pessoa; um tema junta as suas origens; um tema
	// digitado usa a busca. Mesmo desenho dos outros feeds, com manchete só em `tudo`.
	import { untrack } from 'svelte';
	import { t } from '#lib/i18n/index.ts';
	import { PREFIXO_BUSCA, type Canal } from '#lib/navegacao/espacos.ts';
	import { buscarFeed, buscarNoticias } from '#lib/noticias/dados.ts';
	import { criarFeed, vigiarVolta } from '#lib/noticias/feed.svelte.ts';
	import { preferencias } from '#lib/preferencias/estado.svelte.ts';
	import { juntarFeeds } from '#lib/preferencias/filtros.ts';
	import { painelTemas } from '#lib/preferencias/painel.svelte.ts';
	import { exemplosParaVoce, LIMITE_TUDO, planoDoCanal } from '#lib/preferencias/para-voce.ts';
	import ColunaFeed from './ColunaFeed.svelte';
	import type { Noticia } from './tipos.ts';

	let { canal }: { canal: Canal } = $props();

	/** Pede tudo o que o canal precisa ao mesmo tempo; falha só se nada responder. */
	async function buscarParaVoce(_espaco: 'para-voce', id: string): Promise<Noticia[]> {
		const plano = planoDoCanal(id, preferencias.atual);
		const respostas = await Promise.allSettled([
			...plano.origens.map((o) => buscarFeed(o.espaco, o.canal)),
			...plano.termos.map((termo) => buscarNoticias(termo))
		]);
		const listas = respostas.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
		const falha = respostas.find((r) => r.status === 'rejected');
		if (listas.length === 0 && falha) throw falha.reason;
		return juntarFeeds(listas).slice(0, LIMITE_TUDO);
	}

	const real = __PROTOTIPO__ ? null : criarFeed(buscarParaVoce);

	// O que muda o pedido: o canal e, em `tudo`, os temas e as buscas escolhidos.
	const chave = $derived(
		canal.id === 'tudo'
			? `${preferencias.atual.temas.join(',')}|${preferencias.atual.temasProprios.join(',')}`
			: canal.id
	);

	$effect(() => {
		const id = canal.id;
		void chave;
		untrack(() => void real?.carregar('para-voce', id));
	});

	$effect(() => vigiarVolta(real));

	// Primeira visita (site e app): abre "O que você quer ver?" uma vez.
	$effect(() => {
		if (!__PROTOTIPO__ && !preferencias.atual.escolheu)
			untrack(() => painelTemas.abrirPrimeiraVisita());
	});

	const termo = $derived(canal.id.startsWith(PREFIXO_BUSCA) ? canal.nome : undefined);
	const semTemas = $derived(
		canal.id === 'tudo' &&
			preferencias.atual.temas.length === 0 &&
			preferencias.atual.temasProprios.length === 0
	);
</script>

<ColunaFeed
	estado={real ? real.estado : 'pronto'}
	erro={real?.erro}
	noticias={real ? real.noticias : exemplosParaVoce(canal.id, preferencias.atual)}
	capa={canal.id === 'tudo'}
	ontentar={async () => {
		await real?.carregar('para-voce', canal.id);
	}}
>
	{#snippet vazio()}
		<div class="vazio-tema">
			{#if termo}
				<p class="frase">{t('paraVoce.semResultado', { termo })}</p>
				<p class="dica">{t('paraVoce.semResultadoDica')}</p>
			{:else if semTemas}
				<p class="frase">{t('paraVoce.semTemas')}</p>
				<button type="button" onclick={(e) => painelTemas.abrir(e.currentTarget)}>
					{t('paraVoce.escolherTemas')}
				</button>
			{:else}
				<p class="dica">{t('feed.vazio')}</p>
			{/if}
		</div>
	{/snippet}
</ColunaFeed>

<style>
	.vazio-tema {
		display: grid;
		justify-items: center;
		gap: var(--espaco-2);
		max-width: 44ch;
		margin-inline: auto;
		padding: var(--espaco-10) var(--espaco-6);
		text-align: center;
		text-wrap: balance;
	}

	.frase {
		color: var(--texto);
		font-size: var(--tipo-medio);
		font-weight: 600;
	}

	.dica {
		color: var(--texto-fraco);
	}

	button {
		min-height: 44px;
		margin-top: var(--espaco-3);
		padding: 0 var(--espaco-5);
		border: 1px solid var(--borda);
		border-radius: 999px;
		background: var(--cartao);
		color: var(--texto);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	button:hover {
		background: color-mix(in srgb, var(--texto) 6%, var(--cartao));
	}
</style>
