import { comPreferencias, expect, test } from './apoio.ts';

test.describe('painel "Notícias e temas"', () => {
	test('primeira visita abre o painel; "Pular" fecha e não abre de novo ao recarregar', async ({
		page
	}) => {
		await page.goto('/');
		const painel = page.getByRole('dialog', { name: 'O que você quer ver?' });
		await expect(painel).toBeVisible();
		await expect(painel.getByRole('checkbox', { name: 'Mercado', exact: true })).toBeChecked();
		await painel.getByRole('button', { name: 'Pular' }).click();
		await expect(painel).toBeHidden();
		await page.reload();
		await expect(page.getByRole('heading', { level: 1, name: 'tudo' })).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByRole('dialog')).toHaveCount(0);
	});

	test('a primeira visita só abre no início, não em outros espaços', async ({ page }) => {
		await page.goto('/cripto/nft');
		await expect(page.getByRole('heading', { level: 1, name: 'nft' })).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByRole('dialog')).toHaveCount(0);
	});

	test('depois de adicionar "Corinthians", aparece o canal no "Para você"', async ({
		page,
		isMobile
	}) => {
		await comPreferencias(page, {});
		await page.goto('/para-voce/tudo');
		if (isMobile) await page.getByRole('button', { name: 'Abrir canais' }).click();
		await page.getByRole('button', { name: 'Adicionar tema' }).click();
		const painel = page.getByRole('dialog', { name: 'Notícias e temas' });
		await painel.getByRole('textbox', { name: 'Novo tema' }).fill('Corinthians');
		await painel.getByRole('button', { name: 'Adicionar', exact: true }).click();
		await expect(painel.getByRole('status').first()).toContainText(
			'“corinthians” entrou no seu início'
		);
		await painel.getByRole('button', { name: 'Pronto' }).click();
		await expect(painel).toBeHidden();
		if (isMobile) await page.getByRole('button', { name: 'Abrir canais' }).click();
		await page
			.getByRole('navigation', { name: 'Canais' })
			.getByRole('link', { name: 'corinthians' })
			.click();
		await expect(page).toHaveURL(/\/para-voce\/busca-corinthians$/);
		await expect(
			page.getByText('Ainda não há notícias sobre “corinthians” nas nossas fontes.')
		).toBeVisible();
	});

	test('a engrenagem abre "Notícias e temas"; Esc fecha e o foco volta à engrenagem', async ({
		page
	}) => {
		await comPreferencias(page, {});
		await page.goto('/mercado/manchetes');
		const engrenagem = page
			.getByRole('button', { name: 'Ajustes', exact: true })
			.or(page.getByRole('button', { name: 'Ajustes do protótipo' }))
			.first();
		await engrenagem.click();
		await page.getByRole('button', { name: 'Notícias e temas' }).click();
		const painel = page.getByRole('dialog', { name: 'Notícias e temas' });
		await expect(painel).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(painel).toBeHidden();
		await expect(engrenagem).toBeFocused();
	});

	test('palavra silenciada some do feed na hora', async ({ page }) => {
		await comPreferencias(page, {});
		await page.goto('/mercado/manchetes');
		await expect(page.locator('.coluna').getByText(/Copom mantém os juros/)).toBeVisible();
		await page
			.getByRole('button', { name: 'Ajustes', exact: true })
			.or(page.getByRole('button', { name: 'Ajustes do protótipo' }))
			.first()
			.click();
		await page.getByRole('button', { name: 'Notícias e temas' }).click();
		const painel = page.getByRole('dialog', { name: 'Notícias e temas' });
		await painel.getByRole('textbox', { name: 'Palavra ou expressão' }).fill('copom');
		await painel.getByRole('button', { name: 'Silenciar' }).click();
		await painel.getByRole('button', { name: 'Pronto' }).click();
		await expect(page.locator('.coluna').getByText(/Copom mantém os juros/)).toHaveCount(0);
	});

	test('a 320 px o painel cabe inteiro, sem rolagem de lado', async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 640 });
		await page.goto('/para-voce/tudo');
		const painel = page.getByRole('dialog', { name: 'O que você quer ver?' });
		await expect(painel).toBeVisible();
		const caixa = (await painel.boundingBox())!;
		expect(caixa.x).toBeGreaterThanOrEqual(0);
		expect(caixa.x + caixa.width).toBeLessThanOrEqual(320);
		const [scroll, cliente] = await painel.evaluate((el) => [el.scrollWidth, el.clientWidth]);
		expect(scroll).toBeLessThanOrEqual(cliente);
	});
});
