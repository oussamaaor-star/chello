import { Resend } from 'resend';

function escapeHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// POST /api/notify-stock-interest
// Notifies admin when a customer leaves their number for an out-of-stock product.

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

  const { phone, productName } = req.body ?? {};
  // ── Field validation (types, presence, lengths) ──
  if (typeof phone !== 'string' || typeof productName !== 'string') {
    return res.status(400).json({ error: 'phone and productName required' });
  }
  if (!phone.trim() || !productName.trim()) {
    return res.status(400).json({ error: 'phone and productName required' });
  }
  if (productName.length > 200) {
    return res.status(400).json({ error: 'productName too long' });
  }

  if (!/^\+?[0-9\s\-]{6,15}$/.test(phone.trim())) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[StockInterest] RESEND_API_KEY missing');
    return res.status(200).json({ sent: false, reason: 'missing_api_key' });
  }

  const waLink = `https://wa.me/${phone.replace(/^\+/, '').replace(/^0/, '968')}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#faf9f7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

        <tr>
          <td style="background:#1c1917;border-radius:16px 16px 0 0;padding:24px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#d97706;">Chello</p>
            <h1 style="margin:0;font-size:20px;color:#fff;font-weight:400;">🔔 New Product Interest</h1>
          </td>
        </tr>

        <tr>
          <td style="background:#fff;padding:28px 32px;">
            <p style="margin:0 0 20px;font-size:14px;color:#57534e;line-height:1.6;">
              A customer wants to be contacted when the following product is available:
            </p>

            <div style="background:#fef9ee;border:1px solid #fcd34d;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#92400e;">Product</p>
              <p style="margin:0;font-size:17px;font-weight:700;color:#1c1917;">${escapeHtml(productName)}</p>
            </div>

            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#166534;">WhatsApp Number</p>
              <p style="margin:0;font-size:20px;font-weight:700;color:#15803d;">${escapeHtml(phone)}</p>
            </div>

            <a href="${waLink}?text=${encodeURIComponent(`Hello! The product "${productName}" is back in stock at Chello 🌟 You can order here: https://chello-nine.vercel.app`)}"
               style="display:block;text-align:center;background:#25D366;color:#fff;padding:14px 24px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;">
              📲 Contact on WhatsApp
            </a>
          </td>
        </tr>

        <tr>
          <td style="background:#f5f0e8;border-radius:0 0 16px 16px;padding:14px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#a8a29e;">Chello · Admin Dashboard</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const resend    = new Resend(apiKey);
    const fromEmail = process.env.EMAIL_FROM || 'Chello <onboarding@resend.dev>';

    const { error } = await resend.emails.send({
      from:    fromEmail,
      to:      [process.env.SHOP_EMAIL ?? 'contact.chello.om@gmail.com'],
      subject: `🔔 Product Interest: ${productName} — ${phone}`,
      html,
    });

    if (error) {
      console.error('[StockInterest] Resend error:', error);
      return res.status(200).json({ sent: false, reason: error.message });
    }

    console.log(`[StockInterest] ✓ Admin notification for ${productName} (${phone})`);
    return res.status(200).json({ sent: true });

  } catch (err) {
    console.error('[StockInterest] Exception:', err.message);
    return res.status(200).json({ sent: false, reason: err.message });
  }
}
