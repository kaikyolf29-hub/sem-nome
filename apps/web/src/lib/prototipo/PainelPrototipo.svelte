<script lang="ts">
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import X from '@lucide/svelte/icons/x';
	import { casca } from '#lib/casca/casca.svelte.ts';
	import { tema } from '#lib/design/tema.svelte.ts';
	import type { PreferenciaTema } from '#lib/design/tema.ts';
	import { i18n, t } from '#lib/i18n/index.ts';
	import type { ChaveMensagem, Idioma } from '#lib/i18n/tipos.ts';
	import { janela, type ModoJanela } from '#lib/janela/janela.svelte.ts';

	let manchete = $state<'serifada' | 'semSerifa'>('serifada');

	$effect(() => {
		document.documentElement.style.setProperty(
			'--fonte-manchete',
			manchete === 'serifada'
				? "'Newsreader Variable', Georgia, serif"
				: "'Inter Variable', system-ui, sans-serif"
		);
	});

	const grupos: {
		id: string;
		titulo: ChaveMensagem;
		opcoes: { valor: string; rotulo: ChaveMensagem }[];
		atual: () => string;
		definir: (v: string) => void;
	}[] = [
		{
			id: 'tema',
			titulo: 'prototipo.tema',
			opcoes: [
				{ valor: 'sistema', rotulo: 'prototipo.temaSistema' },
				{ valor: 'claro', rotulo: 'prototipo.temaClaro' },
				{ valor: 'escuro', rotulo: 'prototipo.temaEscuro' },
				{ valor: 'preto', rotulo: 'prototipo.temaPreto' }
			],
			atual: () => tema.preferencia,
			definir: (v) => tema.definir(v as PreferenciaTema)
		},
		{
			id: 'janela',
			titulo: 'prototipo.verComo',
			opcoes: [
				{ valor: 'navegador', rotulo: 'prototipo.navegador' },
				{ valor: 'matsu', rotulo: 'prototipo.matsu' },
				{ valor: 'windows', rotulo: 'prototipo.windows' }
			],
			atual: () => janela.modo,
			definir: (v) => (janela.modo = v as ModoJanela)
		},
		{
			id: 'manchete',
			titulo: 'prototipo.manchete',
			opcoes: [
				{ valor: 'serifada', rotulo: 'prototipo.serifada' },
				{ valor: 'semSerifa', rotulo: 'prototipo.semSerifa' }
			],
			atual: () => manchete,
			definir: (v) => (manchete = v as typeof manchete)
		},
		{
			id: 'idioma',
			titulo: 'prototipo.idioma',
			opcoes: [
				{ valor: 'pt-BR', rotulo: 'prototipo.idioma' },
				{ valor: 'en', rotulo: 'prototipo.idioma' }
			],
			atual: () => i18n.idioma,
			definir: (v) => i18n.definir(v as Idioma)
		}
	];

	const nomesIdioma: Record<string, string> = { 'pt-BR': 'Português', en: 'English' };
</script>

{#if casca.ajustesAberto}
	<section class="painel" aria-label={t('prototipo.ajustes')}>
		<header>
			<h2>{t('prototipo.ajustes')}</h2>
			<button
				class="fechar"
				type="button"
				aria-label={t('prototipo.fechar')}
				onclick={() => (casca.ajustesAberto = false)}
			>
				<X size={16} strokeWidth={2} />
			</button>
		</header>
		{#each grupos as grupo (grupo.id)}
			<fieldset>
				<legend>{t(grupo.titulo)}</legend>
				<div class="opcoes">
					{#each grupo.opcoes as opcao (opcao.valor)}
						<label class:ativa={grupo.atual() === opcao.valor}>
							<input
								type="radio"
								name="prototipo-{grupo.id}"
								value={opcao.valor}
								checked={grupo.atual() === opcao.valor}
								onchange={() => grupo.definir(opcao.valor)}
							/>
							{grupo.id === 'idioma' ? nomesIdioma[opcao.valor] : t(opcao.rotulo)}
						</label>
					{/each}
				</div>
			</fieldset>
		{/each}
	</section>
{:else}
	<button
		class="abrir"
		type="button"
		aria-label={t('prototipo.ajustes')}
		onclick={() => (casca.ajustesAberto = true)}
	>
		<SlidersHorizontal size={18} strokeWidth={1.75} />
	</button>
{/if}

<style>
	.painel {
		position: fixed;
		right: var(--espaco-4);
		bottom: calc(var(--espaco-4) + env(safe-area-inset-bottom));
		z-index: 55;
		display: grid;
		gap: var(--espaco-3);
		width: min(320px, calc(100vw - 32px));
		padding: var(--espaco-4);
		border: 1px solid var(--borda);
		border-radius: var(--raio-grande);
		background: var(--canais);
		box-shadow: 0 16px 48px rgb(0 0 0 / 0.35);
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	h2 {
		font-size: var(--tipo-corpo);
	}

	.fechar,
	.abrir {
		display: grid;
		place-items: center;
		border: 0;
		color: var(--texto);
	}

	.fechar {
		width: 32px;
		height: 32px;
		border-radius: var(--raio-medio);
		background: none;
	}

	.abrir {
		position: fixed;
		right: var(--espaco-4);
		bottom: calc(var(--espaco-4) + env(safe-area-inset-bottom));
		z-index: 55;
		width: 44px;
		height: 44px;
		border: 1px solid var(--borda);
		border-radius: 50%;
		background: var(--canais);
		box-shadow: 0 6px 20px rgb(0 0 0 / 0.25);
	}

	fieldset {
		display: grid;
		gap: 6px;
		margin: 0;
		padding: 0;
		border: 0;
	}

	legend {
		margin-bottom: 6px;
		padding: 0;
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
		font-weight: 600;
	}

	.opcoes {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		padding: 3px;
		border-radius: var(--raio-medio);
		background: var(--trilho);
	}

	label {
		flex: 1;
		min-width: max-content;
		padding: 6px 10px;
		border-radius: 6px;
		font-size: var(--tipo-pequeno);
		text-align: center;
		cursor: pointer;
	}

	label.ativa {
		background: var(--cartao);
		font-weight: 600;
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.15);
	}

	label:has(input:focus-visible) {
		outline: 2px solid var(--foco);
		outline-offset: 1px;
	}

	input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	@media (max-width: 767.98px) {
		.painel,
		.abrir {
			bottom: calc(76px + env(safe-area-inset-bottom));
		}
	}
</style>
