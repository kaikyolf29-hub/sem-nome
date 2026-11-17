<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import type { AtivoLigado } from './tipos.ts';

	let { ativo }: { ativo: AtivoLigado } = $props();
</script>

<p class="carteira">
	<span class="rotulo">{t('feed.afetaCarteira')}:</span>
	<strong class="ticker">{ativo.ticker}</strong>
	<span class="motivo">{ativo.motivo}</span>
</p>

<style>
	.carteira {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0 4px;
		max-width: 100%;
		color: var(--texto-fraco);
		font-size: var(--tipo-pequeno);
	}

	.rotulo {
		color: var(--texto);
		font-weight: 600;
	}

	.ticker {
		color: var(--texto);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.motivo {
		overflow-wrap: anywhere;
	}
</style>
