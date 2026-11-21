<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import { resolve } from '$app/paths';
	import { painelTemas } from '#lib/preferencias/painel.svelte.ts';
	import { t } from '#lib/i18n/index.ts';
	import { paramsCanal, type Canal, type Espaco } from '#lib/navegacao/espacos.ts';
	import CartaoConta from './CartaoConta.svelte';

	let {
		espaco,
		canalAtivo,
		onescolher = () => {}
	}: {
		espaco: Espaco;
		canalAtivo: string;
		onescolher?: () => void;
	} = $props();

	// Agrupa mantendo a ordem: canais sem grupo ficam num bloco sem título.
	const grupos = $derived.by(() => {
		const lista: { grupo?: Canal['grupo']; canais: Canal[] }[] = [];
		for (const c of espaco.canais) {
			const ultimo = lista.at(-1);
			if (ultimo && ultimo.grupo === c.grupo) ultimo.canais.push(c);
			else lista.push({ grupo: c.grupo, canais: [c] });
		}
		return lista;
	});
</script>

<div class="canais">
	<header class="topo">
		<h2>{t(espaco.rotulo)}</h2>
	</header>

	<nav class="lista" aria-label={t('casca.canais')}>
		{#each grupos as bloco, i (i)}
			<div class="bloco">
				{#if bloco.grupo}
					<h3 class="grupo">{t(bloco.grupo)}</h3>
				{/if}
				<ul role="list">
					{#each bloco.canais as canal (canal.id)}
						<li>
							<a
								class="canal"
								class:ativo={canal.id === canalAtivo}
								href={resolve('/(app)/[espaco]/[[canal]]', paramsCanal(espaco.id, canal.id))}
								aria-current={canal.id === canalAtivo ? 'page' : undefined}
								onclick={onescolher}
							>
								<span class="hash" aria-hidden="true">#</span>
								<span class="nome">{canal.nome ?? t(canal.rotulo)}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
		{#if espaco.id === 'para-voce'}
			<button
				class="canal adicionar"
				type="button"
				onclick={(e) => {
					onescolher();
					painelTemas.abrir(e.currentTarget);
				}}
			>
				<span class="hash" aria-hidden="true"><Plus size={16} strokeWidth={2} /></span>
				<span class="nome">{t('paraVoce.adicionarTema')}</span>
			</button>
		{/if}
	</nav>

	<CartaoConta />
</div>

<style>
	.canais {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		background: var(--canais);
		min-width: 0;
	}

	.topo {
		display: flex;
		align-items: center;
		height: 48px;
		padding: 0 var(--espaco-4);
		border-bottom: 1px solid var(--borda);
		flex: none;
	}

	h2 {
		font-size: var(--tipo-medio);
	}

	.lista {
		flex: 1;
		overflow-y: auto;
		padding: var(--espaco-3) var(--espaco-2);
	}

	.bloco + .bloco {
		margin-top: var(--espaco-4);
	}

	.grupo {
		padding: 0 var(--espaco-2) var(--espaco-1);
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
		font-weight: 600;
		letter-spacing: 0;
	}

	ul {
		display: grid;
		gap: 2px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.canal {
		position: relative;
		display: flex;
		align-items: center;
		gap: 6px;
		min-height: 34px;
		padding: 0 var(--espaco-2);
		border-radius: 5px;
		color: var(--texto-fraco);
		text-decoration: none;
		font-weight: 500;
		transition:
			background-color var(--dur-rapido) var(--curva),
			color var(--dur-rapido) var(--curva);
	}

	.canal:hover {
		background: color-mix(in srgb, var(--texto) 5%, transparent);
		color: var(--texto);
	}

	.canal.ativo {
		background: color-mix(in srgb, var(--texto) 8%, transparent);
		color: var(--texto);
	}

	.canal.ativo::before {
		content: '';
		position: absolute;
		left: 0;
		top: 8px;
		bottom: 8px;
		width: 3px;
		border-radius: 2px;
		background: var(--texto);
	}

	/* Caixa de largura fixa: o # dos canais e o + de "Adicionar tema" alinham os nomes. */
	.hash {
		display: inline-grid;
		flex: none;
		place-items: center;
		width: 14px;
		font-size: 1.15em;
		opacity: 0.7;
	}

	/* "Adicionar tema": mesma linha dos canais, com o + no lugar do #. */
	.adicionar {
		width: 100%;
		margin-top: var(--espaco-2);
		border: 0;
		background: none;
		font: inherit;
		font-weight: 500;
		text-align: start;
		cursor: pointer;
	}

	.adicionar .hash {
		height: 1em;
	}

	.nome {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@media (max-width: 767.98px) {
		.canal {
			min-height: 44px;
		}
	}
</style>
