# SouFIT Mobile (Expo + React Native)

## Como rodar

- `cd mobile && npm install` para instalar as dependências.
- `npm start` (ou `npm run android` / `npm run ios`) para abrir o app no Expo Go ou emulador.
- A aplicação já vem com navegação por tabs, tema dinâmico e componentes globais reutilizáveis (cards, badges, barras de progresso, etc.).

## Estrutura do projeto

- `/src/navigation`: stack + navigator para as abas principais e telas auxiliares.
- `/src/screens`: as telas solicitadas (Dashboard, Treinos, Speed, Status, Perfil, Dieta e Configurações) organizadas por finalidade.
- `/src/components`: cards, badges, progress bars, emty states e modal sheets estilizados pelo tema.
- `/src/theme`: provedor de tema global, tokens e lista de skins (Azul, Roxo, Vermelho, Verde).
- `metro.config.js` + `babel.config.js`: registram o alias `@soufit/core` e incluem a pasta `packages/core` para o bundler Expo.

## Core compartilhado

Toda a lógica de regras de pontos, ranks, streak, missões e conquistas vive em `packages/core/src`. O mobile consome esse núcleo via o alias `@soufit/core` (veja `tsconfig.json` e `babel.config.js`). Módulos como `points`, `runs`, `missions`, `staking` e `achievements` não dependem de DOM nem APIs nativas.

## Regras principais

- **Pontos**: missão = +25, treino = +50, corrida = +10/km com cap diário de 120, peso = +5, penalidade diária = -10.
- **Ranks**: letras E→S com 5 subníveis de 500 pontos cada; `@soufit/core/src/ranks.ts` calcula progresso e thresholds.
- **Streak**: qualquer atividade ativa um dia; o rastreamento chama `registerDailyActivity`.
- **Missões**: reset diário com penalidade caso haja missões pendentes; veja `reconcileDailyQuests`.
- **Achievments**: recalculados sempre que novas atividades são registradas (`computeAchievementProgress`).

## Importação/exportação

O app mobile terá botões de importação/exportação na tela de Configurações, mas a primeira versão usa os scripts Node em `/tools`:

- `cd tools && npm install` (só na primeira vez).
- `npm run migrate:storage -- ../caminho/do/exportado.json [output.json]` para atualizar o snapshot legado para v3.
- `npm run validate:import -- ./snapshot.json` para checar um snapshot JSON antes de importar.
- `npm run simulate:days -- 7 2025-01-01` para simular streaks e missões em um período.

Esses scripts usam `ts-node` e consomem o core compartilhado; você pode adaptá-los para persistir em AsyncStorage/SQLite ou gerar um dump JSON para importar dentro do app.

## Próximos passos

1. Conectar os módulos de `packages/core` com os armazenamentos do mobile (AsyncStorage) e preencher as telas com dados reais.
2. Implementar import/export dentro do app usando o mesmo formato JSON que os scripts validam.
3. Estender o simulador para processar runs/workouts reais e atualizar badge/status.
