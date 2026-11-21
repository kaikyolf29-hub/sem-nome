<script lang="ts">
	// Painel "Notícias e temas" (e, na primeira visita, "O que você quer ver?"). Só é baixado quando
	// abre. Três partes: temas da lista, temas digitados e filtros (filtros não entram na primeira visita).
	import Bitcoin from '@lucide/svelte/icons/bitcoin';
	import Car from '@lucide/svelte/icons/car';
	import Check from '@lucide/svelte/icons/check';
	import Clapperboard from '@lucide/svelte/icons/clapperboard';
	import Cpu from '@lucide/svelte/icons/cpu';
	import FlaskConical from '@lucide/svelte/icons/flask-conical';
	import Globe from '@lucide/svelte/icons/globe';
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';
	import Hash from '@lucide/svelte/icons/hash';
	import HeartPulse from '@lucide/svelte/icons/heart-pulse';
	import Landmark from '@lucide/svelte/icons/landmark';
	import Leaf from '@lucide/svelte/icons/leaf';
	import MapIcone from '@lucide/svelte/icons/map';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import Plane from '@lucide/svelte/icons/plane';
	import Scale from '@lucide/svelte/icons/scale';
	import Trophy from '@lucide/svelte/icons/trophy';
	import X from '@lucide/svelte/icons/x';
	import type { Component } from 'svelte';
	import MarcaFonte from '#lib/feed/MarcaFonte.svelte';
	import { i18n, t } from '#lib/i18n/index.ts';
	import type { ChaveMensagem } from '#lib/i18n/tipos.ts';
	import { preferencias, type EstadoPreferencias } from './estado.svelte.ts';
	import {
		agruparPorNome,
		buscarFontes,
		fontesDeExemplo,
		fontesDoTema,
		type FonteLista
	} from './fontes.ts';
	import { adicionarTemaProprio } from './preferencias.ts';
	import { TEMAS } from './temas.ts';

	let {
		primeiraVisita,
		onfechar,
		estado = preferencias,
		carregarFontes = __PROTOTIPO__ ? async () => fontesDeExemplo() : () => buscarFontes()
	}: {
		primeiraVisita: boolean;
		onfechar: () => void;
		estado?: EstadoPreferencias;
		carregarFontes?: () => Promise<FonteLista[]>;
	} = $props();

	const icones: Record<string, Component<{ size?: number; strokeWidth?: number }>> = {
		newspaper: Newspaper,
		bitcoin: Bitcoin,
		cpu: Cpu,
		map: MapIcone,
		landmark: Landmark,
		globe: Globe,
		trophy: Trophy,
		'flask-conical': FlaskConical,
		'heart-pulse': HeartPulse,
		'graduation-cap': GraduationCap,
		clapperboard: Clapperboard,
		leaf: Leaf,
		scale: Scale,
		car: Car,
		plane: Plane
	};

	// Primeira visita: as escolhas ficam num rascunho; "Pronto" grava e "Pular" mantém o padrão.
	// Depois disso, cada mudança vale na hora.
	const inicio = () => ({
		temas: [...estado.atual.temas],
		temasProprios: [...estado.atual.temasProprios]
	});
	let rascunho = $state(inicio());
	const temas = $derived(primeiraVisita ? rascunho.temas : estado.atual.temas);
	const proprios = $derived(primeiraVisita ? rascunho.temasProprios : estado.atual.temasProprios);

	let fontes = $state.raw<FonteLista[]>([]);
	let situacaoFontes = $state<'carregando' | 'pronto' | 'erro'>('carregando');
	$effect(() => {
		carregarFontes().then(
			(lista) => {
				fontes = lista;
				situacaoFontes = 'pronto';
			},
			() => (situacaoFontes = 'erro')
		);
	});
	const gruposFontes = $derived(agruparPorNome(fontes));

	/** "g1, BBC News Brasil e DW Brasil"; com mais de 3, "g1, BBC News Brasil, DW Brasil e mais 1". */
	function linhaDeFontes(nomes: string[]): string {
		if (nomes.length <= 3) {
			return new Intl.ListFormat(i18n.idioma, { type: 'conjunction' }).format(nomes);
		}
		return t('painelTemas.maisFontes', {
			lista: nomes.slice(0, 3).join(', '),
			n: nomes.length - 3
		});
	}

	function alternarTema(id: string, marcado: boolean) {
		const novos = marcado ? [...temas, id] : temas.filter((x) => x !== id);
		if (primeiraVisita) rascunho.temas = TEMAS.filter((x) => novos.includes(x.id)).map((x) => x.id);
		else estado.definirTemas(novos);
	}

	let novoTema = $state('');
	let avisoTema = $state('');
	const avisos: Record<'invalido' | 'limite' | 'repetido', ChaveMensagem> = {
		invalido: 'painelTemas.invalido',
		limite: 'painelTemas.limite',
		repetido: 'painelTemas.repetido'
	};

	function adicionar(e: SubmitEvent) {
		e.preventDefault();
		const r = adicionarTemaProprio({ ...estado.atual, temasProprios: proprios }, novoTema);
		if (typeof r === 'string') {
			avisoTema = t(avisos[r]);
			return;
		}
		const termo = r.temasProprios.at(-1) ?? '';
		if (primeiraVisita) rascunho.temasProprios = r.temasProprios;
		else estado.adicionarTemaProprio(novoTema);
		avisoTema = t('painelTemas.adicionado', { termo });
		novoTema = '';
	}

	function tirarTema(termo: string) {
		if (primeiraVisita) rascunho.temasProprios = proprios.filter((x) => x !== termo);
		else estado.tirarTemaProprio(termo);
		avisoTema = '';
	}

	let novaPalavra = $state('');
	let avisoPalavra = $state('');
	function silenciar(e: SubmitEvent) {
		e.preventDefault();
		const r = estado.silenciar(novaPalavra);
		if (r === 'ok') {
			novaPalavra = '';
			avisoPalavra = '';
		} else {
			avisoPalavra = t(
				r === 'repetido'
					? 'painelTemas.palavraRepetida'
					: r === 'limite'
						? 'painelTemas.palavraLimite'
						: 'painelTemas.invalido'
			);
		}
	}

	function pronto() {
		if (primeiraVisita) {
			estado.substituir({
				...estado.atual,
				temas: rascunho.temas,
				temasProprios: rascunho.temasProprios,
				escolheu: true
			});
		}
		onfechar();
	}

	/** Esc, Pular e o véu: na primeira visita, contam como pular (não abre de novo). */
	function fechar() {
		if (primeiraVisita) estado.marcarEscolheu();
		onfechar();
	}

	const focaveis =
		'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
	let caixa = $state<HTMLElement>();

	$effect(() => {
		// O foco entra no diálogo (o leitor de tela lê o título); o Tab segue para dentro dele.
		caixa?.focus();
	});

	function aoTeclar(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			fechar();
			return;
		}
		if (e.key !== 'Tab' || !caixa) return;
		const lista = [...caixa.querySelectorAll<HTMLElement>(focaveis)];
		const [primeiro, ultimo] = [lista[0], lista[lista.length - 1]];
		if (e.shiftKey && (document.activeElement === primeiro || document.activeElement === caixa)) {
			e.preventDefault();
			ultimo?.focus();
		} else if (!e.shiftKey && document.activeElement === ultimo) {
			e.preventDefault();
			primeiro?.focus();
		}
	}
