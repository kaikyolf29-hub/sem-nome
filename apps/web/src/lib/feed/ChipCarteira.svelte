<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import LogoAtivo from '#lib/logos/LogoAtivo.svelte';
	import type { AtivoLigado } from './tipos.ts';

	let { ativo }: { ativo: AtivoLigado } = $props();
</script>

<p class="carteira">
	<span class="rotulo">{t('feed.afetaCarteira')}:</span>
	<span class="ativo"
		><LogoAtivo ticker={ativo.ticker} tamanho={18} /><strong class="ticker">{ativo.ticker}</strong
		></span
	>
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

	.ativo {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		align-self: center;
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
