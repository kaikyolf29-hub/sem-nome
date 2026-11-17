import { armazenamentoLocal } from '#lib/design/tema.ts';
import { lerMoedaPrincipal, salvarMoedaPrincipal, type Moeda } from './moedas.ts';

function criarMoeda() {
	let principal = $state<Moeda>(lerMoedaPrincipal(armazenamentoLocal()));
	return {
		get principal() {
			return principal;
		},
		definir(m: Moeda) {
			principal = m;
			salvarMoedaPrincipal(armazenamentoLocal(), m);
		}
	};
}

/** Moeda em que a pessoa vê o patrimônio todo (lembrada neste navegador). */
export const moeda = criarMoeda();
