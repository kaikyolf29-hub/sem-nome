# Fase 1B, parte 1: personalização das notícias

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: superpowers:executing-plans (execução nativa; o dono autorizou seguir sozinho). Siga o `CLAUDE.md`. Passos com caixas (`- [ ]`).

**Objetivo:** cada pessoa escolhe as notícias que vê: temas da lista pronta, temas digitados e filtros. Tudo reunido no espaço "Para você", que vira a tela de início.

**Arquitetura:**
- **Servidor:** entrega um feed por tema, igual para todos, guardado no cache da Cloudflare pelo Worker `mirante` (rotas `/api/feed` e `/api/busca`).
- **Aparelho:** junta os temas da pessoa, tira os repetidos e aplica os filtros.
- **Escolhas da pessoa:** ficam no aparelho; com conta, também na tabela `preferencias` (RLS), juntando as duas sem perder nada.
- **Tema digitado:** é uma busca em texto nas notícias de todas as fontes conferidas, feita pela função `buscar_noticias()`.

**Tech:** Supabase (Postgres, extensão `unaccent`, busca em texto), Edge Function `coletar`, Cloudflare Worker com Cache API, SvelteKit 3 e Svelte 5, Vitest, Playwright, Bun test.

**Spec:** `docs/superpowers/specs/2026-11-17-personalizacao-noticias-design.md` (e a spec geral `2026-11-17-mirante-design.md`).

## Restrições globais
- Só planos grátis. O Worker conta nos 100 mil pedidos por dia; se falhar, o site pede direto ao Supabase.
- Cache de 60 s para feeds e de 120 s para buscas.
- Notícias de `espaco = 'geral'` ficam 30 dias; as dos outros espaços, 90.
- Tema digitado: de 2 a 40 caracteres, no máximo 5 por pessoa, comparado sem acento e sem diferença de maiúsculas.
- Padrão de quem pula a primeira tela: `mercado`, `brasil`, `mundo`, `tecnologia`.
- Primeira tela: no máximo 120 KB. O painel de temas carrega só quando é aberto.
- Regras do dono (`CLAUDE.md`): detalhes, sem cara de IA (nada de "recomendado para você", estrelinhas ou excesso de pílulas), `t()` em todo texto visível, teclado completo (Esc fecha, o foco volta), toque de 44 px.
- Decisão de execução: a lista de temas fica no código do app (`lib/preferencias/temas.ts`), e não numa tabela, porque os nomes já passam pelos catálogos `pt-BR` e `en`. O efeito é o mesmo da spec: cada tema aponta para uma ou mais origens (`espaco`, `canal`).

## Pontos de atenção
1. **A mesma matéria em dois feeds** (g1 geral e g1 Política): entra uma vez e ganha os dois canais. Teste na Task 2.
2. **`localStorage` bloqueado ou com conteúdo estragado:** o app usa o padrão e não quebra. Teste na Task 4.
3. **Entrar na conta tendo escolhas no aparelho:** junta as duas, sem passar de 5 temas digitados. Teste na Task 7.
4. **Tema digitado com acento, maiúsculas ou espaços** ("  Energia  SOLAR "): vira o mesmo termo que "energia solar". Testes nas Tasks 1 e 4.
5. **Worker fora do ar, ou o endereço `/api` devolvendo a página do site** (no `vite preview`): o app pede direto ao Supabase. Teste na Task 3.

---

### Task 1: banco: espaço `geral`, fontes novas, preferências e busca

**Arquivos:** criar `supabase/migrations/20261117000006_personalizacao.sql`, `supabase/testes/personalizacao.sql`.

