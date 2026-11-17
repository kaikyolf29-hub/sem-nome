import { expect, test } from './apoio.ts';

test('Entrar com Google leva à tela do Google pelo Supabase', async ({ page, isMobile }) => {
	await page.route('**/auth/v1/settings', (r) =>
		r.fulfill({ json: { external: { google: true, email: true } } })
	);
	let destino = '';
	await page.route('**/auth/v1/authorize**', (r) => {
		destino = r.request().url();
		return r.fulfill({ body: 'ok', contentType: 'text/plain' });
	});
	await page.goto('/mercado/manchetes');
	if (isMobile) await page.getByRole('button', { name: 'Abrir canais' }).click();
	await page.getByRole('button', { name: 'Entrar com Google' }).last().click();
	await expect.poll(() => destino).toContain('/auth/v1/authorize?provider=google');
	expect(decodeURIComponent(destino)).toContain('redirect_to=http://localhost:4173/');
});

test('com o Google desligado, a pessoa fica no site e vê o motivo', async ({ page, isMobile }) => {
	await page.route('**/auth/v1/settings', (r) =>
		r.fulfill({ json: { external: { google: false } } })
	);
	await page.goto('/mercado/manchetes');
	if (isMobile) await page.getByRole('button', { name: 'Abrir canais' }).click();
	await page.getByRole('button', { name: 'Entrar com Google' }).last().click();
	await expect(page.getByRole('status').last()).toContainText(
		'O login com Google ainda não foi ligado'
	);
	await expect(page).toHaveURL(/\/mercado\/manchetes$/);
});
