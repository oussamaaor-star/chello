import PDFDocument from 'pdfkit';
import { createClient } from '@supabase/supabase-js';

// ─── Vercel Serverless Function ────────────────────────────────────────────
// Route : GET /api/generate-invoice?orderId=xxx
// Auth  : Authorization: Bearer <supabase_access_token>
// Returns: application/pdf as attachment

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shortRef(uuid) {
  return uuid.replace(/-/g, '').slice(0, 8).toUpperCase();
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatOMR(amount) {
  return `${Number(amount).toFixed(3)} OMR`;
}

// ─── Color palette ───────────────────────────────────────────────────────────
const C = {
  black:      '#1c1917',  // stone-900
  gray:       '#78716c',  // stone-500
  grayLight:  '#e7e5e4',  // stone-200
  accent:     '#292524',  // stone-800
  white:      '#ffffff',
  emerald:    '#059669',
};

// ─── PDF builder ─────────────────────────────────────────────────────────────

function buildInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    doc.on('data',  (c) => chunks.push(c));
    doc.on('end',   () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageW = doc.page.width;
    const margin = 50;
    const contentW = pageW - margin * 2;

    const ref        = shortRef(order.id);
    const snap       = order.shipping_address_snapshot ?? {};
    // Les articles sont stockés dans la colonne JSONB `orders.items`
    // (pas de table `order_items`) : { product_id, name, size, color, quantity, price }
    const orderItems = Array.isArray(order.items) ? order.items : [];

    // ── HEADER ────────────────────────────────────────────────────────────────

    // Dark header background
    doc.rect(0, 0, pageW, 110).fill(C.black);

    // Logo text
    doc
      .fill(C.white)
      .font('Helvetica-Bold')
      .fontSize(28)
      .text('Chello', margin, 30);

    // Tagline
    doc
      .fill(C.gray)
      .font('Helvetica')
      .fontSize(9)
      .text("Women's Fashion — Al Araimi Boulevard, Muscat, Oman", margin, 63);

    // INVOICE title right side
    doc
      .fill(C.white)
      .font('Helvetica-Bold')
      .fontSize(22)
      .text('INVOICE', 0, 34, { align: 'right', width: pageW - margin });

    doc
      .fill(C.gray)
      .font('Helvetica')
      .fontSize(9)
      .text(`No. ${ref}`, 0, 62, { align: 'right', width: pageW - margin });

    // Reset fill
    doc.fill(C.black);

    // ── ORDER INFO (below header) ──────────────────────────────────────────────

    let y = 130;

    // Left block: date + status
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(C.black)
      .text('Date', margin, y)
      .font('Helvetica')
      .fontSize(10)
      .fillColor(C.gray)
      .text(formatDate(order.created_at), margin, y + 14);

    const isPaid = ['paid', 'simulated_paid'].includes(order.payment_status);
    const statusLabel = isPaid ? 'Paid' : 'Cash on Delivery';
    const statusColor = isPaid ? C.emerald : C.gray;

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(C.black)
      .text('Status', margin + 160, y)
      .font('Helvetica')
      .fontSize(10)
      .fillColor(statusColor)
      .text(statusLabel, margin + 160, y + 14);

    // Right block: delivery address
    const addrX = margin + contentW / 2;
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(C.black)
      .text('Delivery Address', addrX, y);

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(C.gray);

    const addrLines = [
      snap.full_name   || '',
      snap.address_line_1 || '',
      snap.address_line_2 || '',
      [snap.postal_code, snap.city].filter(Boolean).join(' '),
      snap.country     || 'Oman',
    ].filter(Boolean);

    addrLines.forEach((line, i) => {
      doc.text(line, addrX, y + 14 + i * 13);
    });

    // Separator line
    y = Math.max(y + 80, y + 14 + addrLines.length * 13 + 20);
    doc
      .moveTo(margin, y)
      .lineTo(pageW - margin, y)
      .lineWidth(1)
      .strokeColor(C.grayLight)
      .stroke();

    // ── ITEMS TABLE ───────────────────────────────────────────────────────────

    y += 20;

    // Column headers
    const colProduct = margin;
    const colQty     = margin + contentW * 0.55;
    const colUnit    = margin + contentW * 0.70;
    const colTotal   = margin + contentW * 0.85;

    doc.rect(margin, y - 6, contentW, 24).fill(C.black);

    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor(C.white);

    doc.text('PRODUCT',   colProduct, y + 2);
    doc.text('QTY',       colQty,     y + 2);
    doc.text('PRICE',     colUnit,    y + 2);
    doc.text('TOTAL',     colTotal,   y + 2);

    y += 26;

    // Item rows
    orderItems.forEach((item, idx) => {
      const rowH = 32;
      const bgColor = idx % 2 === 0 ? '#fafaf9' : C.white;
      doc.rect(margin, y, contentW, rowH).fill(bgColor);

      // Champs JSONB : name, size, color, quantity, price
      const qty       = Number(item.quantity) || 1;
      const unitPrice = Number(item.price) || 0;
      const lineTotal = unitPrice * qty;

      // Product name
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(C.black)
        .text(item.name ?? '', colProduct, y + 5, { width: contentW * 0.50, ellipsis: true });

      if (item.size || item.color) {
        const sub = [item.size, item.color].filter(Boolean).join(' — ');
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(C.gray)
          .text(sub, colProduct, y + 18, { width: contentW * 0.50, ellipsis: true });
      }

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(C.black)
        .text(String(qty),               colQty,   y + 10)
        .text(formatOMR(unitPrice),      colUnit,  y + 10)
        .text(formatOMR(lineTotal),      colTotal, y + 10);

      y += rowH;
    });

    // ── TOTALS ────────────────────────────────────────────────────────────────

    y += 14;

    const totalsX     = margin + contentW * 0.55;
    const totalsValX  = margin + contentW * 0.85;
    const totalsW     = contentW - contentW * 0.55;

    function totalRow(label, value, bold = false, color = C.black) {
      doc
        .font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(bold ? 10 : 9)
        .fillColor(C.gray)
        .text(label, totalsX, y, { width: contentW * 0.28 });

      doc
        .font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(bold ? 10 : 9)
        .fillColor(color)
        .text(value, totalsValX, y, { width: totalsW * 0.15, align: 'right' });

      y += bold ? 16 : 14;
    }

    doc
      .moveTo(totalsX, y - 4)
      .lineTo(pageW - margin, y - 4)
      .lineWidth(0.5)
      .strokeColor(C.grayLight)
      .stroke();

    totalRow('Subtotal', formatOMR(order.subtotal));

    if (Number(order.shipping_cost) === 0) {
      totalRow('Shipping', 'Free', false, C.emerald);
    } else {
      totalRow('Shipping', formatOMR(order.shipping_cost));
    }

    if (order.promo_code && Number(order.discount_amount) > 0) {
      totalRow(`Promo Code (${order.promo_code})`, `−${formatOMR(order.discount_amount)}`, false, C.emerald);
    }

    // Separator line before total
    doc
      .moveTo(totalsX, y)
      .lineTo(pageW - margin, y)
      .lineWidth(1)
      .strokeColor(C.black)
      .stroke();

    y += 10;

    // TOTAL
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor(C.black)
      .text('TOTAL', totalsX, y);

    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor(C.black)
      .text(formatOMR(order.total), totalsValX, y, { width: totalsW * 0.15, align: 'right' });

    y += 30;

    // Tax note
    doc
      .font('Helvetica')
      .fontSize(7.5)
      .fillColor(C.gray)
      .text(
        'This document serves as an invoice. Chello — Al Araimi Boulevard, Seeb, Muscat, Oman.',
        margin, y,
        { width: contentW }
      );

    // ── FOOTER ────────────────────────────────────────────────────────────────

    const footerY = doc.page.height - 50;
    doc
      .moveTo(margin, footerY - 12)
      .lineTo(pageW - margin, footerY - 12)
      .lineWidth(0.5)
      .strokeColor(C.grayLight)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(C.gray)
      .text(
        'Chello — contact@chello.om — chello-nine.vercel.app',
        margin, footerY,
        { align: 'center', width: contentW }
      );

    doc.end();
  });
}

// ─── Handler ──────────────────────────────────────────────────────────────────

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl    = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey        = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return res.status(500).json({ error: 'Incomplete Supabase configuration' });
  }

  // ── Verify JWT token ──────────────────────────────────────────────────────
  const authHeader = req.headers['authorization'] ?? '';
  const token      = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  // Use anon client to verify the token
  const supabaseAuth = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // ── Fetch the order ───────────────────────────────────────────────────────
  const { orderId } = req.query;

  if (!orderId) {
    return res.status(400).json({ error: 'orderId missing' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Les articles vivent dans la colonne JSONB `orders.items` (pas de table `order_items`).
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)   // Security: only the owner can generate the invoice
    .maybeSingle();

  if (orderError || !order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // ── Generate the PDF ──────────────────────────────────────────────────────
  try {
    const pdfBuffer = await buildInvoicePDF(order);
    const ref       = shortRef(order.id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-chello-${ref}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.status(200).end(pdfBuffer);
  } catch (err) {
    console.error('[Invoice] PDF generation error:', err.message);
    return res.status(500).json({ error: 'PDF generation error' });
  }
}
