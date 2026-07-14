// ─── Sign — chạy bởi workflow sau mỗi lần push ───────────────────────────────
import { ROOT, ORIGIN, collectFiles, computeFileHash } from './integrity.js';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

const SIGN_KEY = process.env.SIGN_KEY;
if (!SIGN_KEY) {
    console.error('❌  SIGN_KEY (private key) không tìm thấy trong env.');
    console.error('    Chỉ chủ repo mới có thể ký. Thêm vào GitHub Secrets.');
    process.exit(1);
}

let privateKey; try {
    privateKey = crypto.createPrivateKey(SIGN_KEY);
} catch (err) {
    console.error('❌  SIGN_KEY không hợp lệ:', err.message);
    process.exit(1);
}

const files = collectFiles();
const fileHash = computeFileHash(files);

const sigBuffer = crypto.sign(null, fileHash, privateKey);
const sigBase64 = sigBuffer.toString('base64');

const signature = {
    origin: ORIGIN,
    signed_at: new Date().toISOString(),
    file_count: files.length,
    files: files.map(f => f.relPath),
    signature: sigBase64,
};

fs.writeFileSync(path.join(ROOT, 'signature.json'), JSON.stringify(signature, null, 2) + '\n', 'utf8');
console.log(`✅  Đã ký ${files.length} file bằng Ed25519.`);
console.log(`    Signature: ${sigBase64.slice(0, 24)}...`);
