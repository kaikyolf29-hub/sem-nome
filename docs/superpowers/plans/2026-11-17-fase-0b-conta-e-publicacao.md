# Fase 0B: conta, login com Google e site publicado (plano de implementação)

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: superpowers:executing-plans. Siga o `CLAUDE.md` (regras do dono). Passos com caixas (`- [ ]`).

**Objetivo:** fazer o Mirante ter conta de verdade:
- banco no Supabase com regras de acesso (RLS) testadas;
- botão "Entrar com Google" funcionando, com sessão, perfil e "Sair";
- site publicado no endereço grátis da Cloudflare.

**Arquitetura:**
- **Banco:** Supabase Postgres, com migrações versionadas em `supabase/migrations/` e aplicadas pelo MCP.
- **Cliente:** `@supabase/supabase-js` no navegador, com fluxo PKCE e a chave publicável (pode ficar no código).
- **Sessão:** guardada num estado reativo único (`sessao`), injetável nos testes.
- **Protótipo:** o build de arquivo único continua sem rede e sem login.
- **Publicação:** Cloudflare Workers com arquivos estáticos (SPA), que são grátis e sem limite de pedidos.

**Spec:** `docs/superpowers/specs/2026-11-17-mirante-design.md`, seções 6, 13 e 16 (fase 0).

## Restrições globais
- **Supabase:** projeto `mirante` (ref `dzrdbeulimgzdcinukch`, São Paulo, plano grátis). Nunca mexa no `matsu-loja`.
- **RLS** em toda tabela de usuário, com teste provando que uma pessoa não lê nem muda os dados de outra.
- **Erros de login** viram mensagem clara em português, nunca o texto cru do Supabase.
- **Protótipo** (`PROTOTIPO=1`): nenhuma chamada de rede. O botão de login mostra "chega na próxima etapa".
- **Cloudflare:** só o plano grátis. A chave de API vem por formulário seguro (`request_credential`) e nunca entra no repositório.
- **Regras do dono** (`CLAUDE.md`): detalhes, sem cara de IA, i18n e acessibilidade.

## Pontos de atenção
1. **Provedor Google ainda desligado no Supabase:** o clique mostra "O login com Google ainda não foi ligado", sem tela de erro.
2. **Volta do Google com erro ou cancelamento** (`?error=` na URL): mensagem clara, e a URL fica limpa.
3. **Usuário sem foto:** o avatar padrão continua alinhado. **Nome muito longo:** corta com reticências.
4. **Sessão vencida ou removida noutra aba:** a interface volta a "Visitante" sem quebrar.
5. **Protótipo:** nenhuma requisição de rede, o teste existente continua valendo.

---

### Task 1: banco: perfis com RLS
**Arquivos:**
- `supabase/migrations/20261117000001_perfis.sql`
- `supabase/testes/rls_perfis.sql`
- `supabase/README.md`

- [ ] **1. Migração:**
  - tabela `public.perfis`: `id uuid` (chave, ligado a `auth.users` com `on delete cascade`), `nome`, `avatar_url`, `idioma` (`pt-BR` ou `en`, padrão `pt-BR`), `moeda_principal` (as 10 moedas, padrão `BRL`), `tema` (`sistema`, `claro`, `escuro` ou `preto`), `criado_em` e `atualizado_em`;
  - RLS ligada;
  - políticas de select e update só do próprio `id`, sem insert nem delete pelo cliente;
  - função `public.criar_perfil()` (`security definer`, com `search_path` vazio) e gatilho em `auth.users` que cria o perfil com nome e foto do Google;
  - gatilho que atualiza `atualizado_em`.
- [ ] **2.** Aplique com `apply_migration` e confira com `list_tables`.
- [ ] **3. Teste de RLS** (SQL em transação com `rollback`), executado com `execute_sql`:
  1. cria dois usuários em `auth.users`;
  2. como `authenticated` com o `sub` do usuário A: vê só o próprio perfil (1 linha); update no perfil de B afeta 0 linhas; insert e delete são negados;
  3. como `anon`: vê 0 linhas.

  Esperado: todas as checagens retornam `ok`.
- [ ] **4.** `get_advisors` (segurança) sem alerta para `perfis`.
- [ ] **5. Commit.**

