<script lang="ts">
	import { t, type ChaveMensagem } from '#lib/i18n/index.ts';

	let { rotulo = 'feed.geradoPorIA' }: { rotulo?: ChaveMensagem } = $props();
</script>

<span class="selo-ia">{t(rotulo)}</span>

<style>
	.selo-ia {
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
		font-weight: 600;
	}
</style>
