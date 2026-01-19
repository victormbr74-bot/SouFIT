# SouFIT

Dashboard fitness com tema Solo Leveling. Navegacao: Dashboard, Treinos, Dieta do Cacador, Status, Speed, Perfil do Cacador.

## Como usar
- Abra o site no GitHub Pages ou rode um servidor local:
  - `python -m http.server 5500`
  - Acesse `http://localhost:5500/index.html`

## Tema global (Design System)
- As variaveis do tema ficam em `style.css` no bloco `:root` e nas classes `body.theme-*`.
- Tokens principais: `--color-primary`, `--color-bg`, `--color-card`, `--color-border`, `--color-text`, `--color-glow`, `--color-accent`, `--color-progress`.
- O tema e aplicado pela funcao `applyTheme(themeColor)` em `app.js`, que alterna as classes `theme-*` no `body`.

### Como adicionar um novo tema
1) Em `style.css`, adicione uma nova classe `body.theme-nome` definindo os tokens `--color-*` (siga o padrao dos temas existentes).
2) Se precisar de uma nova cor base, inclua no bloco `:root` como `--palette-nome`.
3) Em `app.js`, inclua o novo tema no seletor de cores do perfil.

## Gamificacao
### Pontos
- Missao diaria concluida: +25 pontos
- Corrida registrada: +10 pontos por km (limite diario de 120 pontos)
- Treino concluido: +50 pontos (1x por missao)
- Peso registrado: +5 pontos
- Penalidade diaria por missao nao concluida: -10 pontos (aplica 1x por dia)

### Ranks
- Sistema de ranks: E, D, C, B, A, S
- Cada rank tem 5 subniveis (1 a 5)
- Cada subnivel = 500 pontos (2.500 pontos por rank)
- Exemplo: E1 (0-499), E2 (500-999) ... E5 (2000-2499), D1 (2500-2999) ate S5

### Streak e Missoes Diarias
- Um dia conta como ativo se pelo menos 1 missao diaria for concluida.
- Se hoje e ativo e ontem foi ativo, o streak aumenta.
- Se um dia passa sem atividade, o streak volta para 0.
- Missoes diarias resetam automaticamente na virada do dia.
- Se alguma missao do dia anterior ficar pendente, aplica penalidade (-10) no dia seguinte (1x).

### Conquistas
- Conquistas sao recalculadas ao registrar corrida, treino, dieta e peso.
- Ao desbloquear, aparece popup de conquista e pontos de recompensa.

## Speed: Historico de Corridas
- Registre corridas manualmente com data/hora, distancia e tempo.
- O sistema calcula ritmo e velocidade media.
- Filtros por periodo (7/30/90 dias), distancia minima e ordenacao.
- Resumo do periodo: total km, melhor ritmo, melhor velocidade.
- Exportacao/Importacao via JSON com validacao.
- Dados salvos localmente em `localStorage` (chave `soufit_runs_v1`).

## QA Checklist
### Mobile
- Menu inferior fixo funcional (Dashboard, Treinos, Speed, Status, Perfil).
- Botao "Mais" abre o menu lateral e permite acessar Dieta.
- Nenhum overflow horizontal; cards e tabelas se ajustam em largura total.
- Alvos de toque com tamanho minimo adequado.
- Formularios e modais acessiveis no teclado (Tab) e foco visivel.
- Speed: mapa carrega, tracking inicia/pausa/finaliza, historico salva e lista.

### Desktop
- Sidebar e navbar alinhados, sem sobreposicao.
- Navegacao por hash funciona em todas as abas.
- Tabelas com layout tradicional e sem quebra de alinhamento.
- Speed: mapa carrega, tracking inicia/pausa/finaliza, historico salva e lista.

## Lighthouse (Chrome)
### Desktop
1) Abra a pagina no Chrome.
2) F12 -> Lighthouse.
3) Mode: Navigation, Device: Desktop.
4) Clique em "Analyze page load".

### Mobile
1) Abra a pagina no Chrome.
2) F12 -> Lighthouse.
3) Mode: Navigation, Device: Mobile.
4) Clique em "Analyze page load".
