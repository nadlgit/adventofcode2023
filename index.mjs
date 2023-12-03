import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const dayDir = process.argv[2];
if (!dayDir) {
  console.error('Directory argument not provided (example: day01)');
  process.exit(1);
}
const scriptPath = join('dist', dayDir, 'script.js');
if (!existsSync(scriptPath)) {
  console.error(`File "${scriptPath}" not found`);
  process.exit(1);
}
execSync(`node ${scriptPath}`, { stdio: 'inherit' });
