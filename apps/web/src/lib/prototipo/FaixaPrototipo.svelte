<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
</script>

<p class="faixa" role="note">
	{t(__PROTOTIPO__ ? 'prototipo.faixa' : 'aviso.dadosReais')}
</p>

<style>
	.faixa {
		padding: 6px var(--espaco-4);
		border-bottom: 1px solid var(--borda);
		background: color-mix(in srgb, var(--bafafa) 10%, var(--conteudo));
		color: var(--texto);
		font-size: var(--tipo-legenda);
		font-weight: 500;
	}
</style>
