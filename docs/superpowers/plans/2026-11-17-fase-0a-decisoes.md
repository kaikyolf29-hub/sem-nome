# Fase 0A: decisões tomadas durante a construção

Registro das escolhas que fiz no lugar do dono enquanto construía o protótipo, e do que ficou para depois. Cada item diz o custo se a escolha estiver errada.

## Pedidos do dono no meio do caminho
- **Menos "cara de IA":**
  - sem estrelinhas no rótulo de IA;
  - resumo em estilo editorial (fio à esquerda, sem caixa);
  - marca das fontes com letra serifada ou prédio público;
  - fontes da manchete numa frase;
  - "Afeta sua carteira" como texto, não pílula.
- **Detalhes como regra principal:** passadas com prints de perto e testes que medem sobreposição e alinhamento em várias larguras.
- **Carteira em várias moedas:** moeda principal entre 10 (BRL, USD, EUR, GBP, JPY, CHF, CAD, AUD, CNY, MXN), dólar como ponte, visão por moeda (original, convertido, %). A escolha fica lembrada. *Custo se errado: trocar a lista de moedas.*
- **Logo escolhida:** opção A, "Gráfico em M".
- **Supervisão pelo Fable 5.2:** revisão da base (tarefas 1 a 5) e revisão final. Todos os pontos graves e importantes foram corrigidos com teste.

## Escolhas de construção
1. Títulos das tarefas do plano em inglês ("Task N"), exigência da ferramenta de execução. *Nenhum custo.*
2. O site é uma SPA (sem renderização no servidor); a mesma interface servirá ao Tauri. *Nenhum custo.*
3. Fontes locais (Inter, JetBrains Mono, Newsreader) pelo fontsource, todas as variantes de idioma. *O protótipo em arquivo único fica maior (cerca de 800 KB).*
4. Variação de preço lida pelo leitor de tela como texto escondido ("alta de 1,80%"), não como `aria-label`. *Nenhum custo.*
5. Chaves de tradução em camelCase e endereços em kebab-case. *Nenhum custo.*
6. Ícones com os nomes da lucide 1.x (`chart-pie`, `chart-candlestick`, `triangle-exclamation-point`). *Nenhum custo.*
7. Título do canal no topo da casca, como no Discord. *Nenhum custo.*
8. Barra de baixo do celular: Início, Carteira, Cripto, Agenda e Mais (abre a gaveta com todos os espaços). Troquei "Alertas" e "Você" porque ainda não existem essas telas. *Rever quando a tela de alertas existir (fase 6).*
9. Testes de navegador em português (`locale: 'pt-BR'`). *Nenhum custo.*
10. Medidor da IA em duas linhas: "IA grátis: 40% usado" e "Renova às 15:20". *Nenhum custo.*
11. Notícias do feed como "mensagens" das fontes, e a manchete serifada como único destaque. *Se preferir cartões, é fácil trocar.*
12. Faixa de cotações acima da manchete: 5 colunas iguais, ou rolagem com borda esmaecida no celular. *Nenhum custo (dados de exemplo).*
13. Links de exemplo em `example.com`, abrindo em nova aba. *Nenhum custo.*
14. Campo do chat aceita digitação; "Enviar" fica desligado até a fase 4. *Nenhum custo.*
15. Cores das fatias dos gráficos: dois neutros e quatro tons calmos por tema, com contraste conferido. *Pode querer outras cores.*
16. A carteira de exemplo mostra também renda mensal e rentabilidade em 12 meses contra CDI, Ibovespa e S&P 500. *Nenhum custo.*
17. Bolinhas do Matsu pelo guia de 14/11 (14 px, áreas de 18 px, 4 px de espaço), que vale sobre o padrão antigo de 12 px. *Nenhum custo.*
18. Barra do Windows com 40 px de altura e a do Matsu com 48 px. *Nenhum custo.*
19. "Ver como" desenha uma janela simulada sobre um fundo escuro; gavetas e busca ficam dentro da janela. *Nenhum custo.*
20. Página `/marca` fora da casca do app (grupo de rotas `(app)`). *Nenhum custo.*
21. O protótipo em arquivo único apaga os arquivos soltos que o build gera e não usa, e não procura versão nova. *Nenhum custo.*
22. No teste do Tab na busca, o foco vai para a página antes do atalho, porque sob carga o primeiro toque de tecla pode se perder. O app está correto: os outros testes do atalho confirmam. *Nenhum custo.*

## Para depois (pequenos)
- A escolha de idioma não fica lembrada ao recarregar.
- As notícias de exemplo continuam em português quando a interface está em inglês. É conteúdo, não interface.
- A política de segurança rígida (CSP) vai precisar de hash ou nonce para o script do tema e o pacote embutido (fase 0B).
- No Matsu, a primeira pintura sai sem o visual do Matsu até o app instalado avisar que está no Matsu (fase 7).
- O tema não sincroniza entre abas abertas.
- `/mercado` não vira `/mercado/manchetes` no endereço.
