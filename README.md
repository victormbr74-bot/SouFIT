# SouFIT Monorepo

Monorepo offline-first com foco em Web (GitHub Pages) + Mobile Expo + um core Node/TypeScript compartilhado para regras de negócio, migrações e QA.

## Estrutura
- `apps/web`: cópia da aplicação web atual (HTML/CSS/JS). Mantém compatibilidade com o GitHub Pages e as chaves de `localStorage` já existentes.
- `apps/mobile`: aplicação Expo + TypeScript com navegação por abas e acesso imediato ao `@soufit/core`.
- `packages/core`: regras puras de pontos, streak, missões, corridas, rank e peso. Sem dependências do DOM ou APIs nativas.
- `tools`: scripts Node para validar imports, migrar snapshots e simular dias usando o core.

## Começando
1. `npm run bootstrap` — instala dependências em todos os workspaces (`apps/*`, `packages/*`, `tools`).
2. `npm run build` — compila todos os pacotes TypeScript (`packages/core` e scripts de ferramentas).
3. `npm run test` — executa a suíte que está nos workspaces que implementarem `test`.

## Web (apps/web)
- Use `apps/web/index.html` no GitHub Pages; todo o front depende de `app.js`/`style.css` e `src/` para scripts legados.
- Não refatore tudo de uma vez: preserve os assets originais e, sempre que possível, integre com o core em arquivos novos (ex: adaptadores de storage).

## Mobile (apps/mobile)
- Aplicação Expo com TypeScript. Execute `npm run start` dentro de `apps/mobile`.
- Consome `@soufit/core` diretamente via paths do workspace; o estado deve ser persistido em `AsyncStorage`.

## Core (packages/core)
- `npm run build` gera `dist/` com CommonJS + declarações.
- Exporta helpers para datas, missões, streaks, pontos, runs, achievements, peso e storage.
- Regras críticas como pedidos de reset semanal/mensal e prevenção de exploits precisam evoluir aqui.

## Ferramentas (tools)
- `npm run validate:import -- <snapshot.json>` identifica chaves reconhecidas no JSON.
- `npm run migrate:storage -- <snapshot.json> [output.json]` atualiza um snapshot legado para a versão v3, registrando metadados.
- `npm run simulate:days -- <dias> [dataInicial]` simula reconciliações de missões + streaks para QA dos ciclos.

## Próximos passos
- Evoluir o `packages/core` com os ciclos automáticos (reset semanal, prompt mensal), regras de pontuação e sanitização de corridas importadas.
- Implementar adaptadores de storage na web (localStorage) e mobile (AsyncStorage) para usar plenamente o core.
- Garantir consistência do tema global e documentar os ganchos de validação/migração.
