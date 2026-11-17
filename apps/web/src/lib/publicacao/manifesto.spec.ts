import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { hashDoArquivo, montarManifesto, tipoDoArquivo } from './manifesto.ts';

const texto = (s: string) => new TextEncoder().encode(s);

describe('manifesto de publicação (Cloudflare)', () => {
	it('calcula o hash como o wrangler: sha256 de base64 + extensão, 32 caracteres', () => {
		// Valores conferidos com sha256sum no terminal.
		expect(hashDoArquivo(texto('olá'), 'txt')).toBe('bf3da8dcefab76547cd72af15f64e260');
		expect(hashDoArquivo(texto('body{}'), 'css')).toBe('f78a1c20d726372960baaeb9d0aacb0c');
	});

	it('lista todos os arquivos da pasta com caminho começando em "/" e tamanho certo', () => {
		const pasta = mkdtempSync(join(tmpdir(), 'mirante-pub-'));
		mkdirSync(join(pasta, '_app', 'immutable'), { recursive: true });
		writeFileSync(join(pasta, 'index.html'), '<!doctype html>');
		writeFileSync(join(pasta, '_app', 'immutable', 'a.js'), 'export{}');
		const { manifesto, caminhos } = montarManifesto(pasta);
		expect(Object.keys(manifesto).sort()).toEqual(['/_app/immutable/a.js', '/index.html']);
		expect(manifesto['/index.html']).toEqual({
			hash: hashDoArquivo(texto('<!doctype html>'), 'html'),
			size: 15
		});
		expect(caminhos[manifesto['/_app/immutable/a.js'].hash]).toBe(
			join(pasta, '_app', 'immutable', 'a.js')
		);
	});

	it('deixa _headers e _redirects fora da lista e devolve o conteúdo para a configuração', () => {
		const pasta = mkdtempSync(join(tmpdir(), 'mirante-pub-'));
		writeFileSync(join(pasta, 'index.html'), 'x');
		writeFileSync(join(pasta, '_headers'), '/*\n  X-Content-Type-Options: nosniff\n');
		const { manifesto, regras } = montarManifesto(pasta);
		expect(Object.keys(manifesto)).toEqual(['/index.html']);
		expect(regras).toEqual({ _headers: '/*\n  X-Content-Type-Options: nosniff\n' });
	});

	it('envia cada arquivo com o tipo certo, para o navegador abrir direito', () => {
		expect(tipoDoArquivo('/index.html')).toBe('text/html');
		expect(tipoDoArquivo('/_app/x.js')).toBe('application/javascript');
		expect(tipoDoArquivo('/_app/x.css')).toBe('text/css');
		expect(tipoDoArquivo('/f.woff2')).toBe('font/woff2');
		expect(tipoDoArquivo('/robots.txt')).toBe('text/plain');
		expect(tipoDoArquivo('/_app/version.json')).toBe('application/json');
		expect(tipoDoArquivo('/logo.svg')).toBe('image/svg+xml');
		expect(tipoDoArquivo('/sem-extensao')).toBe('application/octet-stream');
	});
});
