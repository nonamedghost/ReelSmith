import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, '..');
export const OUTPUT_DIR = path.join(ROOT_DIR, 'output');
export const ASSETS_DIR = path.join(ROOT_DIR, 'assets');

export async function ensureDirectories() {
  await fs.ensureDir(OUTPUT_DIR);
  await fs.ensureDir(ASSETS_DIR);
}
