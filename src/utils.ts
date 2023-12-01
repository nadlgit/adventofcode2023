import { createReadStream, readFileSync } from 'fs';
import { createInterface } from 'readline';

export function getInputLines(filepath: string) {
  return readFileSync(filepath).toString().replaceAll('\r', '').split('\n');
}

export function getInputReadlineInterface(filepath: string) {
  return createInterface({ input: createReadStream(filepath) });
}
