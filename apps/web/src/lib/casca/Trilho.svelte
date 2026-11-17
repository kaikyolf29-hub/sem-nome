<script lang="ts">
	import Settings from '@lucide/svelte/icons/settings';
	import { resolve } from '$app/paths';
	import favicon from '#lib/assets/favicon.svg';
	import { t } from '#lib/i18n/index.ts';
	import { espacosApp, paramsCanal, type IdEspaco } from '#lib/navegacao/espacos.ts';
	import { iconesEspaco } from './icones.ts';

	let { ativo, onajustes = () => {} }: { ativo: IdEspaco | null; onajustes?: () => void } =
		$props();

	// Tabindex rotativo: só um item entra no Tab; as setas andam entre eles.
	let focoIndice = $state(0);
	let itens: HTMLElement[] = $state([]);
	let dica = $state<{ texto: string; y: number } | null>(null);

	const total = espacosApp.length + 1;

	function aoTeclar(e: KeyboardEvent) {
		const mapa: Record<string, number> = {
			ArrowDown: focoIndice + 1,
			ArrowUp: focoIndice - 1,
			Home: 0,
			End: total - 1
		};
		if (!(e.key in mapa)) return;
		e.preventDefault();
		focoIndice = (mapa[e.key] + total) % total;
		itens[focoIndice]?.focus();
	}

	function mostrarDica(texto: string, el: HTMLElement) {
		const r = el.getBoundingClientRect();
		dica = { texto, y: r.top + r.height / 2 };
	}

	$effect(() => {
		const i = espacosApp.findIndex((e) => e.id === ativo);
		if (i >= 0) focoIndice = i;
	});
</script>

<nav class="trilho" aria-label={t('casca.espacos')}>
	<a class="logo" href={resolve('/')} aria-label={t('casca.irInicio')}>
		<img src={favicon} alt="" width="48" height="48" />
	</a>
	<span class="separador" aria-hidden="true"></span>

	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<ul class="lista" role="list" onkeydown={aoTeclar}>
		{#each espacosApp as espaco, i (espaco.id)}
			{@const Icone = iconesEspaco[espaco.icone]}
			{@const nome = t(espaco.rotulo)}
			<li class="item" class:ativo={espaco.id === ativo}>
				<span class="pilula" aria-hidden="true"></span>
				<a
					bind:this={itens[i]}
					class="botao"
					href={resolve('/[espaco]/[[canal]]', paramsCanal(espaco.id))}
					aria-label={nome}
					aria-current={espaco.id === ativo ? 'page' : undefined}
					tabindex={i === focoIndice ? 0 : -1}
					onfocus={(e) => {
						focoIndice = i;
						mostrarDica(nome, e.currentTarget);
					}}
					onblur={() => (dica = null)}
					onpointerenter={(e) => mostrarDica(nome, e.currentTarget)}
					onpointerleave={() => (dica = null)}
				>
					<Icone size={22} strokeWidth={1.75} />
				</a>
			</li>
		{/each}
	</ul>

	<div class="pe">
		<button
			bind:this={itens[espacosApp.length]}
			class="botao"
			type="button"
			aria-label={t('casca.ajustes')}
			tabindex={focoIndice === espacosApp.length ? 0 : -1}
			onkeydown={aoTeclar}
			onclick={onajustes}
			onfocus={(e) => {
				focoIndice = espacosApp.length;
				mostrarDica(t('casca.ajustes'), e.currentTarget);
			}}
			onblur={() => (dica = null)}
			onpointerenter={(e) => mostrarDica(t('casca.ajustes'), e.currentTarget)}
			onpointerleave={() => (dica = null)}
		>
			<Settings size={20} strokeWidth={1.75} />
		</button>
	</div>

	{#if dica}
		<div class="dica" style:top="{dica.y}px" aria-hidden="true">{dica.texto}</div>
	{/if}
</nav>

<style>
	.trilho {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--espaco-2);
		width: 72px;
		height: 100%;
		padding: var(--espaco-3) 0;
		background: var(--trilho);
	}

	.logo {
		display: block;
		width: 48px;
		height: 48px;
		border-radius: 14px;
	}

	.logo img {
		display: block;
		width: 100%;
		height: 100%;
	}

	.separador {
		width: 32px;
		height: 2px;
		border-radius: 1px;
		background: var(--borda);
		margin: var(--espaco-1) 0;
	}

	.lista {
		display: flex;
		flex-direction: column;
		gap: var(--espaco-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.item {
		position: relative;
		display: flex;
		justify-content: center;
		width: 72px;
	}

	.pilula {
		position: absolute;
		left: 0;
		top: 50%;
		width: 4px;
		height: 0;
		border-radius: 0 4px 4px 0;
		background: var(--texto);
		transform: translateY(-50%);
		transition: height var(--dur-medio) var(--curva);
	}

	.item:hover .pilula {
		height: 8px;
	}

	.item.ativo .pilula {
		height: 40px;
	}

	.botao {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		padding: 0;
		border: 0;
		border-radius: 24px;
		background: var(--cartao);
		color: var(--texto);
		text-decoration: none;
		transition:
			border-radius var(--dur-medio) var(--curva),
			background-color var(--dur-rapido) var(--curva),
			color var(--dur-rapido) var(--curva);
	}

	.botao:hover {
		border-radius: 16px;
		background: var(--cartao-hover);
	}

	.item.ativo .botao {
		border-radius: 16px;
		background: var(--destaque);
		color: var(--texto-sobre-destaque);
	}

	.pe {
		margin-top: auto;
	}

	.dica {
		position: fixed;
		left: 80px;
		z-index: 50;
		padding: 6px 10px;
		border-radius: var(--raio-medio);
		background: var(--destaque);
		color: var(--texto-sobre-destaque);
		font-size: var(--tipo-pequeno);
		font-weight: 600;
		white-space: nowrap;
		transform: translateY(-50%);
		pointer-events: none;
		box-shadow: 0 4px 16px rgb(0 0 0 / 0.25);
	}
</style>
