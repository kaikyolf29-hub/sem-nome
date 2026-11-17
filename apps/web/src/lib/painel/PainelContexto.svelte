<script lang="ts">
	import ChipCarteira from '#lib/feed/ChipCarteira.svelte';
	import { formatarMoeda } from '#lib/formato.ts';
	import { i18n, t } from '#lib/i18n/index.ts';
	import { ativoExemplo, noticiasExemplo } from '#lib/prototipo/exemplos.ts';
	import LogoAtivo from '#lib/logos/LogoAtivo.svelte';
	import Variacao from '#lib/ui/Variacao.svelte';
	import ChatExemplo from './ChatExemplo.svelte';
	import Sparkline from './Sparkline.svelte';

	const relacionadas = noticiasExemplo.filter((n) =>
		n.ativos.some((a) => a.ticker === ativoExemplo.ticker)
	);
	const hora = $derived(
		new Intl.DateTimeFormat(i18n.idioma, { hour: '2-digit', minute: '2-digit' }).format(new Date())
	);
</script>

<div class="painel">
	<section class="ativo" aria-labelledby="ativo-titulo">
		<p class="rotulo">{t('painel.titulo')}</p>
		<div class="identidade">
			<LogoAtivo ticker={ativoExemplo.ticker} tamanho={36} />
			<h2 id="ativo-titulo" class="ticker">{ativoExemplo.ticker}</h2>
		</div>
		<p class="nome">{ativoExemplo.nome}</p>
		<p class="preco">
			<span class="valor numero">{formatarMoeda(ativoExemplo.preco, 'BRL', i18n.idioma)}</span>
			<Variacao pct={ativoExemplo.pct} />
		</p>
		<Sparkline valores={ativoExemplo.serie} rotulo={t('painel.ultimos30')} />
		<p class="cotacao">{t('painel.cotacao', { hora })}</p>
	</section>

	<section class="relacionadas" aria-labelledby="relacionadas-titulo">
		<h3 id="relacionadas-titulo">{t('painel.afetaCarteira')}</h3>
		<ul role="list">
			{#each relacionadas as noticia (noticia.id)}
				{@const ativo = noticia.ativos.find((a) => a.ticker === ativoExemplo.ticker)!}
				<li>
					<p class="titulo-noticia">{noticia.titulo}</p>
					<ChipCarteira {ativo} />
				</li>
			{/each}
		</ul>
	</section>

	<ChatExemplo />
</div>

<style>
	.painel {
		display: grid;
		gap: var(--espaco-6);
		padding: var(--espaco-5) var(--espaco-4) var(--espaco-8);
	}

	.ativo {
		display: grid;
		gap: 2px;
	}

	.rotulo,
	.nome,
	.cotacao {
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
	}

	.rotulo {
		font-weight: 600;
	}

	.identidade {
		display: flex;
		align-items: center;
		gap: var(--espaco-3);
		margin: 4px 0 2px;
	}

	.ticker {
		font-size: var(--tipo-grande);
		letter-spacing: -0.01em;
	}

	.preco {
		display: flex;
		align-items: baseline;
		gap: var(--espaco-3);
		margin: var(--espaco-2) 0 var(--espaco-1);
	}

	.valor {
		font-size: var(--tipo-grande);
		font-weight: 600;
	}

	.relacionadas {
		display: grid;
		gap: var(--espaco-3);
	}

	h3 {
		font-size: var(--tipo-corpo);
	}

	ul {
		display: grid;
		gap: var(--espaco-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: grid;
		gap: 6px;
		padding-bottom: var(--espaco-3);
		border-bottom: 1px solid var(--borda);
	}

	.titulo-noticia {
		font-size: var(--tipo-pequeno);
		font-weight: 600;
		line-height: 1.4;
	}
</style>
