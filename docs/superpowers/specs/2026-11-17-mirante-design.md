# Mirante: documento de design

> **Mirante: o mercado visto de cima.**
> Portal de notícias e investimentos com IA, com a parte de tecnologia e IA dentro, num site com conta Google e num app instalável para Windows e Linux, no estilo do Discord.

- **Data:** 17/11/2026
- **Situação:** aprovado pelo dono em 17/11/2026
- **Licença:** fechada (todos os direitos reservados). O repositório pode ficar público durante os testes; o dono decide depois se fica público ou privado.
- **Fase de produto:** beta grátis para todos
- **Repositório:** `kaikyolf29-hub/sem-nome` (o nome do repositório pode mudar depois para `mirante`)
- **De onde vem:** fusão de dois documentos do dono (o *Briefing: portal de notícias e investimentos com IA*, que é o principal, e o *PROJECT SPEC: AI & Tech Intelligence App*), mais o arquivo de identidade visual estilo Discord, o *GUIA: versão Matsu dos apps do Kaiky* (14/11/2026), o *Padrão dos meus aplicativos* (repositório do Ignis) e a conversa de 17/11/2026.

---

## 1. Por quê

O dono quer um lugar só onde o investidor brasileiro veja o que importa para o dinheiro dele: notícias do Brasil e do mundo, a própria carteira, cripto, tecnologia e IA. Tudo com fontes confiáveis e sempre visíveis, e com uma IA que explica sem inventar e sem dizer "compre" ou "venda". Precisa ser bonito de verdade, leve e grátis para começar.

A qualidade é o critério principal: cada função e cada tela devem ter a melhor qualidade possível.

## 2. Para quem

- **Público:** qualquer pessoa, com foco no investidor pessoa física brasileiro que investe em ações, FIIs, ETFs, BDRs, ações dos EUA, renda fixa e cripto, e que acompanha tecnologia e IA.
- **Uso principal:** no celular. O computador vem logo depois, pelo site ou pelo app instalável.
- **O próprio dono** é o primeiro usuário. O perfil padrão de interesses é o dele: IA, big techs, chips, mundo, ações de tecnologia dos EUA, mercado brasileiro e cripto.

## 3. Metas, fora do escopo e anti-metas

### Metas (v1)
1. Site com cara de portal financeiro premium e layout do Discord, que se instala no celular como app (PWA).
2. App instalável para **Windows e Linux** com a mesma cara e a mesma conta. No **Matsu OS** ele ganha a "versão Matsu".
3. Login com **Google**. Ler notícias não exige conta; carteira, alertas, chat e salvar exigem.
4. Carteira nacional (BRL) e internacional (USD) com visão consolidada em BRL, gráficos bonitos e comparação com CDI, Ibovespa e S&P 500.
5. IA em **três níveis**: grátis no servidor, local no aparelho e chave própria opcional (seção 7). Cada conta tem limite de uso no estilo do Claude Code e do Codex.
6. **Cripto, stablecoins, NFTs e day trade**, com análise.
7. Alertas no celular e no computador e resumo diário, em português do Brasil.
8. **Custo zero para o dono no começo:** só planos grátis, com um guardião que não deixa estourar nenhuma cota. Tudo o que for pago fica para depois.
9. **Beta grátis:** todo mundo usa a versão de testes (selo "Beta"). O código já nasce preparado para planos pagos, com fontes trocáveis por interface e limites por plano, mas sem cobrança agora.

### Fora do escopo (v1)
- App Android nativo: vem depois. Na v1 o celular usa o site instalado (PWA), que já recebe notificações.
- App para macOS e iOS nativos. O site funciona neles.
- Cotação da B3 em tempo real e dados do mercado futuro (mini índice e mini dólar) em tempo real: exigem licença paga (seção 9.6).
- Assinatura paga, anúncios e pagamentos. Ficam para depois, quando o dono fizer as contas e escolher o que vale pagar: B3 ao vivo, mercado futuro, índices pagos, mais IA no servidor e domínio próprio.
- Rede social (comentários, servidores criados por usuários).

### Anti-metas (falharia mesmo funcionando)
- A IA dizer "compre" ou "venda", inventar número ou dar uma resposta sem fonte.
- Apresentar cenário como previsão ou promessa.
- Copiar matéria inteira ou imagem sem licença, raspar site que proíbe, ou fazer login automático em rede social (X, Instagram).
- Estourar a cota de qualquer plano grátis ou gastar dinheiro do dono ou do usuário sem um "sim" explícito.
- Vermelho como cor de botão (confunde com "caiu") ou cor sendo o único sinal de alta e baixa.
- App pesado: travar o jogo do dono ou gastar bateria do celular à toa.
- Visual "cara de template".

## 4. Restrições

- **Planos grátis:** Cloudflare (Workers Free) e Supabase (Free). Os limites estão na tabela da seção 6.3. Qualquer serviço pago, inclusive domínio próprio, só com aprovação do dono.
- **Termos das fontes:** usar só RSS, APIs oficiais ou licenças que permitam. Mostrar título, trecho curto, resumo próprio e link. Respeitar robots.txt e limites de frequência. Identificar-se com um User-Agent claro: `Mirante/<versão> (+URL do repositório)`.
- **Dados de mercado:** respeitar as licenças. Mostrar sempre a hora da cotação e o atraso.
- **Regulação:** o Mirante é informativo e educacional, não recomendação nem consultoria (CVM). Antes de lançar ao público, o dono deve consultar um advogado (seção 14).
- **LGPD:** coletar o mínimo, permitir exportar e apagar tudo, não vender dados.
- **Padrão dos apps do dono:** barra de título integrada e versão Matsu automática, conforme o guia do Matsu de 14/11/2026, que é o mais novo (seção 10.6).
- **Idioma:** português do Brasil primeiro, inglês em segundo, com todos os textos no sistema de tradução.