**Produz:**
- `espaco` aceita `'geral'` em `fontes`, `grupos` e `noticias` (troca das restrições `check`).
- 22 fontes com `espaco = 'geral'` e o tema como canal, mais as linhas em `estado_fontes`:

  | id | tema | endereço |
  |---|---|---|
  | `agencia-brasil-geral` | brasil | `https://agenciabrasil.ebc.com.br/rss/geral/feed.xml` |
  | `g1` | brasil | `https://g1.globo.com/rss/g1/` |
  | `agencia-brasil-politica` | politica | `.../rss/politica/feed.xml` |
  | `g1-politica` | politica | `https://g1.globo.com/rss/g1/politica/` |
  | `g1-mundo` | mundo | `.../rss/g1/mundo/` |
  | `bbc-brasil` | mundo | `https://feeds.bbci.co.uk/portuguese/rss.xml` |
  | `dw-brasil` | mundo | `https://rss.dw.com/xml/rss-br-all` |
  | `ge` | esportes | `https://ge.globo.com/rss/ge/` |
  | `agencia-brasil-esportes` | esportes | `.../rss/esportes/feed.xml` |
  | `g1-ciencia` | ciencia | `.../rss/g1/ciencia/` |
  | `pesquisa-fapesp` | ciencia | `https://revistapesquisa.fapesp.br/feed/` |
  | `g1-saude` | saude | `.../rss/g1/saude/` |
  | `agencia-brasil-saude` | saude | `.../rss/saude/feed.xml` |
  | `g1-educacao` | educacao | `.../rss/g1/educacao/` |
  | `agencia-brasil-educacao` | educacao | `.../rss/educacao/feed.xml` |
  | `g1-pop-arte` | cultura | `.../rss/g1/pop-arte/` |
  | `agencia-brasil-cultura` | cultura | `.../rss/cultura/feed.xml` |
  | `g1-natureza` | meio-ambiente | `.../rss/g1/natureza/` |
  | `agencia-brasil-meio-ambiente` | meio-ambiente | `.../rss/meio-ambiente/feed.xml` |
  | `agencia-brasil-justica` | justica | `.../rss/justica/feed.xml` |
  | `g1-carros` | carros | `.../rss/g1/carros/` |
  | `g1-turismo` | viagem | `.../rss/g1/turismo-e-viagem/` |

  Logos: `/fontes/agencia-brasil.png`, `/fontes/g1.png` (todos os g1), `/fontes/bbc-brasil.png`, `/fontes/dw-brasil.png`, `/fontes/ge.png`, `/fontes/pesquisa-fapesp.png`. Todas em português, nenhuma primária.
- `public.sem_acento(text) returns text`, IMMUTABLE, que chama `extensions.unaccent('extensions.unaccent', lower($1))` (extensão `unaccent`).
- Coluna `noticias.busca tsvector`, gerada: `to_tsvector('simple', sem_acento(titulo || ' ' || trecho))`, com índice GIN.
- `public.montar_cartoes(p_ids bigint[]) returns jsonb`: os cartões na ordem dos ids, no mesmo formato e com as mesmas regras da migração 0005 (a fonte do título primeiro). `feed()` passa a usá-la, com o mesmo resultado de antes.
- `public.buscar_noticias(p_termo text, p_limite integer default 30) returns jsonb`, STABLE, `security invoker`: grupos com notícia dos últimos 30 dias que bate com `phraseto_tsquery('simple', sem_acento(p_termo))`, do mais novo para o mais antigo, em todos os espaços. Termo com menos de 2 ou mais de 40 caracteres, depois de tirar os espaços das pontas, devolve `[]`.
- `public.preferencias(id uuid pk → auth.users on delete cascade, temas text[], temas_proprios text[], fontes_ocultas text[], palavras_silenciadas text[], idioma text check in ('pt','pt-en'), atualizado_em timestamptz)`:
  - `check`: `cardinality(temas_proprios) <= 5`, `cardinality(palavras_silenciadas) <= 50`, `cardinality(fontes_ocultas) <= 100`;
  - RLS: `select`, `insert` e `update` só da própria linha (`(select auth.uid()) = id`); sem `delete` pelo cliente; nada para `anon`.
- Limpeza diária: notícias do espaço `geral` com mais de 30 dias saem (`cron.alter_job` no `limpar-noticias`).
- Gatilho `noticias_atualizam_grupo` passa a rodar também em `update of canais`.

- [x] **1. Teste que falha** (`supabase/testes/personalizacao.sql`, em transação com `rollback`):
  - pessoa A grava e lê as próprias preferências; não lê nem muda as de B; `anon` não lê;
  - 6 temas digitados são recusados;
  - `buscar_noticias('ENERGIA  solar')` acha "Boom da energia solar…" e não acha "energia eólica e solar" (a frase precisa vir junta);
  - acha "Petróleo" buscando "petroleo";
  - não acha notícia de 40 dias; termo de 1 caractere devolve `[]`;
  - `feed('geral','esportes')` traz uma notícia do `ge`;
  - `feed('mercado')` devolve o mesmo que antes (compare com um caso gravado no teste).
- [x] **2.** Aplique e rode até tudo dar `ok`; `get_advisors` de segurança vazio.
- [x] **3.** Baixe as logos novas com `scripts/baixar-logos.ts` (inclua os 5 sites novos em `SITES`) e confira cada uma num print de perto.
- [x] **4. Commit.**