</script>

<div class="veu" aria-hidden="true" onclick={fechar}></div>
<div
	bind:this={caixa}
	class="painel-temas"
	class:primeira={primeiraVisita}
	data-painel-temas
	role="dialog"
	aria-modal="true"
	aria-labelledby="painel-temas-titulo"
	aria-describedby={primeiraVisita ? 'painel-temas-explicacao' : undefined}
	tabindex="-1"
	onkeydown={aoTeclar}
>
	<header class="topo">
		<div class="titulos">
			<h2 id="painel-temas-titulo">
				{t(primeiraVisita ? 'painelTemas.tituloPrimeira' : 'painelTemas.titulo')}
			</h2>
			{#if primeiraVisita}
				<p id="painel-temas-explicacao" class="explicacao">{t('painelTemas.explicacaoPrimeira')}</p>
			{/if}
		</div>
		{#if !primeiraVisita}
			<button class="fechar" type="button" aria-label={t('painelTemas.fechar')} onclick={fechar}>
				<X size={18} strokeWidth={2} />
			</button>
		{/if}
	</header>

	<div class="corpo">
		<section class="secao" aria-labelledby="painel-temas-lista">
			<h3 id="painel-temas-lista">{t('painelTemas.temas')}</h3>
			<ul class="linhas" role="list">
				{#each TEMAS as tema (tema.id)}
					{@const Icone = icones[tema.icone]}
					{@const nomes = fontesDoTema(tema, fontes)}
					<li>
						<label class="linha">
							<span class="icone" aria-hidden="true"><Icone size={18} strokeWidth={1.75} /></span>
							<span class="textos">
								<span class="nome" id="tema-{tema.id}">{t(tema.rotulo)}</span>
								{#if nomes.length}
									<span class="detalhe" id="tema-{tema.id}-fontes">{linhaDeFontes(nomes)}</span>
								{/if}
							</span>
							<input
								class="escondido"
								type="checkbox"
								checked={temas.includes(tema.id)}
								aria-labelledby="tema-{tema.id}"
								aria-describedby={nomes.length ? `tema-${tema.id}-fontes` : undefined}
								onchange={(e) => alternarTema(tema.id, e.currentTarget.checked)}
							/>
							<span class="caixa" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
						</label>
					</li>
				{/each}
			</ul>
		</section>

		<section class="secao" aria-labelledby="painel-temas-criar">
			<h3 id="painel-temas-criar">{t('painelTemas.criar')}</h3>
			<p class="ajuda">{t('painelTemas.criarAjuda')}</p>
			<form class="campo" onsubmit={adicionar}>
				<input
					type="text"
					bind:value={novoTema}
					aria-label={t('painelTemas.campoTema')}
					placeholder={t('painelTemas.exemploTema')}
					maxlength="60"
					autocomplete="off"
					enterkeyhint="done"
				/>
				<button class="botao" type="submit">{t('painelTemas.adicionar')}</button>
			</form>
			<p class="aviso" role="status">{avisoTema}</p>
			{#if proprios.length}
				<ul class="linhas" role="list">
					{#each proprios as termo (termo)}
						<li class="linha">
							<span class="icone" aria-hidden="true"><Hash size={18} strokeWidth={1.75} /></span>
							<span class="textos"><span class="nome">{termo}</span></span>
							<button
								class="tirar"
								type="button"
								aria-label={t('painelTemas.tirarTema', { termo })}
								onclick={() => tirarTema(termo)}
							>
								{t('painelTemas.tirar')}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		{#if !primeiraVisita}
			<section class="secao" aria-labelledby="painel-temas-filtros">
				<h3 id="painel-temas-filtros">{t('painelTemas.filtros')}</h3>
				<p class="ajuda">{t('painelTemas.filtrosAjuda')}</p>

				<fieldset class="grupo">
					<legend class="subtitulo">{t('painelTemas.idioma')}</legend>
					<div class="opcoes">
						{#each [{ valor: 'pt', rotulo: 'painelTemas.soPortugues' }, { valor: 'pt-en', rotulo: 'painelTemas.portuguesIngles' }] as const as opcao (opcao.valor)}
							<label class:ativa={estado.atual.idioma === opcao.valor}>
								<input
									class="escondido"
									type="radio"
									name="painel-temas-idioma"
									checked={estado.atual.idioma === opcao.valor}
									onchange={() => estado.definirIdioma(opcao.valor)}
								/>
								{t(opcao.rotulo)}
							</label>
						{/each}
					</div>
				</fieldset>

				<div class="grupo">
					<h4 class="subtitulo">{t('painelTemas.silenciadas')}</h4>
					<p class="ajuda">{t('painelTemas.silenciadasAjuda')}</p>
					<form class="campo" onsubmit={silenciar}>
						<input
							type="text"
							bind:value={novaPalavra}
							aria-label={t('painelTemas.campoPalavra')}
							placeholder={t('painelTemas.campoPalavra')}
							maxlength="60"
							autocomplete="off"
							enterkeyhint="done"
						/>
						<button class="botao" type="submit">{t('painelTemas.silenciar')}</button>
					</form>
					<p class="aviso" role="status">{avisoPalavra}</p>
					{#if estado.atual.palavrasSilenciadas.length}
						<ul class="linhas" role="list">
							{#each estado.atual.palavrasSilenciadas as palavra (palavra)}
								<li class="linha sem-icone">
									<span class="textos"><span class="nome">{palavra}</span></span>
									<button
										class="tirar"
										type="button"
										aria-label={t('painelTemas.tirarPalavra', { palavra })}
										onclick={() => estado.tirarSilenciada(palavra)}
									>
										{t('painelTemas.tirar')}
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<div class="grupo">
					<h4 class="subtitulo">{t('painelTemas.fontes')}</h4>
					<p class="ajuda">{t('painelTemas.fontesAjuda')}</p>
					{#if situacaoFontes === 'carregando'}
						<p class="aviso" role="status">{t('painelTemas.fontesCarregando')}</p>
					{:else if situacaoFontes === 'erro'}
						<p class="aviso" role="alert">{t('painelTemas.fontesErro')}</p>
					{:else}
						<ul class="linhas" role="list">
							{#each gruposFontes as grupo (grupo.nome)}
								{@const oculta = grupo.ids.every((id) => estado.atual.fontesOcultas.includes(id))}
								<li>
									<label class="linha fonte">
										<span class="logo" aria-hidden="true"
											><MarcaFonte fonte={grupo.fonte} tamanho={36} /></span
										>
										<span class="textos"><span class="nome">{grupo.nome}</span></span>
										<input
											class="escondido"
											type="checkbox"
											checked={!oculta}
											aria-label={grupo.nome}
											onchange={(e) =>
												e.currentTarget.checked
													? estado.mostrarFonte(...grupo.ids)
													: estado.esconderFonte(...grupo.ids)}
										/>
										<span class="caixa" aria-hidden="true"><Check size={14} strokeWidth={3} /></span
										>
									</label>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</section>
		{/if}
	</div>

	<footer class="rodape">
		{#if primeiraVisita}
			<button class="botao" type="button" onclick={fechar}>{t('painelTemas.pular')}</button>
		{/if}
		<button class="botao principal" type="button" onclick={pronto}>{t('painelTemas.pronto')}</button
		>
	</footer>
</div>

<style>
	.veu {
		position: fixed;
		inset: 0;
		z-index: 70;
		background: rgb(0 0 0 / 0.5);
	}

	.painel-temas {
		position: fixed;
		top: 50%;
		left: 50%;
		z-index: 71;
		display: flex;
		flex-direction: column;
		width: min(600px, calc(100% - 32px));
		max-height: min(760px, calc(100dvh - 48px));
		overflow: hidden;
		border: 1px solid var(--borda);
		border-radius: var(--raio-grande);
		background: var(--canais);
		box-shadow: 0 24px 64px rgb(0 0 0 / 0.4);
		transform: translate(-50%, -50%);
	}

	.painel-temas:focus {
		outline: none;
	}

	@media (prefers-reduced-motion: no-preference) {
		.veu {
			animation: aparecer var(--dur-medio) var(--curva);
		}

		.painel-temas {
			animation: subir var(--dur-medio) var(--curva);
		}
	}

	@keyframes aparecer {
		from {
			opacity: 0;
		}
	}

	@keyframes subir {
		from {
			opacity: 0;
			transform: translate(-50%, calc(-50% + 8px));
		}
	}

	.topo {
		display: flex;
		align-items: flex-start;
		gap: var(--espaco-3);
		padding: var(--espaco-5) var(--espaco-6) var(--espaco-4);
		border-bottom: 1px solid var(--borda);
	}

	.titulos {
		display: grid;
		flex: 1;
		gap: var(--espaco-1);
		min-width: 0;
	}

	h2 {
		font-size: var(--tipo-titulo);
		line-height: 1.3;
	}

	/* Sem o botão de fechar, o título fica sozinho no topo: alinha com a lista. */
	.topo:not(:has(.fechar)) h2 {
		padding-top: 2px;
	}

	.primeira h2 {
		font-size: var(--tipo-grande);
	}

	.explicacao,
	.ajuda {
		color: var(--texto-fraco);
		font-size: var(--tipo-pequeno);
		line-height: 1.45;
		text-wrap: pretty;
	}

	.fechar {
		display: grid;
		flex: none;
		place-items: center;
		width: 44px;
		height: 44px;
		margin: -10px -12px 0 0;
		padding: 0;
		border: 0;
		border-radius: var(--raio-medio);
		background: none;
		color: var(--texto-fraco);
		cursor: pointer;
	}

	.fechar:hover {
		background: color-mix(in srgb, var(--texto) 6%, transparent);
		color: var(--texto);
	}

	.corpo {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 0 var(--espaco-6);
	}

	.secao {
		padding: var(--espaco-5) 0;
	}

	.secao + .secao {
		border-top: 1px solid var(--borda);
	}

	h3 {
		font-size: var(--tipo-medio);
		line-height: 1.3;
	}

	h3 + .ajuda {
		margin-top: var(--espaco-1);
	}

	h3 + .linhas {
		margin-top: var(--espaco-2);
	}

	.grupo {
		margin: var(--espaco-5) 0 0;
		padding: 0;
		border: 0;
	}

	.subtitulo {
		padding: 0;
		font-size: var(--tipo-corpo);
		font-weight: 600;
		line-height: 1.3;
	}

	.subtitulo + .ajuda {
		margin-top: 2px;
	}

	/* Linhas de lista (não pílulas): o texto alinha com os títulos e o fundo aparece só no hover. */
	.linhas {
		display: grid;
		gap: 2px;
		margin: 0 calc(-1 * var(--espaco-3));
		padding: 0;
		list-style: none;
	}

	.campo + .aviso + .linhas,
	.ajuda + .linhas,
	.aviso + .linhas {
		margin-top: var(--espaco-2);
	}

	.linha {
		position: relative;
		display: grid;
		grid-template-columns: 36px minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--espaco-3);
		min-height: 56px;
		padding: var(--espaco-2) var(--espaco-3);
		border-radius: var(--raio-medio);
		cursor: pointer;
	}

	li.linha {
		cursor: default;
	}

	.linha.sem-icone {
		grid-template-columns: minmax(0, 1fr) auto;
		min-height: 48px;
		padding-block: 2px;
	}

	/* No toque, o hover fica preso depois do toque: só com mouse. */
	@media (hover: hover) {
		label.linha:hover {
			background: color-mix(in srgb, var(--texto) 5%, transparent);
		}
	}

	label.linha:has(input:focus-visible) {
		outline: 2px solid var(--foco);
		outline-offset: -2px;
	}

	.icone {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: var(--raio-medio);
		background: var(--cartao);
		color: var(--texto);
	}

	.logo {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
	}

	.fonte {
		min-height: 48px;
		padding-block: 2px;
	}

	.textos {
		display: grid;
		gap: 2px;
		min-width: 0;
	}

	.nome {
		font-weight: 500;
		line-height: 1.35;
		overflow-wrap: anywhere;
	}

	.detalhe {
		color: var(--texto-fraco);
		font-size: var(--tipo-pequeno);
		line-height: 1.4;
		text-wrap: pretty;
	}

	/* Caixa de seleção com o desenho do app (a nativa destoa entre sistemas). */
	/* A caixa nativa cobre a linha inteira, invisível; o desenho do app fica por baixo. */
	.escondido {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}

	.caixa {
		display: grid;
		place-items: center;
		width: 22px;
		height: 22px;
		border: 1.5px solid color-mix(in srgb, var(--texto) 45%, transparent);
		border-radius: 6px;
		color: transparent;
		transition:
			background-color var(--dur-rapido) var(--curva),
			border-color var(--dur-rapido) var(--curva);
	}

	input:checked + .caixa {
		border-color: var(--destaque);
		background: var(--destaque);
		color: var(--texto-sobre-destaque);
	}

	.campo {
		display: flex;
		gap: var(--espaco-2);
		margin-top: var(--espaco-3);
	}

	.campo input {
		flex: 1;
		min-width: 0;
		height: 44px;
		padding: 0 var(--espaco-3);
		border: 1px solid var(--borda);
		border-radius: var(--raio-medio);
		background: var(--conteudo);
		color: var(--texto);
		font: inherit;
		text-overflow: ellipsis;
	}

	.campo input::placeholder {
		color: var(--texto-fraco);
	}

	.campo input:focus-visible {
		outline: 2px solid var(--foco);
		outline-offset: 1px;
	}

	.aviso {
		color: var(--texto-fraco);
		font-size: var(--tipo-pequeno);
		line-height: 1.4;
	}

	.aviso:not(:empty) {
		margin-top: var(--espaco-2);
	}

	.botao {
		flex: none;
		min-height: 44px;
		padding: 0 var(--espaco-5);
		border: 1px solid var(--borda);
		border-radius: var(--raio-medio);
		background: var(--cartao);
		color: var(--texto);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	.botao:hover {
		background: var(--cartao-hover);
	}

	.botao.principal {
		border-color: var(--destaque);
		background: var(--destaque);
		color: var(--texto-sobre-destaque);
	}

	.botao.principal:hover {
		background: color-mix(in srgb, var(--destaque) 88%, var(--canais));
	}

	.tirar {
		min-width: 44px;
		min-height: 44px;
		padding: 0 var(--espaco-3);
		border: 0;
		border-radius: var(--raio-medio);
		background: none;
		color: var(--texto-fraco);
		font: inherit;
		font-size: var(--tipo-pequeno);
		font-weight: 600;
		cursor: pointer;
	}

	.tirar:hover {
		background: color-mix(in srgb, var(--texto) 6%, transparent);
		color: var(--texto);
	}

	.opcoes {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 4px;
		margin-top: var(--espaco-2);
		padding: 3px;
		border-radius: var(--raio-medio);
		background: var(--trilho);
	}

	.opcoes label {
		position: relative;
		display: grid;
		place-items: center;
		min-height: 44px;
		padding: 0 var(--espaco-2);
		border-radius: 6px;
		color: var(--texto-fraco);
		font-size: var(--tipo-pequeno);
		font-weight: 500;
		text-align: center;
		cursor: pointer;
	}

	.opcoes label.ativa {
		background: var(--cartao);
		color: var(--texto);
		font-weight: 600;
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.15);
	}

	.opcoes label:has(input:focus-visible) {
		outline: 2px solid var(--foco);
		outline-offset: 1px;
	}

	.rodape {
		display: flex;
		justify-content: flex-end;
		gap: var(--espaco-2);
		padding: var(--espaco-3) var(--espaco-6);
		border-top: 1px solid var(--borda);
	}

	/* Celular: tela cheia, botões do rodapé com a mesma largura. */
	@media (max-width: 767.98px) {
		.painel-temas {
			inset: 0;
			width: 100%;
			max-height: none;
			height: 100%;
			border: 0;
			border-radius: 0;
			transform: none;
		}

		@keyframes subir {
			from {
				opacity: 0;
				transform: translateY(8px);
			}
		}

		.topo {
			padding: max(var(--espaco-4), env(safe-area-inset-top)) var(--espaco-4) var(--espaco-4);
		}

		.corpo {
			padding: 0 var(--espaco-4);
		}

		.rodape {
			padding: var(--espaco-3) var(--espaco-4) max(var(--espaco-3), env(safe-area-inset-bottom));
		}

		.rodape .botao {
			flex: 1;
		}
	}
</style>