## 5. Abordagens consideradas

| | Abordagem | O que troca |
|---|---|---|
| **A (escolhida)** | **Um código de interface só (SvelteKit + TypeScript) para site, PWA e app instalável (Tauri 2).** Supabase para conta, banco e coleta agendada; Cloudflare para hospedar o site, entregar dados públicos com cache e rodar a IA grátis. | O mesmo trabalho de tela vale para os três lugares. O Tauri é leve (pouca memória, instalador pequeno) e é o que o Ignis já usa, então a detecção de placa e a IA local podem ser reaproveitadas. O Svelte gera páginas pequenas e rápidas no celular. Exige cuidado com os limites do plano grátis da Cloudflare (seção 6.3). |
| B | Next.js (React) na Cloudflare + Electron no computador | O ecossistema React é maior. Mas o Next.js no plano grátis da Cloudflare esbarra no tamanho máximo do Worker e no limite de pedidos por dia, e o Electron gasta várias vezes mais memória, o que vai contra o "leve" e contra o padrão do dono (o Ignis é Tauri). |
| C | App local primeiro, como no documento de tecnologia (o computador busca tudo, sem servidor) | Descartada pelo dono: o produto é um site público com conta. Do documento de tecnologia ficam as fontes, as regras de termos, a IA local e a cara do Matsu. |

O dono deixou o "como" comigo. A escolhida é a **A**.

## 6. Arquitetura

```
                ┌──────────── NUVEM (planos grátis) ─────────────────────────────┐
                │                                                                │
 Fontes ──────► │  Coleta agendada (Supabase Edge Functions + pg_cron)           │
 (RSS, APIs     │    normaliza · remove duplicatas · agrupa por fato             │
  oficiais,     │    liga a ativos (inclusive BDRs) · marca "bafafá"             │
  cotações)     │              │                                                 │
                │              ▼                                                 │
                │  IA nível 1 (Cloudflare Workers AI, cota grátis)               │
                │    resumo · tema · impacto · ativos  ── 1 vez por notícia      │
                │              │                                                 │
                │              ▼                                                 │
                │  Supabase Postgres (RLS): notícias, ativos, contas, carteiras  │
                │      │                        │                                │
                │      ▼                        ▼                                │
                │  Dados públicos com cache   Dados privados (só o dono da conta)│
                │  na Cloudflare (feed,       carteira, salvos, alertas, diário  │
                │  cotações, resumo, agenda)                                     │
                │      │                        │          Web Push (alertas)    │
                └──────┼────────────────────────┼─────────────────┬──────────────┘
                       ▼                        ▼                 ▼
        ┌──────────────────────────────────────────────────────────────────┐
        │  MESMA INTERFACE (SvelteKit)                                     │
        │  Site + PWA (celular)        App instalável (Tauri 2)            │
        │  IA nível 2: no navegador    IA nível 2: embutida (placa/CPU)    │
        │  IA nível 3: chave própria (OpenAI / Claude), direto do aparelho │
        │  Cripto ao vivo: WebSocket da corretora direto no aparelho       │
        └──────────────────────────────────────────────────────────────────┘
```

### 6.1 As peças
- **Interface:** SvelteKit (Svelte 5) e TypeScript, compilada como app de página única para o Tauri e para a Cloudflare. Rotas públicas, como a página da notícia, têm uma versão leve gerada no servidor só para robôs de busca e prévias de link. Gráficos: Lightweight Charts (de licença livre, para preço e day trade; mostrar a atribuição exigida) e SVG próprio para rosca, barras e mapa de calor.
- **Coleta:** Supabase Edge Functions disparadas pelo `pg_cron` do próprio Supabase. As funções do Supabase têm 2 s de processamento por chamada, contra 10 ms nos Workers grátis, o que basta para ler RSS e XML. Cada fonte é um módulo com o mesmo contrato: buscar o que é novo desde a última vez, respeitando limite de frequência, espera crescente após erro e cache por ETag ou If-Modified-Since.
- **Banco:** Supabase Postgres com RLS (cada pessoa só lê e escreve os próprios dados) em toda tabela de usuário. Busca em texto com a configuração `portuguese`; busca por significado com `pgvector` só para as notícias dos últimos 30 dias, para caber nos 500 MB.
- **Entrega pública:** feed por canal, cotações, resumo do dia e agenda viram respostas com cache na Cloudflare (Worker + Cache API, ou arquivos estáticos quando der), para não gastar a saída de dados grátis do Supabase. Os dados privados vão direto do Supabase para o aparelho, protegidos pela RLS.
- **Hospedagem do site:** Cloudflare (Workers com arquivos estáticos ou Pages). Arquivos estáticos não contam no limite de pedidos.
- **Conta:** Supabase Auth com Google. No app instalável, o login abre o navegador e volta ao app por um link próprio (`mirante://`).
- **Intervalos de coleta (padrão, ajustáveis):**

  | Fonte | Intervalo |
  |---|---|
  | Notícias financeiras e fontes oficiais | 10 min |
  | Hacker News | 10 min |
  | GitHub | 30 min |
  | Reddit, RSS e Bluesky | 15 min |
  | Hugging Face | 2 h |
  | arXiv | 6 h |
  | Cotações | só no horário de cada mercado, dentro da cota |

