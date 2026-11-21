// Estado único das preferências da pessoa: lê do aparelho ao começar e grava a cada mudança.
// A conta (fase 1B, Task 7) entra por `substituir`.
import {
	adicionarTemaProprio,
	gravarLocal,
	lerLocal,
	normalizarTermo,
	type Preferencias
} from './preferencias.ts';
import { TEMAS } from './temas.ts';

type Armazenamento = Pick<Storage, 'getItem' | 'setItem'>;

/** No máximo de palavras silenciadas (o mesmo teto da tabela `preferencias`). */
export const MAX_SILENCIADAS = 50;

/** "Já viu a primeira visita": só do aparelho. Pular não é escolher (ao entrar, a conta vale). */
const CHAVE_VISTA = 'mirante:primeira-visita';

function armazenamentoDoNavegador(): Armazenamento | null {
	try {
		return typeof localStorage === 'undefined' ? null : localStorage;
	} catch {
		return null;
	}
}

export function criarPreferencias(
	armazenamento: Armazenamento | null = armazenamentoDoNavegador()
) {
	let atual = $state.raw<Preferencias>(lerLocal(armazenamento));
	let vista = $state(lerVista());

	function lerVista() {
		try {
			return armazenamento?.getItem(CHAVE_VISTA) === '1';
		} catch {
			return false;
		}
	}

	function mudar(p: Preferencias) {
		atual = p;
		gravarLocal(p, armazenamento);
	}

	return {
		get atual() {
			return atual;
		},
		get vista() {
			return vista;
		},
		marcarVista() {
			vista = true;
			try {
				armazenamento?.setItem(CHAVE_VISTA, '1');
			} catch {
				// Sem armazenamento: vale só nesta visita.
			}
		},
		/** Troca tudo de uma vez (por exemplo, ao juntar com o que está na conta). */
		substituir(p: Preferencias) {
			mudar(p);
		},
		/** Guarda os temas na ordem da lista, sem repetidos e sem ids desconhecidos. Mexer em tema é escolher. */
		definirTemas(ids: readonly string[]) {
			mudar({
				...atual,
				temas: TEMAS.filter((t) => ids.includes(t.id)).map((t) => t.id),
				escolheu: true
			});
		},
		adicionarTemaProprio(texto: string): 'ok' | 'invalido' | 'limite' | 'repetido' {
			const r = adicionarTemaProprio(atual, texto);
			if (typeof r === 'string') return r;
			mudar({ ...r, escolheu: true });
			return 'ok';
		},
		tirarTemaProprio(termo: string) {
			mudar({
				...atual,
				temasProprios: atual.temasProprios.filter((x) => x !== termo),
				escolheu: true
			});
		},
		esconderFonte(...ids: string[]) {
			const novas = ids.filter(
				(id, i) => !atual.fontesOcultas.includes(id) && ids.indexOf(id) === i
			);
			mudar({ ...atual, fontesOcultas: [...atual.fontesOcultas, ...novas] });
		},
		mostrarFonte(...ids: string[]) {
			mudar({ ...atual, fontesOcultas: atual.fontesOcultas.filter((x) => !ids.includes(x)) });
		},
		silenciar(texto: string): 'ok' | 'invalido' | 'limite' | 'repetido' {
			const palavra = normalizarTermo(texto);
			if (palavra === null) return 'invalido';
			if (atual.palavrasSilenciadas.includes(palavra)) return 'repetido';
			if (atual.palavrasSilenciadas.length >= MAX_SILENCIADAS) return 'limite';
			mudar({ ...atual, palavrasSilenciadas: [...atual.palavrasSilenciadas, palavra] });
			return 'ok';
		},
		tirarSilenciada(palavra: string) {
			mudar({
				...atual,
				palavrasSilenciadas: atual.palavrasSilenciadas.filter((x) => x !== palavra)
			});
		},
		definirIdioma(idioma: Preferencias['idioma']) {
			mudar({ ...atual, idioma });
		},
		marcarEscolheu() {
			mudar({ ...atual, escolheu: true });
		}
	};
}

export type EstadoPreferencias = ReturnType<typeof criarPreferencias>;

export const preferencias = criarPreferencias();