### Task 2: coleta: espaço `geral` e canais somados

**Arquivos:** `supabase/functions/_compartilhado/{tipos,canais}.ts` e testes, `supabase/functions/coletar/{rodada,banco}.ts` e `rodada.test.ts`.

**Produz:**
- `Espaco` ganha `'geral'`. Em `classificar`, a fonte `geral` mantém só os canais base (o tema); título com palavra de cripto continua indo para `cripto`.
- `BancoColeta.acrescentarCanais(url: string, canais: string[]): Promise<void>`: URL que já existe **no mesmo espaço** ganha os canais novos (sem repetir). URL de outro espaço fica como está.
- `BancoColeta.urlsExistentes` passa a devolver `Map<string, Espaco>` (url → espaço).

- [x] **1. Testes que falham:**
  - fonte `geral` do tema `politica` → `{ espaco: 'geral', canais: ['politica'] }`;
  - "Bitcoin sobe" no `g1` → `cripto`;
  - rodada: URL já gravada no espaço `geral` com `['brasil']`, vinda agora do `g1-politica` → `acrescentarCanais(url, ['politica'])` e nenhum `inserir`; URL gravada no `mercado` → nada muda.
- [x] **2.** Implemente, rode `bun run test:coleta` e publique a função (`deploy_edge_function`, todos os arquivos).
- [x] **3.** Confira em produção: as 22 fontes novas coletando e `feed('geral','politica')` com itens.
- [x] **4. Commit.**

### Task 3: Worker com cache (`/api/feed`, `/api/busca`)

**Arquivos:**
- criar `apps/web/worker/borda.ts` (lógica pura) e `borda.spec.ts`, e `apps/web/worker/index.ts` (entrada do Worker);
- alterar `apps/web/wrangler.jsonc` (`main`, `assets.run_worker_first: ["/api/*"]`), `apps/web/scripts/publicacao.ts` (gera `build-worker/mirante.js` com `bun build`), `apps/web/src/lib/noticias/dados.ts`, `vite.config.ts` (projeto `server` do Vitest inclui `worker/**/*.spec.ts`).

**Produz:**
- `responder(pedido: Request, dep: { buscar: typeof fetch; cache: Cache; esperar: (p: Promise<unknown>) => void }): Promise<Response>`.
  - Valida `espaco` (`mercado`, `cripto`, `tecnologia`, `geral`), `canal` (`^[a-z0-9-]{0,40}$`), `limite` (1 a 60) e `q` (2 a 40 caracteres); parâmetro inválido devolve 400.
  - A chave do cache é a URL com os parâmetros em ordem fixa e o termo normalizado (minúsculas, sem acento, espaços únicos).
  - Se não está no cache, pede `/rest/v1/rpc/feed` ou `/rest/v1/rpc/buscar_noticias` ao Supabase com `apikey`.
  - Resposta 200 vai para o cache com `Cache-Control: public, max-age=60` (busca: 120). Erro do Supabase devolve 502, sem guardar no cache.
- No `dados.ts`: `buscarFeed` e o novo `buscarNoticias(termo, buscar = fetch): Promise<Noticia[]>` pedem `/api/...` primeiro. Se a resposta não for JSON com uma lista, ou se a rede falhar, pedem direto ao Supabase (o caminho de hoje). Os cartões passam a trazer `idioma`.

- [x] **1. Testes que falham** (`borda.spec.ts`, com `fetch` e `cache` falsos): `/api/feed?espaco=geral&canal=esportes` pede ao Supabase uma vez e, no segundo pedido, sai do cache; `espaco=x` → 400; busca "  Energia SOLAR" e "energia solar" usam a mesma chave; Supabase 500 → 502 e nada no cache. No `dados.spec.ts`: `/api` devolvendo `text/html` → cai no Supabase (ponto 5).
- [x] **2.** Implemente e rode `bun run test`.
- [x] **3. Commit.**

### Task 4: preferências no aparelho e catálogo de temas

**Arquivos:** criar `apps/web/src/lib/preferencias/{temas,preferencias,filtros}.ts` e testes `*.spec.ts`; catálogos `pt-BR` e `en` (`temas.*`).

