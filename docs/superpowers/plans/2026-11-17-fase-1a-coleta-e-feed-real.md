# Fase 1A: notícias de verdade (coleta, duplicatas, feed real)

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: superpowers:executing-plans (execução nativa; o dono autorizou seguir sem esperar revisão do plano). Siga o `CLAUDE.md`. Passos com caixas (`- [ ]`).

**Objetivo:** o feed do site passa a mostrar notícias reais de fontes oficiais e veículos com RSS, sem repetidas, agrupadas por fato, atualizando sozinho e sem estourar nenhuma cota grátis.

**Arquitetura:**
- **Coleta:** a Edge Function `coletar` (Deno) roda a cada 5 min, chamada pelo `pg_cron` com `pg_net`. Lê as fontes vencidas, com ETag/If-Modified-Since, espera crescente após erro e limite de tempo por rodada.
- **Lógica pura** (ler RSS/Atom/JSON, limpar, canonizar URL, agrupar, classificar canal) num pacote do workspace (`supabase/functions/_compartilhado`), testado com `bun test` e respostas gravadas.
- **Banco:** tabelas públicas de leitura (`fontes`, `grupos`, `noticias`) com RLS. Um gatilho mantém os números de cada grupo. A função `feed()` (STABLE, chamada por GET) entrega cada grupo como um cartão.
- **Interface:** o build normal lê `GET /rest/v1/rpc/feed` com a chave publicável, sem supabase-js. O protótipo continua com as notícias de exemplo e sem rede.

