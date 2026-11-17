import { expect, test, type Page } from '@playwright/test';

const desktop = ({ isMobile }: { isMobile: boolean }) => isMobile;
const celular = ({ isMobile }: { isMobile: boolean }) => !isMobile;

async function semSobreposicao(page: Page, linha: string, a: string, b: string) {
	return page.locator(linha).evaluateAll(
		(linhas, [sa, sb]) =>
			linhas.every((l) => {
				const ra = l.querySelector(sa)!.getBoundingClientRect();
				const rb = l.querySelector(sb)!.getBoundingClientRect();
				return ra.right <= rb.left + 0.5 || ra.bottom <= rb.top + 0.5 || rb.bottom <= ra.top + 0.5;
			}),
		[a, b]
	);
}

test('Por moeda e legenda da rosca sem texto encostado a 768 px, mesmo em ienes', async ({
	page
}) => {
	test.skip(desktop({ isMobile: false }) && false);
	await page.setViewportSize({ width: 768, height: 1000 });
	await page.goto('/carteira/visao-geral');
	await page.getByRole('button', { name: /Ver em/ }).click();
	await page.getByRole('option', { name: /Iene japonês/ }).click();
	expect(await semSobreposicao(page, '.moedas li', '.nome', '.valores')).toBe(true);
	const quebras = await page
		.locator('.rosca li .nome')
		.evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height > 30).length);
	expect(quebras).toBe(0);
});

test.describe('celular', () => {
	test.skip(celular, 'só no celular');

	test('a gaveta tem todos os espaços e leva até Tecnologia & IA', async ({ page }) => {
		await page.goto('/mercado/manchetes');
		await page.getByRole('button', { name: 'Abrir canais' }).click();
		const gaveta = page.getByRole('dialog', { name: 'Canais' });
		await gaveta.getByRole('link', { name: 'Tecnologia & IA' }).click();
		await expect(page).toHaveURL(/\/tecnologia\/ia$/);
	});

	test('a barra de baixo diz para onde cada botão leva', async ({ page }) => {
		await page.goto('/mercado/manchetes');
		const barra = page.getByRole('navigation', { name: 'Navegação principal' });
		await expect(barra.getByRole('link')).toHaveText(['Início', 'Carteira', 'Cripto', 'Agenda']);
		await barra.getByRole('button', { name: 'Mais' }).click();
		await expect(page.getByRole('dialog', { name: 'Canais' })).toBeVisible();
	});

	test('no cartão, Ler na fonte e Salvar ficam juntos na mesma linha a 320 px', async ({
		page
	}) => {
		await page.setViewportSize({ width: 320, height: 700 });
		await page.goto('/mercado/manchetes');
		const ok = await page.locator('article.noticia').evaluateAll((cartoes) =>
			cartoes.every((c) => {
				const [a, b] = [...c.querySelectorAll('.acao')].map((e) => e.getBoundingClientRect());
				return Math.abs(a.top - b.top) < 1;
			})
		);
		expect(ok).toBe(true);
	});

	test('a busca a 320 px não passa da borda', async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 700 });
		await page.goto('/mercado/manchetes');
		await page.getByRole('button', { name: 'Buscar ou perguntar' }).click();
		const dentro = await page.getByRole('dialog', { name: 'Buscar no Mirante' }).evaluate((d) => {
			const r = d.getBoundingClientRect();
			return [...d.querySelectorAll('li')].every(
				(li) => li.getBoundingClientRect().right <= r.right - 4
			);
		});
		expect(dentro).toBe(true);
	});
});

