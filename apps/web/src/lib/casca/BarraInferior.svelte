<script lang="ts">
	import { resolve } from '$app/paths';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Bitcoin from '@lucide/svelte/icons/bitcoin';
	import ChartPie from '@lucide/svelte/icons/chart-pie';
	import House from '@lucide/svelte/icons/house';
	import Menu from '@lucide/svelte/icons/menu';
	import { t } from '#lib/i18n/index.ts';
	import { paramsCanal, type IdEspaco } from '#lib/navegacao/espacos.ts';

	let { ativo, onmais }: { ativo: IdEspaco | null; onmais: () => void } = $props();

	const itens = [
		{ rotulo: 'casca.inicio', params: paramsCanal('mercado'), espaco: 'mercado', Icone: House },
		{
			rotulo: 'espacos.carteira',
			params: paramsCanal('carteira'),
			espaco: 'carteira',
			Icone: ChartPie
		},
		{ rotulo: 'espacos.cripto', params: paramsCanal('cripto'), espaco: 'cripto', Icone: Bitcoin },
		{ rotulo: 'espacos.agenda', params: paramsCanal('agenda'), espaco: 'agenda', Icone: Calendar }
	] as const;
</script>

<nav class="barra" aria-label={t('casca.navegacaoCelular')}>
	{#each itens as item (item.rotulo)}
		<a
			class="item"
			class:ativo={ativo === item.espaco}
			href={resolve('/(app)/[espaco]/[[canal]]', item.params)}
			aria-current={ativo === item.espaco ? 'page' : undefined}
		>
			<item.Icone size={22} strokeWidth={1.75} />
			<span>{t(item.rotulo)}</span>
		</a>
	{/each}
	<button class="item" type="button" onclick={onmais}>
		<Menu size={22} strokeWidth={1.75} />
		<span>{t('casca.mais')}</span>
	</button>
</nav>

<style>
	.barra {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		padding: 4px 4px max(4px, env(safe-area-inset-bottom));
		background: var(--trilho);
		border-top: 1px solid var(--borda);
	}

	.item {
		display: grid;
		justify-items: center;
		align-content: center;
		gap: 2px;
		min-height: 52px;
		padding: 0;
		border: 0;
		border-radius: var(--raio-medio);
		background: none;
		color: var(--texto-fraco);
		font-size: 11px;
		font-weight: 600;
		text-decoration: none;
	}

	.item.ativo {
		color: var(--texto);
	}
</style>
