// ─── Verify — chạy ở đầu main.js trước mọi thứ khác ─────────────────────────
import { ROOT, ORIGIN, PUBLIC_KEY, collectFiles, computeFileHash } from './integrity.js';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

async function sendAlert(message, { webhook, errWebhook }) {
    const url = errWebhook || webhook;
    if (!url) { console.error('[INTEGRITY ALERT]', message); return; }
    const body = JSON.stringify({
        embeds: [{
            title: '🚨 Phát hiện hành vi trái phép!',
            description: message,
            color: 0xED4245,
            timestamp: new Date().toISOString(),
            footer: { text: `quests-tracker • Integrity Guard • ${ORIGIN}` },
        }],
    });

    for (const target of [url, url !== webhook ? webhook : null].filter(Boolean)) {
        try {
            const res = await fetch(target, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
            }); if (res.ok) return;
        } catch { /* continue */ }
    }; console.error('[INTEGRITY ALERT — webhook thất bại]', message);
}

async function checkLineage(repository, githubToken, origin) {
    try {
        const res = await fetch(`https://api.github.com/repos/${repository}`, {
            headers: { Authorization: `token ${githubToken}`, 'User-Agent': 'quests-tracker-integrity' },
        }); if (!res.ok) return 'unknown';
        const info = await res.json();
        if (info.full_name === origin) return 'original';
        if (info.fork && info.parent?.full_name === origin) return 'valid_fork';
        return 'invalid';
    } catch { return 'unknown'; }
}

export async function verifyIntegrity({ repository, githubToken, webhook, errWebhook }) {
    const ctx = { webhook, errWebhook };
    const SIG_FILE = path.join(ROOT, 'signature.json');

    if (!fs.existsSync(SIG_FILE)) {
        await sendAlert('`signature.json` không tìm thấy — file bị xóa hoặc chưa được tạo.\nHệ thống bị ngắt để bảo vệ tính toàn vẹn.', ctx);
        return false;
    }

    let sig; try {
        sig = JSON.parse(fs.readFileSync(SIG_FILE, 'utf8'));
    } catch {
        await sendAlert('`signature.json` bị hỏng hoặc không đọc được JSON.\nHệ thống bị ngắt.', ctx);
        return false;
    }

    if (!sig.signature || !sig.origin || !sig.files) {
        await sendAlert('`signature.json` thiếu trường bắt buộc.\nHệ thống bị ngắt.', ctx);
        return false;
    }

    if (repository && githubToken) {
        const lineage = await checkLineage(repository, githubToken, sig.origin);
        if (lineage === 'invalid') {
            await sendAlert(`**Phát hiện sao chép trái phép!**\n\nRepository \`${repository}\` không phải bản gốc cũng không phải fork hợp lệ của \`${sig.origin}\`.\n\nVui lòng **fork** từ <https://github.com/${sig.origin}> thay vì tải về rồi upload lại.\nHệ thống đã bị ngắt.`, ctx);
            return false;
        }
    }

    const files = collectFiles();
    const fileHash = computeFileHash(files);
    const sigBuf = Buffer.from(sig.signature, 'base64');

    let valid = false; try {
        const pubKey = crypto.createPublicKey(PUBLIC_KEY);
        valid = crypto.verify(null, fileHash, pubKey, sigBuf);
    } catch (err) {
        await sendAlert(`Lỗi khi xác minh chữ ký Ed25519: ${err.message}\nHệ thống bị ngắt.`, ctx);
        return false;
    }

    if (!valid) {
        await sendAlert(`**Phát hiện chỉnh sửa file trái phép!**\n\nChữ ký Ed25519 không hợp lệ. Một hoặc nhiều file trong \`.github/\`, \`assets/\`, \`src/\` đã bị **thay đổi mà chưa được ký lại**.\n\nNếu bạn vừa cập nhật code, hãy chạy workflow **🔐 Sign Repository** để ký lại.\nRepo gốc: <https://github.com/${sig.origin}>\nHệ thống đã bị ngắt.`, ctx);
        return false;
    }

    console.log(`✅  Integrity OK — ${files.length} file, Ed25519 hợp lệ.`);
    return true;
}
