import { expect, test, type Page } from '@playwright/test';

async function nadaVazaDoCartao(page: Page) {
	return page
		.locator('.conta')
		.last()
		.evaluate((c) => {
			const r = c.getBoundingClientRect();
			return [...c.querySelectorAll('*')].every((el) => {
				const e = el.getBoundingClientRect();
				if (e.width === 0 || e.height === 0) return true;
				return e.left >= r.left - 0.5 && e.right <= r.right + 0.5 && e.bottom <= r.bottom + 0.5;
			});
		});
}

test.describe('cartão da conta', () => {
	test.skip(({ isMobile }) => isMobile, 'desktop');

	for (const [w, h] of [
		[1440, 900],
		[1280, 720]
	]) {
		test(`nada cortado ou vazando a ${w}x${h}`, async ({ page }) => {
			await page.setViewportSize({ width: w, height: h });
			await page.goto('/mercado/manchetes');
			expect(await nadaVazaDoCartao(page)).toBe(true);
		});
	}

	test('ajustes ficam no cartão, alinhados com o avatar', async ({ page }) => {
		await page.goto('/mercado/manchetes');
		const conta = page.locator('.conta');
		const ajustes = conta.getByRole('button', { name: 'Ajustes', exact: true });
		await expect(ajustes).toBeVisible();
		const a = (await conta.locator('.avatar').boundingBox())!;
		const b = (await ajustes.boundingBox())!;
		expect(Math.abs(a.y + a.height / 2 - (b.y + b.height / 2))).toBeLessThanOrEqual(1);
	});

	test('Entrar com Google responde ao clique', async ({ page }) => {
		await page.goto('/mercado/manchetes');
		await page.getByRole('button', { name: 'Entrar com Google' }).click();
		await expect(page.getByText('O login com Google chega na próxima etapa.')).toBeVisible();
	});

	test('a dica de Ajustes não fica na tela depois de usar o mouse', async ({ page }) => {
		await page.goto('/mercado/manchetes');
		await page.getByRole('button', { name: 'Ajustes', exact: true }).click();
		await page.getByRole('button', { name: 'Fechar ajustes' }).click();
		await page.mouse.move(800, 400);
		await expect(page.locator('.dica')).toHaveCount(0);
	});
});

test.describe('perfil da conta', () => {
	test('clicar na conta abre o perfil inteiro na tela; Esc fecha e devolve o foco', async ({
		page,
		isMobile
	}) => {
		await page.goto('/mercado/manchetes');
		if (isMobile) await page.getByRole('button', { name: 'Abrir canais' }).click();
		const conta = page
			.locator('.conta')
			.last()
			.getByRole('button', { name: /Visitante/ });
		await conta.click();
		const perfil = page.getByRole('dialog', { name: 'Sua conta' });
		await expect(perfil).toBeVisible();
		await expect(perfil.getByRole('button', { name: 'Entrar com Google' })).toBeVisible();
		const r = (await perfil.boundingBox())!;
		const v = page.viewportSize()!;
		expect(r.x).toBeGreaterThanOrEqual(0);
		expect(r.y).toBeGreaterThanOrEqual(0);
		expect(r.x + r.width).toBeLessThanOrEqual(v.width);
		expect(r.y + r.height).toBeLessThanOrEqual(v.height);
		await page.keyboard.press('Escape');
		await expect(perfil).toHaveCount(0);
		await expect(conta).toBeFocused();
	});
});

test('em "Também em destaque", fonte e horário nunca quebram em duas linhas', async ({
	page,
	isMobile
}) => {
	test.skip(isMobile, 'desktop');
	for (const w of [1280, 1440, 1600]) {
		await page.setViewportSize({ width: w, height: 900 });
		await page.goto('/mercado/manchetes');
		const alturas = await page
			.locator('.tambem .meta')
			.evaluateAll((ms) => ms.map((m) => m.getBoundingClientRect().height));
		for (const h of alturas) expect(h, `largura ${w}`).toBeLessThanOrEqual(24);
	}
});