### Task 2: cliente Supabase e estado da sessão
**Arquivos:**
- `apps/web/src/lib/supabase/config.ts` (URL e chave publicável);
- `apps/web/src/lib/supabase/cliente.ts`;
- `apps/web/src/lib/conta/sessao.svelte.ts` e `sessao.spec.ts`;
- `apps/web/src/lib/conta/erros.ts` e `erros.spec.ts`.

**Interfaces:**
- `criarSessao(cliente: ClienteAuth | null)`: retorna `{ usuario: Usuario | null; carregando: boolean; erro: ChaveMensagem | null; iniciar(): Promise<void>; entrarComGoogle(): Promise<void>; sair(): Promise<void> }`;
- `interface Usuario { id: string; nome: string; email: string; avatarUrl: string | null }`;
- `ClienteAuth` é a parte de `supabase.auth` que usamos (`getSession`, `onAuthStateChange`, `signInWithOAuth`, `signOut`), o que permite um cliente falso nos testes;
- `mensagemDeErro(erro: { message?: string; code?: string } | null): ChaveMensagem` mapeia provedor desligado, cancelamento, rede e caso genérico;
- `export const sessao = criarSessao(clienteDoNavegador())`, com cliente nulo no protótipo (`__PROTOTIPO__` via `define` do Vite).

- [ ] **1. Testes que falham:**
  - `iniciar()` com sessão existente preenche `usuario`, lendo nome e foto de `user_metadata`;
  - `onAuthStateChange` com `SIGNED_OUT` zera `usuario` (ponto 4);
  - `entrarComGoogle()` chama `signInWithOAuth({ provider: 'google', options: { redirectTo: origin + '/' } })`;
  - erro "provider is not enabled" vira `conta.erroProvedor` (ponto 1);
  - erro com `?error=access_denied` na URL vira `conta.erroCancelado` (ponto 2);
  - com cliente nulo, `entrarComGoogle()` define `conta.emBreve` e não lança erro.
- [ ] **2.** Implemente e rode até passar.
- [ ] **3. Commit.**

### Task 3: interface da conta com sessão real
**Arquivos:** `CartaoConta.svelte` (e o perfil), `e2e/login.e2e.ts`, catálogos.
- [ ] **1. Testes que falham:**
  - **e2e:** clicar em "Entrar com Google" no build normal leva a `…supabase.co/auth/v1/authorize?provider=google…`, com a rota interceptada pelo Playwright;
  - **componente:** com usuário logado, o cartão mostra nome, e-mail e foto (`img` com `alt=""`) e o perfil mostra "Sair";
  - **componente:** nome longo corta com reticências (ponto 3);
  - **componente:** erro de provedor desligado aparece como texto claro (`role="status"`).
- [ ] **2.** Implemente: logado, o cartão mostra a foto (ou o avatar padrão), o nome e o e-mail, e o perfil ganha o botão "Sair"; ao voltar do Google, a URL fica limpa.
- [ ] **3.** Rode todas as verificações do `CLAUDE.md` e confira com prints de perto.
- [ ] **4. Commit.**

### Task 4: publicação na Cloudflare
**Arquivos:** `apps/web/wrangler.jsonc`, `README.md` (seção "Publicar"), `.github/workflows/ci.yml` (sem publicar automaticamente por enquanto).
- [x] **1.** Crie `wrangler.jsonc` com nome `mirante`, `compatibility_date` e `assets: { directory: "./build", not_found_handling: "single-page-application" }`.
- [x] **2.** ~~Peça a chave de API~~ Publicado pela conta da Cloudflare conectada (kael.olf18@gmail.com), sem chave no repositório: `scripts/publicacao.ts` faz a lista e o envio, a conta conectada cria a sessão e grava o Worker.
- [x] **3.** Build e publicação. Endereço: `https://mirante.mirante-mercado.workers.dev` (subdomínio da conta criado agora: `mirante-mercado`).
- [x] **4.** Abra o endereço com o Playwright e confira o feed, a rota `/cripto/nft` (fallback da SPA) e o tema. Tire prints.
- [x] **5.** Documente no README como publicar.
- [x] **6.** Diga ao dono quais endereços cadastrar no Supabase em Authentication → URL Configuration: Site URL e Redirect URLs (`https://mirante…workers.dev/**`, `http://localhost:5173/**`).
- [x] **7. Commit e push.**
