<script lang="ts">
	import User from '@lucide/svelte/icons/user';
	import { t } from '#lib/i18n/index.ts';
	import MedidorIA from './MedidorIA.svelte';

	const renovaEm = new Date(Date.now() + 2 * 3_600_000);
</script>

<section class="conta">
	<div class="linha">
		<span class="avatar" aria-hidden="true"><User size={18} strokeWidth={1.75} /></span>
		<div class="quem">
			<p class="nome">{t('casca.visitante')}</p>
			<p class="entrar">{t('casca.entrarEmBreve')}</p>
		</div>
	</div>
	<MedidorIA usoPct={40} {renovaEm} />
</section>

<style>
	.conta {
		display: grid;
		gap: var(--espaco-3);
		padding: var(--espaco-3);
		background: var(--trilho);
		border-top: 1px solid var(--borda);
	}

	.linha {
		display: flex;
		align-items: center;
		gap: var(--espaco-3);
	}

	.avatar {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--cartao);
		color: var(--texto-fraco);
		flex: none;
	}

	.quem {
		display: grid;
		min-width: 0;
	}

	.nome {
		font-weight: 600;
		font-size: var(--tipo-pequeno);
	}

	.entrar {
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
		text-align: start;
	}
</style>