- **Notificações:** Web Push (padrão aberto e grátis; no iPhone funciona com o site instalado), enviado por uma Edge Function com chaves VAPID. No app instalável, notificação nativa do sistema.
- **Administrador:** só as contas da lista do dono veem a tela de cotas e de fontes.

### 6.2 Domínio
Começa num endereço grátis da Cloudflare (`*.pages.dev` ou `*.workers.dev`). Domínio próprio custa pouco por ano, mas é pago, então só com aprovação do dono.

### 6.3 Guardião de cotas (nenhum plano grátis estoura)
Cada serviço tem um contador no banco e um teto **abaixo** do limite oficial. Ao chegar no teto, a função para e cai para um modo econômico; nunca dá erro para o usuário. Há uma tela de administrador com o uso do dia e do mês.

| Serviço (plano grátis, **conferir na implementação**) | Limite oficial aproximado | Teto do Mirante | Ao chegar no teto |
|---|---|---|---|
| Workers AI | 10.000 unidades (neurons) por dia, reinicia 00:00 UTC | 85% | notícia aparece sem resumo; resumo entra na fila do dia seguinte |
| Workers (pedidos) | 100.000 por dia; 10 ms de processamento por pedido; 5 agendamentos por conta | 80% | site estático continua; dados públicos passam a ser lidos com cache mais longo |
| Supabase banco | 500 MB | 80% | apaga notícias antigas (padrão: mais de 90 dias, menos as salvas) e vetores com mais de 30 dias |
| Supabase saída de dados | ~5 GB por mês | 80% | aumenta o cache público na Cloudflare |
| Supabase Edge Functions | ~500 mil chamadas por mês | 80% | espaça as coletas menos importantes |
| Supabase Auth | ~50 mil usuários ativos por mês | 90% | alerta ao dono |
| brapi (cotações B3, grátis) | 15 mil pedidos por mês, 1 ativo por pedido, ~30 min de atraso | 85% | usa o fechamento oficial do dia (B3) |
| CoinGecko (grátis) | ~10 mil pedidos por mês | 85% | usa só as corretoras (WebSocket no aparelho) |

O Supabase grátis pausa projetos parados há 7 dias. A coleta agendada mantém o projeto ativo.

## 7. IA

### 7.1 Nível 1: grátis no servidor
- **O que faz:** para cada notícia, uma única vez, gera um resumo de 2 linhas em português, tema, impacto (0 a 100), ativos ligados com o motivo e a marca de "bafafá". Também gera o resumo do dia (uma vez por dia para todos) e a explicação de cada notícia em modo simples e avançado, guardada em cache para reaproveitar.
- **Onde roda:** Cloudflare Workers AI, por chamada da coleta (API REST). O modelo é escolhido na implementação: o melhor em português dentro da cota, testado com um conjunto de avaliação próprio.
- **Também atende pedidos pessoais** (chat, análise da carteira) quando a pessoa não tem os níveis 2 ou 3, dentro do limite da conta (7.5).

### 7.2 Nível 2: local no aparelho (grátis e privado)
- **App instalável:** IA embutida que funciona como o Ignis. Detecta a placa, escolhe Vulkan, CUDA, ROCm ou o processador, baixa só o motor certo (o `llama-server` oficial do llama.cpp) e um modelo pequeno quantizado escolhido pela memória da placa. Carrega quando precisa, descarrega depois de 5 minutos parado e pausa com jogo em tela cheia ou na bateria.
  - **Usa o Ignis** (decisão do dono): o app depende do `ignis-core` direto do repositório do Ignis, numa versão fixada. Assim as otimizações que o dono fizer no Ignis entram ao atualizar a dependência, e o app funciona sem o Ignis instalado.
  - Se o app do Ignis estiver aberto (`127.0.0.1:11470`), o Mirante usa o Ignis em vez de subir um segundo motor, para não carregar dois modelos na placa.
- **Site:** IA no próprio navegador por WebGPU (WebLLM ou equivalente), com um modelo de 0,6 a 1,7 bilhão de parâmetros, baixado uma vez (~0,5 a 1,1 GB) e só com o "sim" da pessoa. Funciona bem no Chrome e no Edge de computador; no celular o suporte é instável, então lá o padrão é o nível 1 ou o 3.

### 7.3 Nível 3: chave própria (opcional, mais potente)
- OpenAI ou Anthropic (Claude), à escolha da pessoa. Serve para chat mais forte, análise de 5 a 10 anos e resumo de balanços longos.
- **A chave fica só no aparelho:** no app instalável, no cofre de senhas do sistema; no site, guardada cifrada no navegador. As chamadas vão do aparelho direto para a OpenAI ou a Anthropic. O servidor do Mirante nunca vê a chave.
- O app mostra o custo estimado de cada pedido antes de mandar, quando for grande, e um contador do mês.

### 7.4 Roteador
Cada tarefa vai para o melhor nível disponível: nível 3 (se configurado), depois nível 2 (se o aparelho aguenta a tarefa), depois nível 1 (dentro do limite). A pessoa pode fixar um nível em Ajustes. Na interface, tudo passa pela mesma interface `ProvedorIA`.

