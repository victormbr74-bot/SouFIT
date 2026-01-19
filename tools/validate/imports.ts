import { promises as fs } from 'fs';
import path from 'path';

import { shouldMigrateKey } from '@soufit/core';

const [,, inputPath] = process.argv;

if (!inputPath) {
  console.error('Usage: npm run validate:imports -- <snapshot.json>');
  process.exit(1);
}

async function validate() {
  const absolute = path.resolve(process.cwd(), inputPath);
  const raw = await fs.readFile(absolute, 'utf-8');
  const payload = JSON.parse(raw);
  const keys = Object.keys(payload);
  const legacy = keys.filter(key => shouldMigrateKey(key));
  const unknown = keys.filter(key => !shouldMigrateKey(key));

  console.log('Snapshot keys:', keys.length);
  console.log('Recognized legacy keys:', legacy.join(', ') || 'Nenhum');
  if (unknown.length) {
    console.warn('Chaves não reconhecidas:', unknown.join(', '));
  } else {
    console.log('Todas as chaves parecem válidas.');
  }
}

validate().catch(error => {
  console.error('Erro ao validar o snapshot:', error);
  process.exit(1);
});
