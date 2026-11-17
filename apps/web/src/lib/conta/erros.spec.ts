import { describe, expect, it } from 'vitest';
import { mensagemDeErro } from './erros.ts';

describe('mensagemDeErro', () => {
	it('provedor desligado', () => {
		expect(mensagemDeErro({ message: 'Unsupported provider: provider is not enabled' })).toBe(
			'conta.erroProvedor'
		);
	});

	it('cancelado na tela do Google', () => {
		expect(mensagemDeErro({ code: 'access_denied' })).toBe('conta.erroCancelado');
		expect(mensagemDeErro({ message: 'access_denied' })).toBe('conta.erroCancelado');
	});

	it('sem internet', () => {
		expect(mensagemDeErro({ message: 'Failed to fetch' })).toBe('conta.erroRede');
		expect(mensagemDeErro({ message: 'NetworkError when attempting to fetch resource.' })).toBe(
			'conta.erroRede'
		);
	});

	it('qualquer outro erro vira a mensagem genérica', () => {
		expect(mensagemDeErro({ message: 'boom' })).toBe('conta.erroGenerico');
		expect(mensagemDeErro(null)).toBe('conta.erroGenerico');
	});
});
