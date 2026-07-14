// ─── Config ──────────────────────────────────────────────────────────────────
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import path from 'path';

config();
export const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, '..');
export const LANG_FOLDER = path.join(__dirname, 'languages');

function parseArgs() {
    const args = process.argv.slice(2);
    const result = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].slice(2);
            result[key] = args[i + 1] ?? true;
            i++;
        }
    }
    return result;
}

const args = parseArgs();
const STATE_DIR = args['state-dir'] || process.env.STATE_DIR || ROOT;
export const STATE_FILE = path.join(STATE_DIR, 'state.json');
export const STATE_TMP  = path.join(STATE_DIR, 'state.tmp.json'); 

export const TOKEN = args['token'] || process.env.DISCORD_TOKEN;
export const WEBHOOK = args['webhook'] || process.env.MAIN_WEBHOOK;
export const PING_ROLE = args['ping-role'] || process.env.PING_ROLE_ID;
export const REPOSITORY = args['repository'] || process.env.REPOSITORY;
export const ERR_WEBHOOK = args['error-webhook'] || process.env.ERROR_WEBHOOK;
export const GITHUB_TOKEN = args['github-token'] || process.env.GITHUB_TOKEN;
export const LOCALE = args['locale'] || process.env.LOCALE || 'en-US';
export const SIGN_KEY  = args['sign-key']  || process.env.SIGN_KEY;
