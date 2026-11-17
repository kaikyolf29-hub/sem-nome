<script lang="ts">
	import { t } from '#lib/i18n/index.ts';

	let { fase }: { fase: number } = $props();
</script>

<section class="vazio">
	<h2>{t('comum.emBreveTitulo')}</h2>
	<p>{t('comum.emBreve', { fase })}</p>
</section>

<style>
	.vazio {
		display: grid;
		gap: var(--espaco-2);
		max-width: 48ch;
		padding: var(--espaco-10) var(--espaco-6);
	}

	h2 {
		font-size: var(--tipo-titulo);
	}

	p {
		color: var(--texto-fraco);
	}
</style>
