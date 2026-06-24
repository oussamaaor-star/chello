import { Resend } from 'resend';

function escapeHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ─── POST /api/send-contact-email ─────────────────────────────────────────────
// Receives the contact form and sends an email to the shop address.

// ─── Allowed hosts whitelist (Origin / Referer) ─────────────────────────────
function allowedHosts() {
  const hosts = ['localhost', '127.0.0.1'];
  try {
    if (process.env.SITE_URL) hosts.push(new URL(process.env.SITE_URL).host);
  } catch { /* malformed SITE_URL → ignored */ }
  hosts.push('chello-nine.vercel.app');
  return hosts;
}

// Check that the request comes from the site (best-effort: non-browser clients
// can spoof Origin/Referer, this is not a strong guarantee).
function isAllowedOrigin(req) {
  const allowed = allowedHosts();
  const candidates = [req.headers.origin, req.headers.referer].filter(Boolean);
  if (candidates.length === 0) return false;
  return candidates.some((value) => {
    try {
      const host = new URL(value).hostname;
      return allowed.some((h) => host === h || host.endsWith(`.${h}`));
    } catch {
      return false;
    }
  });
}

// ─── In-memory IP throttle (best-effort) ──────────────────────────────────────
// Best-effort only; for robust limiting use Upstash/Vercel KV (serverless
// instances are ephemeral) — the Map is reset on each cold start and
// not shared across concurrent instances.
const RATE_LIMIT_MAX = 5;          // max requests
const RATE_LIMIT_WINDOW = 60_000;  // per 60 s window
const ipHits = new Map();          // ip -> number[] (timestamps)

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(req) {
  const ip = getClientIp(req);
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW);
  hits.push(now);
  ipHits.set(ip, hits);
  return hits.length > RATE_LIMIT_MAX;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── CORS: restricted to site origin ──────────────────────────────────────────
function applyCors(req, res) {
  const allowed = [
    process.env.SITE_URL,
    'https://chello-nine.vercel.app',
  ].filter(Boolean);
  const origin = req.headers.origin;
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : allowed[0]);
}

export default async function handler(req, res) {
  applyCors(req, res);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── Allowlist Origin/Referer (best-effort, spoofable outside browser) ──
  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: 'Unauthorized origin' });
  }

  // ── IP throttle ──
  if (isRateLimited(req)) {
    return res.status(429).json({ error: 'Too many requests, please try again later' });
  }

  const { name, email, message, website, _gotcha } = req.body ?? {};

  // ── Honeypot: bots fill hidden fields ──
  // Respond 200 without sending so the bot doesn't know it was filtered.
  if ((typeof website === 'string' && website.trim()) ||
      (typeof _gotcha === 'string' && _gotcha.trim())) {
    return res.status(200).json({ sent: true });
  }

  // ── Field validation (types, presence, lengths, email format) ──
  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return res.status(400).json({ error: 'name, email and message required' });
  }
  if (!name.trim() || !email.trim() || !message.trim()) {
    return res.status(400).json({ error: 'name, email and message required' });
  }
  if (name.length > 100 || email.length > 254 || message.length > 4000) {
    return res.status(400).json({ error: 'Field too long' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Contact] RESEND_API_KEY missing');
    return res.status(200).json({ sent: false, reason: 'missing_api_key' });
  }

  const fromEmail = process.env.EMAIL_FROM || 'Chello <onboarding@resend.dev>';
  const toEmail   = process.env.SHOP_EMAIL ?? 'contact.chello.om@gmail.com';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>New Contact Message</title></head>
<body style="margin:0;padding:0;background:#faf9f7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <tr>
          <td style="background:#1c1917;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
            <p style="margin:0 0 4px;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#d97706;">Chello</p>
            <h1 style="margin:0;font-size:20px;color:#fff;font-weight:400;">📩 New Contact Message</h1>
          </td>
        </tr>

        <tr>
          <td style="background:#fff;padding:32px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:16px;border-bottom:1px solid #f0ece4;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a8a29e;">From</p>
                  <p style="margin:0;font-size:15px;font-weight:600;color:#1c1917;">${escapeHtml(name)}</p>
                  <a href="mailto:${escapeHtml(email)}" style="font-size:13px;color:#d97706;text-decoration:none;">${escapeHtml(email)}</a>
                </td>
              </tr>
              <tr>
                <td style="padding-top:20px;">
                  <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a8a29e;">Message</p>
                  <p style="margin:0;font-size:14px;color:#1c1917;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="background:#f5f0e8;border-radius:0 0 16px 16px;padding:16px 36px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#a8a29e;">
              Reply directly to <a href="mailto:${escapeHtml(email)}" style="color:#d97706;">${escapeHtml(email)}</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from:     fromEmail,
      to:       [toEmail],
      replyTo:  email,
      subject:  `📩 Message from ${escapeHtml(name)} — Chello`,
      html,
    });

    if (error) {
      console.error('[Contact] Resend error:', error);
      return res.status(200).json({ sent: false, reason: error.message });
    }

    console.log(`[Contact] ✓ Message from ${email} forwarded to ${toEmail}`);
    return res.status(200).json({ sent: true });

  } catch (err) {
    console.error('[Contact] Exception:', err.message);
    return res.status(200).json({ sent: false, reason: err.message });
  }
}