test('links das fontes abrem em nova aba num endereço de exemplo', async ({ page, isMobile }) => {
	await page.goto('/mercado/manchetes');
	const ler = page.locator('article.noticia .acao[href]').first();
	await expect(ler).toHaveAttribute('href', /^https:\/\/example\.com\//);
	await expect(ler).toHaveAttribute('target', '_blank');
	if (isMobile) await page.getByRole('button', { name: 'Abrir painel' }).click();
	const fonteChat = page.locator('.chat .fontes a').first();
	await expect(fonteChat).toHaveAttribute('target', '_blank');
});

test('resposta do analista sem espaço sobrando perto das citações', async ({ page, isMobile }) => {
	await page.goto('/mercado/manchetes');
	if (isMobile) await page.getByRole('button', { name: 'Abrir painel' }).click();
	const texto = ((await page.locator('.resposta p').textContent()) ?? '').replace(/\u00a0/g, ' ');
	expect(texto).toContain('dividendos 1 e o');
	expect(texto).toContain('exportadores 2. Um');
	await expect(page.locator('.chat').getByText('Resposta da IA')).toBeVisible();
});

test.describe('teclado', () => {
	test.skip(desktop, 'teclado: desktop');

	test('painel do protótipo: abre com foco dentro, Esc fecha e devolve o foco', async ({
		page
	}) => {
		await page.goto('/mercado/manchetes');
		const ajustes = page.getByRole('button', { name: 'Ajustes', exact: true });
		await ajustes.focus();
		await page.keyboard.press('Enter');
		await expect(ajustes).toHaveAttribute('aria-expanded', 'true');
		await expect(page.getByRole('button', { name: 'Fechar ajustes' })).toBeFocused();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('region', { name: 'Ajustes do protótipo' })).toHaveCount(0);
		await expect(ajustes).toBeFocused();
	});

	test('busca: Tab não sai do diálogo e Esc fecha depois do Tab', async ({ page }) => {
		await page.goto('/mercado/manchetes');
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await page.getByRole('link', { name: 'Mercado', exact: true }).focus();
		await page.keyboard.press('Control+k');
		const dialogo = page.getByRole('dialog', { name: 'Buscar no Mirante' });
		await expect(dialogo).toBeVisible();
		await expect(page.getByRole('combobox')).toBeFocused();
		await page.keyboard.press('Tab');
		expect(await dialogo.evaluate((d) => d.contains(document.activeElement))).toBe(true);
		await page.keyboard.press('Escape');
		await expect(dialogo).toHaveCount(0);
	});
});

test.describe('ver como Matsu', () => {
	test('bolinhas em pixel inteiro e a gaveta não cobre a barra de título', async ({
		page,
		isMobile
	}) => {
		await page.goto('/mercado/manchetes');
		await page
			.getByRole('button', { name: 'Ajustes', exact: true })
			.or(page.getByRole('button', { name: 'Ajustes do protótipo' }))
			.first()
			.click();
		await page.getByText('Matsu OS', { exact: true }).click();
		await page.getByRole('button', { name: 'Fechar ajustes' }).click();
		const fechar = page.getByRole('button', { name: 'Fechar', exact: true });
		const y = await fechar.evaluate(
			(b) => b.querySelector('.bolinha')!.getBoundingClientRect().top
		);
		expect(Number.isInteger(y)).toBe(true);
		if (isMobile) {
			await page.getByRole('button', { name: 'Abrir canais' }).click();
			const caixa = (await fechar.boundingBox())!;
			const noTopo = await page.evaluate(
				([x, yy]) =>
					document.elementFromPoint(x, yy)?.closest('button')?.getAttribute('aria-label'),
				[caixa.x + caixa.width / 2, caixa.y + caixa.height / 2]
			);
			expect(noTopo).toBe('Fechar');
		}
	});

	test('a dica do trilho aparece à direita do ícone', async ({ page, isMobile }) => {
		test.skip(isMobile, 'trilho: desktop');
		await page.goto('/mercado/manchetes');
		await page.getByRole('button', { name: 'Ajustes', exact: true }).click();
		await page.getByText('Matsu OS', { exact: true }).click();
		await page.getByRole('button', { name: 'Fechar ajustes' }).click();
		const cripto = page.getByRole('link', { name: 'Cripto' });
		await cripto.hover();
		const dica = page.locator('.trilho .dica');
		await expect(dica).toBeVisible();
		expect((await dica.boundingBox())!.x).toBeGreaterThanOrEqual(
			(await cripto.boundingBox())!.x + 48
		);
	});
});

test.describe('em inglês', () => {
	test.use({ locale: 'en-US' });

	test('a faixa do mercado fica toda em inglês', async ({ page }) => {
		await page.goto('/mercado/manchetes');
		const faixa = page.getByRole('region', { name: 'Markets now' });
		await expect(faixa).toContainText('Dollar');
		await expect(faixa).toContainText('Oil');
		await expect(faixa).toContainText('128,412');
		await expect(faixa).toContainText('R$5.41');
	});
});
