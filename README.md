# SouFIT

Dashboard fitness com tema Solo Leveling. Navegacao: Dashboard, Treinos, Dieta do Cacador, Status, Speed, Perfil do Cacador.

## Como usar
- Abra o site no GitHub Pages ou rode um servidor local:
  - `python -m http.server 5500`
  - Acesse `http://localhost:5500/index.html`

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
