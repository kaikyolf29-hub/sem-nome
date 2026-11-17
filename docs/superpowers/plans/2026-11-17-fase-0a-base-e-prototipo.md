# Fase 0A: base do projeto e protótipo visual (plano de implementação)

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa por tarefa. Os passos usam caixas (`- [ ]`) para acompanhar.

**Objetivo:** criar o repositório do Mirante com a base técnica (SvelteKit 3, testes, CI) e um protótipo clicável da cara do app, para o dono aprovar:
- casca estilo Discord;
- feed de exemplo, painel de contexto, carteira com rosca e paleta Ctrl+K;
- três temas, mais a versão Matsu e a barra do Windows;
- três opções de logo.

**Arquitetura:** um app SvelteKit 3 (Svelte 5, runes) em `apps/web`, sem renderização no servidor (SPA com `index.html` de fallback), que depois será o mesmo para site, PWA e Tauri. Tokens de design numa fonte única em TypeScript, que gera um CSS conferido por teste. O protótipo sai como **um arquivo HTML único** (roteador por hash + bundle inline) para publicar como página privada. Nesta fase não há servidor, conta nem rede: os dados são de exemplo.

**Tecnologias:**
- Bun 1.4.4 (workspaces), SvelteKit 3.2, Svelte 5.57, Vite 8, TypeScript 6;
- Vitest 4 (projetos `server` em Node e `client` no navegador com `vitest-browser-svelte`), Playwright 1.6x;
- `@lucide/svelte` (ícones);
- `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono` e `@fontsource-variable/newsreader` (fontes locais);
- `@axe-core/playwright` (acessibilidade).

**Spec:** `docs/superpowers/specs/2026-11-17-mirante-design.md` (seções 3, 4, 10, 15 e 16, fase 0). A parte de Supabase, Cloudflare e login Google da fase 0 fica no plano **Fase 0B**, que precisa das contas do dono.

## Restrições globais

- **Ferramentas:** Bun `1.4.4` e Node `>=22.17`. SvelteKit 3: a configuração fica no `sveltekit({...})` do `vite.config.ts` (não existe `svelte.config.js`).
- **Imports:** pelos subpaths `#lib/...`, **com extensão explícita** (`#lib/design/tema.ts`). Use `$app/state` (não `$app/stores`) e `resolve()` de `$app/paths` para links.
- **Textos:** todo texto visível passa por `t()` (`#lib/i18n/index.ts`). O catálogo fonte é `pt-BR`, com `en` de mesma forma. Nenhum texto em português fixo em `.svelte` (há teste).
- **Cores:** só por variáveis CSS dos tokens. O vermelho da marca (`--marca`) só aparece na logo e em `/marca`. Botões e seleção usam `--destaque`, que é neutro.
- **Alta e baixa:** sempre com sinal (`+`/`−`, o menos é U+2212) **e** seta (`▲`/`▼`). Nunca só a cor.
- **Rede:** nenhuma chamada de rede em tempo de execução. Fontes locais, sem CDN, sem analytics, sem imagem de terceiros.
- **Exemplos:** dados de exemplo sempre identificados. Faixa fixa "Protótipo · notícias e números de exemplo", fontes com nomes fictícios e links que não saem do app.
- **Acessibilidade:**
  - contraste AA, uso completo por teclado e foco visível;
  - áreas de toque ≥ 44 px no celular;
  - `prefers-reduced-motion` respeitado.
- **Movimento:** durações de 140, 200 e 250 ms, com curva `cubic-bezier(0.22, 1, 0.36, 1)`. Nada anima ao rolar.
- **Matsu:** valores do *GUIA: versão Matsu* de 14/11/2026 (copiados na Tarefa 10).
- **Licença:** fechada, "Todos os direitos reservados".
- **Commits:** terminam com as linhas de atribuição da sessão.
- **Navegador nos testes:** quando `CHROMIUM_PATH` estiver definida, Vitest e Playwright usam esse executável. No container de desenvolvimento ele é `/opt/pw-browsers/chromium`; no CI a variável fica vazia e roda `playwright install chromium`.

## Pontos de atenção na revisão

1. **Tela estreita (320 px) com título longo, muitas fontes ou ticker longo:** sem rolagem horizontal. O título corta em 3 linhas e o resumo em 2. *Teste na Tarefa 7.*
2. **Navegador sem `localStorage`** (aba anônima ou bloqueio): o app abre normalmente no tema do sistema e não dá erro. *Teste na Tarefa 3.*
3. **Sistema troca de claro para escuro com o app aberto** e a preferência é "sistema": o app troca na hora. *Teste na Tarefa 3.*
4. **Endereço antigo ou errado** (`/espaco-que-nao-existe`, canal inválido): vai para `/mercado/manchetes`, nunca tela branca. *Teste na Tarefa 5.*
5. **Uso só por teclado:**
   - Esc fecha a gaveta ou a paleta e devolve o foco a quem abriu;
   - Ctrl+K com o foco num campo de texto abre a paleta, sem perder o que foi digitado.
   *Testes nas Tarefas 6 e 8.*

---

### Task 1: base do repositório

**Arquivos:**
- Criar:
  - `package.json` (raiz, workspaces `["apps/*"]`, scripts que repassam para `apps/web`) e `bun.lock`;
  - `.gitignore`, `.editorconfig`;
  - `LICENSE`, `README.md`;
  - `.github/workflows/ci.yml`.
- Criar `apps/web/` a partir de `sv create` (template `minimal`, `ts`, add-ons `prettier eslint vitest playwright(demo:no) sveltekit-adapter(adapter:static)`), sem os exemplos do `sv` (`src/lib/vitest-examples/`).
- Modificar `apps/web/vite.config.ts`:
  - `adapter({ fallback: 'index.html', pages: process.env.PROTOTIPO ? 'build-prototipo' : 'build' })`;
  - `router: { type: process.env.PROTOTIPO ? 'hash' : 'pathname' }`;
  - `output: { bundleStrategy: process.env.PROTOTIPO ? 'inline' : 'split' }`;
  - `build.assetsInlineLimit`: `100_000_000` quando `PROTOTIPO`;
  - `playwright({ launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined } })`.
- **Não** criar `+layout.ts` com `ssr`: as opções de página são proibidas no roteador por hash. O fallback do adapter já gera a SPA.
- Criar:
  - `apps/web/playwright.config.ts`: `webServer` com `bun run build && bun run preview --port 4173`; projetos `desktop` (1440×900) e `celular` (`devices['Pixel 7']`); `executablePath` de `CHROMIUM_PATH`; `trace: 'off'`;
  - `apps/web/e2e/abre.e2e.ts`;
  - `apps/web/src/lib/nome.ts`.

