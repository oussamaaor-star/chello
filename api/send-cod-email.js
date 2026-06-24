import { Resend } from 'resend';

// ─── Escape HTML characters to prevent XSS injections ────────────────────────
function escapeHtml(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── Vercel Serverless Function ───────────────────────────────────────────────
// Route : POST /api/send-cod-email
// Sends order confirmation email for Cash-on-Delivery orders

// ⚠️  PRODUCTION WARNING — RESEND EMAIL SANDBOX
// EMAIL_FROM currently uses "onboarding@resend.dev".
// This domain is in Resend SANDBOX mode: emails are only delivered to
// verified email addresses in your Resend account (dashboard → Audiences).
// In production, you MUST:
//   1. Add and verify your own domain in Resend (e.g. contact@chello.om)
//   2. Update EMAIL_FROM in Vercel environment variables
//      e.g. EMAIL_FROM=Chello <contact@chello.om>
// While onboarding@resend.dev is used, customers will NOT receive their
// confirmation emails (unless their email is explicitly verified in Resend).

function formatPrice(amount) {
  return new Intl.NumberFormat('en-OM', { minimumFractionDigits: 3 }).format(amount) + ' OMR';
}

function shortRef(uuid) {
  return (uuid || '').replace(/-/g, '').slice(0, 8).toUpperCase();
}

function buildEmailHtml({ customerName, orderRef, orderDate, items, total, shippingCost, address }) {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #f0ece4;font-size:14px;color:#1c1917;">
        ${escapeHtml(String(item.quantity))}× ${escapeHtml(item.product_name)}${item.selected_size ? ` <span style="color:#78716c;">(${escapeHtml(item.selected_size)})</span>` : ''}
      </td>
      <td style="padding:10px 16px;border-bottom:1px solid #f0ece4;font-size:14px;color:#1c1917;text-align:right;white-space:nowrap;">
        <strong>${formatPrice(item.line_total)}</strong>
      </td>
    </tr>
  `).join('');

  const addressHtml = address
    ? `<p style="margin:0;font-size:14px;color:#57534e;line-height:1.6;">
        ${escapeHtml(address.full_name || '')}<br/>
        ${escapeHtml(address.address_line_1 || '')}<br/>
        ${escapeHtml(address.postal_code || '')} ${escapeHtml(address.city || '')}, Oman
        ${address.phone ? `<br/>📞 ${escapeHtml(address.phone)}` : ''}
      </p>`
    : '<p style="color:#78716c;font-size:14px;">Not specified</p>';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Order Confirmation</title></head>
<body style="margin:0;padding:0;background:#faf9f7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f7;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#1c1917;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#d97706;">Chello</p>
            <h1 style="margin:0;font-size:26px;color:#fff;font-weight:300;letter-spacing:0.05em;">Order Confirmed ✓</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px;">

            <p style="font-size:16px;color:#1c1917;margin:0 0 8px;">Hello <strong>${escapeHtml(customerName)}</strong>,</p>
            <p style="font-size:14px;color:#57534e;line-height:1.6;margin:0 0 28px;">
              Your order <strong>#${escapeHtml(orderRef)}</strong> placed on ${escapeHtml(orderDate)} has been confirmed.
              You will pay in <strong>cash</strong> upon delivery.
            </p>

            <!-- Badge COD -->
            <div style="background:#fef9ee;border:1px solid #fcd34d;border-radius:10px;padding:14px 18px;margin-bottom:28px;display:flex;align-items:center;gap:10px;">
              <span style="font-size:22px;">💵</span>
              <div>
                <p style="margin:0;font-size:13px;font-weight:700;color:#92400e;">Cash on Delivery</p>
                <p style="margin:4px 0 0;font-size:12px;color:#b45309;">Please have the exact amount ready in cash upon delivery.</p>
              </div>
            </div>

            <!-- Articles -->
            <p style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#a8a29e;margin:0 0 8px;">Ordered Items</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0ece4;border-radius:10px;overflow:hidden;margin-bottom:20px;">
              ${itemsHtml}
              <tr style="background:#faf9f7;">
                <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#1c1917;">
                  ${shippingCost === 0 ? 'Free Shipping 🎁' : 'Shipping Fee'}
                </td>
                <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#1c1917;text-align:right;">
                  ${shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                </td>
              </tr>
              <tr style="background:#1c1917;">
                <td style="padding:14px 16px;font-size:15px;font-weight:700;color:#fff;">Total Due</td>
                <td style="padding:14px 16px;font-size:18px;font-weight:900;color:#fbbf24;text-align:right;">${formatPrice(total)}</td>
              </tr>
            </table>

            <!-- Address -->
            <p style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#a8a29e;margin:0 0 8px;">Delivery Address</p>
            <div style="border:1px solid #f0ece4;border-radius:10px;padding:16px;margin-bottom:28px;">
              ${addressHtml}
            </div>

            <p style="font-size:13px;color:#78716c;text-align:center;margin:0;">
              Have questions? Contact us on WhatsApp or by email.<br/>
              <strong style="color:#1c1917;">Chello</strong>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f0e8;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#a8a29e;letter-spacing:0.1em;text-transform:uppercase;">
              © 2025 Chello · Women's Fashion · Al Araimi Boulevard, Muscat
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[COD Email] RESEND_API_KEY missing');
    return res.status(200).json({ sent: false, reason: 'missing_api_key' });
  }

  const { order, items, delivery } = req.body ?? {};
  // ── Validation: expected structure ──
  if (!order || typeof order !== 'object' || !Array.isArray(items)) {
    return res.status(400).json({ error: 'order and items required' });
  }
  if (items.length > 200) {
    return res.status(400).json({ error: 'Too many items' });
  }

  const customerEmail = delivery?.email || order?.shipping_address_snapshot?.email;
  const customerName  = delivery
    ? `${delivery.firstName || ''} ${delivery.lastName || ''}`.trim()
    : order?.shipping_address_snapshot?.full_name || 'Customer';

  const orderRef   = shortRef(order.id);
  const orderDate  = new Date(order.created_at || Date.now()).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const html = buildEmailHtml({
    customerName: customerName.split(' ')[0] || customerName,
    orderRef,
    orderDate,
    items,
    total:        order.total ?? 0,
    shippingCost: order.shipping_cost ?? 0,
    address:      order.shipping_address_snapshot ?? null,
  });

  const fromEmail  = process.env.EMAIL_FROM || 'Chello <onboarding@resend.dev>';
  const shopEmail  = process.env.SHOP_EMAIL ?? 'contact.chello.om@gmail.com';

  try {
    const resend = new Resend(apiKey);

    // 1. Confirmation email to customer (only if email provided)
    if (customerEmail) {
      const { error: clientErr } = await resend.emails.send({
        from:    fromEmail,
        to:      [customerEmail],
        subject: `✓ Order Confirmed #${escapeHtml(orderRef)} — Chello`,
        html,
      });
      if (clientErr) console.error(`[COD Email] Error sending to customer (${customerEmail}):`, clientErr);
      else           console.log(`[COD Email] ✓ Customer email → ${customerEmail}`);
    }

    // 2. Shop notification (always sent)
    const shopHtml = `<!DOCTYPE html><html lang="en"><body style="font-family:Arial,sans-serif;padding:24px;">
      <h2 style="color:#1c1917;">🛒 New Order #${escapeHtml(orderRef)}</h2>
      <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(customerEmail || 'Not provided')}</p>
      <p><strong>Phone:</strong> ${escapeHtml(order.shipping_address_snapshot?.phone || 'Not provided')}</p>
      <p><strong>Address:</strong> ${escapeHtml(order.shipping_address_snapshot?.address_line_1 || '')}, ${escapeHtml(order.shipping_address_snapshot?.postal_code || '')} ${escapeHtml(order.shipping_address_snapshot?.city || '')}</p>
      <p><strong>Total:</strong> ${formatPrice(order.total)}</p>
      <p><strong>Delivery:</strong> ${order.delivery_method === 'express' ? 'Express' : 'Standard'}</p>
      <hr/>
      <p style="color:#78716c;font-size:12px;">Manage this order in your admin dashboard.</p>
    </body></html>`;

    const { error: shopErr } = await resend.emails.send({
      from:    fromEmail,
      to:      [shopEmail],
      subject: `🛒 New Order #${escapeHtml(orderRef)} — ${escapeHtml(customerName)}`,
      html:    shopHtml,
    });
    if (shopErr) console.error('[COD Email] Shop notification error:', shopErr);
    else         console.log(`[COD Email] ✓ Shop notification → ${shopEmail}`);

    return res.status(200).json({ sent: true });

  } catch (err) {
    console.error('[COD Email] Exception:', err.message);
    return res.status(200).json({ sent: false, reason: err.message });
  }
}
