# Personalização das notícias (desenho)

Complementa `2026-11-17-mirante-design.md` (seção 9.1: seguir temas e silenciar assuntos). Combinado com o dono em 17/11/2026.

## Por quê
O Mirante continua com o foco em mercado, mas quer ser **o lugar de todas as notícias da pessoa**. Quem quiser notícias mais amplas (política, esportes, ciência, saúde, cultura, mundo, ou um tema bem dela) coloca no app e passa a ver essas notícias, no site, no celular e no app instalável.

## Metas
1. **Espaço "Para você"**, primeiro do trilho e tela de início (no celular, o botão "Início"). Dentro dele:
   - `# tudo`, que mistura os temas escolhidos;
   - um canal por tema escolhido (`# política`, `# esportes`…);
   - **"+ Adicionar tema"** no fim da lista de canais.
2. **Lista pronta de temas** (tabela abaixo), cada um com fontes conferidas e logos.
3. **Tema digitado** ("Corinthians", "energia solar"): até 5 por pessoa. É uma busca guardada em todas as fontes conferidas do Mirante (cerca de 40 com esta etapa), atualizada sozinha.
4. **Primeira visita:** tela "O que você quer ver?", que dá para pular. Depois, muda-se por "+ Adicionar tema" e pela engrenagem.
5. **Filtros que valem no app inteiro** (engrenagem → Notícias): esconder fontes, idioma ("só português" ou "português e inglês") e palavras silenciadas.
6. **Sem conta**, as escolhas (temas, temas digitados e filtros) ficam no aparelho. **Com conta**, ficam salvas e vão junto para os outros aparelhos; ao entrar, o que estava no aparelho é juntado à conta, sem perder nada.
7. Mercado, Cripto e Tecnologia continuam como estão. Também aparecem como temas da lista, para entrarem no `# tudo` de quem quiser.

## Fora desta etapa
- Aprender sozinho com o que a pessoa lê: fase 2, com IA, e só se a pessoa ligar.
- Avisos de notícia de um tema: fase 6.
- Tradução das notícias em inglês: fase 2.

## Anti-metas (falharia mesmo funcionando)
- Cara de IA: "recomendado para você", estrelinhas, excesso de pílulas na tela de escolha. A escolha é uma lista limpa com ícone, nome, fontes e caixa de seleção, no desenho do app.
- Tema digitado que traz notícia de fonte que ninguém conferiu.
- Perder as escolhas ao trocar de aparelho ou ao entrar na conta.
- Estourar qualquer cota grátis.
- Primeira tela mais pesada: a tela de escolha carrega só quando é aberta (limite de 120 KB).

## Lista pronta (fontes conferidas em 17/11/2026: respondem e o `robots.txt` não bloqueia)

São 22 fontes novas. A Agência Brasil (Internacional) já existe no Mercado e entra no tema Mundo sem ser coletada de novo.

| Tema | Fontes |
|---|---|
| Mercado | as fontes atuais do espaço Mercado |
| Cripto | as fontes atuais do espaço Cripto |
| Tecnologia e IA | as fontes atuais do espaço Tecnologia |
| Brasil | Agência Brasil (Geral), g1 |
| Política | Agência Brasil (Política), g1 Política |
| Mundo | g1 Mundo, BBC News Brasil, DW Brasil, Agência Brasil (Internacional) |
| Esportes | ge, Agência Brasil (Esportes) |
| Ciência | g1 Ciência, Revista Pesquisa FAPESP |
| Saúde | g1 Saúde, Agência Brasil (Saúde) |
| Educação | g1 Educação, Agência Brasil (Educação) |
| Cultura e entretenimento | g1 Pop & Arte, Agência Brasil (Cultura) |
| Meio ambiente | g1 Natureza, Agência Brasil (Meio Ambiente) |
| Justiça | Agência Brasil (Justiça) |
| Carros | g1 Carros |
| Viagem | g1 Turismo e Viagem |

Padrão para quem pula a primeira tela: **Mercado, Brasil, Mundo e Tecnologia e IA**.

## Abordagens consideradas
1. **Como a pessoa escolhe o tema.**
   - Só lista pronta: qualidade alta, mas limitada.
   - Só tema digitado: flexível, mas a qualidade varia e o custo cresce com o número de pessoas.
   - **As duas juntas: escolhida pelo dono.**
