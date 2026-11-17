// Capturas do protótipo para o dono revisar (abre o arquivo único, sem servidor).
import { mkdirSync } from 'node:fs';
import { chromium, devices, type Page } from 'playwright';

const arquivo = new URL('../build-prototipo/index.html', import.meta.url).href;
const saida = new URL('../../../docs/capturas/', import.meta.url).pathname;
mkdirSync(saida, { recursive: true });

const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

async function abrir(
	contexto: Parameters<typeof navegador.newPage>[0],
	tema: string,
	rota: string
) {
	const page = await navegador.newPage({ locale: 'pt-BR', ...contexto });
	await page.addInitScript((t) => localStorage.setItem('mirante:tema', t), tema);
	await page.goto(`${arquivo}#${rota}`);
	await page.waitForTimeout(900);
	return page;
}

async function verComo(page: Page, modo: string) {
	await page.getByRole('button', { name: 'Ajustes', exact: true }).click();
	await page.getByText(modo, { exact: true }).click();
	await page.getByRole('button', { name: 'Fechar ajustes' }).click();
	await page.mouse.move(700, 450);
	await page.waitForTimeout(300);
}

const desktop = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 };
const celular = { ...devices['Pixel 7'] };

for (const tema of ['claro', 'escuro', 'preto']) {
	let p = await abrir(desktop, tema, '/mercado/manchetes');
	await p.screenshot({ path: `${saida}desktop-${tema}.png` });
	await p.close();
	p = await abrir(celular, tema, '/mercado/manchetes');
	await p.screenshot({ path: `${saida}celular-${tema}.png` });
	await p.close();
}

for (const tema of ['claro', 'escuro']) {
	const p = await abrir(desktop, tema, '/mercado/manchetes');
	await verComo(p, 'Matsu OS');
	await p.screenshot({ path: `${saida}matsu-${tema}.png` });
	await p.close();
}

let p = await abrir(desktop, 'escuro', '/carteira/visao-geral');
await p.screenshot({ path: `${saida}carteira-escuro.png` });
await p.close();

p = await abrir(desktop, 'escuro', '/mercado/manchetes');
await verComo(p, 'Windows');
await p.screenshot({ path: `${saida}windows-escuro.png` });
await p.close();

p = await abrir(
	{ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 },
	'escuro',
	'/marca'
);
await p.screenshot({ path: `${saida}marca.png`, fullPage: true });
await p.close();

await navegador.close();
console.log(`capturas em ${saida}`);
