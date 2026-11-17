<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import type { AtivoLigado } from './tipos.ts';

	let { ativo }: { ativo: AtivoLigado } = $props();
</script>

<span class="chip-carteira">
	<span class="rotulo">{t('feed.afetaCarteira')}</span>
	<strong class="ticker">{ativo.ticker}</strong>
	<span class="motivo">{ativo.motivo}</span>
</span>

<style>
	.chip-carteira {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0 6px;
		max-width: 100%;
		padding: 4px 10px;
		border: 1px solid var(--borda);
		border-radius: var(--raio-grande);
		font-size: var(--tipo-legenda);
		color: var(--texto-fraco);
	}

	.ticker {
		color: var(--texto);
		font-weight: 700;
	}

	.motivo {
		overflow-wrap: anywhere;
	}
</style>
