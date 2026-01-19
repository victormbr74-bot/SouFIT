# SouFIT Tools

Scripts auxiliares que rodam via Node/`ts-node` e usam o core compartilhado.

## Setup

```
cd tools
npm install
```

## Scripts disponíveis

- `npm run migrate:web -- <arquivo.json>`: normaliza exports do web (runs, metadata etc.) e imprime resumo pronto para ser importado no mobile.
- `npm run validate:imports -- <snapshot.json>`: valida chaves em um snapshot legado (usando os helpers de storage do core).
- `npm run simulate:days -- <dias> [dataInicial]`: simula streaks, missões e penalidades para o período fornecido (padrão 7 dias começando em hoje).

Os scripts são TS e aproveitam os helpers de `packages/core`. Basta rodar o comando acima e seguir as instruções no console.
