<script lang="ts">
	// Painel "Notícias e temas": chega na Task 6 da fase 1B.
	import { t } from '#lib/i18n/index.ts';

	let { primeiraVisita, onfechar }: { primeiraVisita: boolean; onfechar: () => void } = $props();
</script>

<div role="dialog" aria-modal="true" aria-label={t('painelTemas.titulo')}>
	<button type="button" onclick={onfechar}>
		{primeiraVisita ? t('painelTemas.pular') : t('painelTemas.fechar')}
	</button>
</div>
