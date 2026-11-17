import { expect, test } from './apoio.ts';
import { gzipSync } from 'node:zlib';

// A primeira tela precisa abrir rápido num celular médio (spec, seção 15): no máximo 120 KB de JS+CSS comprimido.
test('a primeira tela baixa no máximo 120 KB de JS e CSS (gzip), sem o login', async ({
	page,
	isMobile
}) => {
	test.skip(isMobile, 'uma medida basta');
	const corpos: Promise<Buffer>[] = [];
	page.on('response', (r) => {
		const tipo = r.request().resourceType();
		if (tipo === 'script' || tipo === 'stylesheet')
			corpos.push(r.body().catch(() => Buffer.alloc(0)));
	});
	await page.goto('/mercado/manchetes');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await page.waitForLoadState('networkidle');
	const arquivos = await Promise.all(corpos);
	const total = arquivos.reduce((soma, b) => soma + gzipSync(b).length, 0) / 1024;
	console.log(`primeira tela: ${total.toFixed(1)} KB`);
	expect(total).toBeLessThanOrEqual(120);
	// O código do login (GoTrueClient, do Supabase) só carrega quando é usado.
	expect(arquivos.some((b) => b.includes('GoTrueClient'))).toBe(false);
});
