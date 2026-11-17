<script lang="ts">
	import FlaskConical from '@lucide/svelte/icons/flask-conical';
	import { t } from '#lib/i18n/index.ts';
</script>

<p class="faixa" role="note">
	<FlaskConical size={14} strokeWidth={2} aria-hidden="true" />
	{t('prototipo.faixa')}
</p>

<style>
	.faixa {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px var(--espaco-4);
		border-bottom: 1px solid var(--borda);
		background: color-mix(in srgb, var(--bafafa) 10%, var(--conteudo));
		color: var(--texto);
		font-size: var(--tipo-legenda);
		font-weight: 500;
	}
</style>