**Interfaces:**
- Produz:
  - `export const NOME_APP = 'Mirante'` e `export const VERSAO_FASE = 'beta'` em `#lib/nome.ts`, o lugar único do nome (spec 2026-11-17);
  - scripts em `apps/web/package.json`: `dev`, `build`, `build:prototipo` (`PROTOTIPO=1 vite build`), `preview`, `check`, `lint`, `test` (`vitest --run`), `test:e2e` (`playwright test`).

- [ ] **Passo 1: criar a estrutura**
  1. Rode `bunx sv@1.4.0 create apps/web` com as opções acima.
  2. Apague os exemplos.
  3. Escreva `LICENSE`: "Copyright (c) 2026 kaikyolf29-hub. Todos os direitos reservados. Nenhuma permissão de uso, cópia, modificação ou distribuição é concedida sem autorização por escrito." (em pt-BR e en).
  4. Escreva o `README.md`, curto em pt-BR: o que é, "beta", `bun install` / `bun run dev`, e o link para o spec.
- [ ] **Passo 2: escrever o teste e2e que falha**
  `e2e/abre.e2e.ts`: `test('abre e mostra o nome', …)` com `page.goto('/')` e `expect(page).toHaveTitle(/Mirante/)`.
- [ ] **Passo 3:** rode `cd apps/web && CHROMIUM_PATH=/opt/pw-browsers/chromium bun run test:e2e`. Esperado: FALHA (título "Welcome…").
- [ ] **Passo 4:** `src/routes/+layout.svelte` coloca `<title>{NOME_APP}</title>` e `src/routes/+page.svelte` fica vazio (a Tarefa 5 redireciona).
- [ ] **Passo 5:** rode `bun run lint && bun run check && bun run test && bun run build && bun run build:prototipo && CHROMIUM_PATH=/opt/pw-browsers/chromium bun run test:e2e`.
  - Esperado: tudo passa.
  - `build-prototipo/` contém só `index.html` (mais `_app/version.json` e `robots.txt`).
- [ ] **Passo 6: CI**
  `ci.yml` em `push` e `pull_request`, `ubuntu-latest`, com os passos:
  1. `oven-sh/setup-bun@v2` com `bun-version: 1.4.4`;
  2. `bun install --frozen-lockfile`;
  3. `bunx playwright install --with-deps chromium` (em `apps/web`);
  4. `lint`, `check`, `test`, `build`, `build:prototipo`, `test:e2e`.
- [ ] **Passo 7: commit** com `git add -A && git commit -m "Base do Mirante: SvelteKit 3, testes, CI e licença fechada"`.

---

### Task 2: tokens de design

**Arquivos:**
- Criar:
  - `apps/web/src/lib/design/tokens.ts`;
  - `apps/web/src/lib/design/gerar-css.ts`;
  - `apps/web/scripts/gerar-tokens.ts`;
  - `apps/web/src/lib/design/tokens.gerado.css` (gerado, versionado);
  - `apps/web/src/lib/design/base.css` (reset, fontes, tipografia, foco, barra de rolagem fina, `prefers-reduced-motion`).
- Testes:
  - `apps/web/src/lib/design/tokens.spec.ts`;
  - `apps/web/src/lib/design/contraste.ts` com `contraste.spec.ts`.
- Modificar `src/routes/+layout.svelte`: importar as fontes (`@fontsource-variable/inter`, `/jetbrains-mono`, `/newsreader`), `tokens.gerado.css` e `base.css`.

**Interfaces:**
- Produz:
  - `type NomeTema = 'claro' | 'escuro' | 'preto' | 'matsu-claro' | 'matsu-escuro'`;
  - `interface PaletaTema { trilho; canais; conteudo; cartao; cartaoHover; borda; texto; textoFraco; destaque; textoSobreDestaque; alta; baixa; bafafa; foco }` (todos `string` CSS);
  - `export const temas: Record<NomeTema, PaletaTema>`;
  - `export const marca = { base: '#E62E2D', degradeDe: '#FF3B30', degradeAte: '#C81D11' }`;
  - `export const raios = { pequeno: 6, medio: 9, grande: 12, enorme: 16, pilula: 999 }` (px);
  - `export const espacamentos = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64]` (px; vira `--espaco-0` … `--espaco-10`);
  - `export const tipos = { legenda: 12, pequeno: 13, corpo: 14, medio: 16, titulo: 18, grande: 22, manchete: 30, destaque: 36 }`;
  - `export const movimento = { rapido: 140, medio: 200, lento: 250, curva: 'cubic-bezier(0.22, 1, 0.36, 1)', mola: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }`;
  - `gerarCss(): string`: um bloco `:root[data-tema="<nome>"]` por tema, com as variáveis `--trilho`, `--canais`, `--conteudo`, `--cartao`, `--cartao-hover`, `--borda`, `--texto`, `--texto-fraco`, `--destaque`, `--texto-sobre-destaque`, `--alta`, `--baixa`, `--bafafa`, `--foco`, mais as globais `--marca`, `--raio-*`, `--espaco-*`, `--tipo-*`, `--dur-*`, `--curva` e `--mola`;
  - `razaoContraste(frente: string, fundo: string): number` (WCAG 2.1, só `#rrggbb`).

Valores iniciais (cores sólidas `#rrggbb`; `borda` em rgba):

| tema | trilho | canais | conteudo | cartao | cartaoHover | borda | texto | textoFraco | destaque / sobre | alta | baixa | bafafa |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| escuro | #141416 | #1b1b1e | #212124 | #2a2a2e | #313136 | rgba(255,255,255,0.08) | #f2f2f3 | #a6a6ad | #f2f2f3 / #141416 | #4cc38a | #ff7a7a | #f5a524 |
| preto | #000000 | #0a0a0b | #000000 | #141416 | #1c1c1f | rgba(255,255,255,0.09) | #f2f2f3 | #a1a1a8 | #f2f2f3 / #000000 | #4cc38a | #ff7a7a | #f5a524 |
| claro | #e8e8eb | #f0f0f2 | #f7f7f8 | #ffffff | #f2f2f4 | rgba(0,0,0,0.09) | #1a1a1e | #5c5c66 | #1a1a1e / #ffffff | #0f6e44 | #b8232b | #9a4a06 |
| matsu-escuro | #202022 | #202022 | #1a1a1b | #262628 | #2c2c2e | rgba(255,255,255,0.07) | #ffffff | #a0a0a8 | #ffffff / #141416 | #4cc38a | #ff7a7a | #f5a524 |
| matsu-claro | #f3f3f5 | #f3f3f5 | #f8f8f9 | #fafafb | #f1f1f3 | rgba(26,26,30,0.08) | #1a1a1e | #6e6e78 | #1a1a1e / #ffffff | #0f6e44 | #b8232b | #9a4a06 |

`foco` é igual a `texto` em todos os temas (contorno neutro de 2 px, deslocado 2 px).

