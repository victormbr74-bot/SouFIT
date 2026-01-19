import { promises as fs } from 'fs';
import path from 'path';

import { importRunsPayload, summarizeRuns } from '@soufit/core';

const [,, inputPath] = process.argv;

if (!inputPath) {
  console.error('Uso: npm run migrate:web -- <caminho para o JSON exportado>');
  process.exit(1);
}

async function normalize() {
  const absolutePath = path.resolve(process.cwd(), inputPath);
  const raw = await fs.readFile(absolutePath, 'utf-8');
  const payload = JSON.parse(raw);
  const runsSource = payload.runs || payload.speedRuns || payload.history || [];
  const runs = importRunsPayload(runsSource);
  const summary = summarizeRuns(runs);

  const normalized = {
    runsCount: runs.length,
    totalKm: summary.totalKm,
    bestPace: summary.bestPace,
    bestSpeed: summary.bestSpeed,
    exportedAt: payload.exportedAt || payload.generatedAt || new Date().toISOString(),
    sourceKeys: Object.keys(payload)
  };

  console.log('Dados normalizados para importação no mobile:\n', JSON.stringify(normalized, null, 2));
}

normalize().catch(error => {
  console.error('Falha ao normalizar dados:', error);
  process.exit(1);
});
