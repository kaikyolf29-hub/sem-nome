// O que cada canal de "Para você" pede: as origens dos temas (feeds iguais para todos, com cache na
// borda) e as buscas dos temas digitados. O aparelho junta as respostas e aplica os filtros.
import type { Noticia } from '#lib/feed/tipos.ts';
import { espacoParaVoce } from '#lib/navegacao/espacos.ts';
import { noticiasDoCanal, noticiasExemplo } from '#lib/prototipo/exemplos.ts';
import { juntarFeeds } from './filtros.ts';
import { normalizarTermo, type Preferencias } from './preferencias.ts';
import { TEMAS, type Origem } from './temas.ts';

export interface PlanoCanal {
	origens: Origem[];
	termos: string[];
}

/** Máximo de cartões no `# tudo` (cada origem traz até 30). */
export const LIMITE_TUDO = 60;

function semRepetir(origens: Origem[]): Origem[] {
	const vistas = new Set<string>();
	return origens.filter((o) => {
		const chave = `${o.espaco}/${o.canal ?? ''}`;
		if (vistas.has(chave)) return false;
		vistas.add(chave);
		return true;
	});
}

export function planoDoCanal(canal: string, p: Preferencias): PlanoCanal {
	if (canal === 'tudo') {
		const escolhidos = new Set(p.temas);
		const origens = TEMAS.filter((t) => escolhidos.has(t.id)).flatMap((t) => t.origens);
		return { origens: semRepetir(origens), termos: [...p.temasProprios] };
	}
	const tema = TEMAS.find((t) => t.id === canal);
	if (tema) return { origens: [...tema.origens], termos: [] };
	const digitado = espacoParaVoce(p).canais.find((c) => c.id === canal && c.nome);
	return { origens: [], termos: digitado?.nome ? [digitado.nome] : [] };
}

const semAcento = (texto: string) =>
	` ${texto
		.normalize('NFD')
		.replace(/\p{M}+/gu, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.trim()} `;

/** Protótipo: as notícias de exemplo no lugar dos feeds e da busca, sem rede. */
export function exemplosParaVoce(canal: string, p: Preferencias): Noticia[] {
	const plano = planoDoCanal(canal, p);
	const listas = plano.origens.map((o) => noticiasDoCanal(o.espaco, o.canal));
	for (const termo of plano.termos) {
		const procurado = semAcento(normalizarTermo(termo) ?? termo);
		listas.push(
			noticiasExemplo.filter((n) => semAcento(`${n.titulo} ${n.trecho}`).includes(procurado))
		);
	}
	return juntarFeeds(listas).slice(0, LIMITE_TUDO);
}