### 7.5 Limite por conta (estilo Claude Code e Codex)
- Vale **só para o nível 1**. Os níveis 2 e 3 não custam nada ao Mirante e não têm limite.
- **Janela de 5 horas mais teto semanal**, medidos em "créditos" que refletem o custo real de cada tarefa. Explicar uma notícia já explicada vem do cache e custa zero; uma pergunta curta custa pouco; a análise completa da carteira custa mais.
- **Medidor visível:** "Uso da IA: 40% desta janela, renova às 15h20". Quando acaba, o app oferece os níveis 2 e 3 em vez de só bloquear.
- O tamanho da janela é calculado todo dia pela sobra da cota global (7.1 e 6.3), com mínimo e máximo, para ninguém ficar sem e ninguém estourar o total.
- Contra abuso: uma conta por conta Google e limite por endereço de rede.

### 7.6 Regras de conteúdo (todas as IAs, todos os níveis)
- Toda afirmação de fato tem fonte clicável. Sem fonte, a IA diz que não encontrou.
- Nunca "compre" ou "venda": argumentos a favor, contra e riscos.
- Horizonte longo sempre em **cenários** (otimista, base, pessimista) com premissas explícitas, e a interface mostra que cenário não é previsão.
- Números de cotação, rentabilidade e impostos vêm do código, nunca da IA. A IA só explica os números que recebe.
- Todo texto de IA leva o selo "Gerado por IA" ao lado do link da fonte.
- Saídas estruturadas em JSON validadas por esquema. O que vier fora do esquema é descartado e a tarefa é refeita uma vez.

### 7.7 Avaliação
Um conjunto fixo de casos (notícias reais, perguntas, carteiras de teste) roda a cada mudança de prompt ou de modelo. O conjunto confere: fonte presente, nenhum número inventado, nenhuma recomendação de compra ou venda e português correto.

## 8. Conteúdo e fontes

**Toda fonte é conferida (termos, limites, endereço) antes de ser ligada.** A lista exata fica para quem implementa, só com RSS ou API oficial.

| Grupo | Exemplos | Como |
|---|---|---|
| Oficiais Brasil | Banco Central (SGS, Focus, Copom, notas), CVM (dados abertos, fatos relevantes), B3, IBGE, Tesouro Nacional, ANBIMA | APIs e arquivos públicos; selo "fonte primária" em destaque |
| Oficiais exterior | Fed, BLS, BEA, SEC (EDGAR), BCE, FMI, Banco Mundial | APIs e RSS oficiais |
| Notícias Brasil e exterior | veículos financeiros de referência que publicam RSS | só título, trecho e link; peso por confiabilidade |
| Busca por tema | ~~Google News RSS~~ (os termos do Google proíbem uso fora de leitor pessoal); o tema digitado busca nas fontes conferidas, veja `2026-11-17-personalizacao-noticias-design.md` | |
| Tecnologia e IA | Hacker News, GitHub (repositórios novos em alta pela velocidade de estrelas e lançamentos de repositórios seguidos), arXiv, Hugging Face, RSS de laboratórios e blogs, Reddit por RSS, Bluesky (contas escolhidas) | conforme o documento de tecnologia; sem raspar a página "trending" do GitHub |
| Cripto | veículos cripto com RSS (em português e inglês) | igual às notícias |
| Cotações B3 | brapi (grátis, ~30 min de atraso) + fechamento oficial diário da B3 | cache compartilhado no servidor |
| Cotações EUA | provedor grátis com chave (Finnhub ou Alpha Vantage; conferir termos de uso público) | atrás da interface `ProvedorCotacao` para trocar fácil |
| Cripto ao vivo | WebSocket público das corretoras, aberto direto no aparelho (sem custo de servidor); CoinGecko para dados gerais | |
| Stablecoins | DefiLlama (oferta e paridade), PTAX do Banco Central (para o ágio) | |
| NFT | CoinGecko (preço mínimo e volume das coleções principais) | |

- **Confiabilidade:** lista curada com peso por fonte. Fonte desconhecida não entra ou entra com selo "não verificada". Fato importante (bafafá) só ganha destaque com duas fontes ou uma primária.
- **Duplicatas:** primeiro pelo endereço canônico (sem parâmetros de rastreio); depois por semelhança de título e significado. A mesma história vira um cartão só com todas as fontes ("coberto por …").
- **Ligar notícia a ativo:** pelo nome, ticker, sinônimos e IA, incluindo a ponte entre a empresa americana, a ação nos EUA e o BDR na B3 (Nvidia → NVDA → NVDC34).

## 9. Funcionalidades

### 9.1 Portal
- Manchete principal, destaques, editorias e feed contínuo.
- Editorias e canais: Brasil, EUA, Mundo, Ações, FIIs, ETFs, Renda fixa, Câmbio, Commodities, Cripto, Stablecoins, NFT, Macroeconomia, Tecnologia & IA, Chips, GitHub Radar.
- Cartão com título, fonte(s), horário, trecho, resumo de IA, temas, indicador de impacto e "afeta sua carteira" com o ativo e o motivo.
- Página da notícia com resumo opcional, contexto, ativos ligados e botão "Ler na fonte". Por padrão abre a fonte em nova aba; um painel lateral só para fontes que permitem ser embutidas, com volta automática para a nova aba.
- Bafafá: decisões de juros, balanços, fusões, escândalos e mudanças de regra, com marca própria.
- Salvar (com nota), seguir ativos e temas, silenciar assuntos.
- Modo simples e modo avançado na mesma tela.