- [ ] **Passo 1: testes que falham** (`contraste.spec.ts` e `tokens.spec.ts`)
  - `razaoContraste('#000000', '#ffffff')` ≈ `21` (2 casas) e `razaoContraste('#777777', '#ffffff')` ≈ `4.48`.
  - `'texto, textoFraco, alta, baixa e bafafa têm contraste ≥ 4.5 sobre trilho, canais, conteudo e cartao em todos os temas'`.
  - `'neutros não são azulados'`: para trilho, canais, conteudo, cartao, cartaoHover e texto de todo tema, `max(R,G,B) − min(R,G,B) ≤ 6`.
  - `'vermelho da marca não aparece na paleta dos temas'`: nenhum valor de `temas` é igual a `marca.base`, `degradeDe` ou `degradeAte`.
  - `'CSS gerado está em dia'`: `readFileSync('src/lib/design/tokens.gerado.css', 'utf8') === gerarCss()`.
- [ ] **Passo 2:** rode `bun run test -- src/lib/design`. Esperado: FALHA (módulos inexistentes).
- [ ] **Passo 3:** implemente `tokens.ts`, `contraste.ts` e `gerar-css.ts`. `scripts/gerar-tokens.ts` grava `gerarCss()` no arquivo. Adicione o script `tokens` (`bun scripts/gerar-tokens.ts`) e rode-o.
- [ ] **Passo 4:** escreva `base.css`.
  - `body` em `var(--conteudo)` e `var(--texto)`, Inter variável 14 px, `font-variant-numeric: tabular-nums` em `.numero`.
  - `:focus-visible { outline: 2px solid var(--foco); outline-offset: 2px }`.
  - Barra de rolagem: pílula fina na cor do texto a 22% (36% no hover).
  - `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important } }`.
- [ ] **Passo 5:** rode `bun run test -- src/lib/design`. Esperado: PASSA.
- [ ] **Passo 6: commit** com a mensagem "Tokens de design: três temas, Matsu, contraste e neutros testados".

---

### Task 3: tema (preferência, sistema, sem piscar)

**Arquivos:**
- Criar:
  - `apps/web/src/lib/design/tema.ts`;
  - `apps/web/src/lib/design/tema.svelte.ts` (estado reativo);
  - `apps/web/src/lib/design/tema.spec.ts`;
  - `apps/web/e2e/tema.e2e.ts`.
- Modificar:
  - `apps/web/src/app.html`: script inline no `<head>` que aplica `data-tema` antes da primeira pintura;
  - `src/routes/+layout.svelte`.

**Interfaces:**
- Consome: `NomeTema` (Tarefa 2).
- Produz:
  - `type PreferenciaTema = 'sistema' | 'claro' | 'escuro' | 'preto'`;
  - `const CHAVE_TEMA = 'mirante:tema'`;
  - `resolverTema(pref: PreferenciaTema, sistemaEscuro: boolean, matsu: boolean): NomeTema`;
  - `lerPreferencia(armazenamento: Pick<Storage, 'getItem'> | null): PreferenciaTema`;
  - `salvarPreferencia(armazenamento: Pick<Storage, 'setItem'> | null, pref: PreferenciaTema): void` (falha calada);
  - em `tema.svelte.ts`: `export const tema: { preferencia: PreferenciaTema; matsu: boolean; readonly nome: NomeTema; definir(p: PreferenciaTema): void }`, que escuta `matchMedia('(prefers-color-scheme: dark)')` e escreve `document.documentElement.dataset.tema`.

- [ ] **Passo 1: testes que falham** (`tema.spec.ts`)
  - `resolverTema('sistema', true, false) === 'escuro'` e `resolverTema('sistema', false, false) === 'claro'`.
  - `resolverTema('preto', false, false) === 'preto'`.
  - No Matsu: `resolverTema('preto', false, true) === 'matsu-escuro'` (o Matsu só tem claro e escuro), `resolverTema('claro', true, true) === 'matsu-claro'` e `resolverTema('sistema', true, true) === 'matsu-escuro'`.
  - `lerPreferencia(null) === 'sistema'`.
  - `lerPreferencia({ getItem: () => { throw new Error('bloqueado') } }) === 'sistema'` (ponto de atenção 2).
  - `lerPreferencia({ getItem: () => 'roxo' }) === 'sistema'`.
  - `salvarPreferencia({ setItem: () => { throw new Error() } }, 'preto')` não lança.
- [ ] **Passo 2:** rode `bun run test -- tema`. Esperado: FALHA.
- [ ] **Passo 3:** implemente `tema.ts` e `tema.svelte.ts`. O script inline do `app.html` repete `resolverTema` sem Matsu, dentro de try/catch. Um comentário aponta para `tema.ts`, e o e2e garante que os dois concordam.
- [ ] **Passo 4: e2e** (`tema.e2e.ts`)
  - Com `localStorage['mirante:tema']='preto'` via `addInitScript`, o `html` tem `data-tema="preto"` e o `body` tem fundo `rgb(0, 0, 0)` já no `DOMContentLoaded`.
  - Com `page.emulateMedia({ colorScheme: 'dark' })` e preferência "sistema", fica `data-tema="escuro"`. Depois de `emulateMedia({ colorScheme: 'light' })`, vira `"claro"` **sem recarregar** (ponto de atenção 3).
- [ ] **Passo 5:** rode `bun run test -- tema && CHROMIUM_PATH=/opt/pw-browsers/chromium bun run test:e2e -- tema`. Esperado: PASSA.
- [ ] **Passo 6: commit** com a mensagem "Tema: claro, escuro, preto, sistema ao vivo e sem piscar".

---

### Task 4: idiomas e formatação de números

**Arquivos:**
- Criar:
  - `apps/web/src/lib/i18n/pt-BR.ts`, `en.ts`, `index.ts` e `i18n.spec.ts`;
  - `apps/web/src/lib/formato.ts` e `formato.spec.ts`;
  - `apps/web/src/lib/ui/Variacao.svelte` e `Variacao.svelte.spec.ts`;
  - `apps/web/src/sem-texto-fixo.spec.ts`.

**Interfaces:**
- Produz:
  - `type Idioma = 'pt-BR' | 'en'`;
  - `export const ptBR = {...} as const`, a fonte das chaves aninhadas por área (`app`, `espacos`, `canais`, `feed`, `painel`, `carteira`, `janela`, `prototipo`, `marca`, `tema`, `comum`);
  - `type Mensagens` (mesma forma, valores `string`): `en: Mensagens`, então a paridade de chaves é conferida pelo compilador;
  - `type ChaveMensagem` (união dos caminhos com ponto, ex. `'espacos.mercado'`);
  - `idiomaInicial(preferidos: readonly string[]): Idioma` (começa com `pt` → `'pt-BR'`, senão `'en'`);
  - `t(chave: ChaveMensagem, params?: Record<string, string | number>): string` (troca `{nome}` pelos parâmetros);
  - `i18n: { idioma: Idioma; definir(i: Idioma): void }` (rune);
  - `formatarMoeda(valor: number, moeda: 'BRL' | 'USD', idioma: Idioma): string`;
  - `formatarVariacao(pct: number, idioma: Idioma): { texto: string; direcao: 'alta' | 'baixa' | 'estavel' }`;
  - `tempoRelativo(data: Date, agora: Date, idioma: Idioma): string`;
  - componente `<Variacao pct={number} />`.

