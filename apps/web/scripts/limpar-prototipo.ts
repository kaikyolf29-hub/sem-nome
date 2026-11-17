// O protótipo embute tudo no index.html; apaga o CSS solto que o build ainda gera e ninguém usa.
import { readFileSync, rmSync } from 'node:fs';

const pasta = new URL('../build-prototipo/', import.meta.url).pathname;
const html = readFileSync(pasta + 'index.html', 'utf8');
if (!html.includes('_app/immutable/'))
	rmSync(pasta + '_app/immutable', { recursive: true, force: true });