**Produz:**
- `TEMAS: readonly Tema[]`, com `Tema { id: string; rotulo: ChaveMensagem; icone: string; origens: { espaco: 'mercado' | 'cripto' | 'tecnologia' | 'geral'; canal: string | null }[] }`. São os 15 temas da spec, nesta ordem:
  - `mercado` → `[{mercado, manchetes}]`;
  - `cripto` → `[{cripto, null}]`;
  - `tecnologia` → `[{tecnologia, null}]`;
  - `brasil`, `politica`, `esportes`, `ciencia`, `saude`, `educacao`, `cultura`, `meio-ambiente`, `justica`, `carros`, `viagem` → `[{geral, <id>}]`;
  - `mundo` → `[{geral, mundo}, {mercado, mundo}]`.
  - Ícones lucide: newspaper, bitcoin, cpu, map, landmark, globe, trophy, flask-conical, heart-pulse, graduation-cap, clapperboard, leaf, scale, car, plane.
- `interface Preferencias { temas: string[]; temasProprios: string[]; fontesOcultas: string[]; palavrasSilenciadas: string[]; idioma: 'pt' | 'pt-en'; escolheu: boolean }` e `PADRAO` (`escolheu: false`, idioma `pt-en`).
- `normalizarTermo(texto: string): string | null`: minúsculas, sem acento, espaços únicos; `null` fora de 2 a 40 caracteres.
- `lerLocal(): Preferencias` e `gravarLocal(p: Preferencias): void`, na chave `mirante:preferencias`. Conteúdo estragado, campos desconhecidos ou `localStorage` bloqueado viram o `PADRAO`, sem erro.
- `adicionarTemaProprio(p, texto): Preferencias | 'invalido' | 'limite' | 'repetido'`.
- `aplicarFiltros(noticias: Noticia[], p: Preferencias): Noticia[]`:
  - tira as fontes escondidas de cada cartão e descarta o cartão que ficar sem fonte;
  - com idioma `pt`, descarta cartões em inglês;
  - descarta cartões com palavra silenciada no título ou no trecho (palavra inteira, sem acento).
- `juntarFeeds(listas: Noticia[][]): Noticia[]`: sem cartão repetido (pelo `id`), do mais novo para o mais antigo, e a mesma fonte não aparece mais de duas vezes seguidas.

- [x] **1. Testes que falham:**
  - `normalizarTermo('  Energia  SOLAR ')` → `'energia solar'`; `'a'` → `null` (ponto 4);
  - `lerLocal` com `'{x'` ou com o armazenamento lançando erro → `PADRAO` (ponto 2);
  - o 6º tema digitado → `'limite'`; "energia solar" duas vezes → `'repetido'`;
  - `aplicarFiltros`: fonte escondida, idioma `pt`, "bolsa família" silenciada (não pode esconder "bolsa de valores");
  - `juntarFeeds`: tira o repetido e intercala fontes.
- [x] **2.** Implemente e rode os testes.
- [x] **3. Commit.**

### Task 5: espaço "Para você"

**Arquivos:**
- alterar `apps/web/src/lib/navegacao/espacos.ts` (`IdEspaco` ganha `'para-voce'`, `DESTINO_PADRAO` vira `{ espaco: 'para-voce', canal: 'tudo' }`, `Canal.nome?: string` para tema digitado), `Trilho.svelte` e `BarraInferior.svelte` ("Início" leva a `para-voce`), `Canais.svelte` ("+ Adicionar tema" no fim, só em `para-voce`), `casca/icones.ts`, `routes/(app)/[espaco]/[[canal]]/+page.svelte`;
- criar `apps/web/src/lib/preferencias/estado.svelte.ts` (estado único das preferências) e `apps/web/src/lib/feed/FeedParaVoce.svelte`.

**Produz:**
- `espacoParaVoce(p: Preferencias): Espaco`: canais `tudo`, um por tema escolhido (na ordem de `TEMAS`) e um por tema digitado (id `busca-<termo com hífens>`, `nome` = o termo).
- `localizar()` aceita `para-voce` com esses canais. Um canal que a pessoa tirou leva para `tudo`.
- `FeedParaVoce`: `tudo` junta as origens de todos os temas mais as buscas; um tema junta as suas origens; um tema digitado usa `buscarNoticias`. Depois aplica `aplicarFiltros` e mostra no mesmo desenho do `Feed` (com manchete em `tudo`). Tema digitado sem resultado mostra `paraVoce.semResultado` ("Ainda não há notícias sobre “{termo}” nas nossas fontes.").
- No protótipo (`__PROTOTIPO__`), "Para você" usa as notícias de exemplo, sem rede.
- O `Feed` de Mercado, Cripto e Tecnologia também passa por `aplicarFiltros`: os filtros valem no app inteiro.