- [ ] **Passo 1: testes que falham** (`formato.spec.ts`; ` ` é o espaço que o `Intl` usa)
  - `formatarMoeda(1234.56,'BRL','pt-BR') === 'R$ 1.234,56'`, `formatarMoeda(1234.56,'USD','pt-BR') === 'US$ 1.234,56'` e `formatarMoeda(1234.56,'USD','en') === '$1,234.56'`.
  - `formatarVariacao(1.8,'pt-BR')` → `{ texto: '+1,80%', direcao: 'alta' }`; `formatarVariacao(-0.42,'pt-BR')` → `{ texto: '−0,42%', direcao: 'baixa' }` (U+2212); `formatarVariacao(0.004,'pt-BR')` → `{ texto: '0,00%', direcao: 'estavel' }`; `formatarVariacao(-1.5,'en').texto === '−1.50%'`.
  - Com `agora = new Date('2026-11-17T15:00:00-03:00')`:

    | entrada | pt-BR | en |
    |---|---|---|
    | 30 s antes | `'agora'` | `'now'` |
    | 5 min antes | `'há 5 min'` | `'5 min ago'` |
    | 2 h antes | `'há 2 h'` | — |
    | 30 h antes | `'ontem'` | `'yesterday'` |
    | `2026-11-12T10:00:00-03:00` | `'12 de nov.'` | `'Nov 12'` |
- [ ] **Passo 2: testes que falham** (`i18n.spec.ts`)
  - `idiomaInicial(['pt-PT']) === 'pt-BR'`, `idiomaInicial(['en-US','pt-BR']) === 'en'` e `idiomaInicial([]) === 'pt-BR'`.
  - `t('comum.ola', { nome: 'Ana' })` com `ptBR.comum.ola = 'Olá, {nome}'` dá `'Olá, Ana'`.
  - Nenhum valor vazio em `ptBR` nem em `en` (percorre recursivamente).
- [ ] **Passo 3: teste que falha** (`sem-texto-fixo.spec.ts`)
  Percorre `src/lib/**/*.svelte` e `src/routes/**/*.svelte`, remove o conteúdo de `<script>` e `<style>` e falha se sobrar algum caractere de `/[áéíóúâêôãõàç]/i`. A mensagem cita o arquivo e manda usar `t()`.
- [ ] **Passo 4: teste que falha** (`Variacao.svelte.spec.ts`)
  - `render(Variacao, { pct: 1.8 })` mostra `▲` e `+1,80%`, com `aria-label` `'alta de 1,80%'` e classe `alta`.
  - `pct: -0.42` mostra `▼` e `−0,42%`, com `aria-label` `'queda de 0,42%'`.
  - `pct: 0` mostra `•` e `0,00%`.
- [ ] **Passo 5:** rode `bun run test -- i18n formato Variacao sem-texto-fixo`. Esperado: FALHA.
- [ ] **Passo 6:** implemente com `Intl.NumberFormat` e `Intl.DateTimeFormat` (`{ day: 'numeric', month: 'short' }`). `formatarVariacao` troca o `-` do `Intl` por `−` e põe `+` nos positivos. É `estavel` quando `|pct| < 0.005`.
- [ ] **Passo 7:** rode os mesmos testes. Esperado: PASSA.
- [ ] **Passo 8: commit** com a mensagem "Idiomas pt-BR/en, formatação de moeda, variação e tempo".

---

### Task 5: espaços, canais e rotas

**Arquivos:**
- Criar:
  - `apps/web/src/lib/navegacao/espacos.ts` e `espacos.spec.ts`;
  - `apps/web/src/routes/[espaco]/[[canal]]/+page.svelte`;
  - `apps/web/e2e/navegacao.e2e.ts`.
- Modificar `apps/web/src/routes/+page.svelte` (redireciona).

**Interfaces:**
- Consome: `ChaveMensagem` (Tarefa 4).
- Produz:
  - `type IdEspaco = 'mercado' | 'carteira' | 'cripto' | 'daytrade' | 'tecnologia' | 'agenda' | 'salvos'`;
  - `interface Canal { id: string; rotulo: ChaveMensagem; grupo?: ChaveMensagem }`;
  - `interface Espaco { id: IdEspaco; rotulo: ChaveMensagem; icone: string /* nome lucide */; canais: readonly Canal[] }`;
  - `export const espacosApp: readonly Espaco[]`;
  - `localizar(espaco: string, canal?: string): { espaco: Espaco; canal: Canal } | null` (sem canal, devolve o primeiro);
  - `const DESTINO_PADRAO = { espaco: 'mercado', canal: 'manchetes' }`.

Canais (ids), na ordem:
- **mercado:** `manchetes`, `resumo-do-dia`, `brasil`, `eua`, `mundo`, `acoes`, `fiis`, `etfs`, `renda-fixa`, `cambio`, `commodities`, `macro`;
- **carteira:** `visao-geral`, `proventos`, `imposto`, `diario`;
- **cripto:** `visao-geral`, `stablecoins`, `nft`, `noticias`;
- **daytrade:** `grafico`, `treino`, `operacoes`;
- **tecnologia:** `ia`, `chips`, `big-techs`, `github-radar`, `artigos`;
- **agenda:** `semana`, `balancos`, `dividendos`, `economia`;
- **salvos:** `tudo`.

Ícones (lucide): `newspaper`, `pie-chart`, `bitcoin`, `candlestick-chart`, `cpu`, `calendar`, `bookmark`.

- [ ] **Passo 1: testes que falham** (`espacos.spec.ts`)
  - Os ids de espaço são únicos, e os de canal são únicos dentro de cada espaço.
  - Todo `rotulo` e `grupo` existe em `ptBR` (resolvendo o caminho com ponto).
  - `localizar('mercado')?.canal.id === 'manchetes'`.
  - `localizar('cripto','nft')?.canal.id === 'nft'`.
  - `localizar('xyz') === null` e `localizar('mercado','xyz') === null`.
- [ ] **Passo 2:** rode `bun run test -- espacos`. Esperado: FALHA.
- [ ] **Passo 3:** implemente `espacos.ts`. A página `[espaco]/[[canal]]` chama `localizar`; se der `null`, faz `goto(resolve('/[espaco]/[[canal]]', DESTINO_PADRAO), { replace: true })`. A raiz `/` faz o mesmo.
- [ ] **Passo 4: e2e** (`navegacao.e2e.ts`)
  - `/` termina em `/mercado/manchetes`.
  - `/espaco-que-nao-existe` e `/mercado/xyz` também terminam lá (ponto de atenção 4).
  - `/cripto/nft` mostra o título do canal `#nft`.
