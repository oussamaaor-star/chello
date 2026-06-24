import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// ─── POST /api/send-stock-alert ───────────────────────────────────────────────
// Called from admin when a product's stock goes from 0 → available.
// Sends an email to all subscribers and marks notified_at.

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

  // ── Authentication: CRON_SECRET or Supabase admin JWT ─────────────────────
  // Accepts either the CRON secret (server/cron call) or a Supabase access
  // token belonging to a user with profiles.role === 'admin'.
  // (Pattern aligned with supabase/functions/send-status-email/index.ts.)
  const authHeader = req.headers['authorization'] ?? '';
  const bearer     = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  const resendKey    = process.env.RESEND_API_KEY;
  const supabaseUrl  = process.env.VITE_SUPABASE_URL;
  const anonKey      = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const cronSecret   = process.env.CRON_SECRET ?? '';
  const siteUrl      = process.env.SITE_URL || 'https://chello-nine.vercel.app';
  const fromEmail    = process.env.EMAIL_FROM || 'Chello <onboarding@resend.dev>';

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Missing Supabase config' });
  }

  if (!bearer) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Service-role client: bypass RLS to read profiles + stock_alerts.
  const supabase = createClient(supabaseUrl, serviceKey);

  // 1) Cron path: bearer matches the CRON_SECRET.
  const isCron = !!cronSecret && bearer === cronSecret;

  // 2) Admin path: verify the token as a Supabase access token, then check role.
  let isAdmin = false;
  if (!isCron) {
    if (!anonKey) {
      return res.status(500).json({ error: 'Missing Supabase config' });
    }
    try {
      const authClient = createClient(supabaseUrl, anonKey);
      const { data: { user }, error: userErr } = await authClient.auth.getUser(bearer);
      if (userErr || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: admin role required' });
      }
      isAdmin = true;
    } catch (err) {
      console.error('[StockAlert] Admin verification error:', err.message);
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  if (!isCron && !isAdmin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { product_id, product_name, product_slug } = req.body ?? {};
  if (!product_id) return res.status(400).json({ error: 'product_id required' });

  // 1. Fetch subscribers not yet notified
  const { data: alerts, error: fetchErr } = await supabase
    .from('stock_alerts')
    .select('id, email')
    .eq('product_id', product_id)
    .is('notified_at', null);

  if (fetchErr) {
    console.error('[StockAlert] Error:', fetchErr.message);
    return res.status(500).json({ error: 'Server error' });
  }

  if (!alerts?.length) {
    return res.status(200).json({ sent: 0, message: 'No subscribers to notify' });
  }

  if (!resendKey) {
    console.warn('[StockAlert] RESEND_API_KEY missing');
    return res.status(200).json({ sent: 0, reason: 'missing_api_key' });
  }

  const resend   = new Resend(resendKey);
  const productUrl = `${siteUrl}/produit/${product_slug || product_id}`;
  const name     = product_name || 'A product you are following';

  let sentCount = 0;
  const notifiedIds = [];

  // 2. Send an email to each subscriber
  for (const alert of alerts) {
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#faf9f7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr>
          <td style="background:#1c1917;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
            <p style="margin:0 0 4px;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#d97706;">Chello</p>
            <h1 style="margin:0;font-size:22px;color:#fff;font-weight:300;">🔔 Back in Stock!</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#fff;padding:32px 36px;text-align:center;">
            <p style="font-size:15px;color:#1c1917;margin:0 0 8px;">Great news!</p>
            <p style="font-size:24px;font-weight:700;color:#1c1917;margin:0 0 8px;">${name}</p>
            <p style="font-size:14px;color:#78716c;margin:0 0 28px;">
              This product is back in stock. Don't wait — quantities are limited!
            </p>
            <a href="${productUrl}"
               style="display:inline-block;background:#f59e0b;color:#1c1917;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;">
              View Product →
            </a>
            <p style="font-size:12px;color:#a8a29e;margin-top:24px;">
              You are receiving this email because you requested to be notified when this product becomes available.<br/>
              <a href="${siteUrl}" style="color:#a8a29e;">Chello</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f5f0e8;border-radius:0 0 16px 16px;padding:16px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#a8a29e;">© 2025 Chello · Women's Fashion · Muscat, Oman</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    try {
      const { error } = await resend.emails.send({
        from:    fromEmail,
        to:      [alert.email],
        subject: `🔔 ${name} is back in stock — Chello`,
        html,
      });
      if (!error) {
        sentCount++;
        notifiedIds.push(alert.id);
      } else {
        console.warn(`[StockAlert] Error sending to ${alert.email}:`, error.message);
      }
    } catch (err) {
      console.warn(`[StockAlert] Exception for ${alert.email}:`, err.message);
    }
  }

  // 3. Mark as notified
  if (notifiedIds.length > 0) {
    await supabase
      .from('stock_alerts')
      .update({ notified_at: new Date().toISOString() })
      .in('id', notifiedIds);
  }

  console.log(`[StockAlert] ${sentCount}/${alerts.length} emails sent for ${product_id}`);
  return res.status(200).json({ sent: sentCount, total: alerts.length });
}
