<script lang="ts">
	import { i18n, t } from '#lib/i18n/index.ts';

	let { usoPct, renovaEm }: { usoPct: number; renovaEm: Date } = $props();

	const pct = $derived(Math.round(Math.min(100, Math.max(0, usoPct))));
	const hora = $derived(
		new Intl.DateTimeFormat(i18n.idioma, { hour: '2-digit', minute: '2-digit' }).format(renovaEm)
	);
</script>

<div class="medidor">
	<p class="linha">
		<span class="rotulo">{t('casca.usoIA')}</span>
		<span class="valor numero">{t('casca.usado', { pct })}</span>
	</p>
	<div
		class="barra"
		role="meter"
		aria-label={t('casca.usoIARotulo')}
		aria-valuemin={0}
		aria-valuemax={100}
		aria-valuenow={pct}
	>
		<span class="cheio" style:width="{pct}%"></span>
	</div>
	<p class="renova numero">{t('casca.renovaAs', { hora })}</p>
</div>

<style>
	.medidor {
		display: grid;
		gap: 6px;
	}

	.linha {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--espaco-2);
		font-size: var(--tipo-legenda);
	}

	.rotulo {
		font-weight: 600;
	}

	.valor,
	.renova {
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
	}

	.barra {
		height: 4px;
		border-radius: 2px;
		background: var(--borda);
		overflow: hidden;
	}

	.cheio {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: var(--texto);
	}
</style>
