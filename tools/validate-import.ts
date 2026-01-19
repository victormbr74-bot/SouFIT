import { promises as fs } from 'fs';
import path from 'path';

import { shouldMigrateKey } from '@soufit/core';

const [,, inputPath] = process.argv;

if (!inputPath) {
  console.error('Usage: npm run validate:import -- <snapshot.json>');
  process.exit(1);
}

async function main() {
  const absolute = path.resolve(process.cwd(), inputPath);
  const raw = await fs.readFile(absolute, 'utf-8');
  const payload = JSON.parse(raw);
  const keys = Object.keys(payload);
  const legacy = keys.filter(shouldMigrateKey);
  const unknown = keys.filter(key => !shouldMigrateKey(key));

  console.log('Snapshot keys:', keys.length);
  console.log('Recognized legacy keys:', legacy.length ? legacy.join(', ') : 'Nenhum');
  if (unknown.length) {
    console.warn('Unknown keys detected:', unknown.join(', '));
  } else {
    console.log('Todas as chaves parecem válidas.');
  }
}

main().catch(error => {
  console.error('Erro ao validar o snapshot:', error);
  process.exit(1);
});