### 9.2 Carteira
- Duas carteiras (BRL e USD) com visão consolidada em BRL pelo câmbio do dia, mostrando a hora.
- **Várias moedas (pedido do dono, 17/11/2026):** a pessoa escolhe uma **moeda principal** entre 10 (real, dólar americano, euro, libra, iene, franco suíço, dólar canadense, dólar australiano, yuan e peso mexicano) e vê o patrimônio todo nela. A seção **Por moeda** mostra quanto há em cada moeda: o valor na moeda original, quanto vale na principal e a fatia da carteira. A conversão usa o dólar como ponte, mostrando a hora do câmbio; a escolha fica lembrada.
- Ativos: ações, FIIs, ETFs, BDRs, ações dos EUA, renda fixa, cripto e caixa. Cadastro manual e importação por CSV ou XLSX, inclusive os relatórios que a Área do Investidor da B3 exporta (negociações e movimentações).
- Rosca animada da alocação (por ativo, classe, país, setor, moeda), evolução do patrimônio, rentabilidade, comparação com CDI, Ibovespa e S&P 500.
- Proventos recebidos, renda mensal estimada e calendário de dividendos.
- Alerta de concentração (padrão: mais de 20% num ativo).
- **Imposto (estimativa):** cálculo do DARF de day trade e swing trade em ações, de FIIs e de cripto, com as isenções. As regras de imposto mudam: **conferir a lei vigente na implementação**, com aviso de "estimativa, confira com um contador".

### 9.3 IA analista (chat)
- Usa o contexto da carteira e das notícias. Toda resposta cita fontes clicáveis.
- Usos: explicar uma notícia, comparar ativos, resumir balanço, analisar risco da carteira, explicar um conceito, explicar um gráfico.
- Cenários de 5 a 10 anos (seção 7.6). Aviso fixo no chat.

### 9.4 Diário com memória
A pessoa anota por que comprou (a tese). A IA lê as notícias novas e avisa quando alguma mexe na tese ("você comprou X pela expansão Y; saiu notícia de que Y foi adiado"). Dá para revisitar e marcar se a tese continua de pé.

### 9.5 Cripto, stablecoins e NFT
- **Cripto:** cotação em BRL e USD ao vivo, página por moeda, capitalização, dominância do Bitcoin, índice de medo e ganância, notícias e "afeta sua carteira".
- **Stablecoins:** monitor de paridade com alerta quando uma moeda sai do valor (por exemplo, USDT abaixo de 0,995 dólar), oferta total por moeda, stablecoins em real e **ágio do USDT em reais contra o dólar PTAX**, um termômetro do fluxo de dinheiro no Brasil.
- **NFT:** preço mínimo, volume e variação das coleções principais, com notícias.

### 9.6 Day trade
- Gráfico ao vivo (cripto ao vivo; B3 com o atraso da fonte, sempre mostrado) com indicadores: médias móveis, RSI, MACD, VWAP, Bollinger e volume.
- Livro de ofertas e negócios ao vivo para cripto.
- Alertas de preço e de cruzamento de indicador, que são condições definidas pela pessoa e não sinais do Mirante.
- **Treino com dinheiro de mentira** e **replay** de pregões passados, para praticar sem risco. Para o replay, cripto usa o histórico minuto a minuto que as corretoras dão de graça, e a B3 usa os dados diários.
- Diário de operações: resultado, taxa de acerto, maior perda e horário.
- A IA explica o gráfico e os indicadores e nunca dá sinal de compra ou venda.
- **Limite honesto:** B3 ao vivo e mini índice e mini dólar ao vivo exigem dados pagos. Na v1, B3 com atraso; ao vivo só se o dono aprovar um provedor pago no futuro.

### 9.7 Tecnologia & IA
- Notícias de IA, chips e big techs; artigos científicos; modelos em alta no Hugging Face.
- **GitHub Radar:** repositórios novos subindo rápido (velocidade de estrelas), lançamentos dos repositórios seguidos, cada um com uma linha de "o que faz" e o botão Salvar.
- Big techs na bolsa: alerta de movimento acima de ±3% no dia, junto com a notícia que explica.

### 9.8 Alertas, resumo e agenda
- Alertas: preço, notícia de ativo da carteira, bafafá, paridade de stablecoin, movimento de big tech, tese do diário. Com horário de silêncio, limite por hora e agrupamento ("+5 alertas").
- Resumo diário personalizado ("o que aconteceu hoje com o que importa para você") no horário escolhido, em texto e **em áudio**. O áudio usa a voz do navegador no site e uma voz local no app instalável; nada é enviado para fora.
- Agenda: balanços, dividendos, Copom, Fed, payroll, CPI e IPCA, com alerta antes.

### 9.9 Busca, comparador e páginas
- Busca por palavra e **por pergunta** ("o que aconteceu com a Petrobras essa semana?"), com resposta citando as notícias.
- Paleta de comandos **Ctrl+K**, como no Discord.
- Página de cada ativo: cotação, gráfico, indicadores, notícias, proventos e análise de IA.
- Comparador lado a lado, mapa de calor por setor e ativo, e glossário que explica termos ao passar o mouse ou tocar.

## 10. Aparência

