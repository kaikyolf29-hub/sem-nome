import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './apoio.ts';

for (const tema of ['claro', 'escuro'] as const) {
	for (const rota of ['/mercado/manchetes', '/carteira/visao-geral', '/marca']) {
		test(`sem problemas graves de acessibilidade em ${rota} (${tema})`, async ({ page }) => {
			await page.addInitScript((t) => localStorage.setItem('mirante:tema', t), tema);
			await page.goto(rota);
			await page.waitForTimeout(900);
			const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
			const graves = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
			expect(
				graves.map(
					(v) =>
						`${v.id}: ${v.nodes
							.map((n) => n.target.join(' '))
							.slice(0, 3)
							.join(' | ')}`
				)
			).toEqual([]);
		});
	}
}