- [ ] **Passo 5:** rode os testes unitário e e2e. Esperado: PASSA.
- [ ] **Passo 6: commit** com a mensagem "Espaços e canais com rotas e redirecionamento seguro".

---

### Task 6: casca estilo Discord

**Arquivos:**
- Criar em `apps/web/src/lib/casca/`:
  - `Casca.svelte`, `Trilho.svelte`, `Canais.svelte`, `BarraInferior.svelte`, `Gaveta.svelte`;
  - `CartaoConta.svelte`, `MedidorIA.svelte`;
  - `casca.svelte.ts` (estado das gavetas e do painel);
  - testes `Trilho.svelte.spec.ts`, `Gaveta.svelte.spec.ts` e `MedidorIA.svelte.spec.ts`.
- Criar `apps/web/e2e/casca.e2e.ts`.
- Modificar `src/routes/+layout.svelte`: tudo dentro de `<Casca>`.

**Interfaces:**
- Consome: `espacosApp`, `localizar` (Tarefa 5), `t` (Tarefa 4), tokens (Tarefa 2).
- Produz:
  - `<Casca>{#snippet painel()}…{/snippet}{children}</Casca>`: grade trilho 72 px | canais 240 px | conteúdo | painel 340 px;
  - `casca: { gaveta: 'canais' | 'painel' | null; painelAberto: boolean; abrir(g): void; fechar(): void }`;
  - `<Gaveta lado="esquerda" | "direita" aberta={boolean} onfechar={() => void} rotulo={string}>`, com foco preso dentro, Esc fecha e o foco volta ao elemento que abriu;
  - `<MedidorIA usoPct={number} renovaEm={Date} />`: barra, texto `t('casca.usoIA', { pct, hora })` (exemplo: "Uso da IA: 40% · renova às 15:20") e `role="meter"` com `aria-valuenow`.

Comportamento por largura:

| Largura | Trilho | Canais | Painel | Barra inferior |
|---|---|---|---|---|
| ≥ 1280 px | sim | sim | aberto por padrão | não |
| 768 a 1279 px | sim | sim | sobreposto | não |
| < 768 px | não | gaveta à esquerda | gaveta à direita | sim |

- **Barra inferior:** Início (mercado), Carteira, Cripto, Alertas e Você. Ícones com rótulo, áreas de 44 px.
- **Trilho:**
  - logo no topo: `#lib/assets/favicon.svg`, que a Tarefa 11 troca pela opção A;
  - quadrados arredondados de 48 px, com pílula branca à esquerda (8 px no hover, 40 px quando ativo) e dica com o nome;
  - Ajustes no pé;
  - foco circula com ↑/↓ (tabindex rotativo) e Enter abre;
  - `<nav aria-label=t('casca.espacos')>` e `aria-current="page"`.
- **Canais:**
  - cabeçalho com o nome do espaço e grupos;
  - prefixo `#`;
  - item ativo com fundo da frente a 8% e um traço de 3 px à esquerda;
  - pé com `CartaoConta` (botão "Entrar com Google" desativado, com a dica "chega na fase 0B") e `MedidorIA` de exemplo (40%).

- [ ] **Passo 1: testes de componente que falham**
  - `Trilho.svelte.spec.ts`: renderiza 7 espaços mais Ajustes. Com foco no primeiro, `ArrowDown` move o foco para o segundo. O ativo tem `aria-current="page"`.
  - `Gaveta.svelte.spec.ts`: aberta, `Escape` chama `onfechar`. Tab no último elemento focável volta ao primeiro. Ao fechar, o foco volta ao botão que abriu.
  - `MedidorIA.svelte.spec.ts`: `usoPct=40` dá `aria-valuenow="40"` e o texto contém `40%`.
- [ ] **Passo 2:** rode `bun run test -- casca`. Esperado: FALHA.
- [ ] **Passo 3:** implemente. As gavetas deslizam com `transform` em `--dur-medio` e `--curva`, e fecham ao arrastar o dedo com pointer events (limite de 80 px).
- [ ] **Passo 4: e2e** (`casca.e2e.ts`)
  - No desktop, clicar em "Cripto" no trilho leva a URL para `/cripto/visao-geral` e a lista mostra `#stablecoins`.
  - No celular, o trilho fica invisível e a barra inferior visível. O botão de canais abre a gaveta, e Esc fecha e devolve o foco (ponto de atenção 5).
  - Com `reducedMotion: 'reduce'`, a duração de transição da gaveta é ≤ 1 ms.
- [ ] **Passo 5:** rode os testes de componente e e2e. Esperado: PASSA.
- [ ] **Passo 6: commit** com a mensagem "Casca estilo Discord: trilho, canais, gavetas e barra inferior".

---

### Task 7: feed do protótipo

**Arquivos:**
- Criar:
  - `apps/web/src/lib/feed/tipos.ts`;
  - em `apps/web/src/lib/feed/`: `Manchete.svelte`, `CartaoNoticia.svelte`, `SeloIA.svelte`, `SeloFonte.svelte`, `IndicadorImpacto.svelte`, `ChipCarteira.svelte`, `Feed.svelte`;
  - `apps/web/src/lib/prototipo/exemplos.ts` e `FaixaPrototipo.svelte`;
  - testes `CartaoNoticia.svelte.spec.ts` e `IndicadorImpacto.svelte.spec.ts`;
  - `apps/web/e2e/feed.e2e.ts`.
- Modificar a página `[espaco]/[[canal]]` para mostrar o `Feed` em mercado, cripto e tecnologia.

**Interfaces:**
- Consome: `t`, `tempoRelativo`, `Variacao` (Tarefa 4).
- Produz (forma que o banco da fase 1 vai seguir):
  ```ts
  interface FonteNoticia { nome: string; url: string; primaria: boolean }
  interface AtivoLigado { ticker: string; motivo: string }
  interface Noticia {
    id: string; titulo: string; url: string; fontes: FonteNoticia[];
    publicadoEm: string /* ISO */; trecho: string; resumoIA?: string;
    temas: string[]; impacto: number /* 0–100 */; bafafa: boolean;
    ativos: AtivoLigado[]; espaco: IdEspaco; canais: string[];
  }
  ```
- `exemplos.ts`: `export const noticiasExemplo: readonly Noticia[]` (≥ 18 itens, cobrindo mercado, cripto e tecnologia, com ≥ 2 bafafás, ≥ 4 com ativos e ≥ 1 com 4 fontes ou mais). Veículos fictícios: "Gazeta do Pregão", "Mercado Hoje", "Radar Tech", "Cripto Diário" e "Fonte oficial (exemplo)". `url: '#'`.
- `noticiasDoCanal(espaco: IdEspaco, canal: string): Noticia[]` (os `manchetes` de cada espaço mostram tudo do espaço, por impacto).
- `<IndicadorImpacto valor={number} />`: 1 a 5 barras (`ceil(valor/20)`, mínimo 1) e `aria-label` com as chaves `feed.impacto.baixo` (≤ 40), `feed.impacto.medio` (≤ 70) ou `feed.impacto.alto`.

