import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SW_PATH = path.join(__dirname, '../public/sw.js');

try {
  let content = fs.readFileSync(SW_PATH, 'utf8');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const newVersion = `1.0.0-${timestamp}`;
  
  // Regex to match: const VERSION = '...'
  const versionRegex = /const VERSION = ['"`](.*)['"`]/;
  
  if (versionRegex.test(content)) {
    content = content.replace(versionRegex, `const VERSION = '${newVersion}'`);
    fs.writeFileSync(SW_PATH, content);
    console.log(`✅ Service Worker version updated to: ${newVersion}`);
  } else {
    console.error('❌ Could not find VERSION constant in sw.js');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error updating Service Worker version:', error);
  process.exit(1);
}
