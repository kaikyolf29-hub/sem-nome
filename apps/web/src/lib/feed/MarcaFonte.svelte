<script lang="ts">
	import Coins from '@lucide/svelte/icons/coins';
	import Landmark from '@lucide/svelte/icons/landmark';
	import Radar from '@lucide/svelte/icons/radar';
	import type { FonteNoticia } from './tipos.ts';

	let { fonte, tamanho = 40 }: { fonte: FonteNoticia; tamanho?: number } = $props();

	// Fonte oficial: prédio público. Veículo com marca: a cor e o símbolo dele. Sem marca: a inicial, serifada.
	const letra = $derived(
		fonte.nome
			.replace(/^(o|a|the)\s+/i, '')
			.charAt(0)
			.toUpperCase()
	);
	const marca = $derived(fonte.marca);
	const icone = $derived(Math.round(tamanho * 0.5));

	// A logo do site vem primeiro; se não carregar, cai no desenho de sempre.
	let logoFalhou = $state(false);
	$effect(() => {
		void fonte.logo;
		logoFalhou = false;
	});
	const comLogo = $derived(Boolean(fonte.logo) && !logoFalhou);
</script>

<span
	class="marca-fonte"
	class:com-logo={comLogo}
	class:oficial={fonte.primaria && !comLogo}
	class:sigla-longa={(marca?.sigla?.length ?? 1) > 1}
	style:width="{tamanho}px"
	style:height="{tamanho}px"
	style:background={!fonte.primaria && marca ? marca.cor : undefined}
	style:color={!fonte.primaria && marca ? '#ffffff' : undefined}
	style:font-size="{Math.round(tamanho * ((marca?.sigla?.length ?? 1) > 1 ? 0.36 : 0.55))}px"
	aria-hidden="true"
>
	{#if comLogo}
		<img
			src={fonte.logo}
			alt=""
			width={tamanho}
			height={tamanho}
			loading="lazy"
			decoding="async"
			onerror={() => (logoFalhou = true)}
		/>
	{:else if fonte.primaria}
		<Landmark size={icone} strokeWidth={1.75} />
	{:else if marca?.icone === 'radar'}
		<Radar size={icone} strokeWidth={2} />
	{:else if marca?.icone === 'cripto'}
		<Coins size={icone} strokeWidth={2} />
	{:else}
		{marca?.sigla ?? letra}
	{/if}
</span>

<style>
	.marca-fonte {
		display: grid;
		place-items: center;
		flex: none;
		border-radius: 10px;
		background: var(--cartao);
		color: var(--texto);
		font-family: var(--fonte-manchete);
		font-weight: 600;
		line-height: 1;
	}

	.sigla-longa {
		font-family: var(--fonte-ui);
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.com-logo {
		position: relative;
		overflow: hidden;
		background: #ffffff;
	}

	/* Contorno fino por cima da imagem: logo de fundo branco não some no tema claro. */
	.com-logo::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow: inset 0 0 0 1px var(--borda);
		pointer-events: none;
	}

	.com-logo img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.oficial {
		background: var(--destaque);
		color: var(--texto-sobre-destaque);
	}
</style>