Cartão:
- linha de fontes ("Gazeta do Pregão +3") com o selo de fonte primária;
- tempo relativo;
- título com corte em 3 linhas e trecho em 2;
- bloco de resumo com `SeloIA` ("✦ Gerado por IA");
- chips de tema;
- `IndicadorImpacto`;
- `ChipCarteira` ("Afeta sua carteira: PETR4 · motivo");
- ações "Ler na fonte" e "Salvar" (Salvar alterna `aria-pressed`);
- bafafá com marca `--bafafa` e rótulo `t('feed.bafafa')`.

Manchete: título em `--tipo-manchete`, com a família controlada pela variável `--fonte-manchete` (padrão `'Newsreader Variable', serif`; a Tarefa 10 troca no painel do protótipo).

- [ ] **Passo 1: testes que falham**
  - `IndicadorImpacto.svelte.spec.ts`: valor 85 dá 5 barras acesas e aria "Impacto alto"; 10 dá 1 barra e "Impacto baixo"; 55 dá 3 barras e "Impacto médio".
  - `CartaoNoticia.svelte.spec.ts`:
    - com uma notícia de exemplo que tem `resumoIA`, existe o texto "Gerado por IA";
    - com 4 fontes, mostra "+3";
    - clicar em Salvar alterna `aria-pressed` de `false` para `true`;
    - sem `resumoIA`, não há selo de IA.
- [ ] **Passo 2:** rode `bun run test -- feed`. Esperado: FALHA.
- [ ] **Passo 3:** implemente os componentes e os exemplos. A `FaixaPrototipo` fixa no topo do conteúdo usa `t('prototipo.faixa')`: "Protótipo · notícias e números de exemplo".
- [ ] **Passo 4: e2e** (`feed.e2e.ts`)
  - `/mercado/manchetes` mostra uma manchete e ≥ 6 cartões.
  - Numa janela de **320 px** com o item de título mais longo, `document.documentElement.scrollWidth <= clientWidth` (ponto de atenção 1).
- [ ] **Passo 5:** rode os testes. Esperado: PASSA.
- [ ] **Passo 6: commit** com a mensagem "Feed do protótipo: manchete, cartões, selos de IA e fonte, impacto".

---

### Task 8: painel de contexto e paleta Ctrl+K

**Arquivos:**
- Criar:
  - em `apps/web/src/lib/painel/`: `PainelContexto.svelte`, `Sparkline.svelte`, `ChatExemplo.svelte`;
  - `apps/web/src/lib/painel/sparkline.ts` com `sparkline.spec.ts`;
  - em `apps/web/src/lib/paleta/`: `PaletaComandos.svelte`, `busca.ts` e `busca.spec.ts`;
  - `apps/web/e2e/paleta.e2e.ts`.
- Modificar `Casca.svelte`, que monta a paleta e o atalho global.

**Interfaces:**
- Consome: `noticiasExemplo`, `espacosApp`, `Variacao`, `formatarMoeda`.
- Produz:
  - `caminhoSparkline(valores: readonly number[], largura: number, altura: number): string`: atributo `d` do SVG. Com menos de 2 valores dá `''`; com valores iguais, linha horizontal no meio;
  - `buscarComandos(consulta: string, itens: readonly ItemComando[]): ItemComando[]`, com `interface ItemComando { id: string; rotulo: string; tipo: 'espaco' | 'canal' | 'noticia'; destino: string }`. Ignora acentos e maiúsculas, prioriza o começo da palavra e limita a 8.

Painel de exemplo (PETR4):
- nome;
- preço (`formatarMoeda`) com `Variacao`;
- linha "Cotação de exemplo · atraso de 30 min · 15:20";
- `Sparkline` de 30 pontos;
- lista "Afeta sua carteira";
- `ChatExemplo`: uma pergunta e uma resposta estáticas, com citações `[1]` e `[2]` clicáveis que rolam até as fontes, `SeloIA` e o aviso fixo `t('painel.aviso')` ("Informativo. Não é recomendação de investimento.").

- [ ] **Passo 1: testes que falham**
  - `sparkline.spec.ts`:
    - `caminhoSparkline([], 100, 20) === ''`;
    - `caminhoSparkline([5,5,5], 100, 20) === 'M0,10 L50,10 L100,10'`;
    - `caminhoSparkline([0,10], 100, 20) === 'M0,20 L100,0'`.
  - `busca.spec.ts`:
    - `buscarComandos('cambio', itens)[0].id === 'canal:mercado/cambio'` (com o rótulo "câmbio");
    - `buscarComandos('', itens).length === 8`;
    - `buscarComandos('zzz', itens).length === 0`.
- [ ] **Passo 2:** rode `bun run test -- sparkline busca`. Esperado: FALHA.
- [ ] **Passo 3:** implemente.
  - A paleta abre com `Ctrl+K` ou `⌘K` (`keydown` em `window` com `preventDefault`), **inclusive com o foco num campo de texto**.
  - ↑/↓ navegam, Enter faz `goto(destino)` e Esc fecha e devolve o foco.
  - `role="dialog"` com `aria-modal`, campo com `role="combobox"` e lista com `role="listbox"`.
- [ ] **Passo 4: e2e** (`paleta.e2e.ts`)
  - Escrever "abc" num campo e apertar Ctrl+K abre a paleta, e o campo continua com "abc" (ponto de atenção 5).
  - Digitar "stable" e apertar Enter leva a `/cripto/stablecoins`.
  - Esc fecha e o foco volta ao campo.
- [ ] **Passo 5:** rode os testes. Esperado: PASSA.
- [ ] **Passo 6: commit** com a mensagem "Painel de contexto com chat de exemplo e paleta Ctrl+K".

---

### Task 9: carteira de exemplo e estados vazios

**Arquivos:**
- Criar:
  - em `apps/web/src/lib/carteira/`: `rosca.ts`, `rosca.spec.ts`, `Rosca.svelte`, `ResumoCarteira.svelte`;
  - `apps/web/src/lib/prototipo/carteira-exemplo.ts`;
  - `apps/web/src/lib/ui/EstadoVazio.svelte`.
- Modificar a página `[espaco]/[[canal]]`:
  - `carteira/visao-geral` mostra rosca, legenda e resumo;
  - os canais ainda sem conteúdo mostram `EstadoVazio` com `t('comum.emBreve', { fase })`.

