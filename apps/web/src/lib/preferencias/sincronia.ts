// Liga as preferências do aparelho à conta: ao entrar, junta as duas; depois, grava cada mudança
// na conta (1 s depois da última, para não mandar um pedido por clique). Sem conta, nada sai do aparelho.
import { carregarDaConta, juntar, salvarNaConta } from './conta.ts';
import { PADRAO, type Preferencias } from './preferencias.ts';

export interface AlvoSincronia {
	readonly atual: Preferencias;
	substituir(p: Preferencias): void;
}

interface Opcoes {
	carregar?: (token: string) => Promise<Preferencias | null>;
	salvar?: (token: string, id: string, p: Preferencias) => Promise<void>;
	esperaMs?: number;
}

type Token = () => Promise<string | null>;

/**
 * Junta aparelho e conta. Quem nunca escolheu temas (só tem o padrão) não manda neles:
 * os temas vêm do lado que escolheu; filtros (fontes e palavras) sempre se somam.
 */
export function combinar(local: Preferencias, conta: Preferencias | null): Preferencias {
	if (!conta) return local;
	const somado = juntar(local, conta);
	if (local.escolheu && conta.escolheu) return somado;
	const dono = local.escolheu ? local : conta;
	return {
		...somado,
		temas: dono.temas,
		temasProprios: dono.temasProprios,
		idioma: dono.idioma,
		escolheu: dono.escolheu
	};
}

/** Texto que não depende da ordem dos campos, para saber se a conta já tem isto. */
const comparavel = (p: Preferencias) =>
	JSON.stringify([
		p.temas,
		p.temasProprios,
		p.fontesOcultas,
		p.palavrasSilenciadas,
		p.idioma,
		p.escolheu
	]);

export function criarSincronia(alvo: AlvoSincronia, opcoes: Opcoes = {}) {
	const carregar = opcoes.carregar ?? ((t: string) => carregarDaConta(t));
	const salvar =
		opcoes.salvar ?? ((t: string, id: string, p: Preferencias) => salvarNaConta(t, id, p));
	const esperaMs = opcoes.esperaMs ?? 1000;

	let id: string | null = null;
	let obterToken: Token = async () => null;
	let pronto = false;
	/** Muda a cada entrada ou saída: resposta de uma entrada antiga é ignorada. */
	let geracao = 0;
	let relogio: ReturnType<typeof setTimeout> | undefined;
	/** O que a conta tem agora (em JSON), para não gravar de novo a mesma coisa. */
	let naConta: string | null = null;

	async function gravar(p: Preferencias, minha: number) {
		const texto = comparavel(p);
		if (texto === naConta || !id) return;
		const token = await obterToken();
		if (!token || minha !== geracao || !id) return;
		try {
			await salvar(token, id, p);
			if (minha === geracao) naConta = texto;
		} catch {
			// Fica no aparelho; a próxima mudança tenta de novo.
		}
	}

	/** Lê a conta, junta com o aparelho e grava a junção. Falhou: fica para a próxima mudança. */
	async function sincronizar(minha: number) {
		const t = await obterToken();
		if (!t || minha !== geracao || !id) return;
		let daConta: Preferencias | null;
		try {
			daConta = await carregar(t);
		} catch {
			return;
		}
		if (minha !== geracao) return;
		if (daConta) naConta = comparavel(daConta);

		const local = alvo.atual;
		const junto = combinar(local, daConta);
		if (comparavel(junto) !== comparavel(local)) alvo.substituir(junto);
		pronto = true;
		await gravar(junto, minha);
	}

	return {
		/** A pessoa entrou (id) ou saiu (null). */
		async entrou(novoId: string | null, token: Token) {
			clearTimeout(relogio);
			const minha = ++geracao;
			// Saiu da conta: as escolhas ficam na conta, e o aparelho volta ao padrão para a próxima pessoa.
			if (id && !novoId) alvo.substituir({ ...PADRAO });
			id = novoId;
			obterToken = token;
			pronto = false;
			naConta = null;
			if (novoId) await sincronizar(minha);
		},

		/** As preferências mudaram (chamado a cada troca do estado). */
		mudou(p: Preferencias) {
			if (!id) return;
			clearTimeout(relogio);
			const minha = geracao;
			relogio = setTimeout(() => void (pronto ? gravar(p, minha) : sincronizar(minha)), esperaMs);
		}
	};
}

export type Sincronia = ReturnType<typeof criarSincronia>;
