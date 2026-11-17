<script lang="ts">
	import Settings from '@lucide/svelte/icons/settings';
	import User from '@lucide/svelte/icons/user';
	import { siGoogle } from 'simple-icons';
	import { sessao as sessaoGlobal } from '#lib/conta/estado.svelte.ts';
	import type { Sessao } from '#lib/conta/sessao.svelte.ts';
	import { t } from '#lib/i18n/index.ts';
	import { casca } from './casca.svelte.ts';
	import MedidorIA from './MedidorIA.svelte';

	let { sessao = sessaoGlobal }: { sessao?: Sessao } = $props();

	const renovaEm = new Date(Date.now() + 2 * 3_600_000);

	let perfilAberto = $state(false);
	let entrando = $state(false);

	const usuario = $derived(sessao.usuario);
	const nome = $derived(usuario?.nome || t('casca.visitante'));
	const status = $derived(usuario ? usuario.email : t('casca.semConta'));

	async function entrar() {
		entrando = true;
		await sessao.entrarComGoogle();
		// Se ficou na página (erro ou aviso), o botão volta ao normal.
		entrando = false;
	}

	async function sair() {
		await sessao.sair();
		fecharPerfil();
	}
	let botaoConta: HTMLButtonElement | undefined = $state();
	let perfil: HTMLElement | undefined = $state();
	let caixa: HTMLElement | undefined = $state();

	function fecharPerfil(devolverFoco = true) {
		perfilAberto = false;
		if (devolverFoco) queueMicrotask(() => botaoConta?.focus());
	}

	$effect(() => {
		if (!perfilAberto) return;
		queueMicrotask(() => perfil?.querySelector<HTMLElement>('button')?.focus());
		const fora = (e: PointerEvent) => {
			if (caixa && !caixa.contains(e.target as Node)) fecharPerfil(false);
		};
		window.addEventListener('pointerdown', fora);
		return () => window.removeEventListener('pointerdown', fora);
	});
</script>

