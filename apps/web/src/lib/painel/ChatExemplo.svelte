<script lang="ts">
	import SeloIA from '#lib/feed/SeloIA.svelte';
	import { t } from '#lib/i18n/index.ts';
	import { chatExemplo, noticiasExemplo } from '#lib/prototipo/exemplos.ts';

	const fontes = chatExemplo.fontes.map((id) => noticiasExemplo.find((n) => n.id === id)!);
	let rascunho = $state('');

	function irPara(n: number) {
		document.getElementById(`fonte-chat-${n}`)?.focus();
	}
</script>

<section class="chat" aria-labelledby="chat-titulo">
	<h3 id="chat-titulo" class="titulo">{t('painel.analista')}</h3>

	<div class="pergunta">
		<span class="quem">{t('painel.voce')}</span>
		<p>{chatExemplo.pergunta}</p>
	</div>

	<div class="resposta">
		<SeloIA />
		<p>
			{#each chatExemplo.resposta as parte, i (i)}
				{parte.texto}{#if 'citacao' in parte}<button
						class="citacao"
						type="button"
						aria-label={t('painel.citacao', { n: parte.citacao })}
						onclick={() => irPara(parte.citacao)}>[{parte.citacao}]</button
					>{/if}
			{/each}
		</p>
		<ol class="fontes" aria-label={t('painel.fontes')}>
			{#each fontes as noticia, i (noticia.id)}
				<li>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- link externo para a fonte -->
					<a id="fonte-chat-{i + 1}" href={noticia.url}
						>{noticia.fontes[0].nome}: {noticia.titulo}</a
					>
				</li>
			{/each}
		</ol>
	</div>

	<p class="aviso">{t('painel.aviso')}</p>

	<form class="caixa" onsubmit={(e) => e.preventDefault()}>
		<label class="so-leitor" for="chat-campo">{t('painel.perguntar')}</label>
		<input
			id="chat-campo"
			type="text"
			bind:value={rascunho}
			placeholder={t('painel.perguntar')}
			autocomplete="off"
			aria-describedby="chat-em-breve"
		/>
		<button type="submit" disabled>{t('painel.enviar')}</button>
		<p id="chat-em-breve" class="em-breve">{t('painel.enviarEmBreve')}</p>
	</form>
</section>

<style>
	.chat {
		display: grid;
		gap: var(--espaco-3);
	}

	.titulo {
		font-size: var(--tipo-corpo);
	}

	.pergunta {
		justify-self: end;
		max-width: 90%;
		padding: var(--espaco-2) var(--espaco-3);
		border-radius: var(--raio-grande) var(--raio-grande) 4px var(--raio-grande);
		background: var(--cartao);
	}

	.quem {
		display: block;
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
		font-weight: 600;
	}

	.resposta {
		display: grid;
		gap: var(--espaco-2);
	}

	.resposta p {
		line-height: 1.6;
	}

	.citacao {
		margin: 0 2px;
		padding: 0 4px;
		border: 0;
		border-radius: 4px;
		background: var(--cartao);
		color: var(--texto);
		font-size: var(--tipo-legenda);
		font-weight: 700;
		vertical-align: 1px;
	}

	.fontes {
		display: grid;
		gap: 4px;
		margin: 0;
		padding-left: 1.4em;
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
	}

	.fontes a {
		color: inherit;
		text-underline-offset: 2px;
	}

	.aviso {
		padding: var(--espaco-2) var(--espaco-3);
		border-left: 3px solid var(--borda);
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
	}

	.caixa {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--espaco-2);
	}

	input {
		min-height: 40px;
		padding: 0 var(--espaco-3);
		border: 1px solid var(--borda);
		border-radius: 999px;
		background: var(--conteudo);
	}

	.caixa button {
		padding: 0 var(--espaco-4);
		border: 0;
		border-radius: 999px;
		background: var(--destaque);
		color: var(--texto-sobre-destaque);
		font-weight: 600;
	}

	.caixa button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.em-breve {
		grid-column: 1 / -1;
		color: var(--texto-fraco);
		font-size: var(--tipo-legenda);
	}
</style>
