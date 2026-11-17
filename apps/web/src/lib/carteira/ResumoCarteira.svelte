<script lang="ts">
	import TriangleAlert from '@lucide/svelte/icons/triangle-exclamation-point';
	import { formatarMoeda, formatarVariacao } from '#lib/formato.ts';
	import { i18n, t } from '#lib/i18n/index.ts';
	import {
		alocacaoExemplo,
		cotacoesExemplo,
		posicoesPorMoeda,
		resumoExemplo
	} from '#lib/prototipo/carteira-exemplo.ts';
	import { moeda } from './moeda.svelte.ts';
	import { consolidar, converter } from './moedas.ts';
	import PorMoeda from './PorMoeda.svelte';
	import SeletorMoeda from './SeletorMoeda.svelte';
	import Variacao from '#lib/ui/Variacao.svelte';
	import Rosca from './Rosca.svelte';

	const fatias = $derived(alocacaoExemplo.map((f) => ({ rotulo: t(f.rotulo), valor: f.valor })));
	const consolidado = $derived(consolidar(posicoesPorMoeda, moeda.principal, cotacoesExemplo));
	const patrimonio = $derived(formatarMoeda(consolidado.total, moeda.principal, i18n.idioma));
	const compacto = $derived(
		new Intl.NumberFormat(i18n.idioma, {
			style: 'currency',
			currency: moeda.principal,
			notation: 'compact',
			maximumFractionDigits: 0
		}).format(consolidado.total)
	);
	const renda = $derived(
		formatarMoeda(
			converter(resumoExemplo.rendaMensal, 'BRL', moeda.principal, cotacoesExemplo),
			moeda.principal,
			i18n.idioma
		)
	);
	const hora = $derived(
		new Intl.DateTimeFormat(i18n.idioma, { hour: '2-digit', minute: '2-digit' }).format(new Date())
	);
	const maiorRetorno = Math.max(...resumoExemplo.dozeMeses.map((d) => d.pct));
</script>

<div class="carteira">
	<header class="cabecalho">
		<div class="linha-rotulo">
			<p class="rotulo">{t('carteira.patrimonio')}</p>
			<SeletorMoeda valor={moeda.principal} onescolher={(m) => moeda.definir(m)} />
		</div>
		<p class="patrimonio numero">{patrimonio}</p>
		<p class="dia">{t('carteira.hoje')} <Variacao pct={resumoExemplo.variacaoDia} /></p>
	</header>

	<p class="alerta" role="status">
		<TriangleAlert size={16} strokeWidth={2} aria-hidden="true" />
		{t('carteira.concentracao', resumoExemplo.concentracao)}
	</p>

	<section aria-labelledby="moedas-titulo">
		<h2 id="moedas-titulo" class="titulo">{t('carteira.porMoeda')}</h2>
		<PorMoeda fatias={consolidado.porMoeda} principal={moeda.principal} />
		<p class="cambio">{t('carteira.cambio', { hora })}</p>
	</section>

	<section aria-labelledby="alocacao-titulo">
		<h2 id="alocacao-titulo" class="titulo">{t('carteira.alocacao')}</h2>
		<Rosca
			{fatias}
			titulo={t('carteira.alocacao')}
			centro={compacto}
			legendaCentro={t('carteira.patrimonio')}
		/>
	</section>

	<div class="duas">
		<section aria-labelledby="renda-titulo">
			<h2 id="renda-titulo" class="titulo">{t('carteira.rendaMensal')}</h2>
			<p class="grande numero">{renda}</p>
		</section>

		<section aria-labelledby="doze-titulo">
			<h2 id="doze-titulo" class="titulo">{t('carteira.dozeMeses')}</h2>
			<ul class="comparacao" role="list">
				{#each resumoExemplo.dozeMeses as item (item.nome)}
					<li class:voce={item.nome === 'suaCarteira'}>
						<span>{item.nome === 'suaCarteira' ? t('carteira.suaCarteira') : item.nome}</span>
						<span class="barra" aria-hidden="true"
							><span style:width="{(item.pct / maiorRetorno) * 100}%"></span></span
						>
						<span class="numero">{formatarVariacao(item.pct, i18n.idioma).texto}</span>
					</li>
				{/each}
			</ul>
		</section>
	</div>
</div>

<style>
	.carteira {
		display: grid;
		gap: var(--espaco-8);
		max-width: 860px;
		margin-inline: auto;
		padding: var(--espaco-8) var(--espaco-6) var(--espaco-10);
	}

	.cabecalho {
		display: grid;
		gap: 2px;
	}

	.rotulo,
	.dia {
		color: var(--texto-fraco);
		font-size: var(--tipo-pequeno);
	}

	.linha-rotulo {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--espaco-2) var(--espaco-4);
	}

	.cambio {
		margin-top: var(--espaco-3);
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
	}

	.patrimonio {
		font-size: clamp(32px, 4vw, 44px);
		font-weight: 650;
		letter-spacing: -0.02em;
	}

	.dia {
		display: flex;
		align-items: baseline;
		gap: var(--espaco-2);
	}

	.alerta {
		display: flex;
		align-items: flex-start;
		gap: var(--espaco-2);
		padding: var(--espaco-3) var(--espaco-4);
		border-left: 3px solid var(--bafafa);
		background: color-mix(in srgb, var(--bafafa) 8%, transparent);
		border-radius: 0 var(--raio-medio) var(--raio-medio) 0;
	}

	.alerta :global(svg) {
		flex: none;
		margin-top: 3px;
		color: var(--bafafa);
	}

	.titulo {
		margin-bottom: var(--espaco-4);
		font-size: var(--tipo-titulo);
	}

	.duas {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: var(--espaco-8);
	}

	.grande {
		font-size: var(--tipo-grande);
		font-weight: 650;
	}

	.comparacao {
		display: grid;
		gap: var(--espaco-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.comparacao li {
		display: grid;
		grid-template-columns: 110px minmax(0, 1fr) 64px;
		align-items: center;
		gap: var(--espaco-3);
		color: var(--texto-fraco);
		font-size: var(--tipo-pequeno);
	}

	.comparacao li.voce {
		color: var(--texto);
		font-weight: 600;
	}

	.barra {
		height: 6px;
		border-radius: 3px;
		background: var(--borda);
		overflow: hidden;
	}

	.barra span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: var(--texto-fraco);
	}

	.voce .barra span {
		background: var(--texto);
	}

	.comparacao .numero {
		text-align: right;
	}

	@media (max-width: 767.98px) {
		.carteira {
			padding: var(--espaco-6) var(--espaco-4) var(--espaco-10);
		}
	}
</style>
