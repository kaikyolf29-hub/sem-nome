// Liga o estado das preferências à conta da pessoa. Chamada uma vez, no layout raiz.
// O código da sincronia só é baixado quando alguém entra: a primeira tela continua leve.
import { untrack } from 'svelte';
import type { AlvoSincronia, Sincronia } from './sincronia.ts';

interface SessaoLigada {
	readonly usuario: { id: string } | null;
	token(): Promise<string | null>;
}

export function ligarConta(
	sessao: SessaoLigada,
	estado: AlvoSincronia,
	criar: () => Promise<Sincronia> = async () =>
		(await import('./sincronia.ts')).criarSincronia(estado)
) {
	// Derivado: a renovação do token troca o objeto do usuário, mas o id é o mesmo e nada roda de novo.
	const id = $derived(sessao.usuario?.id ?? null);
	let pronta: Promise<Sincronia> | null = null;
	let sincronia: Sincronia | null = null;

	$effect(() => {
		const atual = id;
		untrack(() => {
			if (!atual && !pronta) return;
			pronta ??= criar().then((s) => (sincronia = s));
			// Em ordem: entrar e sair seguidos chegam na sincronia na mesma ordem.
			void pronta.then((s) => s.entrou(atual, () => sessao.token()));
		});
	});

	$effect(() => {
		const p = estado.atual;
		untrack(() => sincronia?.mudou(p));
	});
}