**Interfaces:**
- Produz:
  - `interface Fatia { rotulo: string; valor: number }`;
  - `arcos(fatias: readonly Fatia[]): { rotulo: string; pct: number; inicio: number; fim: number }[]`, com ângulos em graus a partir de 0 no topo, no sentido horário. Fatias com valor ≤ 0 saem. Total zero dá `[]`;
  - `<Rosca fatias={Fatia[]} titulo={string} />`: SVG com `<path>` por fatia; anima o traço uma vez ao montar (sem animação com movimento reduzido); legenda com percentuais; `role="img"` com `aria-label` listando as fatias.

Cores das fatias: `PaletaTema` ganha `fatias: readonly string[]` (6 cores por tema: dois neutros e quatro tons de baixa saturação, contraste ≥ 3:1 sobre `cartao`). `gerarCss` passa a emitir `--fatia-1` … `--fatia-6`, e `tokens.gerado.css` é regenerado com `bun run tokens`. Os testes da Tarefa 2 ganham esta regra.

Carteira de exemplo: Ações BR 38%, FIIs 18%, EUA 22%, Renda fixa 14%, Cripto 6%, Caixa 2%. Resumo:
- patrimônio de exemplo em BRL;
- variação do dia (`Variacao`);
- alerta de concentração de exemplo (`t('carteira.concentracao', { ativo, pct })`, padrão > 20%).

- [ ] **Passo 1: testes que falham**
  - `rosca.spec.ts`:
    - `arcos([{rotulo:'a',valor:1},{rotulo:'b',valor:3}])` → `[{rotulo:'a',pct:25,inicio:0,fim:90},{rotulo:'b',pct:75,inicio:90,fim:360}]`;
    - `arcos([]) → []`;
    - `arcos([{rotulo:'a',valor:0}]) → []`;
    - a soma dos `pct` de 6 fatias arbitrárias é `100` (tolerância 1e-9).
  - Na Tarefa 2, teste `'fatias têm contraste ≥ 3 sobre cartao em todos os temas'`.
- [ ] **Passo 2:** rode `bun run test -- rosca tokens`. Esperado: FALHA.
- [ ] **Passo 3:** implemente.
- [ ] **Passo 4:** rode os testes. Esperado: PASSA. Abra `/carteira/visao-geral` no `bun run dev` e confira a animação única.
- [ ] **Passo 5: commit** com a mensagem "Carteira de exemplo com rosca animada e estados vazios".

---

### Task 10: barras de título (Matsu e Windows) e painel do protótipo

**Arquivos:**
- Criar:
  - em `apps/web/src/lib/janela/`: `BarraTitulo.svelte`, `BotoesMatsu.svelte`, `BotoesWindows.svelte`, `janela.svelte.ts`;
  - testes `BotoesMatsu.svelte.spec.ts` e `BotoesWindows.svelte.spec.ts`;
  - `apps/web/src/lib/prototipo/PainelPrototipo.svelte`.
- Modificar `Casca.svelte`: com `janela.modo !== 'navegador'`, mostra a `BarraTitulo` de 48 px no topo, com cantos de 10 px e borda de 1 px como janela simulada.

**Interfaces:**
- Consome: `tema` (Tarefa 3), `t`.
- Produz:
  - `type ModoJanela = 'navegador' | 'matsu' | 'windows'`;
  - `janela: { modo: ModoJanela; focada: boolean; maximizada: boolean }`. No protótipo, `focada` segue `window` focus/blur; no Tauri (fase 7) virá do processo principal;
  - `<BarraTitulo>`: altura 48 px; atributo `data-tauri-drag-region`; nome do app com o ícone pequeno ao lado dos botões; duplo clique alterna `maximizada`;
  - `<BotoesMatsu focada maximizada lado="esquerda" | "direita" tema="claro" | "escuro" onfechar onminimizar ontelacheia />`;
  - `<BotoesWindows focada maximizada onfechar onminimizar onmaximizar />`.
- Ao ligar `modo = 'matsu'`, o `tema` usa `matsu = true` (resolve para `matsu-claro` ou `matsu-escuro`).

Valores exatos do guia Matsu (14/11/2026):

| Item | Valor |
|---|---|
| Bolinhas | círculos de 14 px, cada um num botão de 18 × 18 px, 4 px entre botões, o primeiro a 14 px da borda; ordem fechar, minimizar, tela cheia |
| Cores | fechar `#ff5f57` (símbolo X `#4d0000`), minimizar `#febc2e` (traço `#995700`), tela cheia `#28c840` (dois triângulos cheios nos cantos, `#006500`) |
| Contorno | 1 px preto a 18% no escuro e 10% no claro |
| Símbolos | escondidos; com o mouse em **qualquer** bolinha aparecem nas três, escala 0,4 → 1 em 200 ms com `--mola` |
| Sem foco | as três em cinza, sem contorno: cor do texto a 20% no escuro e 16% no claro. Com o mouse em cima, as cores voltam |
| Ao apertar | `filter: brightness(0.82)`; trocas de cor em 140 ms |
| Dica | após 0,7 s: `janela.fechar` "Fechar", `janela.minimizar` "Minimizar", `janela.telaCheia` "Tela cheia" (maximizada: `janela.sairTelaCheia` "Sair da tela cheia") |

Windows 11:
- botões de 46 px de largura e altura da barra;
- ícones finos de 10 px;
- hover com a frente a 6%;
- fechar com hover `#C42B1C` e X branco;
- maximizada, mostra "restaurar" (dois quadradinhos);
- sem foco, ícones a 45% de opacidade.

Painel do protótipo (flutuante no canto inferior esquerdo, recolhível, todos os textos por `t`):
- **Tema:** Sistema, Claro, Escuro, Preto;
- **Ver como:** Navegador, Matsu OS, Windows;
- **Manchete:** Serifada, Inter;
- **Idioma:** pt-BR, en.

- [ ] **Passo 1: testes que falham**
  - `BotoesMatsu.svelte.spec.ts`:
    - cada botão mede 18×18 e o círculo 14×14 (`getBoundingClientRect`);
    - a distância entre a borda direita do 1º botão e a esquerda do 2º é 4;
    - sem hover, os símbolos têm opacidade computada `0`; após `hover()` num botão, os três símbolos chegam a `1` (aguardar 250 ms);
    - com `focada=false`, o fundo do fechar é cinza (não `rgb(255, 95, 87)`) e volta a `rgb(255, 95, 87)` no hover;
    - `aria-label` dos três é "Fechar", "Minimizar" e "Tela cheia"; com `maximizada`, o terceiro vira "Sair da tela cheia";
    - clicar no primeiro chama `onfechar`.
  - `BotoesWindows.svelte.spec.ts`:
    - cada botão tem 46 px de largura;
    - o hover do fechar dá fundo `rgb(196, 43, 28)`;
    - com `maximizada`, o rótulo do meio é "Restaurar".
