<script lang="ts">
	import { i18n, t } from '#lib/i18n/index.ts';

	let { usoPct, renovaEm }: { usoPct: number; renovaEm: Date } = $props();

	const pct = $derived(Math.round(Math.min(100, Math.max(0, usoPct))));
	const hora = $derived(
		new Intl.DateTimeFormat(i18n.idioma, { hour: '2-digit', minute: '2-digit' }).format(renovaEm)
	);
</script>

<div class="medidor">
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
	<p class="texto numero">
		<span>{t('casca.usoIA', { pct })}</span>
		<span>{t('casca.renovaAs', { hora })}</span>
	</p>
</div>

<style>
	.medidor {
		display: grid;
		gap: 6px;
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
		background: var(--texto-fraco);
	}

	.texto {
		display: grid;
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
		line-height: 1.35;
	}
</style>
