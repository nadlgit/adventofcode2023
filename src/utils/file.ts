import { createReadStream, existsSync, readFileSync } from 'fs';
import { basename, dirname, join } from 'path';
import { createInterface } from 'readline';

export const puzzleFilename = 'puzzle-input.txt';

export function getInputLines(filename: string) {
  const filepath = makeFilePath(filename);
  return readFileSync(filepath).toString().replaceAll('\r', '').split('\n');
}

export function getInputReadlineInterface(filename: string) {
  const filepath = makeFilePath(filename);
  return createInterface({ input: createReadStream(filepath) });
}

const makeFilePath = (filename: string) => {
  const dayDir = require.main ? basename(dirname(require.main.filename)) : '';
  const filepath =
    filename === puzzleFilename
      ? join('data', '2023', dayDir, puzzleFilename)
      : join('src', dayDir, filename);
  if (!existsSync(filepath)) {
    console.error(`File "${filepath}" not found`);
    process.exit(1);
  }
  return filepath;
};
