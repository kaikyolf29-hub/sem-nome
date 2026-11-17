// Publicação pela API da Cloudflare (Workers com arquivos estáticos), sem precisar do wrangler.
// Usado por scripts/publicacao.ts. Não entra no site: só roda no terminal.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';

export interface ItemManifesto {
	hash: string;
	size: number;
}
export type Manifesto = Record<string, ItemManifesto>;

/** Mesmo cálculo do wrangler: sha256 do conteúdo em base64 + extensão, nos primeiros 32 caracteres. */
export function hashDoArquivo(conteudo: Uint8Array, extensao: string): string {
	return createHash('sha256')
		.update(Buffer.from(conteudo).toString('base64') + extensao)
		.digest('hex')
		.slice(0, 32);
}

/** Arquivos de regras: não são servidos, vão na configuração do Worker (como faz o wrangler). */
const REGRAS = ['_headers', '_redirects'] as const;
export type Regras = Partial<Record<(typeof REGRAS)[number], string>>;

/**
 * Lista os arquivos da pasta: o manifesto vai para a Cloudflare, `caminhos` liga cada hash ao
 * arquivo local e `regras` traz o conteúdo de _headers e _redirects da raiz.
 */
export function montarManifesto(pasta: string): {
	manifesto: Manifesto;
	caminhos: Record<string, string>;
	regras: Regras;
} {
	const manifesto: Manifesto = {};
	const caminhos: Record<string, string> = {};
	const regras: Regras = {};
	const andar = (dir: string) => {
		for (const nome of readdirSync(dir).sort()) {
			const caminho = join(dir, nome);
			if (statSync(caminho).isDirectory()) {
				andar(caminho);
				continue;
			}
			const regra = REGRAS.find((r) => r === nome);
			if (regra && dir === pasta) {
				regras[regra] = readFileSync(caminho, 'utf8');
				continue;
			}
			const conteudo = readFileSync(caminho);
			const hash = hashDoArquivo(conteudo, extname(caminho).slice(1));
			manifesto['/' + relative(pasta, caminho).split(sep).join('/')] = {
				hash,
				size: conteudo.length
			};
			caminhos[hash] = caminho;
		}
	};
	andar(pasta);
	return { manifesto, caminhos, regras };
}

const TIPOS: Record<string, string> = {
	html: 'text/html',
	js: 'application/javascript',
	css: 'text/css',
	json: 'application/json',
	txt: 'text/plain',
	svg: 'image/svg+xml',
	png: 'image/png',
	webp: 'image/webp',
	ico: 'image/x-icon',
	woff2: 'font/woff2',
	webmanifest: 'application/manifest+json'
};

export function tipoDoArquivo(caminho: string): string {
	return TIPOS[extname(caminho).slice(1)] ?? 'application/octet-stream';
}
