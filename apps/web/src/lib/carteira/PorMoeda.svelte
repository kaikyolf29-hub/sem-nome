<script lang="ts">
	import { formatarMoeda } from '#lib/formato.ts';
	import { i18n, t } from '#lib/i18n/index.ts';
	import type { FatiaMoeda, Moeda } from './moedas.ts';

	let { fatias, principal }: { fatias: readonly FatiaMoeda[]; principal: Moeda } = $props();

	const nomes = $derived(new Intl.DisplayNames(i18n.idioma, { type: 'currency' }));
	const pct = (v: number) =>
		new Intl.NumberFormat(i18n.idioma, { maximumFractionDigits: 1 }).format(v) + '%';
</script>

<ul class="moedas" role="list">
	{#each fatias as f (f.moeda)}
		<li>
			<span class="codigo">{f.moeda}</span>
			<span class="nome">
				{nomes.of(f.moeda)}
				{#if f.moeda === principal}<small>{t('carteira.moedaPrincipal')}</small>{/if}
			</span>
			<span class="valores">
				<span class="original numero">{formatarMoeda(f.original, f.moeda, i18n.idioma)}</span>
				{#if f.moeda !== principal}
					<span class="convertido numero"
						>{t('carteira.emPrincipal', {
							valor: formatarMoeda(f.convertido, principal, i18n.idioma)
						})}</span
					>
				{/if}
			</span>
			<span class="fatia">
				<span class="barra" aria-hidden="true"><span style:width="{f.pct}%"></span></span>
				<span class="pct numero">{pct(f.pct)}</span>
			</span>
		</li>
	{/each}
</ul>

<style>
	.moedas {
		container-type: inline-size;
		display: grid;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: grid;
		grid-template-columns: 52px minmax(0, 1fr) auto 140px;
		align-items: center;
		gap: var(--espaco-4);
		min-height: 60px;
		padding: var(--espaco-2) 0;
		border-bottom: 1px solid var(--borda);
	}

	.codigo {
		display: grid;
		place-items: center;
		height: 28px;
		border-radius: 6px;
		background: var(--cartao);
		font-size: var(--tipo-legenda);
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	.nome {
		display: grid;
		min-width: 0;
		overflow-wrap: anywhere;
		font-weight: 600;
	}

	.nome small {
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
		font-weight: 500;
	}

	.valores {
		display: grid;
		justify-items: end;
		text-align: right;
	}

	.original {
		font-weight: 600;
	}

	.convertido {
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
	}

	.fatia {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 48px;
		align-items: center;
		gap: var(--espaco-2);
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
		background: var(--texto);
	}

	.pct {
		text-align: right;
		font-size: var(--tipo-pequeno);
		font-weight: 600;
	}

	@container (max-width: 560px) {
		li {
			grid-template-columns: 48px minmax(0, 1fr) auto;
			grid-template-areas: 'codigo nome valores' 'fatia fatia fatia';
			row-gap: var(--espaco-2);
		}

		.codigo {
			grid-area: codigo;
		}

		.nome {
			grid-area: nome;
		}

		.valores {
			grid-area: valores;
		}

		.fatia {
			grid-area: fatia;
		}
	}
</style>
