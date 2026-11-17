import { describe, expect, it } from 'vitest';
import { formatarMoeda, formatarVariacao, tempoRelativo } from './formato.ts';

describe('formatarMoeda', () => {
	it('real e dólar em pt-BR, dólar em inglês', () => {
		expect(formatarMoeda(1234.56, 'BRL', 'pt-BR')).toBe('R$ 1.234,56');
		expect(formatarMoeda(1234.56, 'USD', 'pt-BR')).toBe('US$ 1.234,56');
		expect(formatarMoeda(1234.56, 'USD', 'en')).toBe('$1,234.56');
	});
});

describe('formatarVariacao', () => {
	it('alta com sinal de mais', () => {
		expect(formatarVariacao(1.8, 'pt-BR')).toEqual({ texto: '+1,80%', direcao: 'alta' });
	});

	it('baixa com o sinal de menos tipográfico (U+2212)', () => {
		expect(formatarVariacao(-0.42, 'pt-BR')).toEqual({ texto: '−0,42%', direcao: 'baixa' });
		expect(formatarVariacao(-1.5, 'en').texto).toBe('−1.50%');
	});

	it('quase zero é estável e sem sinal', () => {
		expect(formatarVariacao(0.004, 'pt-BR')).toEqual({ texto: '0,00%', direcao: 'estavel' });
		expect(formatarVariacao(-0.004, 'pt-BR')).toEqual({ texto: '0,00%', direcao: 'estavel' });
	});
});

describe('tempoRelativo', () => {
	const agora = new Date('2026-11-17T15:00:00-03:00');
	const antes = (ms: number) => new Date(agora.getTime() - ms);

	it('agora, minutos, horas, ontem', () => {
		expect(tempoRelativo(antes(30_000), agora, 'pt-BR')).toBe('agora');
		expect(tempoRelativo(antes(5 * 60_000), agora, 'pt-BR')).toBe('há 5 min');
		expect(tempoRelativo(antes(2 * 3_600_000), agora, 'pt-BR')).toBe('há 2 h');
		expect(tempoRelativo(antes(30 * 3_600_000), agora, 'pt-BR')).toBe('ontem');
	});

	it('data curta depois de dois dias', () => {
		expect(tempoRelativo(new Date('2026-11-12T10:00:00-03:00'), agora, 'pt-BR')).toBe('12 de nov.');
		expect(tempoRelativo(new Date('2026-11-12T10:00:00-03:00'), agora, 'en')).toBe('Nov 12');
	});

	it('em inglês', () => {
		expect(tempoRelativo(antes(30_000), agora, 'en')).toBe('now');
		expect(tempoRelativo(antes(5 * 60_000), agora, 'en')).toBe('5 min ago');
		expect(tempoRelativo(antes(30 * 3_600_000), agora, 'en')).toBe('yesterday');
	});
});
