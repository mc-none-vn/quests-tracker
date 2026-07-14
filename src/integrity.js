// ─── Integrity (shared between sign.js & verify.js) ──────────────────────────
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

export const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, '..');
export const ORIGIN = 'mc-none-vn/quests-tracker';

export const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAClSe8EJf/+7yzEtfBx9AU5a+9GnbTOvJjaKt9fl8COQ=
-----END PUBLIC KEY-----`;

export const PROTECTED_DIRS = ['.github', 'assets', 'src'];
export const EXCLUDE = new Set([
    'signature.json',
    'state.json',
    'state.tmp.json',
    'package-lock.json',
]);

export function walkDir(absDir, relBase = '') {
    const results = [];
    if (!fs.existsSync(absDir)) return results;
    const entries = fs.readdirSync(absDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
        const relPath  = relBase ? `${relBase}/${entry.name}` : entry.name;
        const fullPath = path.join(absDir, entry.name);
        if (entry.isDirectory()) results.push(...walkDir(fullPath, relPath));
        else if (entry.isFile() && !EXCLUDE.has(entry.name)) results.push({ relPath, fullPath });
    }; return results;
}

export function collectFiles() {
    const files = [];
    for (const dir of PROTECTED_DIRS) {
        files.push(...walkDir(path.join(ROOT, dir), dir));
    }; return files;
}

export function computeFileHash(files) {
    const hash = crypto.createHash('sha256');
    for (const { relPath, fullPath } of files) {
        hash.update(`${relPath}\n`);
        hash.update(fs.readFileSync(fullPath));
        hash.update('\n');
    }; return hash.digest();
}
