// ─── Logging ──────────────────────────────────────────────────────────────────
export function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }
export function warn(msg) { console.warn(`[${new Date().toISOString()}] ⚠️  ${msg}`); }
export function error(msg) { console.error(`[${new Date().toISOString()}] ❌  ${msg}`); }
