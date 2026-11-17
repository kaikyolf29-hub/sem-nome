// O protótipo embute tudo no index.html. Apaga o que o build ainda gera e ninguém usa:
// o CSS solto e o _app/version.json (a checagem de versão nova está desligada no vite.config.ts).
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';

const pasta = new URL('../build-prototipo/', import.meta.url).pathname;
const html = readFileSync(pasta + 'index.html', 'utf8');
if (!html.includes('_app/immutable/'))
	rmSync(pasta + '_app/immutable', { recursive: true, force: true });
rmSync(pasta + '_app/version.json', { force: true });
if (existsSync(pasta + '_app') && readdirSync(pasta + '_app').length === 0)
	rmSync(pasta + '_app', { recursive: true });
