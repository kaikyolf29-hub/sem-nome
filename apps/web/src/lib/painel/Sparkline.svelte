<script lang="ts">
	import { caminhoSparkline } from './sparkline.ts';

	let {
		valores,
		rotulo,
		largura = 280,
		altura = 56
	}: { valores: readonly number[]; rotulo: string; largura?: number; altura?: number } = $props();

	const d = $derived(caminhoSparkline(valores, largura, altura - 4));
	const subiu = $derived(valores.length > 1 && valores[valores.length - 1] >= valores[0]);
</script>

<svg
	class="sparkline"
	class:subiu
	viewBox="0 -2 {largura} {altura}"
	preserveAspectRatio="none"
	role="img"
	aria-label={rotulo}
>
	<path {d} fill="none" vector-effect="non-scaling-stroke" />
</svg>

<style>
	.sparkline {
		display: block;
		width: 100%;
		height: 56px;
	}

	path {
		stroke: var(--baixa);
		stroke-width: 2;
		stroke-linejoin: round;
		stroke-linecap: round;
	}

	.subiu path {
		stroke: var(--alta);
	}
</style>
