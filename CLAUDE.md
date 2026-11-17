# Mirante: regras do projeto

Regras do dono que valem para o **projeto inteiro, até depois de pronto**. Leia antes de mudar qualquer coisa.

- Design: `docs/superpowers/specs/2026-11-17-mirante-design.md`
- Planos: `docs/superpowers/plans/`

## Conversa com o dono
- Português do Brasil, simples e direto, sem jargão técnico.
- O dono costuma falar por áudio, então nomes podem chegar trocados (Ignis vira "Ingress", NFT vira "NVIDIA", Cloudflare vira "Claude Frari"). Na dúvida, confirme.

## Regra principal: detalhes
O nível de acabamento é de um produto caro. **Nada** pode ficar:
- descentralizado ou desalinhado (números, ícones, logos, textos);
- cortado ou sobreposto;
- quebrando linha no lugar errado;
- com espaço sobrando de um lado só (vãos);
- feio.

Vale em todas as larguras (320, 390, 768, 1024, 1280, 1440, 1600) e em todos os temas (claro, escuro, preto, matsu-claro, matsu-escuro). Confira com prints de perto e escreva testes que medem alinhamento e sobreposição.

## Sem "cara de IA"
Proibido:
- estrelinhas (✨) para indicar IA;
- avatares genéricos com iniciais;
- excesso de pílulas e etiquetas;
- textos unidos por "·";
- rótulos em MAIÚSCULAS em cima de títulos;
- fonte monoespaçada em rótulos pequenos;
- "→" no fim de links;
- violeta;
- degradês decorativos;
- cartões todos iguais com a mesma sombra;
- animação aparecendo ao rolar a página.

O Taste Skill (MIT) pode servir de referência. Não copie código do transitions.dev nem do React Bits.

## Janela e sistema
- **Barra de título integrada (nativa):** o app vai até o topo da janela e os botões ficam dentro dele, como no Discord e no VS Code. **Nunca** uma faixa separada repetindo o nome do app.
- **Matsu OS:** reconhecido sozinho pelo os-release, sem opção manual. Segue o *GUIA: versão Matsu dos apps do Kaiky* (14/11/2026):
  - bolinhas de 14 px em áreas de 18 px, 4 px entre elas, a primeira a 14 px da borda;
  - cores `#ff5f57`, `#febc2e` e `#28c840`;
  - símbolos só com o mouse em cima;
  - cinza quando a janela está sem foco;
  - dica depois de 0,7 s;
  - cores neutras e Inter.
- **Windows:** botões do Windows 11 (46 px de largura; o fechar fica `#C42B1C` com o mouse em cima).
- **Outros Linux:** botões no estilo do sistema.

## Visual
- O vermelho é só da marca (logo escolhida: **opção A, "Gráfico em M"**). A interface usa cores neutras, com temas claro, escuro e preto.
- Alta e baixa sempre com sinal e seta, nunca só com a cor.
- **Logos:**
  - cada notícia mostra a logo da própria fonte;
  - ativos e criptos usam a marca real (simple-icons, CC0) ou, sem marca disponível, uma logo própria com a sigla.
- O que for nativo do sistema e destoar (como a lista do `<select>`) vira componente com o desenho do app.

## Produto
- **Custo:** o mais grátis possível. Só planos grátis, com contadores que não deixam estourar nenhuma cota. Tudo que for pago fica para depois e só entra com aprovação do dono. O beta é grátis.
- **Licença** fechada (todos os direitos reservados). O repositório pode ficar público durante os testes.
- **Contas:**
  - Supabase: organização "kaikyolf29-7664's projects";
  - Cloudflare: a conta conectada.

  Antes de usar uma conta, **diga qual é**.
- **IA local:** pelo Ignis do dono (`kaikydev1-jpg/Ignis`). Chaves da OpenAI e do Claude ficam só no aparelho da pessoa.
- **Supervisão:** o Fable 5.2 revisa em pontos-chave (fim de etapa e revisão final), respeitando o limite de gasto.

## Como trabalhar
- Todo texto visível passa por `t()`, com catálogos `pt-BR` e `en` (há teste contra texto fixo).
- **Acessibilidade:**
  - contraste AA;
  - uso completo por teclado (Esc fecha, o foco volta a quem abriu);
  - áreas de toque de 44 px;
  - "reduzir movimento" respeitado.
- Teste antes do código (TDD).
- Não diga que está pronto sem rodar:

```bash
cd apps/web
bun run lint && bun run check
CHROMIUM_PATH=/opt/pw-browsers/chromium bun run test
bun run build && bun run orcamento && bun run build:prototipo
CHROMIUM_PATH=/opt/pw-browsers/chromium bun run test:e2e
```

- Limite de 120 KB de JS+CSS comprimido (`bun run orcamento`).
