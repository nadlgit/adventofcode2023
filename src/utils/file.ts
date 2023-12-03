import { createReadStream, readFileSync } from 'fs';
import { basename, dirname, join } from 'path';
import { createInterface } from 'readline';

const scriptDir = join('src', require.main ? basename(dirname(require.main.filename)) : '');

export function getInputLines(filename: string) {
  const filepath = join(scriptDir, filename);
  return readFileSync(filepath).toString().replaceAll('\r', '').split('\n');
}

export function getInputReadlineInterface(filename: string) {
  const filepath = join(scriptDir, filename);
  return createInterface({ input: createReadStream(filepath) });
}