### 10.1 Identidade
- **Logo:** quadrado bem arredondado (squircle) vermelho vivo (degradê suave de `#FF3B30` para `#C81D11`, base `#E62E2D`) com um símbolo **branco, geométrico e amigável**, de traço grosso, no espírito do Discord, mas com **desenho próprio**. Ideia: um mirante (horizonte com ondas de sinal, ou um "M" formado por uma linha de gráfico que sobe). Não copia o controle do Discord.
- **Logo escolhida (17/11/2026): opção A, "Gráfico em M"**: o M do Mirante desenhado como uma linha de gráfico que sobe, terminando num ponto (arquivo `apps/web/src/lib/marca/logo-a.svg`).
- **Formato do ícone:** o padrão Matsu, que funciona em todo sistema: SVG num quadro de 256 × 256, quadrado de 224 px com cantos de 58 px, degradê suave, desenho branco no meio e uma linha clara de 3 px na borda.
- **O vermelho é da marca, não da interface.** Aparece na logo, na tela de abertura e em poucos momentos de marca. Botões e seleção usam o destaque neutro do tema.

### 10.2 Layout (estilo Discord)
```
┌────┬──────────────────┬───────────────────────────────────┬──────────────────┐
│ ▣  │ MERCADO          │ [Buscar ou perguntar…  Ctrl+K]    │ PETR4  ▲ +1,8%   │
│ ── │ # manchetes      │ ┌───────────────────────────────┐ │ ───────────────  │
│ ◉  │ # brasil         │ │ MANCHETE · Copom mantém Selic │ │ Afeta sua        │
│ ◉  │ # eua            │ │ Banco Central · 2 fontes · 18h│ │ carteira: PETR4, │
│ ◉  │ # fiis           │ │ ✦ Resumo de IA em 2 linhas…   │ │ por quê…         │
│ ◉  │ # câmbio         │ │ [Ler na fonte]  [Salvar]      │ │                  │
│ ◉  │ CRIPTO           │ └───────────────────────────────┘ │ Chat do analista │
│ ◉  │ # stablecoins    │ ┌──────────────┐┌───────────────┐ │ (com fontes)     │
│ ◉  │ TECNOLOGIA       │ │ cartão       ││ cartão        │ │                  │
│ ＋ │ # ia  # github   │ └──────────────┘└───────────────┘ │                  │
│ ⚙  │ [conta · uso IA] │ feed contínuo…                    │                  │
└────┴──────────────────┴───────────────────────────────────┴──────────────────┘
 trilho  canais (240 px)  conteúdo principal                  painel de contexto
 (72 px)                                                      (abre e fecha)
```
- **Trilho (72 px):** Mercado, Carteira, Cripto, Day trade, Tecnologia & IA, Agenda, Salvos e, no pé, Ajustes.
- **Canais (240 px):** editorias e filtros do espaço escolhido no trilho, como `#manchetes`, `#resumo-do-dia`, `#stablecoins` e `#github-radar`. No pé, a conta e o medidor de uso da IA.
- **Conteúdo:** feed com hierarquia editorial (manchete grande, destaques, cartões).
- **Painel de contexto (abre e fecha):** ativo em foco, "afeta sua carteira" e o chat do analista.
- **Celular:** como o Discord no celular. O conteúdo ocupa a tela, os canais deslizam da esquerda, o painel de contexto da direita, e há uma barra inferior com Início, Carteira, Cripto, Agenda e Mais (abre a gaveta com todos os espaços e canais).

### 10.3 Temas
- **Claro, Escuro e Preto** (preto puro para telas OLED, como o "Meia-noite" do Discord), seguindo o sistema por padrão.
- **Cores calmas:** cinzas grafite neutros (nunca azulados), contraste confortável para leitura longa e um único destaque neutro, como no Matsu.
- **Alta e baixa:** verde e vermelho acessíveis, **sempre** com sinal (+/−) e seta (▲/▼), nunca só a cor.
- **Tokens únicos** (cores, cantos, espaços, sombras, tempos) num lugar só, para o site, o app e a versão Matsu.

### 10.4 Tipografia e movimento
- Inter (variável) para a interface, com números tabulares em cotações e tabelas, e JetBrains Mono para código. **Proposta:** uma serifada editorial (por exemplo Newsreader ou Source Serif 4) só nas manchetes, para dar cara de portal premium. A decisão sai do protótipo.
- Animações curtas (140 a 250 ms, desacelerando no fim). A rosca da carteira anima uma vez ao abrir. Nada surge ao rolar. "Reduzir movimento" é respeitado.

### 10.5 Primeira entrega visual
Antes de construir as telas de verdade, vai um **protótipo clicável** da tela principal (computador e celular, nos três temas) e três opções de logo, para o dono aprovar a aparência.

### 10.6 Versão Matsu e janelas (app instalável)
- **Matsu OS (automático):** segue o *GUIA: versão Matsu dos apps do Kaiky* (14/11/2026) inteiro:
  - reconhecimento pelo os-release (`/run/host/os-release`, `/etc/os-release`, `/usr/lib/os-release`; "matsu" em ID, NAME ou PRETTY_NAME);
  - janela sem moldura, barra de 48 px, cantos de 10 px (retos quando maximizada), borda de 1 px;
  - bolinhas de 14 px com área de clique de 18 px, 4 px entre as áreas e 14 px da borda; cores, símbolos, estado sem foco, tempo da dica e lado e ordem lidos do sistema;
  - cores neutras do Matsu, cor e transparência lidas de `~/.config/matsu/vidro` (relidas ao ganhar foco), tema pelo portal do sistema;
  - **vidro sólido**: o Tauri não consegue pedir o desfoque ao KWin, e o guia manda usar as mesmas cores com opacidade 1;
  - Inter, cantos e barra de rolagem do guia, textos em português do Brasil, ícone e `.desktop` com `StartupWMClass` igual ao id do app.
