import { execSync } from 'child_process';
import { existsSync } from 'fs';

const scriptPath = `src/${process.argv[2]}/script.js`;
if (existsSync(scriptPath)) {
  execSync(`node ${scriptPath}`, { stdio: 'inherit' });
} else {
  console.log(`File "${scriptPath}" not found`);
}
