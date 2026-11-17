import { describe, expect, it } from 'vitest';
import { razaoContraste } from '#lib/design/contraste.ts';
import { logoAtivo } from './logos.ts';

describe('logoAtivo', () => {
	it('usa a marca real quando existe (Bitcoin, Ethereum, Tether, Nvidia e o BDR dela, Google)', () => {
		expect(logoAtivo('BTC')).toMatchObject({ tipo: 'marca', nome: 'Bitcoin' });
		expect(logoAtivo('ETH')).toMatchObject({ tipo: 'marca', nome: 'Ethereum' });
		expect(logoAtivo('USDT')).toMatchObject({ tipo: 'marca', nome: 'Tether' });
		expect(logoAtivo('NVDA')).toMatchObject({ tipo: 'marca', nome: 'NVIDIA' });
		expect(logoAtivo('NVDC34')).toMatchObject({ tipo: 'marca', nome: 'NVIDIA' });
		expect(logoAtivo('GOOGL')).toMatchObject({ tipo: 'marca', nome: 'Google' });
	});

	it('sem marca disponível, cria uma logo própria com a sigla', () => {
		expect(logoAtivo('PETR4')).toMatchObject({ tipo: 'sigla', sigla: 'P' });
		expect(logoAtivo('HGLG11')).toMatchObject({ tipo: 'sigla', sigla: 'HG' });
		expect(logoAtivo('MSFT')).toMatchObject({ tipo: 'sigla', sigla: 'MS' });
		expect(logoAtivo('Tesouro Selic')).toMatchObject({ tipo: 'sigla', sigla: 'TS' });
	});

	it('a cor da logo própria é sempre a mesma para o mesmo ativo', () => {
		expect(logoAtivo('PETR4').cor).toBe(logoAtivo('PETR4').cor);
	});

	// Logos de marcas usam as cores oficiais (logos não entram na regra de contraste); as próprias, sim.
	it('nas logos próprias, a sigla branca tem contraste ≥ 3 sobre o fundo', () => {
		for (const t of [
			'PETR4',
			'HGLG11',
			'IVVB11',
			'MSFT',
			'Tesouro Selic',
			'VALE3',
			'ITUB4',
			'AAPL',
			'XYZ'
		])
			expect(razaoContraste('#ffffff', logoAtivo(t).cor), t).toBeGreaterThanOrEqual(3);
	});
});
