<script lang="ts">
	import type { Snippet } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { fade, fly } from 'svelte/transition';

	let {
		lado,
		aberta,
		onfechar,
		rotulo,
		children
	}: {
		lado: 'esquerda' | 'direita';
		aberta: boolean;
		onfechar: () => void;
		rotulo: string;
		children: Snippet;
	} = $props();

	const LIMITE_ARRASTO = 80;
	const focaveis =
		'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

	let painel: HTMLElement | undefined = $state();
	let quemAbriu: HTMLElement | null = null;
	let inicioX: number | null = null;
	let deslocamento = $state(0);

	const duracao = $derived(prefersReducedMotion.current ? 0 : 200);
	const sinal = $derived(lado === 'esquerda' ? -1 : 1);

	$effect(() => {
		if (!aberta || !painel) return;
		quemAbriu = document.activeElement as HTMLElement | null;
		painel.querySelector<HTMLElement>(focaveis)?.focus();
		return () => {
			// Ao fechar, o foco volta a quem abriu.
			const alvo = quemAbriu;
			queueMicrotask(() => alvo?.isConnected && alvo.focus());
		};
	});

	function aoTeclar(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			onfechar();
			return;
		}
		if (e.key !== 'Tab' || !painel) return;
		const lista = [...painel.querySelectorAll<HTMLElement>(focaveis)];
		if (lista.length === 0) return;
		const [primeiro, ultimo] = [lista[0], lista[lista.length - 1]];
		if (e.shiftKey && document.activeElement === primeiro) {
			e.preventDefault();
			ultimo.focus();
		} else if (!e.shiftKey && document.activeElement === ultimo) {
			e.preventDefault();
			primeiro.focus();
		}
	}

	function aoApertar(e: PointerEvent) {
		if (e.pointerType === 'mouse') return;
		inicioX = e.clientX;
	}

	function aoMover(e: PointerEvent) {
		if (inicioX === null) return;
		const dx = e.clientX - inicioX;
		// Só conta o arrasto na direção de fechar.
		deslocamento = Math.sign(dx) === sinal ? dx : 0;
	}

	function aoSoltar() {
		if (inicioX === null) return;
		if (Math.abs(deslocamento) > LIMITE_ARRASTO) onfechar();
		inicioX = null;
		deslocamento = 0;
	}
</script>

{#if aberta}
	<div
		class="veu"
		transition:fade={{ duration: duracao }}
		onclick={onfechar}
		aria-hidden="true"
	></div>
	<div
		bind:this={painel}
		class="gaveta {lado}"
		role="dialog"
		aria-modal="true"
		aria-label={rotulo}
		tabindex="-1"
		style:translate={deslocamento ? `${deslocamento}px 0` : undefined}
		transition:fly={{ x: sinal * 320, duration: duracao, opacity: 1 }}
		onkeydown={aoTeclar}
		onpointerdown={aoApertar}
		onpointermove={aoMover}
		onpointerup={aoSoltar}
		onpointercancel={aoSoltar}
	>
		{@render children()}
	</div>
{/if}

<style>
	.veu {
		position: fixed;
		inset: 0;
		z-index: 40;
		background: rgb(0 0 0 / 0.5);
	}

	.gaveta {
		position: fixed;
		top: 0;
		bottom: 0;
		z-index: 41;
		display: flex;
		width: min(88vw, 340px);
		background: var(--canais);
		box-shadow: 0 0 32px rgb(0 0 0 / 0.35);
		touch-action: pan-y;
		outline: none;
	}

	.esquerda {
		left: 0;
	}

	.direita {
		right: 0;
	}
</style>
