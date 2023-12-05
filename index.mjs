/* eslint-env node */
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const dayDir = process.argv[2];
if (!dayDir) {
  console.error('Directory argument not provided (example: day01)');
  process.exit(1);
}

const scriptNameWithoutExt = 'script';
const tsScriptPath = join('src', dayDir, scriptNameWithoutExt + '.ts');
const jsScriptPath = join('dist', dayDir, scriptNameWithoutExt + '.js');
if (!existsSync(tsScriptPath)) {
  console.error(`File "${tsScriptPath}" not found`);
  process.exit(1);
}
execSync(`tsc-watch --onSuccess "node ${jsScriptPath}"`, { stdio: 'inherit' });
