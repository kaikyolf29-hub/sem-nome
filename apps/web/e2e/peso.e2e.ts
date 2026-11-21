import { comPreferencias, expect, test, type Page } from './apoio.ts';
import { gzipSync } from 'node:zlib';

// A primeira tela precisa abrir rápido num celular médio (spec, seção 15): no máximo 120 KB de JS+CSS comprimido.
async function medir(page: Page, rota: string) {
	const corpos: Promise<Buffer>[] = [];
	page.on('response', (r) => {
		const tipo = r.request().resourceType();
		if (tipo === 'script' || tipo === 'stylesheet')
			corpos.push(r.body().catch(() => Buffer.alloc(0)));
	});
	await page.goto(rota);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await page.waitForLoadState('networkidle');
	const arquivos = await Promise.all(corpos);
	const total = arquivos.reduce((soma, b) => soma + gzipSync(b).length, 0) / 1024;
	return { arquivos, total };
}

for (const rota of ['/mercado/manchetes', '/para-voce/tudo']) {
	test(`${rota}: a primeira tela baixa no máximo 120 KB de JS e CSS (gzip), sem o login e sem o painel de temas`, async ({
		page,
		isMobile
	}) => {
		test.skip(isMobile, 'uma medida basta');
		await comPreferencias(page, {});
		const { arquivos, total } = await medir(page, rota);
		console.log(`primeira tela (${rota}): ${total.toFixed(1)} KB`);
		expect(total).toBeLessThanOrEqual(120);
		// O código do login (GoTrueClient, do Supabase) só carrega quando é usado.
		expect(arquivos.some((b) => b.includes('GoTrueClient'))).toBe(false);
		// O painel "Notícias e temas" só carrega quando abre.
		expect(arquivos.some((b) => b.includes('data-painel-temas'))).toBe(false);
	});
}

test('primeira visita: o início com o painel "O que você quer ver?" também cabe em 120 KB', async ({
	page,
	isMobile
}) => {
	test.skip(isMobile, 'uma medida basta');
	const { arquivos, total } = await medir(page, '/');
	await expect(page.getByRole('dialog', { name: 'O que você quer ver?' })).toBeVisible();
	console.log(`primeira visita com o painel: ${total.toFixed(1)} KB`);
	expect(arquivos.some((b) => b.includes('data-painel-temas'))).toBe(true);
	expect(total).toBeLessThanOrEqual(120);
});