- **Windows:** barra de título integrada com os botões do Windows 11 (46 px, fechar `#C42B1C`), arrastar, duplo clique e encaixe preservados.
- **Outros Linux:** botões no estilo do sistema (lado, ordem e estilo por `gtk-decoration-layout`, configurações do GTK e do KDE), com escolha manual em Ajustes: Automático, Windows, GNOME, KDE, Mac (sem opção Matsu, que é automática).
- **Os guias do dono divergem:** o *Padrão dos meus aplicativos* tem bolinhas de 12 px e Flatpak para o Matsu; o guia de 14/11 tem bolinhas de 14 px e AppImage. **Vale o guia de 14/11** até o dono mandar as instruções do instalador.

### 10.7 Acessibilidade
Contraste AA, navegação completa por teclado (atalhos como no Discord), leitor de tela, áreas de toque de pelo menos 44 px e foco visível.

## 11. App instalável (Windows e Linux)
- Tauri 2 com a mesma interface compilada dentro do app (abre rápido e mostra o que já baixou mesmo sem internet).
- O núcleo em Rust cuida de:
  - IA local embutida (7.2), reaproveitando o `ignis-core` (MIT);
  - cofre de senhas do sistema para as chaves;
  - notificações nativas;
  - ícone perto do relógio, com a janela fechando para a bandeja;
  - abrir com o computador (opcional);
  - link `mirante://` para o login;
  - instância única;
  - versão Matsu e barras de título.
- **Pacotes:** Windows com instalador NSIS por usuário. Linux conforme as **instruções de instalador que o dono vai mandar**; até lá, o padrão do Ignis: AppImage, Flatpak, `.deb`, `.rpm`, um arquivo com nome fixo do Matsu OS e um `instalar.sh` que descobre o sistema, tudo com `SHA256SUMS.txt`.
- Atualização com um clique a partir das releases do GitHub, conferindo o SHA-256.
- **Metas de desempenho:** menos de 150 MB de memória parado (sem contar o modelo de IA), processador perto de 0% parado, abrir em menos de 2 s.

## 12. Celular
- **v1:** o site instalado como app (PWA) no Android e no iPhone, com notificações (Web Push) e leitura do que já baixou sem internet.
- **Depois:** app Android nativo (Tauri 2 Android) com a mesma interface.
- **Proposta:** entrar no celular lendo um QR code mostrado no computador já logado, como no Discord.

## 13. Dados, privacidade e segurança
- **Tabelas principais:**
  - conta e preferências: `profiles`, `ai_usage` (créditos por janela), `push_subscriptions`;
  - carteira: `portfolios`, `holdings`, `transactions`, `dividends`;
  - mercado: `assets` (com aliases e ligação BDR ↔ ação dos EUA), `quotes_cache`;
  - notícias: `articles` (com `cluster_id`, temas, impacto, resumo e o modelo de IA usado), `article_sources`, `article_assets`;
  - escolhas da pessoa: `follows`, `mutes`, `saved_articles` (com nota), `alerts`, `journal_entries`;
  - chat: `chat_threads` e `chat_messages`, com as fontes citadas;
  - operação: `quota_counters`, `source_state` (ETag, última coleta, erros).
- **RLS** em toda tabela de usuário, com testes automáticos provando que uma conta nunca lê dados de outra.
- **Chaves secretas** (Workers AI, provedores de cotação) só no servidor. As chaves dos usuários ficam só no aparelho deles.
- **Política de segurança de conteúdo (CSP) rígida** no site, para proteger a chave guardada no navegador.
- **LGPD:** exportar tudo (JSON e CSV) e apagar a conta de verdade; termos de uso e política de privacidade em português.
- Sem telemetria de terceiros. Os registros de erro ficam no próprio Supabase e na Cloudflare.

## 14. Avisos legais
- Rodapé, chat e páginas de análise com o aviso: informativo e educacional, não é recomendação; rentabilidade passada não garante resultado futuro; investir tem risco de perda; cenários não são previsões.
- Hora e atraso de toda cotação. Selo de fonte em toda notícia.
- **Antes de abrir ao público:** revisão jurídica (regras da CVM sobre análise e recomendação, LGPD) feita por advogado. Este documento não substitui isso.

## 15. Qualidade
- **Testes automáticos:**
  - cálculos da carteira (alocação, rentabilidade, proventos, câmbio, imposto);
  - RLS (uma conta nunca acessa dados de outra);
  - leitura de cada fonte com respostas gravadas;
  - remoção de duplicatas;
  - guardião de cotas;
  - roteador de IA;
  - regra das bolinhas e detecção do Matsu (com os casos do Ignis).
- **Avaliação de IA** (7.7) a cada mudança de prompt ou de modelo.
- **Testes de tela:** Playwright nos fluxos principais, em computador e celular, e prints nos três temas.
- **Desempenho:** primeira carga abaixo de 2 s num celular médio, nota alta no Lighthouse e limite de tamanho do pacote no CI.
- **CI:** lint, tipos, testes, build do site e do app (Linux e Windows) e checagem de acessibilidade.

## 16. Fases e critérios de aceite
Cada fase termina com algo que o dono pode abrir e testar.

