import { describe, expect, it } from 'vitest';
import { criarPreferencias } from './estado.svelte.ts';
import { PADRAO } from './preferencias.ts';

const CHAVE = 'mirante:preferencias';

function armazenamento(inicial?: object) {
	const dados = new Map<string, string>();
	if (inicial) dados.set(CHAVE, JSON.stringify(inicial));
	return {
		dados,
		getItem: (k: string) => dados.get(k) ?? null,
		setItem: (k: string, v: string) => void dados.set(k, v),
		gravado: () => JSON.parse(dados.get(CHAVE) ?? 'null')
	};
}

describe('estado das preferências', () => {
	it('lê do aparelho ao começar', () => {
		const arm = armazenamento({ ...PADRAO, temas: ['esportes'], escolheu: true });
		const p = criarPreferencias(arm);
		expect(p.atual.temas).toEqual(['esportes']);
		expect(p.atual.escolheu).toBe(true);
	});

	it('sem nada guardado, usa o padrão', () => {
		expect(criarPreferencias(armazenamento()).atual).toEqual(PADRAO);
	});

	it('definir temas guarda na ordem da lista, sem repetidos nem ids desconhecidos', () => {
		const arm = armazenamento();
		const p = criarPreferencias(arm);
		p.definirTemas(['esportes', 'xyz', 'mercado', 'esportes']);
		expect(p.atual.temas).toEqual(['mercado', 'esportes']);
		expect(arm.gravado().temas).toEqual(['mercado', 'esportes']);
	});

	it('tema digitado: adiciona, avisa e tira', () => {
		const arm = armazenamento();
		const p = criarPreferencias(arm);
		expect(p.adicionarTemaProprio('  Energia SOLAR ')).toBe('ok');
		expect(p.adicionarTemaProprio('energia solar')).toBe('repetido');
		expect(p.adicionarTemaProprio('a')).toBe('invalido');
		for (const t of ['b1', 'b2', 'b3', 'b4']) p.adicionarTemaProprio(t);
		expect(p.adicionarTemaProprio('b5')).toBe('limite');
		expect(arm.gravado().temasProprios).toHaveLength(5);
		p.tirarTemaProprio('energia solar');
		expect(p.atual.temasProprios).toEqual(['b1', 'b2', 'b3', 'b4']);
	});

	it('esconde e mostra fontes', () => {
		const arm = armazenamento();
		const p = criarPreferencias(arm);
		p.esconderFonte('g1', 'g1-mundo');
		p.esconderFonte('g1');
		expect(p.atual.fontesOcultas).toEqual(['g1', 'g1-mundo']);
		p.mostrarFonte('g1-mundo');
		expect(arm.gravado().fontesOcultas).toEqual(['g1']);
	});

	it('silencia e tira palavras (sem acento, sem repetir)', () => {
		const p = criarPreferencias(armazenamento());
		expect(p.silenciar('Bolsa Família')).toBe('ok');
		expect(p.silenciar('bolsa familia')).toBe('repetido');
		expect(p.silenciar(' ')).toBe('invalido');
		expect(p.atual.palavrasSilenciadas).toEqual(['bolsa familia']);
		p.tirarSilenciada('bolsa familia');
		expect(p.atual.palavrasSilenciadas).toEqual([]);
	});

	it('idioma, escolheu e substituir gravam no aparelho', () => {
		const arm = armazenamento();
		const p = criarPreferencias(arm);
		p.definirIdioma('pt');
		p.marcarEscolheu();
		expect(arm.gravado()).toMatchObject({ idioma: 'pt', escolheu: true });
		p.substituir({ ...PADRAO, temas: ['cripto'] });
		expect(p.atual.temas).toEqual(['cripto']);
		expect(arm.gravado().temas).toEqual(['cripto']);
	});

	it('armazenamento bloqueado: segue em memória, sem erro', () => {
		const quebrado = {
			getItem: () => {
				throw new Error('bloqueado');
			},
			setItem: () => {
				throw new Error('bloqueado');
			}
		};
		const p = criarPreferencias(quebrado);
		p.definirTemas(['saude']);
		expect(p.atual.temas).toEqual(['saude']);
	});
});