{#snippet avatar(grande: boolean)}
	<span class="avatar" class:grande aria-hidden="true">
		{#if usuario?.avatarUrl}
			<img src={usuario.avatarUrl} alt="" referrerpolicy="no-referrer" />
		{:else}
			<User size={grande ? 24 : 18} strokeWidth={1.75} />
		{/if}
	</span>
{/snippet}

{#snippet botaoGoogle()}
	{#if !usuario}
		<button class="google" type="button" disabled={entrando} onclick={entrar}>
			<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"
				><path d={siGoogle.path} /></svg
			>
			{entrando ? t('conta.entrando') : t('casca.entrarGoogle')}
		</button>
	{/if}
	{#if sessao.erro}<p class="aviso" role="status">{t(sessao.erro)}</p>{/if}
{/snippet}

<section class="conta" bind:this={caixa}>
	<div class="linha">
		<button
			bind:this={botaoConta}
			class="quem"
			type="button"
			aria-haspopup="dialog"
			aria-expanded={perfilAberto}
			onclick={() => (perfilAberto ? fecharPerfil() : (perfilAberto = true))}
		>
			{@render avatar(false)}
			<span class="nomes">
				<span class="nome">{nome}</span>
				<span class="status">{status}</span>
			</span>
		</button>
		<button
			class="ajustes"
			type="button"
			aria-label={t('casca.ajustes')}
			aria-expanded={casca.ajustesAberto}
			onclick={() => (casca.ajustesAberto = !casca.ajustesAberto)}
		>
			<Settings size={18} strokeWidth={1.75} />
		</button>
	</div>

	{@render botaoGoogle()}
	<MedidorIA usoPct={40} {renovaEm} />

	{#if perfilAberto}
		<div
			bind:this={perfil}
			class="perfil"
			role="dialog"
			aria-label={t('casca.suaConta')}
			tabindex="-1"
			onkeydown={(e) => {
				if (e.key === 'Escape') {
					e.stopPropagation();
					fecharPerfil();
				}
			}}
		>
			<div class="corpo-perfil">
				<div class="cabeca">
					{@render avatar(true)}
					<span class="nomes">
						<span class="nome-grande">{nome}</span>
						<span class="status">{status}</span>
					</span>
				</div>
				{#if usuario}
					<button class="google" type="button" onclick={sair}>{t('conta.sair')}</button>
				{:else}
					<p class="texto">{t('casca.contaTexto')}</p>
				{/if}
				{@render botaoGoogle()}
				<div class="separador" aria-hidden="true"></div>
				<MedidorIA usoPct={40} {renovaEm} />
			</div>
		</div>
	{/if}
</section>

<style>
	.conta {
		position: relative;
		display: grid;
		gap: var(--espaco-3);
		padding: var(--espaco-2) var(--espaco-3) var(--espaco-4);
		background: var(--trilho);
		border-top: 1px solid var(--borda);
	}

	.linha {
		display: flex;
		align-items: center;
		gap: var(--espaco-1);
	}

	.quem {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 10px;
		min-width: 0;
		min-height: 44px;
		padding: 4px 6px 4px 4px;
		border: 0;
		border-radius: var(--raio-medio);
		background: none;
		text-align: start;
	}

	.quem:hover,
	.quem[aria-expanded='true'] {
		background: color-mix(in srgb, var(--texto) 6%, transparent);
	}

	.avatar {
		display: grid;
		place-items: center;
		flex: none;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--cartao);
		color: var(--texto-fraco);
		box-shadow: inset 0 0 0 1px var(--borda);
	}

	.avatar img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
	}

	.google:disabled {
		cursor: progress;
		opacity: 0.7;
	}

	.nomes {
		display: grid;
		min-width: 0;
		line-height: 1.25;
	}

	.nome {
		overflow: hidden;
		font-size: var(--tipo-pequeno);
		font-weight: 600;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.status {
		overflow: hidden;
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.nome-grande {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ajustes {
		display: grid;
		place-items: center;
		flex: none;
		width: 40px;
		height: 40px;
		padding: 0;
		border: 0;
		border-radius: var(--raio-medio);
		background: none;
		color: var(--texto-fraco);
	}

	.ajustes:hover,
	.ajustes[aria-expanded='true'] {
		background: color-mix(in srgb, var(--texto) 6%, transparent);
		color: var(--texto);
	}

	.google {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-height: 36px;
		padding: 0 var(--espaco-4);
		border: 1px solid var(--borda);
		border-radius: 999px;
		background: var(--cartao);
		font-size: var(--tipo-pequeno);
		font-weight: 600;
		transition:
			background-color var(--dur-rapido) var(--curva),
			transform var(--dur-rapido) var(--curva);
	}

	.google:hover {
		background: var(--cartao-hover);
	}

	.google:active {
		transform: scale(0.98);
	}

	.google svg {
		fill: currentColor;
	}

	.aviso {
		margin-top: calc(var(--espaco-1) * -1);
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
		line-height: 1.4;
		text-align: center;
	}

	/* Perfil: abre em cima do cartão, como o perfil do Discord. */
	.perfil {
		position: absolute;
		bottom: calc(100% + 8px);
		left: 8px;
		z-index: 35;
		width: 292px;
		max-width: calc(100vw - 24px);
		overflow: hidden;
		border: 1px solid var(--borda);
		border-radius: var(--raio-grande);
		background: var(--canais);
		box-shadow: 0 20px 56px rgb(0 0 0 / 0.35);
		transform-origin: bottom left;
		animation: abrir var(--dur-medio) var(--curva);
	}

	.perfil:focus {
		outline: none;
	}

	@keyframes abrir {
		from {
			opacity: 0;
			transform: translateY(6px) scale(0.98);
		}
	}

	.corpo-perfil {
		display: grid;
		gap: var(--espaco-4);
		padding: var(--espaco-4);
	}

	.cabeca {
		display: flex;
		align-items: center;
		gap: var(--espaco-3);
	}

	.avatar.grande {
		width: 48px;
		height: 48px;
	}

	.nome-grande {
		font-size: var(--tipo-medio);
		font-weight: 650;
		line-height: 1.25;
	}

	.texto {
		color: var(--texto-fraco);
		font-size: var(--tipo-pequeno);
		line-height: 1.5;
	}

	.separador {
		height: 1px;
		background: var(--borda);
	}
</style>
