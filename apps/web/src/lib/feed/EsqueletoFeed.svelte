<script lang="ts">
	import { t } from '#lib/i18n/index.ts';

	// Mesmo desenho da capa (manchete + lista), para nada pular quando as notícias chegam.
	let { comManchete }: { comManchete: boolean } = $props();
</script>

<div class="esqueleto" role="status" aria-busy="true" aria-label={t('feed.carregando')}>
	{#if comManchete}
		<div class="manchete" aria-hidden="true">
			<span class="barra meta"></span>
			<span class="barra titulo"></span>
			<span class="barra titulo curto"></span>
			<span class="barra linha"></span>
			<span class="barra linha"></span>
			<span class="barra linha meia"></span>
		</div>
	{/if}
	<div class="lista" aria-hidden="true">
		{#each [1, 2, 3, 4] as item (item)}
			<div class="cartao">
				<span class="logo"></span>
				<div class="corpo">
					<span class="barra meta"></span>
					<span class="barra linha forte"></span>
					<span class="barra linha meia"></span>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.esqueleto {
		--tom: color-mix(in srgb, var(--texto) 9%, transparent);
	}

	.barra,
	.logo {
		display: block;
		border-radius: 6px;
		background: var(--tom);
		animation: pulsar 1.6s ease-in-out infinite;
	}

	.manchete {
		display: grid;
		gap: var(--espaco-3);
		padding: var(--espaco-8) var(--espaco-6) var(--espaco-6);
		border-bottom: 1px solid var(--borda);
	}

	.meta {
		width: 9rem;
		height: 0.8rem;
	}

	.titulo {
		width: min(100%, 38rem);
		height: 2.2rem;
	}

	.titulo.curto {
		width: min(70%, 26rem);
		margin-bottom: var(--espaco-2);
	}

	.linha {
		width: min(100%, 36rem);
		height: 0.95rem;
	}

	.linha.forte {
		height: 1.1rem;
	}

	.meia {
		width: min(55%, 20rem);
	}

	.lista {
		display: grid;
		gap: 2px;
		padding: var(--espaco-2) var(--espaco-2) var(--espaco-10);
	}

	.cartao {
		display: grid;
		grid-template-columns: 40px minmax(0, 1fr);
		gap: var(--espaco-3);
		padding: var(--espaco-3) var(--espaco-4);
	}

	.logo {
		width: 40px;
		height: 40px;
		border-radius: 10px;
	}

	.corpo {
		display: grid;
		gap: var(--espaco-2);
		align-content: start;
	}

	@keyframes pulsar {
		50% {
			opacity: 0.55;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.barra,
		.logo {
			animation: none;
		}
	}

	@media (max-width: 767.98px) {
		.manchete {
			padding: var(--espaco-6) var(--espaco-4) var(--espaco-4);
		}

		.lista {
			padding-inline: var(--espaco-1);
		}

		.cartao {
			padding: var(--espaco-3);
		}
	}
</style>
