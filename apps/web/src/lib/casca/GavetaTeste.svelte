<!-- Só para testes de Gaveta.svelte. -->
<script lang="ts">
	import Gaveta from './Gaveta.svelte';

	let {
		abertaInicial = false,
		onfechar = () => {}
	}: { abertaInicial?: boolean; onfechar?: () => void } = $props();
	// svelte-ignore state_referenced_locally
	let aberta = $state(abertaInicial);
</script>

<button onclick={() => (aberta = true)}>abrir</button>
<Gaveta
	lado="esquerda"
	{aberta}
	rotulo="Canais"
	onfechar={() => {
		aberta = false;
		onfechar();
	}}
>
	<button>primeiro</button>
	<button>último</button>
</Gaveta>