| Fase | O que entra | Pronto quando |
|---|---|---|
| **0. Fundação e cara** | Repositório, CI, tokens de design, logo (3 opções), protótipo clicável, projeto Supabase e Cloudflare, login Google | O dono aprova a cara; o site vazio abre no endereço grátis com login funcionando |
| **1. Notícias** | Coleta das fontes, remoção de duplicatas, agrupamento, layout Discord completo, página da notícia, filtros, salvar, seguir, silenciar, busca por palavra | Feed enche de todas as fontes, sem duplicatas, respeitando limites; funciona no celular |
| **2. IA nível 1 e cotas** | Resumos, temas, impacto, bafafá, "afeta sua carteira", guardião de cotas, limite por conta | Notícias novas ganham resumo em português; nenhuma cota passa do teto; o medidor funciona |
| **3. Carteira** | Carteiras, importação (inclusive B3), cotações, gráficos, proventos, agenda de dividendos, concentração, diário com memória, imposto | Uma carteira real importada mostra números certos, conferidos por testes |
| **4. Analista e níveis 2 e 3** | Chat com fontes, cenários, IA no navegador, chave OpenAI ou Claude, roteador, busca por pergunta | Respostas sempre com fonte e sem recomendação; funciona sem chave |
| **5. Cripto, stablecoins, NFT e day trade** | Cotações ao vivo, paridade e ágio, NFT, gráficos com indicadores, treino, replay, diário de operações | Cripto atualiza ao vivo sem custo de servidor; o treino funciona |
| **6. Alertas, resumo e agenda** | Web Push, resumo diário (texto e áudio), agenda econômica | Alerta chega no celular em até ~1 min; o resumo sai no horário |
| **7. App instalável** | Tauri Windows e Linux, versão Matsu, IA local embutida, bandeja, notificações, pacotes, atualização | Instala e roda no Matsu OS e no Windows 10 e 11; o modelo descarrega parado |
| **8. Polimento e revisão** | Acessibilidade, desempenho, textos legais, revisão de segurança | Lista de qualidade da seção 15 toda verde |
| **Depois** | App Android nativo, login por QR, provedor pago de B3 ao vivo (se o dono aprovar) | |

## 17. Decisões minhas (para o dono conferir)
1. **Tecnologia:** SvelteKit + Tauri 2 + Supabase + Cloudflare (seção 5).
2. **Coleta:** nas funções do Supabase, não nos Workers, porque os Workers grátis só dão 10 ms de processamento.
3. **Contas:** ler notícias não exige conta; carteira, alertas, chat e salvar exigem.
4. **Chaves de IA:** ficam só no aparelho e o servidor nunca as vê.
5. **Cores:** vermelho só na marca; a interface usa cores neutras; três temas (Claro, Escuro, Preto).
6. **Celular:** PWA na v1; Android nativo depois.
7. **B3:** com atraso na v1 (grátis); ao vivo só com provedor pago aprovado pelo dono.
8. **Matsu:** vale o guia de 14/11 quando os guias do dono divergem.
9. **Tipografia:** serifada editorial só nas manchetes, a confirmar no protótipo.
10. **Limites:** alerta de concentração padrão de 20%; limite da IA em janela de 5 horas mais teto semanal.

## 18. Respostas do dono
Respondidas em 17/11/2026:
1. **Licença:** fechada, todos os direitos reservados. O repositório fica público por enquanto, porque é um teste; depois o dono decide se fica público ou privado. Nunca entra segredo (chave ou senha) no repositório.
2. **IA local:** usar o Ignis (seção 7.2). O dono vai otimizá-lo depois.
3. **Cripto:** entram NFT **e** Nvidia (ações e o BDR, já cobertos em 8 e 9.7).
4. **Pago:** tudo o que for pago fica para depois. Agora é beta grátis, o mais grátis possível.
5. **Plano pago (17/11/2026):** assinatura simbólica de cerca de R$ 29,90 por mês, a construir depois das próximas etapas. Dá mais limites (IA) e coisas ao vivo (cotações ao vivo com provedor pago, alertas mais rápidos). Pagamento por Stripe ou por uma plataforma brasileira de assinaturas confiável, escolha do dono. O plano grátis segue completo e sem anúncios de venda insistentes.
6. **Personalização das notícias (17/11/2026):** lista pronta de temas mais tema digitado, no espaço "Para você". Desenho em `2026-11-17-personalizacao-noticias-design.md`.

## 19. O que fica para quem implementa
- A lista exata de fontes (conferida, só oficiais e RSS).
- Os modelos de IA de cada nível (pelo conjunto de avaliação).
- Os prompts e esquemas JSON.
- Os valores exatos de cor e espaço dentro da direção da seção 10.
- A estrutura de pastas e as bibliotecas.
- As migrações do banco.
- Os números finais do guardião depois de conferir os limites oficiais.

## 20. Limites honestos
- Os limites dos planos grátis mudam; todos os números da seção 6.3 serão conferidos nas páginas oficiais na hora de implementar.
- Daqui só dá para testar no Linux, sem placa de vídeo e sem o Matsu OS de verdade. Windows, placa real e Matsu OS ficam para o CI e para o teste do dono.
- O site depende de contas do dono na Cloudflare, no Supabase e no Google Cloud (para o login Google). Elas serão pedidas na fase 0, sem custo.
- B3 ao vivo e mercado futuro ao vivo não são possíveis de graça.
