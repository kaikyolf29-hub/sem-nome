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
		fechar() {
			aberto = false;
			const alvo = devolverPara;
			devolverPara = null;
			queueMicrotask(() => {
				// Quem abriu sumiu (por exemplo, a gaveta de canais do celular fechou): volta ao botão dela.
				const destino = alvo?.isConnected
					? alvo
					: alvo
						? document.querySelector<HTMLElement>('[data-volta-foco]')
						: null;
				destino?.focus();
			});
		}
	};
}

export const painelTemas = criarPainelTemas();
