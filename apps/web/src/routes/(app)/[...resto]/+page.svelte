<script lang="ts">
	// Qualquer endereço desconhecido (inclusive com 3 partes ou mais) volta para o início ("Para você").
	import { irParaPadrao } from '#lib/navegacao/ir-padrao.ts';

	$effect(() => {
		irParaPadrao();
	});
</script>
