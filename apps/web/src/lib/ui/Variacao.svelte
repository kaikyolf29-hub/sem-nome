<script lang="ts">
	import { formatarVariacao } from '#lib/formato.ts';
	import { i18n, t } from '#lib/i18n/index.ts';

	let { pct }: { pct: number } = $props();

	const v = $derived(formatarVariacao(pct, i18n.idioma));
	const absoluto = $derived(formatarVariacao(Math.abs(pct), i18n.idioma).texto.replace('+', ''));
	const seta = $derived(v.direcao === 'alta' ? '▲' : v.direcao === 'baixa' ? '▼' : '•');
	const rotulo = $derived(
		t(
			v.direcao === 'alta'
				? 'variacao.alta'
				: v.direcao === 'baixa'
					? 'variacao.queda'
					: 'variacao.estavel',
			{ valor: absoluto }
		)
	);
</script>

<span class="variacao numero {v.direcao}">
	<span class="seta" aria-hidden="true">{seta}</span><span aria-hidden="true">{v.texto}</span>
	<span class="so-leitor">{rotulo}</span>
</span>

<style>
	.variacao {
		/* Contém o texto para leitor de tela (absoluto) dentro do componente. */
		position: relative;
		display: inline-flex;
		align-items: baseline;
		font-weight: 600;
		white-space: nowrap;
	}
	.alta {
		color: var(--alta);
	}
	.baixa {
		color: var(--baixa);
	}
	.estavel {
		color: var(--texto-fraco);
	}
	.seta {
		font-size: 0.8em;
		margin-inline-end: 0.3em;
	}
</style>
