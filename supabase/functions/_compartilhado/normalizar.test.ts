import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { lerFeed } from './ler.ts';
import { limparTexto, prepararItem, trecho, urlCanonica } from './normalizar.ts';
import type { Fonte } from './tipos.ts';

const fonte: Fonte = {
	id: 'infomoney',
	nome: 'InfoMoney',
	tipo: 'rss',
	endereco: 'https://www.infomoney.com.br/feed/',
	idioma: 'pt-BR',
	primaria: false,
	espaco: 'mercado',
	canais: ['brasil'],
	intervalo_min: 10
};
const agora = new Date('2026-11-17T12:00:00Z');

describe('limparTexto', () => {
	test('tira tags, decodifica entidades e junta espaços', () => {
		expect(limparTexto('Petróleo &amp; gás <b>sobem</b>&nbsp; 3%')).toBe('Petróleo & gás sobem 3%');
	});
	test('entidades numéricas e com nome do português', () => {
		expect(limparTexto('A&ccedil;&otilde;es &#8211; alta de 2&#37; &#x2014; ok')).toBe('Ações – alta de 2% — ok');
	});
	test('tira espaço invisível, script e estilo', () => {
		expect(limparTexto('Pix​<script>x()</script><style>p{}</style> celebra')).toBe('Pix celebra');
	});
	test('tira o rodapé automático dos blogs', () => {
		expect(limparTexto('<p>Texto.</p><p>The post Algo appeared first on Site.</p>')).toBe('Texto.');
		expect(limparTexto('Texto. O post Algo apareceu primeiro em Site.')).toBe('Texto.');
		// Livecoins: "Fonte: <título da matéria> Veja mais notícias sobre Bitcoin."
		expect(
			limparTexto('<p>Resumo da matéria.</p><p>Fonte: <a href="#">Título</a></p> Veja mais notícias sobre Bitcoin.')
		).toBe('Resumo da matéria.');
	});
});

describe('trecho', () => {
	test('corta na palavra, com reticências, até 281 caracteres', () => {
		const longo = 'palavra '.repeat(80);
		const t = trecho(longo);
		expect(t.length).toBeLessThanOrEqual(281);
		expect(t.endsWith('…')).toBe(true);
		expect(t).not.toContain('palavra…palavra');
		expect(t.at(-2)).not.toBe(' ');
	});
	test('texto curto fica igual', () => {
		expect(trecho('<p>Curto.</p>')).toBe('Curto.');
	});
});

describe('urlCanonica', () => {
	test('https, sem rastreio e sem âncora', () => {
		expect(urlCanonica('http://site.com/a/?utm_source=x&id=2&fbclid=y#topo')).toBe('https://site.com/a/?id=2');
	});
	test('tira o /amp do fim', () => {
		expect(urlCanonica('https://site.com/noticia/amp/')).toBe('https://site.com/noticia/');
		expect(urlCanonica('https://site.com/noticia/amp')).toBe('https://site.com/noticia');
	});
	test('endereço inválido lança erro', () => {
		expect(() => urlCanonica('não é url')).toThrow();
	});
});

describe('prepararItem', () => {
	const bruto = {
		titulo: 'Dólar fecha em queda de 1%',
		url: 'https://www.infomoney.com.br/mercados/dolar?utm_medium=rss',
		trecho: '<p>A moeda americana recuou com a entrada de capital.</p>',
		publicadoEm: '2026-11-17T11:00:00Z'
	};

	test('item completo vira notícia pronta, com canais e assinatura', () => {
		const item = prepararItem(bruto, fonte, agora)!;
		expect(item.url).toBe('https://www.infomoney.com.br/mercados/dolar');
		expect(item.trecho).toBe('A moeda americana recuou com a entrada de capital.');
		expect(item.publicadoEm).toBe('2026-11-17T11:00:00.000Z');
		expect(item.idioma).toBe('pt-BR');
		expect(item.espaco).toBe('mercado');
		expect(item.canais).toContain('cambio');
		expect(item.assinatura).toContain('dolar');
	});
	test('sem data usa a hora da coleta; data no futuro também', () => {
		expect(prepararItem({ ...bruto, publicadoEm: null }, fonte, agora)!.publicadoEm).toBe(agora.toISOString());
		expect(prepararItem({ ...bruto, publicadoEm: '2026-11-20T00:00:00Z' }, fonte, agora)!.publicadoEm).toBe(
			agora.toISOString()
		);
	});
	test('com mais de 7 dias, sem título ou com link ruim, não entra', () => {
		expect(prepararItem({ ...bruto, publicadoEm: '2026-11-09T11:00:00Z' }, fonte, agora)).toBeNull();
		expect(prepararItem({ ...bruto, titulo: '  ' }, fonte, agora)).toBeNull();
		expect(prepararItem({ ...bruto, url: 'javascript:alert(1)' }, fonte, agora)).toBeNull();
	});
	test('trecho que só repete o título fica vazio', () => {
		expect(prepararItem({ ...bruto, trecho: 'Dólar fecha em queda de 1% ' }, fonte, agora)!.trecho).toBe('');
	});
	test('na tecnologia, notícia fora de IA, chips e big techs não entra', () => {
		const tec: Fonte = { ...fonte, id: 'tecnoblog', espaco: 'tecnologia', canais: [] };
		expect(prepararItem({ ...bruto, titulo: 'Como limpar a geladeira' }, tec, agora)).toBeNull();
		expect(prepararItem({ ...bruto, titulo: 'Nvidia anuncia novo chip para IA' }, tec, agora)).not.toBeNull();
	});
});

