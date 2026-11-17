import { expect, test } from './apoio.ts';
import { fileURLToPath } from 'node:url';

const arquivo = fileURLToPath(new URL('../build-prototipo/index.html', import.meta.url));

test('o protótipo em arquivo único abre sem servidor e sem rede', async ({ page }) => {
	const externos: string[] = [];
	page.on('request', (r) => {
		if (!r.url().startsWith('file://') && !r.url().startsWith('data:')) externos.push(r.url());
	});
	await page.goto(`file://${arquivo}#/mercado/manchetes`);
	await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
	await page.goto(`file://${arquivo}#/cripto/nft`);
	await expect(page.getByRole('heading', { level: 1, name: 'nft' })).toBeVisible();
	expect(externos).toEqual([]);
});
