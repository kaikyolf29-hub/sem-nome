import { flushSync } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { ligarConta } from './ligar-conta.svelte.ts';
import { PADRAO, type Preferencias } from './preferencias.ts';
import type { Sincronia } from './sincronia.ts';

function montar() {
	const sessao = $state({
		usuario: null as { id: string } | null,
		token: vi.fn(async () => 'tok')
	});
	const estado = $state({
		atual: { ...PADRAO } as Preferencias,
		substituir(p: Preferencias) {
			estado.atual = p;
		}
	});
	const sincronia = {
		entrou: vi.fn<Sincronia['entrou']>(async () => {}),
		mudou: vi.fn<Sincronia['mudou']>()
	};
	const criar = vi.fn(async () => sincronia);
	const parar = $effect.root(() => ligarConta(sessao, estado, criar));
	return { sessao, estado, sincronia, criar, parar };
}

const assentar = async () => {
	flushSync();
	await new Promise((r) => setTimeout(r, 0));
};

describe('ligarConta', () => {
	it('sem conta, não baixa o código da sincronia', async () => {
		const { criar, estado, parar } = montar();
		await assentar();
		estado.substituir({ ...PADRAO, temas: ['mundo'] });
		await assentar();
		expect(criar).not.toHaveBeenCalled();
		parar();
	});

	it('ao entrar, baixa a sincronia uma vez e avisa quem entrou (com o token da sessão)', async () => {
		const { sessao, sincronia, criar, parar } = montar();
		sessao.usuario = { id: 'u1' };
		await assentar();
		expect(criar).toHaveBeenCalledTimes(1);
		expect(sincronia.entrou).toHaveBeenCalledTimes(1);
		const [id, token] = sincronia.entrou.mock.calls[0];
		expect(id).toBe('u1');
		expect(await token()).toBe('tok');
		parar();
	});

	it('o mesmo usuário de novo (renovação do token) não junta outra vez; sair avisa', async () => {
		const { sessao, sincronia, criar, parar } = montar();
		sessao.usuario = { id: 'u1' };
		await assentar();
		sessao.usuario = { id: 'u1' };
		await assentar();
		expect(sincronia.entrou).toHaveBeenCalledTimes(1);
		sessao.usuario = null;
		await assentar();
		expect(sincronia.entrou.mock.calls.map(([id]) => id)).toEqual(['u1', null]);
		expect(criar).toHaveBeenCalledTimes(1);
		parar();
	});

	it('cada mudança das preferências vai para a sincronia', async () => {
		const { sessao, estado, sincronia, parar } = montar();
		sessao.usuario = { id: 'u1' };
		await assentar();
		const novo = { ...PADRAO, temas: ['saude'] };
		estado.substituir(novo);
		await assentar();
		expect(sincronia.mudou).toHaveBeenLastCalledWith(novo);
		parar();
	});
});