describe('fontes da Globo (g1 e ge): legenda, crédito e avisos fora do resumo', () => {
	const g1: Fonte = { ...fonte, id: 'g1-mundo', espaco: 'geral', canais: ['mundo'] };
	const ge: Fonte = { ...fonte, id: 'ge', espaco: 'geral', canais: ['esportes'] };
	const foto = ' <img src="https://s2-g1.glbimg.com/x.jpg" /><br /> ';
	const item = (fonteDoItem: Fonte, descricao: string, titulo = 'Países concordam em negociar regras') =>
		prepararItem({ titulo, url: 'https://g1.globo.com/a.ghtml', trecho: descricao, publicadoEm: null }, fonteDoItem, agora);

	test('tira a legenda da foto e o crédito curto', () => {
		const r = item(g1, `${foto}Fiona nada em seu recinto no zoológico.\nJohn Minchillo/AP\nUma necropsia mostrou que o chapéu ficou preso.`);
		expect(r?.trecho).toBe('Uma necropsia mostrou que o chapéu ficou preso.');
	});
	test('sem crédito, o texto começa na segunda linha', () => {
		const r = item(g1, `${foto}Adolescente cria startup para produzir alimentos em Marte\nAos 13 anos, ela fundou uma empresa de cultivo.`);
		expect(r?.trecho).toBe('Aos 13 anos, ela fundou uma empresa de cultivo.');
	});
	test('tira o pedido de sugestão do g1 e o aviso do ge no meio do texto', () => {
		const r = item(g1, `${foto}Soldados com drone.\nReuters\nOs países concordaram.\n🗒️ Tem alguma sugestão de reportagem? Envie para o g1\nO resultado ficou abaixo.`);
		expect(r?.trecho).toBe('Os países concordaram. O resultado ficou abaixo.');
		const s = item(ge, `${foto}Os últimos classificados às quartas\n+ 🔍 Adicione o ge nas suas fontes favoritas do Google\nO Mirassol terá dois desfalques.`);
		expect(s?.trecho).toBe('O Mirassol terá dois desfalques.');
	});
	test('outras fontes com foto no começo ficam como estão', () => {
		const r = item(fonte, `${foto}Primeira linha do texto.\nSegunda linha.`, 'Dólar fecha em queda');
		expect(r?.trecho).toBe('Primeira linha do texto. Segunda linha.');
	});
	test('resumo real do g1 (amostra salva) começa no texto', () => {
		const xml = readFileSync(new URL('./amostras/g1.rss.xml', import.meta.url), 'utf8');
		const [primeiro] = lerFeed(xml, 'rss');
		const r = prepararItem(primeiro, g1, new Date('2026-11-21T12:00:00Z'));
		expect(r?.trecho.startsWith('Uma necropsia em Fiona')).toBe(true);
	});
});

describe('conteúdo automático ou de propaganda não entra', () => {
	const pronto = (titulo: string, f: Fonte = fonte) =>
		prepararItem({ titulo, url: 'https://x.invalid/a', trecho: '', publicadoEm: null }, f, agora);
	test('previsão do tempo automática, palpites de aposta e ofertas de loja', () => {
		expect(pronto('Previsão do tempo hoje para Brasília (DF): sol com algumas nuvens')).toBeNull();
		expect(pronto('Previsão do tempo para amanhã em São Paulo')).toBeNull();
		expect(pronto('Palpites e dicas para Palmeiras x Flamengo pelo Brasileirão')).toBeNull();
		expect(pronto('Hora de renovar a sala: Smart TVs 4K em promoção na Amazon')).toBeNull();
		expect(pronto('Xiaomi com tudo: veja smartphones da marca em promoção no Mercado Livre')).toBeNull();
	});
	test('notícia de verdade com as mesmas palavras continua', () => {
		expect(pronto('Inmet muda a previsão do tempo e alerta para chuva forte no Sul')).not.toBeNull();
		expect(pronto('Amazon anuncia promoção de executivos no Brasil')).not.toBeNull();
		expect(pronto('Governo aprova promoção de policiais')).not.toBeNull();
	});
});
