# Banco do Mirante (Supabase)

Projeto `mirante` (ref `dzrdbeulimgzdcinukch`, São Paulo, plano grátis).

- `migrations/`: mudanças do banco, em ordem. Aplicadas pelo MCP do Supabase (`apply_migration`), com o mesmo nome do arquivo sem a data.
- `functions/`: Edge Functions. `coletar` busca as notícias (agendada pelo `pg_cron` a cada 5 minutos); a lógica pura fica em `functions/_compartilhado/` e é testada com `bun run test:coleta`. Publicação pelo MCP (`deploy_edge_function`, com `entrypoint_path: coletar/index.ts` e `import_map_path: coletar/deno.json`, enviando também os arquivos de `_compartilhado/`).
- `testes/`: testes das regras de acesso (RLS) e da função `feed()`. Cada um roda numa transação que desfaz tudo no fim (`rollback`) e devolve linhas `checagem | ok`. Todas precisam vir `ok = true`.

## Regras
- Toda tabela com dados de pessoas tem RLS: cada pessoa só lê e muda o que é dela.
- Cada tabela nova ganha um teste em `testes/` provando que uma pessoa não lê nem muda os dados de outra.
- Depois de cada migração, confira os avisos de segurança (`get_advisors`, tipo `security`): a lista precisa vir vazia.
- A chave da coleta (`chave_coleta`) nasce no cofre do banco (Vault) e nunca sai dele: o job do `pg_cron` lê a chave e a função `coletar` confere com `conferir_chave_coleta`.
- Cotas: `contadores_cota` guarda o uso de cada serviço grátis; `somar_cota` recusa quando passa do teto.
