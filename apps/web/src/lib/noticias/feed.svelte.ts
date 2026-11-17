// Estado do feed real: carregando, pronto ou erro. Só a resposta do último pedido vale.
import type { Noticia } from '#lib/feed/tipos.ts';
import type { IdEspaco } from '#lib/navegacao/espacos.ts';
import { buscarFeed, ErroFeed } from './dados.ts';

type Buscar = (espaco: IdEspaco, canal: string) => Promise<Noticia[]>;

export function criarFeed(buscar: Buscar = buscarFeed, relogio: () => number = Date.now) {
	let estado = $state<'carregando' | 'pronto' | 'erro'>('carregando');
	let noticias = $state.raw<Noticia[]>([]);
	let erro = $state<'rede' | 'servidor' | null>(null);
	let pedido = 0;
	let atual: { espaco: IdEspaco; canal: string; em: number } | null = null;

	async function carregar(espaco: IdEspaco, canal: string) {
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

export type Feed = ReturnType<typeof criarFeed>;
