import { afterEach, describe, expect, it } from 'vitest';
import { painelTemas } from './painel.svelte.ts';

const esperar = () => new Promise((r) => setTimeout(r, 0));

describe('painelTemas', () => {
	afterEach(() => {
		painelTemas.fechar();
		document.body.innerHTML = '';
	});

	it('se o arquivo do painel não baixar, fecha (o botão volta a responder)', async () => {
		painelTemas.abrir();
		expect(painelTemas.aberto).toBe(true);
		await expect(painelTemas.carregar(() => Promise.reject(new Error('falhou')))).rejects.toThrow();
		expect(painelTemas.aberto).toBe(false);
	});

	it('fechar duas vezes não devolve o foco de novo nem quebra', async () => {
		const botao = document.createElement('button');
		document.body.append(botao);
		painelTemas.abrir(botao);
		painelTemas.fechar();
		painelTemas.fechar();
		await esperar();
		expect(document.activeElement).toBe(botao);
	});

	it('ao fechar a primeira visita, o foco vai para o título da página', async () => {
		const titulo = document.createElement('h1');
		titulo.tabIndex = -1;
		titulo.dataset.focoInicial = '';
		document.body.append(titulo);
		painelTemas.abrirPrimeiraVisita();
		painelTemas.fechar();
		await esperar();
		expect(document.activeElement).toBe(titulo);
	});
});
