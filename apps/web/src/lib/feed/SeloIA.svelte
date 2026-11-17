<script lang="ts">
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import { t } from '#lib/i18n/index.ts';
</script>

<span class="selo-ia"
	><Sparkles size={12} strokeWidth={2} aria-hidden="true" />{t('feed.geradoPorIA')}</span
>

<style>
	.selo-ia {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
		font-weight: 600;
	}
</style>
