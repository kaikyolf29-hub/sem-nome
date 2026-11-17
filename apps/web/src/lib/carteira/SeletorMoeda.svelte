<!-- Escolha da moeda principal: menu desenhado no estilo do app (lista nativa do sistema destoa). -->
<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { i18n, t } from '#lib/i18n/index.ts';
	import { MOEDAS, type Moeda } from './moedas.ts';

	let { valor, onescolher }: { valor: Moeda; onescolher: (m: Moeda) => void } = $props();

	let aberto = $state(false);
	let ativo = $state(0);
	let botao: HTMLButtonElement | undefined = $state();
	let lista: HTMLElement | undefined = $state();
	let caixa: HTMLElement | undefined = $state();

	const nomes = $derived(new Intl.DisplayNames(i18n.idioma, { type: 'currency' }));

	function abrir() {
		ativo = MOEDAS.indexOf(valor);
		aberto = true;
		queueMicrotask(() => lista?.focus());
	}

	function fechar(devolverFoco = true) {
		aberto = false;
		if (devolverFoco) queueMicrotask(() => botao?.focus());
	}

	function escolher(m: Moeda) {
		onescolher(m);
		fechar();
	}

	function aoTeclar(e: KeyboardEvent) {
		const ultimo = MOEDAS.length - 1;
		const mapa: Record<string, number> = {
			ArrowDown: Math.min(ultimo, ativo + 1),
			ArrowUp: Math.max(0, ativo - 1),
			Home: 0,
			End: ultimo
		};
		if (e.key in mapa) {
			e.preventDefault();
			ativo = mapa[e.key];
			lista?.querySelector(`#moeda-${MOEDAS[ativo]}`)?.scrollIntoView({ block: 'nearest' });
		} else if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			escolher(MOEDAS[ativo]);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			fechar();
		} else if (e.key === 'Tab') {
			fechar(false);
		}
	}

	// Clicar fora fecha.
	$effect(() => {
		if (!aberto) return;
		const fora = (e: PointerEvent) => {
			if (caixa && !caixa.contains(e.target as Node)) fechar(false);
		};
		window.addEventListener('pointerdown', fora);
		return () => window.removeEventListener('pointerdown', fora);
	});
</script>

<div class="seletor" bind:this={caixa}>
	<span class="rotulo" aria-hidden="true">{t('carteira.verEm')}</span>
	<button
		bind:this={botao}
		class="botao"
		type="button"
		aria-label="{t('carteira.verEm')}: {nomes.of(valor)} ({valor})"
		aria-haspopup="listbox"
		aria-expanded={aberto}
		onclick={() => (aberto ? fechar() : abrir())}
	>
		<span class="codigo">{valor}</span>
		<span class="nome">{nomes.of(valor)}</span>
		<span class="seta" class:virada={aberto}
			><ChevronDown size={16} strokeWidth={2} aria-hidden="true" /></span
		>
	</button>

	{#if aberto}
		<ul
			bind:this={lista}
			class="lista"
			role="listbox"
			tabindex="-1"
			aria-label={t('carteira.verEm')}
			aria-activedescendant="moeda-{MOEDAS[ativo]}"
			onkeydown={aoTeclar}
		>
			{#each MOEDAS as m, i (m)}
				<!-- svelte-ignore a11y_click_events_have_key_events (o teclado é tratado na lista, via aria-activedescendant) -->
				<li
					id="moeda-{m}"
					role="option"
					aria-selected={m === valor}
					class:ativo={i === ativo}
					onpointermove={() => (ativo = i)}
					onclick={() => escolher(m)}
				>
					<span class="codigo">{m}</span>
					<span class="nome">{nomes.of(m)}</span>
					{#if m === valor}<Check size={16} strokeWidth={2.25} aria-hidden="true" />{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.seletor {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: var(--espaco-2);
	}

	.rotulo {
		color: var(--texto-fraco);
		font-size: var(--tipo-pequeno);
	}

	.botao {
		display: inline-flex;
		align-items: center;
		gap: var(--espaco-2);
		min-height: 40px;
		padding: 0 var(--espaco-3) 0 6px;
		border: 1px solid var(--borda);
		border-radius: 999px;
		background: var(--cartao);
		font-weight: 600;
		transition:
			background-color var(--dur-rapido) var(--curva),
			transform var(--dur-rapido) var(--curva);
	}

	.botao:hover {
		background: var(--cartao-hover);
	}

	.botao:active {
		transform: scale(0.98);
	}

	.codigo {
		display: inline-grid;
		place-items: center;
		min-width: 40px;
		height: 26px;
		padding: 0 6px;
		border-radius: 999px;
		background: var(--trilho);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.03em;
	}

	.seta {
		display: inline-flex;
		color: var(--texto-fraco);
		transition: transform var(--dur-medio) var(--curva);
	}

	.seta.virada {
		transform: rotate(180deg);
	}

	.lista {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		z-index: 30;
		display: grid;
		gap: 2px;
		width: max(100%, 280px);
		max-height: min(380px, 60vh);
		margin: 0;
		padding: 6px;
		overflow-y: auto;
		list-style: none;
		border: 1px solid var(--borda);
		border-radius: var(--raio-grande);
		background: var(--canais);
		box-shadow: 0 18px 48px rgb(0 0 0 / 0.3);
		transform-origin: top right;
		animation: abrir var(--dur-medio) var(--curva);
	}

	.lista:focus {
		outline: none;
	}

	.lista:focus-visible {
		outline: 2px solid var(--foco);
		outline-offset: 2px;
	}

	@keyframes abrir {
		from {
			opacity: 0;
			transform: translateY(-4px) scale(0.97);
		}
	}

	li {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) 16px;
		align-items: center;
		gap: var(--espaco-3);
		min-height: 44px;
		padding: 0 var(--espaco-3) 0 6px;
		border-radius: var(--raio-medio);
		cursor: pointer;
	}

	li.ativo {
		background: color-mix(in srgb, var(--texto) 8%, transparent);
	}

	li .nome {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	li[aria-selected='true'] .nome {
		font-weight: 600;
	}
</style>
