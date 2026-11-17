# Banco do Mirante (Supabase)

Projeto `mirante` (ref `dzrdbeulimgzdcinukch`, São Paulo, plano grátis).

- `migrations/`: mudanças do banco, em ordem. Aplicadas pelo MCP do Supabase (`apply_migration`), com o mesmo nome do arquivo sem a data.
- `testes/`: testes das regras de acesso (RLS). Cada um roda numa transação que desfaz tudo no fim (`rollback`) e devolve linhas `checagem | ok`. Todas precisam vir `ok = true`.

## Regras
- Toda tabela com dados de pessoas tem RLS: cada pessoa só lê e muda o que é dela.
- Cada tabela nova ganha um teste em `testes/` provando que uma pessoa não lê nem muda os dados de outra.
- Depois de cada migração, confira os avisos de segurança (`get_advisors`, tipo `security`): a lista precisa vir vazia.