- [ ] **Passo 2:** rode `bun run test -- Botoes`. Esperado: FALHA.
- [ ] **Passo 3:** implemente os componentes, o estado e o painel do protótipo. A variável `--fonte-manchete` alterna entre `'Newsreader Variable', serif` e `'Inter Variable', sans-serif`.
- [ ] **Passo 4:** rode os testes. Esperado: PASSA.
- [ ] **Passo 5: commit** com a mensagem "Barras de título Matsu e Windows e painel do protótipo".

---

### Task 11: logo (três opções) e página da marca

**Arquivos:**
- Criar:
  - em `apps/web/src/lib/marca/`: `logo-a.svg`, `logo-b.svg`, `logo-c.svg`, `logos.ts` e `logos.spec.ts`;
  - `apps/web/src/routes/marca/+page.svelte`.
- Modificar: `src/lib/assets/favicon.svg` vira uma cópia da opção A (provisória), e assim o `Trilho` e o favicon passam a mostrar a opção A.

**Interfaces:**
- Produz: `export const logos: readonly { id: 'a' | 'b' | 'c'; nome: ChaveMensagem; svg: string /* ?raw */ }[]`.

Formato (guia Matsu, seção 8, e spec 10.1), igual nas três:
1. `viewBox="0 0 256 256"`;
2. `<rect x="16" y="16" width="224" height="224" rx="58" fill="url(#degrade)"/>`, com `linearGradient id="degrade"` do canto superior esquerdo ao inferior direito, de `#FF3B30` a `#C81D11`;
3. linha clara de 3 px na borda: `<rect x="17.5" y="17.5" width="221" height="221" rx="56.5" fill="none" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="3"/>`;
4. o símbolo só em `#FFFFFF`, traço grosso (≥ 16 px em 256), pontas e cantos arredondados, cabendo num círculo de 150 px no centro.

Os símbolos:
- **A "Gráfico-M":** um M de traço contínuo cuja última perna sobe e termina numa bolinha, como uma linha de gráfico subindo.
- **B "Horizonte":** linha do horizonte, meio sol nascendo e dois arcos de sinal acima (ver de cima, radar).
- **C "Binóculo":** binóculo de frente, dois círculos unidos por uma ponte, amigável e geométrico como o emblema do Discord, mas com desenho próprio.

Página `/marca`:
- cada opção em 256, 64, 32 e 16 px;
- sobre fundo claro, escuro e preto;
- dentro de uma doca de exemplo e de uma barra de tarefas de exemplo;
- nome e explicação curta (por `t`).

- [ ] **Passo 1: teste que falha** (`logos.spec.ts`, Node, lendo os arquivos)
  Para cada SVG:
  - contém `viewBox="0 0 256 256"`;
  - contém o `rect` 224/`rx="58"`;
  - contém `#FF3B30` e `#C81D11`;
  - contém `stroke-width="3"`;
  - as cores fora do degradê são só `#FFFFFF`. Uma regex `/#[0-9a-f]{6}/gi` coleta todas, e o conjunto menos `{#FF3B30, #C81D11, #FFFFFF}` fica vazio, ignorando maiúsculas.
- [ ] **Passo 2:** rode `bun run test -- logos`. Esperado: FALHA.
- [ ] **Passo 3:** desenhe os três SVGs à mão (caminhos limpos e simétricos, legíveis a 16 px) e implemente `logos.ts` e a página.
- [ ] **Passo 4:** rode `bun run test -- logos`. Esperado: PASSA. Abra `/marca` e confira a legibilidade a 16 px nos três fundos.
- [ ] **Passo 5: commit** com a mensagem "Logo do Mirante: três opções no formato Matsu e página da marca".

---

### Task 12: protótipo em arquivo único, acessibilidade, orçamento e publicação

**Arquivos:**
- Criar:
  - `apps/web/e2e/acessibilidade.e2e.ts`;
  - `apps/web/e2e/prototipo.e2e.ts`;
  - `apps/web/scripts/orcamento.ts`;
  - `apps/web/scripts/capturas.ts`;
  - `docs/capturas/` (PNGs gerados).
- Modificar:
  - `apps/web/package.json`: scripts `orcamento` e `capturas`;
  - `.github/workflows/ci.yml`: adiciona `orcamento`.

**Interfaces:**
- Consome: todo o app.
- Produz:
  - `apps/web/build-prototipo/index.html`, autocontido;
  - capturas `docs/capturas/{desktop,celular}-{claro,escuro,preto}.png`, `matsu-{claro,escuro}.png`, `windows-escuro.png` e `marca.png`.

- [ ] **Passo 1: e2e que falham**
  - `acessibilidade.e2e.ts`: em `/mercado/manchetes`, `/carteira/visao-geral` e `/marca`, nos temas claro e escuro, `new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze()` não tem violações `serious` nem `critical`.
  - `prototipo.e2e.ts`:
    - abre `file://…/build-prototipo/index.html#/mercado/manchetes` sem servidor;
    - a manchete aparece;
    - nenhuma requisição de rede sai para fora de `file://` (`page.on('request')` registra e a lista fica vazia);
    - a navegação por hash para `#/cripto/nft` funciona.
- [ ] **Passo 2:** rode `bun run build:prototipo && CHROMIUM_PATH=/opt/pw-browsers/chromium bun run test:e2e -- acessibilidade prototipo`. Esperado: FALHA onde houver violação ou dependência de servidor. Corrija até passar.
- [ ] **Passo 3: orçamento**
  - `scripts/orcamento.ts` soma o JS e o CSS de `build/_app/immutable/**` comprimidos com gzip (`Bun.gzipSync`), **sem as fontes**, e falha acima de **120 KB**, imprimindo o total.
  - Rode `bun run build && bun run orcamento`. Esperado: passa e imprime o total.
- [ ] **Passo 4: capturas**
  - `scripts/capturas.ts` (Playwright, `deviceScaleFactor: 2`, `executablePath` de `CHROMIUM_PATH`) abre o `build-prototipo/index.html` e grava as capturas listadas, alternando pelo painel do protótipo.
  - Rode `bun run capturas` e confira as imagens (sem cortes, sem rolagem horizontal, contraste visível).
- [ ] **Passo 5:** rode a verificação completa: `bun run lint && bun run check && bun run test && bun run build && bun run build:prototipo && bun run orcamento && CHROMIUM_PATH=/opt/pw-browsers/chromium bun run test:e2e`. Esperado: tudo passa.
- [ ] **Passo 6: commit e push**
  1. `git add -A && git commit -m "Protótipo em arquivo único, acessibilidade, orçamento e capturas"`.
  2. `git push -u origin claude/quirky-goodall-5s4nwn`.
- [ ] **Passo 7: publicar para o dono**
  1. Siga as regras da ferramenta Artifact (quickstart e skill de design de artifact antes de publicar).
  2. Publique `apps/web/build-prototipo/index.html` como página privada, com ícone `chart`.
  3. Mande as capturas com SendUserFile.
  4. Peça ao dono para escolher a logo (A, B ou C) e o estilo de manchete, e para apontar o que mudar na cara.
