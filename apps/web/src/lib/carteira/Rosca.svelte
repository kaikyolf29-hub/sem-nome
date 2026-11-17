<script lang="ts">
	import { arcos, caminhoArco, type Fatia } from './rosca.ts';

	let {
		fatias,
		titulo,
		centro,
		legendaCentro
	}: { fatias: readonly Fatia[]; titulo: string; centro?: string; legendaCentro?: string } =
		$props();

	const lista = $derived(arcos(fatias));
	const fmt = (pct: number) => `${Math.round(pct)}%`;
	const rotuloAcessivel = $derived(
		`${titulo}: ${lista.map((a) => `${a.rotulo} ${fmt(a.pct)}`).join(', ')}`
	);
	// Pequena folga entre fatias (graus).
	const FOLGA = 1.2;
</script>

<figure class="rosca">
	<svg viewBox="0 0 200 200" role="img" aria-label={rotuloAcessivel}>
		<circle class="trilha" cx="100" cy="100" r="78" />
		{#each lista as arco, i (arco.rotulo)}
			<path
				class="fatia"
				style:stroke="var(--fatia-{(i % 6) + 1})"
				style:animation-delay="{i * 70}ms"
				pathLength="100"
				d={caminhoArco(100, 100, 78, arco.inicio + FOLGA / 2, arco.fim - FOLGA / 2)}
			/>
		{/each}
		{#if centro}
			<text class="centro numero" x="100" y="98" text-anchor="middle">{centro}</text>
		{/if}
		{#if legendaCentro}
			<text class="legenda-centro" x="100" y="120" text-anchor="middle">{legendaCentro}</text>
		{/if}
	</svg>
	<figcaption>
		<ul role="list">
			{#each lista as arco, i (arco.rotulo)}
				<li>
					<span class="cor" style:background="var(--fatia-{(i % 6) + 1})" aria-hidden="true"></span>
					<span class="nome">{arco.rotulo}</span>
					<span class="pct numero">{fmt(arco.pct)}</span>
				</li>
			{/each}
		</ul>
	</figcaption>
</figure>

<style>
	.rosca {
		display: grid;
		grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
		align-items: center;
		gap: var(--espaco-6);
		margin: 0;
	}

	svg {
		width: 100%;
		height: auto;
		overflow: visible;
	}

	.trilha {
		fill: none;
		stroke: var(--borda);
		stroke-width: 22;
	}

	.fatia {
		fill: none;
		stroke-width: 22;
		stroke-dasharray: 100;
		stroke-dashoffset: 100;
		animation: desenhar 700ms var(--curva) forwards;
	}

	@keyframes desenhar {
		to {
			stroke-dashoffset: 0;
		}
	}

	.centro {
		fill: var(--texto);
		font-size: 18px;
		font-weight: 650;
	}

	.legenda-centro {
		fill: var(--texto-fraco);
		font-size: 11px;
		font-weight: 600;
	}

	ul {
		display: grid;
		gap: var(--espaco-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: grid;
		grid-template-columns: 10px minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--espaco-3);
		padding-bottom: var(--espaco-2);
		border-bottom: 1px solid var(--borda);
	}

	.cor {
		width: 10px;
		height: 10px;
		border-radius: 3px;
	}

	.pct {
		font-weight: 600;
	}

	@media (max-width: 767.98px) {
		.rosca {
			grid-template-columns: minmax(0, 1fr);
			justify-items: center;
		}

		svg {
			max-width: 220px;
		}

		figcaption {
			width: 100%;
		}
	}
</style>
