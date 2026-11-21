// Quem abre o painel "Notícias e temas" (o painel em si só carrega quando abre).
function criarPainelTemas() {
	let aberto = $state(false);
	let primeiraVisita = $state(false);
	let jaAbriuPrimeira = false;
	let devolverPara: HTMLElement | null = null;

	return {
		get aberto() {
			return aberto;
		},
		/** Aberto sozinho na primeira visita: título "O que você quer ver?", com Pular e Pronto. */
		get primeiraVisita() {
			return primeiraVisita;
		},
		/** Quem recebe o foco quando o painel fecha. */
		get devolverPara() {
			return devolverPara;
		},
		abrir(origem?: HTMLElement | null) {
			devolverPara =
				origem ??
				(typeof document === 'undefined' ? null : (document.activeElement as HTMLElement | null));
			primeiraVisita = false;
			aberto = true;
		},
		/** Uma vez por carga da página, só para quem ainda não escolheu. */
		abrirPrimeiraVisita() {
			if (jaAbriuPrimeira || aberto) return;
			jaAbriuPrimeira = true;
			devolverPara = null;
			primeiraVisita = true;
			aberto = true;
		},
		/** Baixa o código do painel; se falhar (por exemplo, depois de uma publicação nova), fecha. */
		async carregar<T>(importar: () => Promise<T>): Promise<T> {
			try {
				return await importar();
			} catch (erro) {
				this.fechar();
				throw erro;
			}
		},
		fechar() {
			if (!aberto) return;
			aberto = false;
			const alvo = devolverPara;
			devolverPara = null;
			queueMicrotask(() => {
				// Quem abriu sumiu (por exemplo, a gaveta de canais do celular fechou): volta ao botão dela.
				// Na primeira visita ninguém abriu: o foco vai para o título da página.
				const destino = alvo?.isConnected
					? alvo
					: document.querySelector<HTMLElement>(alvo ? '[data-volta-foco]' : '[data-foco-inicial]');
				destino?.focus();
			});
		}
	};
}

export const painelTemas = criarPainelTemas();
