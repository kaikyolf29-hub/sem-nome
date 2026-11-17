<script lang="ts">
	import { page } from '$app/state';
	import { localizar } from '#lib/navegacao/espacos.ts';
	import { irParaPadrao } from '#lib/navegacao/ir-padrao.ts';

	const local = $derived(localizar(page.params.espaco ?? '', page.params.canal));

	$effect(() => {
		if (!local) irParaPadrao();
	});
</script>
