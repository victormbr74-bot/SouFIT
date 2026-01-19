import { promises as fs } from 'fs';
import path from 'path';

import {
  shouldMigrateKey,
  STORAGE_VERSION_KEY,
  STORAGE_VERSION
} from '@soufit/core';

const [,, inputPath, outputPath] = process.argv;

if (!inputPath) {
  console.error('Usage: npm run migrate:storage -- <snapshot.json> [output.json]');
  process.exit(1);
}

async function main() {
  const absoluteInput = path.resolve(process.cwd(), inputPath);
  const raw = await fs.readFile(absoluteInput, 'utf-8');
  const snapshot = JSON.parse(raw);
  const beforeVersion = snapshot[STORAGE_VERSION_KEY] || 'unknown';
  const targetVersion = 'soufit_v3';
  const recognizedKeys = Object.keys(snapshot).filter(shouldMigrateKey);
  const unknownKeys = Object.keys(snapshot).filter(key => !shouldMigrateKey(key));

  const migratedSnapshot = {
    ...snapshot,
    [STORAGE_VERSION_KEY]: targetVersion,
    soufit_migration_meta: {
      from: beforeVersion,
      to: targetVersion,
      originalVersion: beforeVersion,
      migratedAt: new Date().toISOString(),
      legacyStorageVersion: STORAGE_VERSION
    }
  };

  const finalOutputPath = outputPath
    ? path.resolve(process.cwd(), outputPath)
    : path.resolve(
        path.dirname(absoluteInput),
        `migrated-${path.basename(absoluteInput)}`
      );

  await fs.writeFile(finalOutputPath, JSON.stringify(migratedSnapshot, null, 2), 'utf-8');

  console.log(`De ${beforeVersion} -> ${targetVersion} (${STORAGE_VERSION_KEY})`);
  console.log('Recognized legacy keys:', recognizedKeys.length ? recognizedKeys.join(', ') : 'Nenhum');
  if (unknownKeys.length) {
    console.warn('Chaves sem regra de migração:', unknownKeys.join(', '));
  }
  console.log('Resultados gravados em', finalOutputPath);
}

main().catch(error => {
  console.error('Falha na migração de storage:', error);
  process.exit(1);
});
