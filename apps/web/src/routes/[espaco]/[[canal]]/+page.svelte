<script lang="ts">
	import { page } from '$app/state';
	import { t } from '#lib/i18n/index.ts';
	import { localizar } from '#lib/navegacao/espacos.ts';
	import { irParaPadrao } from '#lib/navegacao/ir-padrao.ts';

	const local = $derived(localizar(page.params.espaco ?? '', page.params.canal));

	$effect(() => {
		if (!local) irParaPadrao();
	});
</script>

{#if local}
	<h1 class="canal"><span class="hash" aria-hidden="true">#</span>{t(local.canal.rotulo)}</h1>
{/if}

<style>
	.hash {
		color: var(--texto-fraco);
		margin-inline-end: 0.15em;
		font-weight: 500;
	}
</style>
