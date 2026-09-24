import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

for (const target of ['.next', 'tmp']) {
  fs.rmSync(path.join(projectRoot, target), { recursive: true, force: true });
}

console.log('[clean-build] Nettoyage du cache .next et tmp terminé.');
