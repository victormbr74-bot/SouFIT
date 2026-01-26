# SouFIT Tools

Scripts auxiliares que executam `ts-node` e consomem o `@soufit/core`, ajudando a validar snapshots e testar regras off-line.

## Setup

```
cd tools
npm install
```

## Scripts disponíveis

- `npm run migrate:storage -- <snapshot.json> [output.json]`: atualiza o `soufit_storage_version` para v3, adiciona metadados de migração e grava um novo snapshot preparado para o core compartilhado.
- `npm run validate:import -- <snapshot.json>`: lista chaves reconhecidas pelo core e alerta quando houver entradas inesperadas no backup.
- `npm run simulate:days -- <dias> [dataInicial]`: simula múltiplos dias reconciliando streak/missões e imprimindo quando penalidades semanais ou resetes ocorrerem.

Os scripts confiam em `tsconfig-paths` para resolver o alias `@soufit/core`, portanto execute-os por dentro da pasta `tools` e passe os parâmetros depois de `--` como nos exemplos acima.
