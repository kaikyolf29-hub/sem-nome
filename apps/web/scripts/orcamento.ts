// Soma o JS e o CSS do app (comprimidos com gzip, sem as fontes) e falha acima do limite.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const LIMITE_KB = 120;
const raiz = new URL('../build/_app/immutable', import.meta.url).pathname;

function arquivos(dir: string): string[] {
	return readdirSync(dir).flatMap((n) => {
		const c = join(dir, n);
		return statSync(c).isDirectory() ? arquivos(c) : /\.(js|css)$/.test(n) ? [c] : [];
	});
}

const total = arquivos(raiz).reduce((s, f) => s + Bun.gzipSync(readFileSync(f)).length, 0) / 1024;
console.log(`JS + CSS (gzip, sem fontes): ${total.toFixed(1)} KB de ${LIMITE_KB} KB`);
if (total > LIMITE_KB) {
	console.error('Acima do limite de tamanho.');
	process.exit(1);
}
