<script lang="ts">
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import { t } from '#lib/i18n/index.ts';
</script>

<span class="selo-fonte" title={t('feed.fontePrimaria')}>
	<BadgeCheck size={14} strokeWidth={2} aria-hidden="true" />
	<span class="so-leitor">{t('feed.fontePrimaria')}</span>
</span>

<style>
	.selo-fonte {
		display: inline-flex;
		color: var(--texto);
	}
</style>
