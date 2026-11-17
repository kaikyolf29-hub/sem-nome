<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { t } from '#lib/i18n/index.ts';
	import { espacosApp, paramsCanal } from '#lib/navegacao/espacos.ts';
	import { noticiasExemplo } from '#lib/prototipo/exemplos.ts';
	import { buscarComandos, type ItemComando } from './busca.ts';

	let { aberta, onfechar }: { aberta: boolean; onfechar: () => void } = $props();

	let consulta = $state('');
	let escolhido = $state(0);
	let campo: HTMLInputElement | undefined = $state();
	let quemAbriu: HTMLElement | null = null;

	const rota = (espaco: (typeof espacosApp)[number]['id'], canal?: string) =>
		resolve('/[espaco]/[[canal]]', paramsCanal(espaco, canal));

	const itens = $derived<ItemComando[]>([
		...espacosApp.map((e) => ({
			id: `espaco:${e.id}`,
			rotulo: t(e.rotulo),
			tipo: 'espaco' as const,
			destino: rota(e.id)
		})),
		...espacosApp.flatMap((e) =>
			e.canais.map((c) => ({
				id: `canal:${e.id}/${c.id}`,
				rotulo: t(c.rotulo),
				tipo: 'canal' as const,
				destino: rota(e.id, c.id)
			}))
		),
		...noticiasExemplo.map((n) => ({
			id: `noticia:${n.id}`,
			rotulo: n.titulo,
			tipo: 'noticia' as const,
			destino: rota(n.espaco, n.canais[0])
		}))
	]);
	const resultados = $derived(buscarComandos(consulta, itens));
	const tipos = {
		espaco: 'paleta.tipoEspaco',
		canal: 'paleta.tipoCanal',
		noticia: 'paleta.tipoNoticia'
	} as const;

	$effect(() => {
		if (!aberta) return;
		quemAbriu = document.activeElement as HTMLElement | null;
		consulta = '';
		escolhido = 0;
		queueMicrotask(() => campo?.focus());
		return () => {
			const alvo = quemAbriu;
			queueMicrotask(() => alvo?.isConnected && alvo.focus());
		};
	});

	$effect(() => {
		void consulta;
		escolhido = 0;
	});

	function abrir(item: ItemComando | undefined) {
		if (!item) return;
		quemAbriu = null;
		onfechar();
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- destino já vem de resolve()
		goto(item.destino);
	}

	function aoTeclar(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			onfechar();
		} else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			const n = resultados.length;
			if (n) escolhido = (escolhido + (e.key === 'ArrowDown' ? 1 : -1) + n) % n;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			abrir(resultados[escolhido]);
		}
	}
</script>

{#if aberta}
	<div class="veu" onclick={onfechar} aria-hidden="true"></div>
	<div class="paleta" role="dialog" aria-modal="true" aria-label={t('paleta.titulo')}>
		<div class="topo">
			<Search size={18} strokeWidth={1.75} aria-hidden="true" />
			<input
				bind:this={campo}
				bind:value={consulta}
				role="combobox"
				aria-label={t('paleta.campo')}
				aria-expanded="true"
				aria-controls="paleta-lista"
				aria-activedescendant={resultados[escolhido] ? `paleta-${escolhido}` : undefined}
				placeholder={t('paleta.campo')}
				autocomplete="off"
				spellcheck="false"
				onkeydown={aoTeclar}
			/>
		</div>
		{#if resultados.length}
			<ul id="paleta-lista" role="listbox" aria-label={t('paleta.resultados')}>
				{#each resultados as item, i (item.id)}
					<!-- svelte-ignore a11y_click_events_have_key_events (o teclado é tratado no campo, via aria-activedescendant) -->
					<li
						id="paleta-{i}"
						role="option"
						aria-selected={i === escolhido}
						onpointermove={() => (escolhido = i)}
						onclick={() => abrir(item)}
					>
						<span class="rotulo">{item.tipo === 'canal' ? '#' : ''}{item.rotulo}</span>
						<span class="tipo">{t(tipos[item.tipo])}</span>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="vazio">{t('paleta.vazio', { q: consulta })}</p>
		{/if}
		<p class="dica">{t('paleta.dica')}</p>
	</div>
{/if}

<style>
	.veu {
		position: fixed;
		inset: 0;
		z-index: 60;
		background: rgb(0 0 0 / 0.5);
	}

	.paleta {
		position: fixed;
		top: 12vh;
		left: 50%;
		z-index: 61;
		display: grid;
		width: min(560px, calc(100vw - 32px));
		max-height: 70vh;
		overflow: hidden;
		border: 1px solid var(--borda);
		border-radius: var(--raio-grande);
		background: var(--canais);
		box-shadow: 0 24px 64px rgb(0 0 0 / 0.4);
		transform: translateX(-50%);
	}

	.topo {
		display: flex;
		align-items: center;
		gap: var(--espaco-3);
		padding: 0 var(--espaco-4);
		border-bottom: 1px solid var(--borda);
		color: var(--texto-fraco);
	}

	input {
		flex: 1;
		min-width: 0;
		height: 52px;
		border: 0;
		background: none;
		font-size: var(--tipo-medio);
		outline: none;
	}

	ul {
		margin: 0;
		padding: var(--espaco-2);
		overflow-y: auto;
		list-style: none;
	}

	li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--espaco-3);
		min-height: 40px;
		padding: 0 var(--espaco-3);
		border-radius: var(--raio-medio);
		cursor: pointer;
	}

	li[aria-selected='true'] {
		background: color-mix(in srgb, var(--texto) 8%, transparent);
	}

	.rotulo {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tipo,
	.dica,
	.vazio {
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
	}

	.tipo {
		flex: none;
	}

	.vazio {
		padding: var(--espaco-5) var(--espaco-4);
	}

	.dica {
		padding: var(--espaco-2) var(--espaco-4);
		border-top: 1px solid var(--borda);
	}
</style>
