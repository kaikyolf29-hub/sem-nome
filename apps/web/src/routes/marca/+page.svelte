<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { resolve } from '$app/paths';
	import { t } from '#lib/i18n/index.ts';
	import { logos } from '#lib/marca/logos.ts';
	import { NOME_APP } from '#lib/nome.ts';

	const tamanhos = [256, 64, 32, 16];
	const fundos = [
		{ id: 'claro', cor: '#f7f7f8' },
		{ id: 'escuro', cor: '#212124' },
		{ id: 'preto', cor: '#000000' }
	];
	const emTamanho = (svg: string, px: number) =>
		svg.replace('width="256" height="256"', `width="${px}" height="${px}"`);
</script>

<svelte:head><title>{t('marca.titulo')} | {NOME_APP}</title></svelte:head>

<main class="marca">
	<a class="voltar" href={resolve('/')}
		><ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />{t('marca.voltar')}</a
	>
	<header>
		<h1>{t('marca.titulo')}</h1>
		<p>{t('marca.explicacao')}</p>
	</header>

	{#each logos as logo (logo.id)}
		<section class="opcao" aria-labelledby="logo-{logo.id}">
			<div class="grande" role="img" aria-label={t(logo.nome)}>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG fixo do próprio repositório -->
				{@html emTamanho(logo.svg, 200)}
			</div>
			<div class="detalhes">
				<h2 id="logo-{logo.id}">{t(logo.nome)}</h2>
				<p class="descricao">{t(logo.descricao)}</p>

				<h3>{t('marca.tamanhos')}</h3>
				<div class="tamanhos" aria-hidden="true">
					{#each tamanhos.slice(1) as px (px)}
						<span class="tamanho">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG fixo do próprio repositório -->
							{@html emTamanho(logo.svg, px)}
							<small class="numero">{px}px</small>
						</span>
					{/each}
				</div>

				<h3>{t('marca.fundos')}</h3>
				<div class="fundos" aria-hidden="true">
					{#each fundos as fundo (fundo.id)}
						<span class="fundo" style:background={fundo.cor}>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG fixo do próprio repositório -->
							{@html emTamanho(logo.svg, 48)}
						</span>
					{/each}
				</div>

				<div class="contextos" aria-hidden="true">
					<div>
						<h3>{t('marca.doca')}</h3>
						<span class="doca">
							{#each [0, 1, 2] as i (i)}<span class="vizinho"></span>{/each}
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG fixo do próprio repositório -->
							{@html emTamanho(logo.svg, 44)}
							<span class="vizinho"></span>
						</span>
					</div>
					<div>
						<h3>{t('marca.barraTarefas')}</h3>
						<span class="tarefas">
							<span class="vizinho pequeno"></span>
							<span class="ativo">
								<!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG fixo do próprio repositório -->
								{@html emTamanho(logo.svg, 24)}
							</span>
							<span class="vizinho pequeno"></span>
						</span>
					</div>
				</div>
			</div>
		</section>
	{/each}
</main>

<style>
	.marca {
		display: grid;
		gap: var(--espaco-10);
		max-width: 980px;
		margin: 0 auto;
		padding: var(--espaco-8) var(--espaco-6) var(--espaco-10);
	}

	.voltar {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		justify-self: start;
		color: var(--texto-fraco);
		font-size: var(--tipo-pequeno);
		text-decoration: none;
	}

	header {
		display: grid;
		gap: var(--espaco-2);
	}

	h1 {
		font-family: var(--fonte-manchete);
		font-size: clamp(28px, 4vw, 40px);
	}

	header p,
	.descricao {
		max-width: 60ch;
		color: var(--texto-fraco);
	}

	.opcao {
		display: grid;
		grid-template-columns: 200px minmax(0, 1fr);
		gap: var(--espaco-8);
		padding-top: var(--espaco-8);
		border-top: 1px solid var(--borda);
	}

	.grande :global(svg) {
		display: block;
	}

	.detalhes {
		display: grid;
		gap: var(--espaco-3);
		align-content: start;
	}

	h2 {
		font-size: var(--tipo-grande);
	}

	h3 {
		margin-top: var(--espaco-3);
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
		font-weight: 600;
	}

	.tamanhos,
	.fundos,
	.contextos {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: var(--espaco-5);
	}

	.tamanho {
		display: grid;
		justify-items: center;
		gap: 4px;
		color: var(--texto-fraco);
	}

	.fundo {
		display: grid;
		place-items: center;
		width: 88px;
		height: 72px;
		border: 1px solid var(--borda);
		border-radius: var(--raio-grande);
	}

	.doca,
	.tarefas {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		border: 1px solid var(--borda);
		background: var(--cartao);
	}

	.doca {
		border-radius: 18px;
	}

	.tarefas {
		border-radius: 8px;
	}

	.vizinho {
		width: 44px;
		height: 44px;
		border-radius: 11px;
		background: var(--cartao-hover);
	}

	.vizinho.pequeno {
		width: 24px;
		height: 24px;
		border-radius: 6px;
	}

	.ativo {
		display: grid;
		place-items: center;
		width: 36px;
		height: 32px;
		border-radius: 6px;
		background: color-mix(in srgb, var(--texto) 8%, transparent);
	}

	@media (max-width: 767.98px) {
		.opcao {
			grid-template-columns: minmax(0, 1fr);
		}

		.grande :global(svg) {
			width: 140px;
			height: 140px;
		}
	}
</style>
