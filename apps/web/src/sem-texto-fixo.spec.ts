import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function svelteFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((nome) => {
		const caminho = join(dir, nome);
		if (statSync(caminho).isDirectory()) return svelteFiles(caminho);
		return caminho.endsWith('.svelte') ? [caminho] : [];
	});
}

describe('sem texto em português fixo nas telas', () => {
	it('todo texto visível passa por t()', () => {
		const problemas = [...svelteFiles('src/lib'), ...svelteFiles('src/routes')].filter((f) => {
			const marcacao = readFileSync(f, 'utf8')
				.replace(/<script[\s\S]*?<\/script>/g, '')
				.replace(/<style[\s\S]*?<\/style>/g, '')
				.replace(/<!--[\s\S]*?-->/g, '');
			return /[áéíóúâêôãõàç]/i.test(marcacao);
		});
		expect(problemas, `Use t() do #lib/i18n nestes arquivos: ${problemas.join(', ')}`).toEqual([]);
	});
});
