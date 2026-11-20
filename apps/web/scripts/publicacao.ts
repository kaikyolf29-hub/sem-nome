// Publica o site na Cloudflare pela API, em dois passos locais (o resto passa pela conta conectada):
//   1. bun scripts/publicacao.ts manifesto -> imprime { manifesto, regras } de ./build
//   2. (conta conectada) cria a sessão de envio com o manifesto e devolve o token e os grupos
//   3. JWT_ENVIO=<token> bun scripts/publicacao.ts enviar <conta> '<grupos em JSON>'
//   4. (conta conectada) grava o Worker "mirante" com o token final (impresso no passo 3) e
//      assets.config = { not_found_handling: 'single-page-application', ...regras }
// O Worker (rotas /api/feed e /api/busca com cache) é gerado por `bun scripts/publicacao.ts worker`
// em build-worker/mirante.js. Na publicação pela API ele sobe junto, no passo 4, com
// main_module: 'mirante.js' (o conteúdo do arquivo), binding ASSETS nos metadados
// e assets.config.run_worker_first: ['/api/*'].
// Com uma chave de API da Cloudflare, use `bun run publicar` (wrangler), que faz tudo de uma vez.
import { montarManifesto, tipoDoArquivo } from '../src/lib/publicacao/manifesto.ts';
import { readFileSync } from 'node:fs';

const [comando, conta, grupos] = process.argv.slice(2);

if (comando === 'worker') {
	const saida = await Bun.build({
		entrypoints: ['worker/index.ts'],
		target: 'browser',
		format: 'esm',
		outdir: 'build-worker',
		naming: 'mirante.js'
	});
	if (!saida.success) {
		for (const log of saida.logs) console.error(log);
		throw new Error('Falha ao gerar o Worker.');
	}
	console.log('build-worker/mirante.js');
	process.exit(0);
}

const { manifesto, caminhos, regras } = montarManifesto('build');

if (comando === 'manifesto') {
	console.log(JSON.stringify({ manifesto, regras }));
} else if (comando === 'enviar' && conta && grupos) {
	const token = process.env.JWT_ENVIO;
	if (!token) throw new Error('Falta JWT_ENVIO (o token da sessão de envio).');
	let final: string | undefined;
	for (const grupo of JSON.parse(grupos) as string[][]) {
		const form = new FormData();
		for (const hash of grupo) {
			const caminho = caminhos[hash];
			if (!caminho) throw new Error(`Arquivo não encontrado para ${hash}: rode o build de novo.`);
			const base64 = readFileSync(caminho).toString('base64');
			form.append(hash, new File([base64], hash, { type: tipoDoArquivo(caminho) }));
		}
		const resposta = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${conta}/workers/assets/upload?base64=true`,
			{ method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form }
		);
		const corpo = (await resposta.json()) as { success: boolean; result?: { jwt?: string } };
		if (!corpo.success) throw new Error(`Envio falhou (${resposta.status}).`);
		final = corpo.result?.jwt ?? final;
	}
	console.log(final ?? 'Nada para enviar: use o token da sessão como token final.');
} else {
	console.log('Uso: bun scripts/publicacao.ts manifesto | enviar <conta> <grupos> | worker');
	process.exit(1);
}
