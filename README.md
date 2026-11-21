# Mirante

**O mercado visto de cima.** Portal de notícias e investimentos com IA, com cripto,
tecnologia e IA dentro, num site com conta Google e num app instalável para
Windows e Linux (com a versão Matsu OS).

> **Beta.** Em construção. As notícias já são reais (41 fontes conferidas, coletadas a
> cada 5 minutos) e cada pessoa escolhe os temas do seu início; cotações, carteira e
> análises ainda são de exemplo.

- Design: [`docs/superpowers/specs/2026-11-17-mirante-design.md`](docs/superpowers/specs/2026-11-17-mirante-design.md)
- Planos: [`docs/superpowers/plans/`](docs/superpowers/plans/) (o atual é a fase 1B, personalização das notícias)

## Rodar

Requer [Bun](https://bun.sh) 1.4.4 e Node 22.17 ou mais novo.

```bash
bun install
bun run dev
```

Testes: `bun run test` (unidade e componentes), `bun run test:coleta` (coleta de notícias) e `bun run test:e2e` (navegador).

## Notícias

- **Fontes:** 41, só RSS, Atom ou API oficial, conferidas (endereço e `robots.txt`) antes de entrar: 19 de mercado, cripto e tecnologia (fase 1A) e 22 de temas gerais, como política, saúde, esportes e cultura (fase 1B). A lista fica na tabela `fontes` do Supabase e nos planos. De cada notícia guardamos só título, trecho e link.
- **Coleta:** a Edge Function `coletar` (`supabase/functions/coletar/`) roda a cada 5 minutos pelo `pg_cron`, com cache (ETag), espera crescente quando uma fonte falha e teto mensal abaixo do limite grátis. A lógica fica em `supabase/functions/_compartilhado/`, testada com respostas gravadas.
- **Limpeza:** fora rodapés automáticos, a legenda e o crédito da foto do g1 e do ge, e conteúdo que não é notícia (previsão do tempo por cidade, palpites de aposta e ofertas de loja).
- **Duplicatas e grupos:** o mesmo link nunca entra duas vezes (se vier de outra seção, só ganha o canal novo); a mesma história em fontes diferentes vira um cartão só, com todas as fontes.
- **Site:** lê `/api/feed` e `/api/busca` (o Worker guarda a resposta por 60 s e 120 s) e, se a borda falhar, as funções `feed()` e `buscar_noticias()` do banco. Um cartão por fato, sem a mesma marca (logo) seguida. Logos das fontes em `apps/web/static/fontes/` (veja `apps/web/scripts/logos-das-fontes.md`).
- **Personalização:** o espaço "Para você" é o início, com `# tudo`, um canal por tema escolhido e um por tema digitado (até 5, buscados nas nossas fontes). Na primeira visita, "O que você quer ver?". Filtros que valem no app inteiro: idioma, palavras silenciadas e fontes escondidas. Tudo fica no aparelho e, com a conta Google, segue a pessoa (tabela `preferencias`).

## Publicar

O site fica em **https://mirante.mirante-mercado.workers.dev**, na Cloudflare (plano grátis, Worker `mirante`). Os arquivos estáticos não contam pedidos do Worker; só `/api/*` passa pelo código (`apps/web/worker/`), com cache na borda. Configuração em `apps/web/wrangler.jsonc`; cabeçalhos (cache longo e proteções) em `apps/web/static/_headers`.

**Com uma chave de API da Cloudflare** (permissão "Workers Scripts: Edit"):

```bash
cd apps/web
bun run publicar
```

**Sem chave, pela conta da Cloudflare conectada ao Claude:** o script `apps/web/scripts/publicacao.ts` faz a parte local (lista de arquivos, envio e o Worker em `build-worker/mirante.js`) e a conta conectada faz o resto. Os passos estão no começo do script.

Depois de publicar num endereço novo, cadastre-o no Supabase em Authentication → URL Configuration (Site URL e Redirect URLs).

## Licença

Fechada. Todos os direitos reservados. Veja [LICENSE](LICENSE).