- [x] **1. Testes que falham (e2e, com as rotas interceptadas):**
  - `/` leva a `/para-voce/tudo`, e "Início" no celular leva a `/para-voce/tudo`;
  - com os temas padrão, o trilho mostra "Para você" primeiro e os canais `tudo`, Mercado, Brasil, Mundo, Tecnologia e IA e "+ Adicionar tema";
  - `tudo` pede `geral/brasil`, `geral/mundo`, `mercado/mundo`, `mercado/manchetes` e `tecnologia`, e não repete um cartão que vem de duas origens;
  - um tema digitado sem resultado mostra a frase de `semResultado`;
  - com uma fonte escondida, ela some também de `/mercado/manchetes`;
  - a 320 px, nada passa da largura.
- [x] **2.** Implemente e rode as verificações do `CLAUDE.md`.
- [x] **3. Commit.**

### Task 6: painel "Escolher temas" e filtros

**Arquivos:** criar `apps/web/src/lib/preferencias/PainelTemas.svelte` (carregado só quando abre) e `PainelTemas.svelte.spec.ts`; alterar o painel de ajustes da engrenagem (entrada "Notícias e temas") e os catálogos.

**Produz:**
- Diálogo com `role="dialog"`: Esc fecha e o foco volta a quem abriu. Tem três partes:
  1. **Temas:** lista com ícone, nome, uma linha com as fontes e caixa de seleção. É linha de lista, não pílula.
  2. **Criar meu tema:** campo e botão "Adicionar"; cada tema digitado vira uma linha com botão "Tirar"; as mensagens `limite`, `invalido` e `repetido` aparecem em texto (`role="status"`).
  3. **Filtros:** idioma (dois botões de opção), palavras silenciadas (campo e lista) e fontes escondidas (lista de `/rest/v1/fontes?select=id,nome,logo,espaco`, carregada quando o painel abre).
- **Primeira visita** (`escolheu: false`): abre sozinho com o título "O que você quer ver?", com os temas padrão marcados e os botões "Pular" e "Pronto". Os dois gravam `escolheu: true`.

- [x] **1. Testes que falham:**
  - componente: marcar Esportes e clicar em "Pronto" grava `temas` com `esportes`;
  - o 6º tema digitado mostra o aviso de limite;
  - Esc fecha e o foco volta ao botão que abriu;
  - e2e: primeira visita abre o painel, "Pular" fecha e não abre de novo depois de recarregar a página;
  - e2e: depois de adicionar "Corinthians", aparece o canal "Corinthians" no "Para você".
- [x] **2.** Implemente; confira o peso (`e2e/peso.e2e.ts` sem o painel na primeira tela).
- [x] **3. Commit.**

### Task 7: preferências na conta

**Arquivos:** alterar `apps/web/src/lib/conta/sessao.svelte.ts` (`ClienteAuth.token(): Promise<string | null>`) e `apps/web/src/lib/supabase/cliente.ts`; criar `apps/web/src/lib/preferencias/conta.ts` e `conta.spec.ts`; ligar no `estado.svelte.ts`.

**Produz:**
- `carregarDaConta(token, buscar = fetch): Promise<Preferencias | null>` e `salvarNaConta(token, id, p, buscar = fetch): Promise<void>` (upsert em `/rest/v1/preferencias`).
- `juntar(local: Preferencias, conta: Preferencias | null): Preferencias`: une temas, fontes e palavras; os temas digitados se unem até 5 (ficam os da conta primeiro); o idioma é o da conta; `escolheu` vira `true` se algum dos dois for `true`.
- Ao entrar: carrega da conta, junta, grava nos dois lugares. A cada mudança com a pessoa logada, salva na conta 1 s depois da última mudança.

- [x] **1. Testes que falham:** `juntar` sem passar de 5 temas digitados (ponto 3); `salvarNaConta` manda `Authorization: Bearer <token>` e `Prefer: resolution=merge-duplicates`; falha de rede ao salvar não perde o que está no aparelho.
- [x] **2.** Implemente e rode os testes.
- [x] **3. Commit.**

