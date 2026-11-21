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

test('no protótipo, "Para você" usa as notícias de exemplo e não abre a primeira visita', async ({
	page
}) => {
	const externos: string[] = [];
	page.on('request', (r) => {
		if (!r.url().startsWith('file://') && !r.url().startsWith('data:')) externos.push(r.url());
	});
	await page.goto(`file://${arquivo}#/para-voce/tudo`);
	await expect(page.getByRole('heading', { level: 1, name: 'tudo' })).toBeVisible();
	await expect(page.locator('.manchete')).toBeVisible();
	await page.waitForTimeout(500);
	await expect(page.getByRole('dialog')).toHaveCount(0);
	expect(externos).toEqual([]);
});
