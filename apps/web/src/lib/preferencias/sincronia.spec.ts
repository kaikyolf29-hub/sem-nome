import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PADRAO, type Preferencias } from './preferencias.ts';
import { criarSincronia } from './sincronia.ts';

function prefs(extra: Partial<Preferencias> = {}): Preferencias {
	return { ...PADRAO, temas: [], temasProprios: [], ...extra };
}

/** Um estado de preferências mínimo (o real é o de estado.svelte.ts). */
function alvoFalso(inicial: Preferencias) {
	const trocas: Preferencias[] = [];
	const alvo = {
		atual: inicial,
		substituir(p: Preferencias) {
			alvo.atual = p;
			trocas.push(p);
		}
	};
	return { alvo, trocas };
}

function contaFalsa(naConta: Preferencias | null) {
	const salvos: [string, string, Preferencias][] = [];
	return {
		salvos,
		carregar: vi.fn(async (token: string) => (token ? naConta : null)),
		salvar: vi.fn(async (token: string, id: string, p: Preferencias) => {
			salvos.push([token, id, p]);
		})
	};
}

const token = async () => 'tok';
const esperar = () => vi.advanceTimersByTimeAsync(0);

describe('criarSincronia', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it('ao entrar: junta aparelho e conta, troca o estado e grava a junção na conta', async () => {
		const { alvo, trocas } = alvoFalso(prefs({ temas: ['mundo'], escolheu: true }));
		const conta = contaFalsa(prefs({ temas: ['ciencia'], idioma: 'pt', escolheu: true }));
		const s = criarSincronia(alvo, conta);
		await s.entrou('u1', token);
		expect(conta.carregar).toHaveBeenCalledWith('tok');
		expect(trocas).toHaveLength(1);
		expect(alvo.atual.temas).toEqual(['mundo', 'ciencia']);
		expect(alvo.atual.idioma).toBe('pt');
		expect(conta.salvos).toEqual([['tok', 'u1', alvo.atual]]);
	});

	it('aparelho que nunca escolheu não mistura os temas padrão na conta', async () => {
		const { alvo } = alvoFalso(prefs({ temas: ['mercado', 'brasil'], escolheu: false }));
		const daConta = prefs({ temas: ['ciencia'], escolheu: true });
		const conta = contaFalsa(daConta);
		await criarSincronia(alvo, conta).entrou('u1', token);
		expect(alvo.atual).toEqual(daConta);
		expect(conta.salvos).toHaveLength(0);
	});

	it('conta vazia recebe o que está no aparelho', async () => {
		const local = prefs({ temas: ['mundo'], escolheu: true });
		const { alvo, trocas } = alvoFalso(local);
		const conta = contaFalsa(null);
		await criarSincronia(alvo, conta).entrou('u1', token);
		expect(trocas).toHaveLength(0);
		expect(conta.salvos).toEqual([['tok', 'u1', local]]);
	});

	it('mudanças com a conta ligada são gravadas uma vez, 1 s depois da última', async () => {
		const { alvo } = alvoFalso(prefs({ escolheu: true }));
		const conta = contaFalsa(null);
		const s = criarSincronia(alvo, conta);
		await s.entrou('u1', token);
		conta.salvos.length = 0;

		s.mudou(prefs({ temas: ['mundo'], escolheu: true }));
		await vi.advanceTimersByTimeAsync(500);
		s.mudou(prefs({ temas: ['mundo', 'saude'], escolheu: true }));
		await vi.advanceTimersByTimeAsync(999);
		expect(conta.salvos).toHaveLength(0);
		await vi.advanceTimersByTimeAsync(1);
		expect(conta.salvos.map(([, , p]) => p.temas)).toEqual([['mundo', 'saude']]);
	});

	it('não grava de novo o que acabou de gravar (a troca do estado ao entrar volta como mudança)', async () => {
		const { alvo } = alvoFalso(prefs({ temas: ['mundo'], escolheu: true }));
		const conta = contaFalsa(prefs({ temas: ['ciencia'], escolheu: true }));
		const s = criarSincronia(alvo, conta);
		await s.entrou('u1', token);
		s.mudou(alvo.atual);
		await vi.advanceTimersByTimeAsync(2000);
		expect(conta.salvos).toHaveLength(1);
	});

	it('sem conta, ou depois de sair, nada vai para a conta', async () => {
		const { alvo } = alvoFalso(prefs({ escolheu: true }));
		const conta = contaFalsa(null);
		const s = criarSincronia(alvo, conta);
		s.mudou(prefs({ temas: ['mundo'] }));
		await vi.advanceTimersByTimeAsync(2000);
		expect(conta.salvar).not.toHaveBeenCalled();

		await s.entrou('u1', token);
		conta.salvos.length = 0;
		s.mudou(prefs({ temas: ['saude'] }));
		await s.entrou(null, token);
		await vi.advanceTimersByTimeAsync(2000);
		expect(conta.salvos).toHaveLength(0);
	});

	it('saiu enquanto a conta carregava: não troca o estado nem grava', async () => {
		const { alvo, trocas } = alvoFalso(prefs({ escolheu: true }));
		let liberar: (p: Preferencias | null) => void = () => {};
		const conta = contaFalsa(null);
		conta.carregar.mockImplementationOnce(() => new Promise((r) => (liberar = r)));
		const s = criarSincronia(alvo, conta);
		const entrando = s.entrou('u1', token);
		await esperar();
		await s.entrou(null, token);
		liberar(prefs({ temas: ['ciencia'], escolheu: true }));
		await entrando;
		expect(trocas).toHaveLength(0);
		expect(conta.salvos).toHaveLength(0);
	});

	it('falha de rede não apaga nada do aparelho; a próxima mudança tenta de novo', async () => {
		const local = prefs({ temas: ['mundo'], escolheu: true });
		const { alvo, trocas } = alvoFalso(local);
		const conta = contaFalsa(null);
		conta.carregar.mockRejectedValueOnce(new TypeError('rede'));
		const s = criarSincronia(alvo, conta);
		await s.entrou('u1', token);
		expect(trocas).toHaveLength(0);
		expect(alvo.atual).toEqual(local);
		expect(conta.salvar).not.toHaveBeenCalled();

		// Sem ter lido a conta, não grava por cima dela: a próxima mudança lê de novo e junta.
		alvo.atual = prefs({ temas: ['saude'], escolheu: true });
		s.mudou(alvo.atual);
		await vi.advanceTimersByTimeAsync(1000);
		expect(conta.carregar).toHaveBeenCalledTimes(2);
		expect(conta.salvos.map(([, , p]) => p.temas)).toEqual([['saude']]);

		conta.salvar.mockRejectedValueOnce(new TypeError('rede'));
		alvo.atual = prefs({ temas: ['saude', 'mundo'], escolheu: true });
		s.mudou(alvo.atual);
		await vi.advanceTimersByTimeAsync(1000);
		alvo.atual = prefs({ temas: ['mundo'], escolheu: true });
		s.mudou(alvo.atual);
		await vi.advanceTimersByTimeAsync(1000);
		expect(conta.salvos.map(([, , p]) => p.temas)).toEqual([['saude'], ['mundo']]);
	});

	it('sem token (sessão expirada), não chama a conta', async () => {
		const { alvo } = alvoFalso(prefs({ escolheu: true }));
		const conta = contaFalsa(null);
		await criarSincronia(alvo, conta).entrou('u1', async () => null);
		expect(conta.carregar).not.toHaveBeenCalled();
		expect(conta.salvar).not.toHaveBeenCalled();
	});
});
