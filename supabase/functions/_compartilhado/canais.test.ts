import { describe, expect, test } from 'bun:test';
import { classificar } from './canais.ts';
import type { Fonte } from './tipos.ts';

const base: Fonte = {
	id: 'x',
	nome: 'X',
	tipo: 'rss',
	endereco: 'https://x.invalid/feed',
	idioma: 'pt-BR',
	primaria: false,
	espaco: 'mercado',
	canais: ['brasil'],
	intervalo_min: 10
};
const infomoney = { ...base, id: 'infomoney' };
const tecnoblog: Fonte = { ...base, id: 'tecnoblog', espaco: 'tecnologia', canais: [] };
const internacional: Fonte = { ...base, id: 'agencia-brasil-internacional', canais: ['mundo'] };
const coindesk: Fonte = { ...base, id: 'coindesk', espaco: 'cripto', canais: ['noticias'], idioma: 'en' };

describe('classificar', () => {
	test('Bitcoin numa fonte de mercado vai para o espaço cripto', () => {
		expect(classificar(infomoney, 'Bitcoin passa de US$ 100 mil', '')).toEqual({
			espaco: 'cripto',
			canais: ['noticias']
		});
	});
	test('chip da Nvidia no Tecnoblog: tecnologia, canal chips', () => {
		const r = classificar(tecnoblog, 'Nvidia lança chip para data centers', '');
		expect(r.espaco).toBe('tecnologia');
		expect(r.canais).toContain('chips');
	});
	test('dólar: mercado, câmbio, mais o canal da fonte', () => {
		expect(classificar(infomoney, 'Dólar fecha em queda', '')).toEqual({ espaco: 'mercado', canais: ['brasil', 'cambio'] });
	});
	test('Fed na Agência Brasil Internacional: mundo, eua e macro', () => {
		const r = classificar(internacional, 'Fed mantém juros', '');
		expect(r.espaco).toBe('mercado');
		expect(r.canais).toEqual(['eua', 'macro', 'mundo']);
	});
	test('stablecoins e NFT ganham os canais próprios', () => {
		expect(classificar(coindesk, 'Tether expands USDT supply', '').canais).toContain('stablecoins');
		expect(classificar(coindesk, 'NFT sales jump', '').canais).toContain('nft');
	});
	test('palavras comuns do português não confundem: "vale a pena", "meta fiscal", "irá"', () => {
		const r = classificar(infomoney, 'Vale a pena? Governo irá cumprir a meta fiscal', '');
		expect(r.canais).not.toContain('acoes');
		expect(r.canais).toContain('macro');
		expect(classificar(tecnoblog, 'Governo define meta para escolas', '').canais).toEqual([]);
	});
	test('o canal vem do título: o trecho não arrasta a notícia para canais de passagem', () => {
		expect(
			classificar(infomoney, 'Mercado de cartas de Pokémon vira negócio milionário', 'A coleção foi vendida na bolsa de leilões.').canais
		).toEqual(['brasil']);
		expect(
			classificar(tecnoblog, 'Nubank libera teste grátis da operadora NuCel', 'Funciona em iPhone e Android.').canais
		).toEqual([]);
	});
	test('código de ação no título vai para ações; final 11 (FII, ETF ou unit) não', () => {
		expect(classificar(infomoney, 'PETR4 sobe após balanço', '').canais).toContain('acoes');
		expect(classificar(infomoney, 'HGLG11 anuncia rendimento', '').canais).not.toContain('acoes');
	});
	test('"IA" no português e "AI" no inglês', () => {
		expect(classificar(tecnoblog, 'Nova IA do Google resume vídeos', '').canais).toEqual(['big-techs', 'ia']);
		expect(
			classificar({ ...tecnoblog, idioma: 'en' }, 'OpenAI ships a new AI model', '').canais
		).toEqual(['ia']);
		expect(classificar(tecnoblog, 'E aí, vale a pena trocar de celular?', '').canais).toEqual([]);
	});

	const g1: Fonte = { ...base, id: 'g1', espaco: 'geral', canais: ['brasil'] };
	const g1Politica: Fonte = { ...base, id: 'g1-politica', espaco: 'geral', canais: ['politica'] };
	test('fonte geral mantém só o canal do tema', () => {
		expect(classificar(g1Politica, 'Câmara aprova projeto sobre o dólar e a Selic', '')).toEqual({
			espaco: 'geral',
			canais: ['politica']
		});
	});
	test('fonte geral não ganha canais de tecnologia (ia, chips, big-techs)', () => {
		expect(classificar(g1, 'Nvidia e Google anunciam nova IA', '').canais).toEqual(['brasil']);
	});
	test('Bitcoin numa fonte geral vai para o espaço cripto', () => {
		expect(classificar(g1, 'Bitcoin sobe', '').espaco).toBe('cripto');
	});
});
