// Baixa a logo de cada fonte de notícias (o ícone que o próprio site publica) para static/fontes/<id>.png.
// Uso: bun scripts/baixar-logos.ts  (precisa de python3 com Pillow). Rode quando entrar fonte nova.
// Cada logo vira um PNG de 128×128 (nítido em telas 2×), com fundo branco onde era transparente.
// Ícone menor que 64 px ficaria borrado: o script tenta o próximo e, por último, o serviço de ícones do Google.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SITES: Record<string, string> = {
	bcb: 'https://www.bcb.gov.br',
	ibge: 'https://www.ibge.gov.br',
	fed: 'https://www.federalreserve.gov',
	bce: 'https://www.ecb.europa.eu',
	'agencia-brasil': 'https://agenciabrasil.ebc.com.br',
	infomoney: 'https://www.infomoney.com.br',
	'money-times': 'https://www.moneytimes.com.br',
	'g1-economia': 'https://g1.globo.com',
	coindesk: 'https://www.coindesk.com',
	cointelegraph: 'https://cointelegraph.com',
	livecoins: 'https://livecoins.com.br',
	'portal-do-bitcoin': 'https://portaldobitcoin.uol.com.br',
	tecnoblog: 'https://tecnoblog.net',
	canaltech: 'https://canaltech.com.br',
	'olhar-digital': 'https://olhardigital.com.br',
	'the-verge': 'https://www.theverge.com',
	'ars-technica': 'https://arstechnica.com',
	techcrunch: 'https://techcrunch.com',
	g1: 'https://g1.globo.com',
	'bbc-brasil': 'https://www.bbc.com/portuguese',
	'dw-brasil': 'https://www.dw.com/pt-br',
	ge: 'https://ge.globo.com',
	'pesquisa-fapesp': 'https://revistapesquisa.fapesp.br'
};

const NAVEGADOR = {
	'User-Agent':
		'Mozilla/5.0 (compatible; MiranteBot/0.1; +https://mirante.mirante-mercado.workers.dev)'
};
const destino = join(import.meta.dir, '..', 'static', 'fontes');
mkdirSync(destino, { recursive: true });

// Abre PNG, ICO (a maior camada), JPEG ou WebP; recusa abaixo de 64 px; centraliza em 128×128 com fundo branco.
const PILLOW = `
import sys
from PIL import Image
img = Image.open(sys.argv[1])
if getattr(img, 'ico', None):
    img = img.ico.getimage(max(img.ico.sizes()))
img = img.convert('RGBA')
if min(img.size) < 64:
    sys.exit(2)
img.thumbnail((128, 128), Image.LANCZOS)
fundo = Image.new('RGBA', (128, 128), (255, 255, 255, 255))
fundo.alpha_composite(img, ((128 - img.width) // 2, (128 - img.height) // 2))
fundo.convert('RGB').save(sys.argv[2], optimize=True)
`;

/** Ícones declarados na página, do maior para o menor; depois os endereços de costume. */
async function candidatos(site: string): Promise<string[]> {
	const html = await (
		await fetch(site, { headers: NAVEGADOR, redirect: 'follow' })
	)
		.text()
		.catch(() => '');
	const achados: { url: string; tamanho: number }[] = [];
	for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
		const rel = /rel=["']([^"']+)["']/i.exec(tag)?.[1].toLowerCase() ?? '';
		const href = /href=["']([^"']+)["']/i.exec(tag)?.[1];
		if (!href || !/(apple-touch-icon|icon)/.test(rel) || /mask-icon/.test(rel)) continue;
		const tamanho = Number(
			/sizes=["'](\d+)x\d+["']/i.exec(tag)?.[1] ?? (rel.includes('apple') ? 180 : 32)
		);
		achados.push({ url: new URL(href.replace(/&amp;/g, '&'), site).toString(), tamanho });
	}
	achados.sort((a, b) => b.tamanho - a.tamanho);
	return [
		...achados.map((a) => a.url),
		new URL('/apple-touch-icon.png', site).toString(),
		new URL('/favicon.ico', site).toString(),
		`https://www.google.com/s2/favicons?domain=${new URL(site).hostname}&sz=128`
	];
}

for (const [id, site] of Object.entries(SITES)) {
	let salvo = false;
	for (const url of await candidatos(site)) {
		const resposta = await fetch(url, { headers: NAVEGADOR, redirect: 'follow' }).catch(() => null);
		if (!resposta?.ok) continue;
		const bytes = new Uint8Array(await resposta.arrayBuffer());
		if (bytes.length < 100) continue;
		const bruto = join(destino, `.${id}.original`);
		writeFileSync(bruto, bytes);
		const processo = Bun.spawnSync([
			'python3',
			'-I',
			'-c',
			PILLOW,
			bruto,
			join(destino, `${id}.png`)
		]);
		Bun.spawnSync(['rm', '-f', bruto]);
		if (processo.exitCode === 0) {
			console.log(`${id}: ${url}`);
			salvo = true;
			break;
		}
	}
	if (!salvo) console.log(`${id}: SEM LOGO`);
}
