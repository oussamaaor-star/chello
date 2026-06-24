import { Resend } from 'resend';

function escapeHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function allowedHosts() {
  const hosts = ['localhost', '127.0.0.1'];
  try {
    if (process.env.SITE_URL) hosts.push(new URL(process.env.SITE_URL).host);
  } catch {}
  hosts.push('chello-nine.vercel.app');
  return hosts;
}

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

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60_000;
const ipHits = new Map();

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

  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: 'Unauthorized origin' });
  }

  if (isRateLimited(req)) {
    return res.status(429).json({ error: 'Too many requests, try again later' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(200).json({ sent: false, reason: 'missing_api_key' });

  const { name, email } = req.body ?? {};
  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'email required' });
  }
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (name != null && (typeof name !== 'string' || name.length > 100)) {
    return res.status(400).json({ error: 'Invalid name' });
  }

  const firstName = (name || 'Customer').split(' ')[0];

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"><title>مرحباً بك في Chello</title></head>
<body style="margin:0;padding:0;background:#faf8f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr>
          <td style="background:#18140f;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;font-size:28px;color:#faf8f4;font-weight:700;letter-spacing:0.12em;font-style:italic;font-family:Georgia,serif;">Chello</h1>
            <p style="margin:6px 0 0;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#b8915a;">WOMEN'S FASHION</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:40px;">
            <p style="font-size:22px;color:#18140f;margin:0 0 8px;font-weight:300;">مرحباً، <strong>${escapeHtml(firstName)}</strong> 🌸</p>
            <p style="font-size:14px;color:#4a443c;line-height:1.7;margin:0 0 28px;">
              تم إنشاء حسابك بنجاح. أنت الآن جزء من عائلة
              <strong style="color:#18140f;">Chello</strong> — أزياء نسائية أنيقة توصل لكل عُمان.
            </p>
            <div style="background:#faf8f4;border:1px solid #f1ece2;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
              <p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#b8915a;">ما ينتظرك</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:6px 0;font-size:14px;color:#4a443c;">👗 &nbsp;عبايات، ملابس جاهزة، شنط وأحذية</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#4a443c;">💵 &nbsp;الدفع عند الاستلام</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#4a443c;">📦 &nbsp;توصيل سريع في كل عُمان</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#4a443c;">🎁 &nbsp;برنامج ولاء بمكافآت</td></tr>
              </table>
            </div>
            <div style="text-align:center;margin-bottom:28px;">
              <a href="https://chello-nine.vercel.app/catalogue"
                 style="display:inline-block;background:#18140f;color:#faf8f4;padding:14px 32px;border-radius:24px;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.02em;">
                استكشفي المجموعة ←
              </a>
            </div>
            <p style="font-size:13px;color:#4a443c;text-align:center;margin:0;">
              أسئلة؟ تواصلي معنا عبر واتساب.<br/>
              <strong style="color:#18140f;">Chello</strong>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f1ece2;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#4a443c;letter-spacing:0.1em;text-transform:uppercase;">
              © 2026 Chello · Women's Fashion · Muscat, Oman
            </p>
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
      to:      [email],
      subject: `مرحباً بك في Chello، ${escapeHtml(firstName)} 🌸`,
      html,
    });

    if (error) {
      console.error('[WelcomeEmail] Error:', error);
      return res.status(200).json({ sent: false, reason: error.message });
    }

    console.log(`[WelcomeEmail] ✓ Email sent → ${email}`);
    return res.status(200).json({ sent: true });

  } catch (err) {
    console.error('[WelcomeEmail] Exception:', err.message);
    return res.status(200).json({ sent: false, reason: err.message });
  }
}
