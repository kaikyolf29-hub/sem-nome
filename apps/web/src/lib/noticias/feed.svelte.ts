// Estado do feed real: carregando, pronto ou erro. Só a resposta do último pedido vale.
import type { Noticia } from '#lib/feed/tipos.ts';
import { ErroFeed } from './dados.ts';

type Buscar<E extends string> = (espaco: E, canal: string) => Promise<Noticia[]>;

export function criarFeed<E extends string>(buscar: Buscar<E>, relogio: () => number = Date.now) {
	let estado = $state<'carregando' | 'pronto' | 'erro'>('carregando');
	let noticias = $state.raw<Noticia[]>([]);
	let erro = $state<'rede' | 'servidor' | null>(null);
	let pedido = 0;
	let atual: { espaco: E; canal: string; em: number } | null = null;

	async function carregar(espaco: E, canal: string) {
		const meu = ++pedido;
		const mesmoCanal = atual?.espaco === espaco && atual.canal === canal && estado === 'pronto';
		if (!mesmoCanal) {
			estado = 'carregando';
			noticias = [];
		}
		erro = null;
		atual = { espaco, canal, em: atual?.em ?? 0 };
		try {
			const lista = await buscar(espaco, canal);
			if (meu !== pedido) return;
			noticias = lista;
			estado = 'pronto';
			atual = { espaco, canal, em: relogio() };
		} catch (e) {
			if (meu !== pedido) return;
			erro = e instanceof ErroFeed ? e.tipo : 'servidor';
			// Atualização que falhou não apaga o que já está na tela.
			if (!mesmoCanal) estado = 'erro';
		}
	}

	return {
		get estado() {
			return estado;
		},
		get noticias() {
			return noticias;
		},
		get erro() {
			return erro;
		},
		carregar,
		/** Busca de novo o canal atual se a última carga passou de `maxMs`. */
		atualizarSeVelho(maxMs: number) {
			if (atual && relogio() - atual.em > maxMs) return carregar(atual.espaco, atual.canal);
		}
	};
}

export type Feed<E extends string = string> = ReturnType<typeof criarFeed<E>>;

const CINCO_MINUTOS = 5 * 60_000;

/** Ao voltar para a aba, busca de novo se a última carga passou de 5 min. Use num $effect. */
export function vigiarVolta(feed: { atualizarSeVelho(maxMs: number): unknown } | null) {
	if (!feed || typeof document === 'undefined') return;
	const voltar = () => {
		if (document.visibilityState === 'visible') void feed.atualizarSeVelho(CINCO_MINUTOS);
	};
	document.addEventListener('visibilitychange', voltar);
	return () => document.removeEventListener('visibilitychange', voltar);
}