**Tech:** Supabase (Postgres, Edge Functions, pg_cron, pg_net, Vault), `fast-xml-parser` 5, SvelteKit 3 e Svelte 5, Bun test, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-17-mirante-design.md`, seções 6.1, 6.3, 8, 9.1, 13 e 16 (fase 1).

## Restrições globais
- Supabase: projeto `mirante` (ref `dzrdbeulimgzdcinukch`). Nunca o `matsu-loja`.
- Só planos grátis. Teto da Edge Function: 400.000 chamadas por mês (80% de ~500 mil). Notícias com mais de 90 dias são apagadas (spec 6.3).
- De cada notícia só guardamos título, trecho (até 280 caracteres, sem HTML) e link (spec 8). Sem imagens das fontes.
- Nenhuma chave no repositório. A chave da coleta fica no Vault e nunca sai do banco.
- Identificação da coleta: `MiranteBot/0.1 (+https://mirante.mirante-mercado.workers.dev)`.
- Toda fonte foi conferida em 17/11/2026: endereço responde, `robots.txt` não bloqueia o caminho do feed para robôs gerais.
- Regras do dono (`CLAUDE.md`): detalhes, sem cara de IA, `t()` em todo texto visível, acessibilidade, peso (primeira tela ≤ 120 KB, app ≤ 160 KB).

## Fontes ligadas nesta fase

| id | Nome | Tipo | Endereço | Espaço | Canais base | Primária |
|---|---|---|---|---|---|---|
| `bcb` | Banco Central do Brasil | atom | `https://www.bcb.gov.br/api/feed/sitebcb/sitefeeds/noticias` | mercado | brasil, macro | sim |
| `ibge` | IBGE | ibge | `https://servicodados.ibge.gov.br/api/v3/noticias/?qtd=20` | mercado | brasil, macro | sim |
| `fed` | Federal Reserve | rss | `https://www.federalreserve.gov/feeds/press_all.xml` | mercado | eua, macro | sim |
| `bce` | Banco Central Europeu | rss | `https://www.ecb.europa.eu/rss/press.html` | mercado | mundo, macro | sim |
| `agencia-brasil-economia` | Agência Brasil | rss | `https://agenciabrasil.ebc.com.br/rss/economia/feed.xml` | mercado | brasil | não |
| `agencia-brasil-internacional` | Agência Brasil | rss | `https://agenciabrasil.ebc.com.br/rss/internacional/feed.xml` | mercado | mundo | não |
| `infomoney` | InfoMoney | rss | `https://www.infomoney.com.br/feed/` | mercado | brasil | não |
| `money-times` | Money Times | rss | `https://www.moneytimes.com.br/feed/` | mercado | brasil | não |
| `g1-economia` | g1 Economia | rss | `https://g1.globo.com/rss/g1/economia/` | mercado | brasil | não |
| `coindesk` | CoinDesk | rss | `https://www.coindesk.com/arc/outboundfeeds/rss/` | cripto | noticias | não |
| `cointelegraph` | Cointelegraph | rss | `https://cointelegraph.com/rss` | cripto | noticias | não |
| `livecoins` | Livecoins | rss | `https://livecoins.com.br/feed/` | cripto | noticias | não |
| `portal-do-bitcoin` | Portal do Bitcoin | rss | `https://portaldobitcoin.uol.com.br/feed/` | cripto | noticias | não |
| `tecnoblog` | Tecnoblog | rss | `https://tecnoblog.net/feed/` | tecnologia | (por palavra) | não |
| `canaltech` | Canaltech | rss | `https://canaltech.com.br/rss/` | tecnologia | (por palavra) | não |
| `olhar-digital` | Olhar Digital | rss | `https://olhardigital.com.br/feed/` | tecnologia | (por palavra) | não |
| `the-verge` | The Verge | rss (Atom) | `https://www.theverge.com/rss/index.xml` | tecnologia | (por palavra) | não |
| `ars-technica` | Ars Technica | rss | `https://feeds.arstechnica.com/arstechnica/index` | tecnologia | (por palavra) | não |
| `techcrunch-ia` | TechCrunch | rss | `https://techcrunch.com/category/artificial-intelligence/feed/` | tecnologia | ia | não |

Intervalo: 10 min para todas. Ficam para a 1B: CVM (o RSS só lista pastas), SEC (exige contato no cabeçalho), Hacker News, GitHub, arXiv.

## Como ficou (17/11/2026)
- Coleta no ar desde 17/11: 19 fontes, sem links repetidos, nenhuma com erro na conferência.
- Mudanças em relação ao plano, todas com teste:
  - canais pelo **título** (o trecho arrastava notícias para canais de passagem);
  - consulta de links existentes em lotes de 25 (o g1 manda 100 itens e o endereço do pedido estourava);
  - logos em 128 px com Pillow (o ImageMagick daqui não lê `.ico`); 3 recortadas do logotipo oficial;
  - `feed()` com variedade de fontes (migração `20261117000004_feed_variado.sql`);
  - impacto só aparece quando a IA calcular (fase 2).
- Revisão de fim de etapa: o Fable 5.2 pediu créditos pagos (não usados sem aprovação do dono); a revisão foi feita por um revisor independente no modelo padrão. Nada bloqueava. Corrigido, com teste: notícias recentes baixadas só quando há novidade e por espaço; folga de 2 min na agenda; agrupamento só no mesmo espaço; a fonte do título vem primeiro; canais sem fonte dizem a fase; foco depois de "Tentar de novo"; chave conferida antes de ir ao banco; rodapé "Fonte: … Veja mais notícias" da Livecoins.
- **Fica para a 1B** (dívida conhecida): cache do `feed()` na Cloudflare e contador de saída de dados (spec 6.1 e 6.3); hoje o navegador chama o Supabase direto (~27 KB por chamada), o que cabe no beta.

## Pontos de atenção (o que mais pode quebrar para quem usa)
1. **Feed com HTML, entidades, CDATA, trecho vazio ou sem data:** o cartão sai limpo (sem `&amp;`, sem tags) e, sem data, usa a hora da coleta. Teste na Task 2.
2. **Fonte fora do ar, lenta ou respondendo 429:** as outras continuam, a fonte espera mais na próxima vez e o site não percebe. Teste na Task 3.
3. **Mesma história em dois veículos com títulos parecidos** vira um cartão só, com "+1"; mas "Ibovespa fecha em alta" de dias diferentes **não** se junta (janela de 36 h). Teste na Task 2.
4. **Sem internet ou Supabase fora do ar na interface:** mensagem clara com "Tentar de novo", nunca tela em branco. Teste na Task 5.
5. **Título muito longo ou em inglês:** o cartão continua alinhado, sem estourar a largura em 320 px. Teste na Task 5.

---

### Task 1: banco das notícias

**Arquivos:**
- Criar: `supabase/migrations/20261117000002_noticias.sql`, `supabase/testes/rls_noticias.sql`
- Alterar: `supabase/README.md`

**Interfaces (produz):**
- `public.fontes(id text pk, nome, site, logo, tipo text check in ('rss','atom','ibge'), endereco, idioma check in ('pt-BR','en'), primaria bool, espaco text, canais text[], intervalo_min int default 10, ativa bool default true)`
- `public.estado_fontes(fonte_id pk → fontes, etag, modificado text, ultima_coleta, proxima_coleta default now(), erros_seguidos int default 0, ultimo_erro text, itens_ultima int)`
- `public.grupos(id bigint identity pk, titulo, espaco, canais text[], n_fontes int, primaria bool, criado_em, atualizado_em)`
- `public.noticias(id bigint identity pk, grupo_id → grupos on delete cascade, fonte_id → fontes, url text unique, titulo, trecho, publicado_em timestamptz, coletado_em default now(), idioma, espaco, canais text[], assinatura text[])` com índices em `publicado_em desc`, `grupo_id`, `coletado_em`.
- `public.contadores_cota(servico text, periodo text, usados int, teto int, pk(servico, periodo))`
- Gatilho `noticias_atualizam_grupo` (after insert): recalcula no grupo `n_fontes` (fontes distintas), `primaria` (alguma primária), `atualizado_em` (maior `publicado_em`) e `canais` (união).
- `public.feed(p_espaco text, p_canal text default null, p_limite int default 30) returns jsonb`, STABLE, `security invoker`. Canal nulo, `manchetes` ou `visao-geral`: grupos das últimas 72 h por `extract(epoch from atualizado_em)/3600 + 4*ln(n_fontes) + (3 se primaria)`, decrescente. Outro canal: grupos com o canal, por `atualizado_em` decrescente. Cada item: `{ id, titulo, url, trecho, publicadoEm, idioma, canais, fontes: [{ id, nome, site, logo, primaria, url }] }`; a primeira fonte é a primária mais antiga, senão a mais antiga.
- `public.conferir_chave_coleta(p_chave text) returns boolean` (security definer, compara com o segredo `chave_coleta` do Vault; só `service_role` executa).
- `public.somar_cota(p_servico text, p_periodo text, p_teto int) returns boolean` (security definer, soma 1 de forma atômica e devolve `false` se passou do teto; só `service_role`).
- RLS ligada em todas. `select` para `anon` e `authenticated` em `fontes`, `grupos` e `noticias`. `estado_fontes` e `contadores_cota` sem política (só o servidor). Sem insert, update ou delete pelo cliente.
- Seed das 19 fontes da tabela acima e das linhas em `estado_fontes`.
- Extensões `pg_cron` e `pg_net`. Segredo `chave_coleta` criado no Vault pelo próprio SQL (`encode(gen_random_bytes(32), 'hex')`), sem passar pela conversa.
- Limpeza diária (`pg_cron`, 03:17): apaga notícias com mais de 90 dias e grupos vazios.

- [x] **1. Teste de RLS e da função `feed` que falha** (`supabase/testes/rls_noticias.sql`, transação com `rollback`, via `execute_sql`): como `anon`, lê fontes (19), não insere em `noticias`, não lê `estado_fontes` nem `contadores_cota`, não executa `somar_cota` nem `conferir_chave_coleta`; inserindo (como dono) duas notícias de fontes diferentes no mesmo grupo, `grupos.n_fontes = 2` e `feed('mercado')` devolve 1 item com 2 fontes, a primária primeiro; uma notícia de 100 dias some do `feed`. Esperado: tudo `ok`.
- [x] **2.** Aplique a migração com `apply_migration` e rode o teste até tudo dar `ok`.
- [x] **3.** `get_advisors` (segurança e desempenho) sem alerta novo.
- [x] **4. Commit.**

### Task 2: lógica da coleta (pura, testada)

**Arquivos:**
- Criar: `supabase/functions/package.json` (workspace `@mirante/coleta`, script `test: bun test`, dependência `fast-xml-parser@5`), `supabase/functions/_compartilhado/{tipos,ler,normalizar,agrupar,canais}.ts` e `*.test.ts`, `supabase/functions/_compartilhado/amostras/*` (respostas gravadas de `bcb`, `ibge`, `fed`, `infomoney`, `the-verge`, `coindesk`).
- Alterar: `package.json` da raiz (workspace `supabase/functions` e script `test:coleta`), `.github/workflows/ci.yml` (passo `bun run test:coleta`), `bun.lock`.

**Interfaces (produz):**
- `tipos.ts`: `TipoFonte = 'rss' | 'atom' | 'ibge'`; `Fonte { id; nome; tipo; endereco; idioma; primaria; espaco: 'mercado' | 'cripto' | 'tecnologia'; canais: string[]; intervalo_min }`; `ItemBruto { titulo; url; trecho; publicadoEm: string | null }`; `ItemPronto { url; titulo; trecho; publicadoEm: string; idioma; espaco; canais: string[]; assinatura: string[] }`.
- `ler.ts`: `lerFeed(texto: string, tipo: TipoFonte): ItemBruto[]` (RSS 2.0, RSS 1.0/RDF e Atom pelo conteúdo, não pelo `tipo`; `ibge` lê o JSON, data `dd/mm/aaaa hh:mm:ss` no fuso de Brasília; link `http://` do IBGE vira `https://`).
- `normalizar.ts`: `urlCanonica(url: string): string` (https, sem `utm_*`, `fbclid`, `gclid`, `mc_cid`, `mc_eid`, `ref`, `amp`, sem `#…`, sem `/amp` final); `limparTexto(html: string): string` (sem tags, entidades decodificadas, espaços únicos); `trecho(html: string, max = 280): string` (corta na palavra, com "…"; se repetir o título, vazio); `prepararItem(bruto: ItemBruto, fonte: Fonte, agora: Date): ItemPronto | null` (null sem título ou URL, ou com mais de 7 dias).
- `agrupar.ts`: `assinatura(titulo: string): string[]` (minúsculas, sem acento, sem palavras vazias pt e en, palavras ≥ 3 letras e números, únicas, ordenadas); `parecidas(a: string[], b: string[]): boolean` (≥ 4 em comum e Jaccard ≥ 0,5); `escolherGrupo(item: ItemPronto, recentes: { grupo_id: number; assinatura: string[]; publicado_em: string }[]): number | null` (só candidatas a até 36 h do item; a mais parecida).
- `canais.ts`: `classificar(fonte: Fonte, titulo: string, trecho: string): { espaco; canais: string[] }`. Palavras de cripto (bitcoin, ethereum, cripto, criptomoeda, stablecoin, nft, blockchain, solana, binance…) levam ao espaço `cripto` (com `stablecoins` e `nft` quando couber). No `mercado`: `acoes`, `fiis`, `etfs`, `renda-fixa`, `cambio`, `commodities`, `macro`, `eua` e `mundo` por palavras. Na `tecnologia`: `ia`, `chips` (Nvidia, AMD, Intel, TSMC, semicondutor, chip), `big-techs` (Apple, Google, Microsoft, Meta, Amazon). Sempre inclui os canais base da fonte. As listas de palavras ficam em constantes exportadas.

- [x] **1. Testes que falham** (`bun test`):
  - `lerFeed` das 6 amostras: cada uma com ≥ 10 itens, todos com título e URL `https://`; Atom do `bcb` com data; IBGE com data em UTC certa (`16/11/2026 04:29:43` → `2026-11-16T07:29:43.000Z`).
  - `limparTexto('Petróleo &amp; gás <b>sobem</b>&nbsp; 3%')` → `'Petróleo & gás sobem 3%'`; `trecho` de 600 caracteres termina em "…" e tem ≤ 281; trecho igual ao título → `''`.
  - `urlCanonica('http://site.com/a/?utm_source=x&id=2&fbclid=y#topo')` → `'https://site.com/a/?id=2'`.
  - `prepararItem` sem data usa `agora`; com 8 dias devolve `null` (ponto 1).
  - `parecidas` verdadeiro para "Copom mantém Selic em 15% e sinaliza cautela" × "Copom mantém a Selic em 15% ao ano e sinaliza cautela com inflação"; falso para "Ibovespa fecha em alta com bancos" × "Ibovespa fecha em alta com Vale".
  - `escolherGrupo` ignora uma candidata igual de 40 h antes (ponto 3).
  - `classificar`: notícia de "Bitcoin" na InfoMoney → `cripto`; "Nvidia lança chip" no Tecnoblog → `tecnologia` com `chips`; "Dólar fecha em queda" → `mercado` com `cambio`; "Fed mantém juros" na Agência Brasil Internacional → `mercado` com `mundo`, `eua` e `macro`.
- [x] **2.** Implemente e rode até passar.
- [x] **3. Commit.**

### Task 3: Edge Function `coletar` e agendamento

**Arquivos:**
- Criar: `supabase/functions/coletar/index.ts` (servidor fino), `supabase/functions/coletar/rodada.ts` e `rodada.test.ts`, `supabase/functions/coletar/deno.json` (mapa `fast-xml-parser` → `npm:fast-xml-parser@5.x`, `@supabase/supabase-js` → `npm:@supabase/supabase-js@2.x`), `supabase/migrations/20261117000003_agendar_coleta.sql`.

**Interfaces:**
- Consome: Task 1 (tabelas, `conferir_chave_coleta`, `somar_cota`), Task 2 (todas as funções).
- Produz: `rodada(db: BancoColeta, buscar: typeof fetch, agora: () => Date, limiteMs = 25_000): Promise<Resumo>` onde `BancoColeta` é a interface mínima (`fontesVencidas()`, `recentes(desde: Date)`, `urlsExistentes(urls: string[])`, `criarGrupo(item: ItemPronto): Promise<number>`, `inserir(itens: (ItemPronto & { grupo_id: number; fonte_id: string })[])`, `salvarEstado(fonte_id: string, estado: Partial<EstadoFonte>)`) e `Resumo { fontes: { id: string; status: number | 'erro'; novos: number }[]; ms: number }`.
- Regras: tempo limite de 10 s por pedido; 304 só reagenda; 2xx atualiza ETag e Last-Modified e reagenda em `intervalo_min`; erro ou status ≥ 400 soma `erros_seguidos` e reagenda em `min(intervalo_min × 2^erros, 24 h)`; no máximo 30 itens novos por fonte; para quando passa de `limiteMs`. O `index.ts` confere a chave do cabeçalho `x-mirante-chave` com `conferir_chave_coleta` (401 se não bate), chama `somar_cota('edge-coletar', 'AAAA-MM', 400000)` (se `false`, responde 200 com `{ pausado: true }`) e monta o `BancoColeta` com supabase-js e `SUPABASE_SERVICE_ROLE_KEY`.

- [x] **1. Testes que falham** (`rodada.test.ts`, banco e `fetch` falsos): fonte com 304 não insere e reagenda; fonte com 500 soma erro e reagenda em 20 min (intervalo 10 × 2¹), e a fonte seguinte continua (ponto 2); URL já existente não entra de novo; dois itens parecidos de fontes diferentes caem no mesmo grupo; `limiteMs` estourado para antes da próxima fonte.
- [x] **2.** Implemente até passar.
- [x] **3. Publique** com `deploy_edge_function` (`verify_jwt: false`, a função confere a própria chave). Chamada sem a chave → 401.
- [x] **4. Migração de agendamento:** `cron.schedule('coletar-noticias', '*/5 * * * *', …)` com `net.http_post` para `https://dzrdbeulimgzdcinukch.supabase.co/functions/v1/coletar`, cabeçalho `x-mirante-chave` lido do Vault dentro do próprio job e `timeout_milliseconds` 60000.
- [x] **5. Confira em produção:** dispare uma vez; em até 10 min `noticias` tem itens das 19 fontes (ou o erro de cada uma em `estado_fontes`); nenhuma URL repetida; `contadores_cota` somando.
- [x] **6. Commit.**

### Task 4: logos das fontes

**Arquivos:**
- Criar: `apps/web/static/fontes/<id>.png` (64×64, a logo do próprio site: `apple-touch-icon` ou o maior ícone declarado), `apps/web/scripts/baixar-logos.ts`.
- Alterar: `apps/web/src/lib/feed/tipos.ts` (`FonteNoticia.logo?: string`), `MarcaFonte.svelte`, `MarcaFonte.svelte.spec.ts` (criar).

- [x] **1. Teste de componente que falha:** com `logo`, `MarcaFonte` mostra `img` com `alt=""`, do tamanho pedido, cantos arredondados, sem distorcer (`object-fit: cover`); se a imagem falha ao carregar, volta para a sigla.
- [x] **2.** Implemente, baixe as 19 logos com o script e confira cada uma num print de perto (nítida, centralizada, sem fundo transparente feio no tema escuro: logo com fundo transparente ganha fundo branco).
- [x] **3. Commit.**

### Task 5: feed real na interface

**Arquivos:**
- Criar: `apps/web/src/lib/noticias/dados.ts` e `dados.spec.ts`, `apps/web/src/lib/noticias/feed.svelte.ts` e `feed.svelte.spec.ts`, `apps/web/e2e/apoio.ts`, `apps/web/e2e/feed-real.e2e.ts`.
- Alterar: `Feed.svelte`, a faixa de aviso (texto do build normal), catálogos `pt-BR` e `en`, todos os `e2e/*.e2e.ts` (importam `test` de `./apoio.ts`).

**Interfaces:**
- `dados.ts`: `buscarFeed(espaco: IdEspaco, canal: string, buscar = fetch): Promise<Noticia[]>` (GET `${SUPABASE_URL}/rest/v1/rpc/feed?p_espaco=…&p_canal=…&p_limite=30`, cabeçalho `apikey`; mapeia para `Noticia` com `impacto: 0`, `temas: []`, `ativos: []`, `bafafa: false`, `fontes[].logo`); lança `ErroFeed` com `tipo: 'rede' | 'servidor'`.
- `feed.svelte.ts`: `criarFeed(buscar: typeof buscarFeed)` → `{ estado: 'carregando' | 'pronto' | 'erro'; noticias: Noticia[]; erro: 'rede' | 'servidor' | null; carregar(espaco, canal): Promise<void> }`. Ignora a resposta de um canal antigo se a pessoa já trocou de canal.
- `e2e/apoio.ts`: exporta `test` e `expect`; o `test` intercepta `**/rest/v1/rpc/feed**` e responde com as notícias de exemplo no formato da função `feed`, para os testes antigos seguirem iguais.
- Textos novos: `feed.carregando`, `feed.erroRede` ("Sem conexão com as notícias agora."), `feed.erroServidor` ("As notícias não carregaram."), `feed.tentarDeNovo` ("Tentar de novo"), `aviso.dadosReais` ("Notícias reais das fontes. Cotações, carteira e análises ainda são de exemplo.").

- [x] **1. Testes que falham:**
  - `dados.spec.ts`: monta a URL certa; mapeia 2 fontes com a primária primeiro; 500 → `ErroFeed('servidor')`; `fetch` rejeitado → `ErroFeed('rede')`.
  - `feed.svelte.spec.ts`: resposta atrasada do canal A não substitui o canal B.
  - `feed-real.e2e.ts`: com a rota respondendo 2 grupos, os cartões mostram título, trecho, a logo de cada fonte e "+1"; "Ler na fonte" abre a URL da fonte em nova aba; com a rota falhando, aparece `feed.erroRede` e "Tentar de novo" recarrega (ponto 4); enquanto carrega, há um esqueleto com `aria-busy="true"` sem pular o layout; título de 200 caracteres em 320 px não cria rolagem lateral (ponto 5).
- [x] **2.** Implemente: no build normal o `Feed` usa `criarFeed(buscarFeed)`; no protótipo (`__PROTOTIPO__`), as notícias de exemplo. A manchete continua sendo o primeiro item do canal geral. Recarrega ao voltar para a aba se passaram mais de 5 min.
- [x] **3.** Rode todas as verificações do `CLAUDE.md`.
- [x] **4. Commit.**

### Task 6: publicar, conferir e revisar

- [x] **1.** Publique o site (`scripts/publicacao.ts` e a conta conectada) e confira em produção: feed real em `mercado/manchetes`, `cripto/visao-geral` e `tecnologia/ia`, sem erro no console.
- [x] **2. Prints de perto** em 320, 390, 768, 1024, 1440 e 1600, nos temas claro, escuro e preto: capa, lista, logos, esqueleto e erro. Corrija o que não estiver perfeito.
- [x] **3. Revisão do Fable 5.2** (fim de etapa) e correção do que ele achar.
- [x] **4.** Atualize README (fontes e coleta), `supabase/README.md`, este plano e a spec (fontes conferidas). Commit e push.
