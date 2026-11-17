# Mirante

**O mercado visto de cima.** Portal de notícias e investimentos com IA, com cripto,
tecnologia e IA dentro, num site com conta Google e num app instalável para
Windows e Linux (com a versão Matsu OS).

> **Beta.** Em construção: hoje o repositório tem a base técnica e um protótipo
> visual com dados de exemplo.

- Design: [`docs/superpowers/specs/2026-11-17-mirante-design.md`](docs/superpowers/specs/2026-11-17-mirante-design.md)
- Plano atual: [`docs/superpowers/plans/2026-11-17-fase-0a-base-e-prototipo.md`](docs/superpowers/plans/2026-11-17-fase-0a-base-e-prototipo.md)

## Rodar

Requer [Bun](https://bun.sh) 1.4.4 e Node 22.17 ou mais novo.

```bash
bun install
bun run dev
```

Testes: `bun run test` (unidade e componentes) e `bun run test:e2e` (navegador).

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