### Task 8: publicar, conferir e revisar
- [x] **1.** Publique a migração, a função, o Worker (`main_module` `mirante.js`, assets com `run_worker_first: ["/api/*"]`) e o site. Confira em produção: `/api/feed` responde com `cf-cache-status: HIT` no segundo pedido.
- [x] **2. Prints de perto** em 320, 390, 768, 1024, 1440 e 1600, nos temas claro, escuro e preto: "Para você", o painel de temas, a primeira visita, um tema digitado com e sem resultado, e os filtros funcionando.
- [x] **3. Revisão independente** (o Fable 5.2 pede créditos pagos; sem aprovação do dono, use o modelo padrão) e correção do que for achado.
- [x] **4.** Atualize o README, o `supabase/README.md`, este plano e a spec; commit e push.

## Como ficou (21/11/2026)

Tudo publicado: migrações 0006 a 0009, função `coletar` (versão 7), Worker com `/api/feed` e `/api/busca` e o site. Em produção, o segundo pedido a `/api/feed` volta com `cf-cache-status: HIT` (1,2 s no primeiro, 0,2 s nos seguintes). As 41 fontes coletam sem erro e o aviso de segurança do Supabase veio vazio.

Verificação final: lint e tipos sem erro, 252 testes de unidade e componentes, 64 da coleta, 18 checagens SQL (variedade e personalização), build, orçamento de 137,4 KB de 160 KB e 178 testes no navegador.

**Decisões tomadas no caminho**
- **Coleta:** só mexe no banco quando uma notícia já gravada ganha um canal novo. Antes, consultava o banco para cada uma, a cada rodada.
- **Canais das fontes gerais:** ficam só com o canal do tema. Não ganham `ia`, `chips` nem `big-techs`, que são do espaço Tecnologia.
- **Ruído:** fora da coleta a previsão do tempo automática do g1 (50 por dia), os palpites de aposta do ge e as ofertas "em promoção na Amazon" do Olhar Digital. Também saem a legenda e o crédito da foto no começo do resumo do g1 e do ge, e os avisos "Tem alguma sugestão de reportagem?" e "Adicione o ge…". Os dados já gravados foram limpos.
- **Variedade por marca:** a marca é a logo. As seções do g1 e as da Agência Brasil contam como uma só, tanto no `feed()` (migração 0008) quanto no `# tudo`, que não mostra a mesma marca duas vezes seguidas.
- **Worker:** o `fetch` é chamado solto. Nos Workers, chamar `fetch` como método de outro objeto quebra ("Illegal invocation"), e isso não aparece nos testes locais; agora há um teste que imita esse comportamento. O 502 informa o status da origem.
- **Sincronia com a conta:**
  - o código só é baixado depois que a pessoa entra;
  - aparelho que nunca escolheu não mistura os temas padrão na conta;
  - se a leitura da conta falhar, nada é gravado por cima: a próxima mudança tenta de novo;
  - a renovação do token não junta outra vez;
  - `atualizado_em` é gravado a cada mudança.
- **Primeira visita:** só abre sozinha no "Para você"; Esc e clicar fora contam como "Pular"; as escolhas só valem com "Pronto".

**Revisão final independente (Opus): nada crítico. Corrigido:**
- "Pronto" na primeira visita não apaga mais o que a conta trouxe com a tela aberta. A tela fecha sozinha quando a conta chega.
- "Pular" deixou de contar como escolha: só marca que a tela foi vista (guardado no aparelho). Mexer em tema no painel conta como escolha. Na junção com a conta, os temas vêm do lado que escolheu e os filtros sempre se somam.
- Ao sair da conta, o aparelho volta ao padrão: a próxima pessoa não herda temas, fontes escondidas nem palavras silenciadas.
- Fonte escondida que é a principal do cartão tira o cartão, para não aparecer a logo de uma fonte com o título e o link de outra.
- A junção respeita os limites do banco (50 palavras, 100 fontes), e cada item tem até 60 letras (migração 0009).
- O "Para você" só pede de novo quando o canal ou os temas mudam; antes, qualquer filtro refazia os pedidos.
- Se o arquivo do painel não baixar, ele fecha e o botão volta a responder. O foco vai para o título quando a primeira visita fecha.
- Tema com notícias escondidas pelos filtros diz isso e oferece "Mudar filtros", em vez de "Ainda não há notícias".

**Ficou como está, de propósito:**
- **Contador próprio no Worker:** o plano grátis dá 100 mil pedidos por dia, e só `/api/*` conta. Se acabar, o site cai sozinho no Supabase, e um contador gastaria escritas do KV (só mil por dia).
- **`canal` no Worker:** qualquer nome no formato certo é aceito. Furar o cache só leva ao Supabase, que a chave publicável já alcança.
