# SouFIT Core (TypeScript)

O núcleo compartilhado concentra regras puras (sem DOM, APIs web ou nativas) para pontos, streak, missões, achievements, corridas e peso. Pode ser importado por apps Web, mobile e por scripts Node.

### Como usar

- `npm install` dentro de `packages/core`.
- `npm run test` para rodar o conjunto de testes unitários com Jest/ts-jest.
- `npm run build` gera `dist/` com CommonJS, pronto para ser publicado ou consumido por outra stack.

### Conteúdo key

- `dates`, `metrics`, `points`, `ranks` e `runs` replicam os cálculos existentes no app web.
- `missions`, `streak` e `achievements` mantêm as regras de streak/missões e recalculam conquistas.
- `storage.ts` expõe abstrações para snapshots e migração de chaves legadas.

Importe usando `import { registerDailyActivity } from '@soufit/core'` (no mobile, o alias aponta para `packages/core/src`).