2. **De onde vêm as notícias do tema digitado.**
   - Google Notícias: **descartado**. O próprio feed diz que só pode ser usado "num leitor pessoal, para uso pessoal e não comercial", e proíbe qualquer outro uso.
   - Serviço aberto de busca de notícias (GDELT): não respondeu daqui na conferência e traz sites sem conferência. Fica para avaliar depois, se faltar cobertura.
   - **Busca nas fontes conferidas do Mirante: escolhida.** É grátis, só traz fonte conferida, não precisa de conta e não aumenta a coleta. O limite é achar só o que essas fontes publicam; por isso a lista de fontes fica ampla (g1 por editoria, ge, BBC, DW, Agência Brasil por editoria).
3. **Onde a personalização acontece** (decisão minha).
   - Feed montado no servidor para cada pessoa: não dá para guardar em cache e gasta mais saída de dados do Supabase.
   - **O servidor entrega um feed por tema, igual para todos (pode ir para o cache da Cloudflare), e o aparelho junta os temas da pessoa e aplica os filtros.** Continua grátis e rápido, e sem conta as escolhas nem saem do aparelho. Escolhida.

## Como funciona
- **Temas no banco:** tabela `temas` (id, nome, ícone, ordem) e, para cada tema, uma ou mais origens (`espaco`, `canal`). Os temas gerais ficam num espaço novo do banco, `geral`, com o tema como canal (`feed('geral', 'esportes')`). Mundo junta `geral/mundo` e `mercado/mundo`. Mercado, Cripto e Tecnologia apontam para os espaços que já existem. O aparelho busca cada origem e junta, sem cartão repetido.
- **Fontes novas:** as 22 entram em `fontes` com `espaco = 'geral'` e o tema como canal. Coleta a cada 10 min, com as mesmas regras de hoje.
- **Tema digitado:**
  - termo de 2 a 40 caracteres, comparado sem acento e sem diferença de maiúsculas;
  - busca por palavras no título e no trecho das notícias dos últimos 30 dias, de todas as fontes (função `buscar_noticias(termo)` no banco, com índice de busca em texto);
  - não precisa de conta: sem conta, os termos ficam no aparelho; com conta, vão junto;
  - poucas ou nenhuma notícia: o canal diz isso com clareza ("Ainda não há notícias sobre … nas nossas fontes") em vez de ficar em branco.
- **Cache na Cloudflare (entra nesta etapa):** o `# tudo` pede um feed por tema, e cada pedido direto ao Supabase tem cerca de 27 KB. Com 8 temas, a saída grátis de 5 GB por mês acabaria em cerca de 23 mil aberturas. Por isso o Worker `mirante` ganha duas rotas, `/api/feed` e `/api/busca`, que repassam ao Supabase e guardam a resposta no cache da Cloudflare (60 s para feeds e 120 s para buscas). Os arquivos do site continuam grátis; só essas rotas contam nos 100 mil pedidos por dia do Worker, com contador e teto de 80%. Se o Worker cair, o site volta a pedir direto ao Supabase.
- **Escolhas da pessoa:** tabela `preferencias` (uma linha por conta, RLS: cada um só lê e muda a sua) com temas, temas digitados, fontes escondidas, palavras silenciadas e idioma. Sem conta, o mesmo formato fica no aparelho.
- **`# tudo`:** junta os feeds dos temas escolhidos, sem cartões repetidos, do mais novo para o mais antigo, com a mesma regra de variedade de fontes da capa.
- **Espaço no banco:** notícias dos temas gerais ficam 30 dias, em vez de 90, para caber nos 500 MB. O guardião de cotas acompanha o tamanho do banco.

## O que fica para quem implementa
- Ícone de cada tema (lucide) e textos exatos, pelos catálogos `pt-BR` e `en`.
- Desenho da tela de escolha e do painel de filtros, dentro das regras do `CLAUDE.md`.
- Números finos (quantos itens por tema no `# tudo`, intervalo exato), dentro dos limites acima.

## Dependências
- **Login com Google:** o dono liga seguindo o passo a passo de 17/11. A sincronização entre aparelhos é testada com respostas simuladas e, quando o login estiver ligado, no site de verdade.
