# Mirante

**O mercado visto de cima.** Portal de notícias e investimentos com IA, com cripto,
tecnologia e IA dentro, num site com conta Google e num app instalável para
Windows e Linux (com a versão Matsu OS).

> **Beta.** Em construção. As notícias já são reais (19 fontes conferidas, coletadas a
> cada 5 minutos); cotações, carteira e análises ainda são de exemplo.

- Design: [`docs/superpowers/specs/2026-11-17-mirante-design.md`](docs/superpowers/specs/2026-11-17-mirante-design.md)
- Planos: [`docs/superpowers/plans/`](docs/superpowers/plans/) (o atual é a fase 1A, notícias de verdade)

## Rodar

Requer [Bun](https://bun.sh) 1.4.4 e Node 22.17 ou mais novo.

```bash
bun install
bun run dev
```

Testes: `bun run test` (unidade e componentes), `bun run test:coleta` (coleta de notícias) e `bun run test:e2e` (navegador).

## Notícias

- **Fontes:** 19, só RSS, Atom ou API oficial, conferidas (endereço e `robots.txt`) antes de entrar. A lista fica na tabela `fontes` do Supabase e no plano da fase 1A. De cada notícia guardamos só título, trecho e link.
- **Coleta:** a Edge Function `coletar` (`supabase/functions/coletar/`) roda a cada 5 minutos pelo `pg_cron`, com cache (ETag), espera crescente quando uma fonte falha e teto mensal abaixo do limite grátis. A lógica fica em `supabase/functions/_compartilhado/`, testada com respostas gravadas.
- **Duplicatas e grupos:** o mesmo link nunca entra duas vezes; a mesma história em fontes diferentes vira um cartão só, com todas as fontes.
- **Site:** lê a função `feed()` do banco, que já entrega um cartão por fato, com variedade de fontes na capa. Logos das fontes em `apps/web/static/fontes/` (veja `apps/web/scripts/logos-das-fontes.md`).

## Publicar

O site fica em **https://mirante.mirante-mercado.workers.dev**, na Cloudflare (plano grátis, Worker `mirante` só com arquivos estáticos, sem custo por acesso). Configuração em `apps/web/wrangler.jsonc`; cabeçalhos (cache longo e proteções) em `apps/web/static/_headers`.

**Com uma chave de API da Cloudflare** (permissão "Workers Scripts: Edit"):

```bash
cd apps/web
bun run publicar
```

**Sem chave, pela conta da Cloudflare conectada ao Claude:** o script `apps/web/scripts/publicacao.ts` faz a parte local (lista de arquivos e envio) e a conta conectada faz o resto. Os passos estão no começo do script.

Depois de publicar num endereço novo, cadastre-o no Supabase em Authentication → URL Configuration (Site URL e Redirect URLs).

## Licença

Fechada. Todos os direitos reservados. Veja [LICENSE](LICENSE).
