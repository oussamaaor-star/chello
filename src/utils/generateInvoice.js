import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { SHOP_CONFIG } from './config';

// ─── Rendu du texte ARABE en image ────────────────────────────────────────────
// jsPDF (polices Helvetica/Times) ne sait ni dessiner ni « reshaper » l'arabe →
// charabia. On délègue le rendu des chaînes arabes au NAVIGATEUR (shaping + RTL
// parfaits) via html2canvas, puis on insère le PNG transparent dans le PDF.
const ARABIC_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const hasArabic = (s) => ARABIC_RE.test(String(s ?? ''));

async function textToImage(text, { fontPx = 26, color = '#37322d', weight = 400 } = {}) {
  const el = document.createElement('div');
  el.setAttribute('dir', 'rtl');
  el.textContent = String(text ?? '');
  el.style.cssText = [
    'position:fixed', 'left:-99999px', 'top:0', 'display:inline-block', 'white-space:nowrap',
    "font-family:'Cairo',sans-serif", `font-size:${fontPx}px`,
    `font-weight:${weight}`, `color:${color}`, 'line-height:1.7', 'padding:3px 2px',
  ].join(';');
  document.body.appendChild(el);
  try {
    try { await document.fonts.load(`${weight} ${fontPx}px 'Cairo'`); } catch { /* noop */ }
    const canvas = await html2canvas(el, { backgroundColor: null, scale: 3, logging: false });
    const PX2MM = 25.4 / 96; // 96 dpi CSS ; canvas rendu à scale 3
    return { dataURL: canvas.toDataURL('image/png'), wmm: (canvas.width / 3) * PX2MM, hmm: (canvas.height / 3) * PX2MM };
  } finally {
    document.body.removeChild(el);
  }
}

// Dessine `text` en image SI arabe (repli : l'appelant fait le doc.text latin).
// Retourne true si un rendu image a eu lieu.
async function drawMaybeArabic(doc, text, x, yBaseline, opts = {}) {
  if (!hasArabic(text)) return false;
  try {
    const { align = 'left', fontPx = 26, color = '#37322d', weight = 400, ascent = 0.78, maxWmm = 90 } = opts;
    const img = await textToImage(text, { fontPx, color, weight });
    let w = img.wmm, h = img.hmm;
    if (w > maxWmm) { const r = maxWmm / w; w = maxWmm; h *= r; }
    const yTop = yBaseline - h * ascent;
    const xLeft = align === 'right' ? x - w : x;
    doc.addImage(img.dataURL, 'PNG', xLeft, yTop, w, h);
    return true;
  } catch {
    return false;
  }
}

// Numéro WhatsApp boutique formaté pour l'affichage (source unique : config.js).
// SHOP_CONFIG.wa_number = '96896777671' → '+968 96 777 671'
const WA_DISPLAY = (() => {
  const n = SHOP_CONFIG.wa_number || '';
  // 968 = indicatif Oman, le reste = numéro local à 8 chiffres
  const cc = n.slice(0, 3);
  const local = n.slice(3);
  const grouped = local.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3').trim();
  return `+${cc} ${grouped}`.trim();
})();

// ─── Identité de marque ──────────────────────────────────────────────────────
const BRAND = {
  name:    'Chello',
  tagline: "WOMEN'S FASHION  ·  MUSCAT, OMAN",
  phone:   WA_DISPLAY,
  site:    'chello-nine.vercel.app',
};

// ─── Palette éditoriale (cohérente avec la boutique : ink / argent / crème) ──
const COLOR = {
  ink:      [24, 20, 15],     // #18140F — titres, header
  white:    [255, 255, 255],
  offwhite: [236, 232, 226],  // texte clair sur fond ink
  silver:   [158, 158, 158],  // #9E9E9E — filets / accents
  silverLt: [190, 186, 180],  // accent clair sur fond sombre
  silverDk: [108, 102, 95],   // libellés de section sur fond clair
  cream:    [250, 248, 244],  // #FAF8F4 — fonds de blocs doux
  line:     [228, 222, 214],  // séparateurs
  text:     [55, 50, 45],     // corps de texte
  muted:    [132, 125, 116],  // texte secondaire
  emerald:  [16, 150, 110],   // payé / remise
};

/**
 * Génère et télécharge une facture PDF premium pour une commande.
 * Design éditorial Chello (ink / argent / crème), wordmark serif.
 * @param {Object} order L'objet commande provenant de Supabase
 */
export async function generateInvoice(order) {
  if (!order || !order.id) return;

  // Les polices arabes (Cairo) doivent être chargées AVANT de rasteriser les
  // textes arabes, sinon html2canvas rend avec une police de repli mal formée.
  try { if (document.fonts?.ready) await document.fonts.ready; } catch { /* noop */ }

  const dateObj  = new Date(order.created_at);
  const dateStr  = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const shortRef = order.id.replace(/-/g, '').slice(0, 8).toUpperCase();
  // « Payé » = paiement réellement encaissé (orders.payment_status === 'paid').
  // En COD, une commande livrée n'est PAS forcément payée tant que payment_status ne l'indique pas.
  const isPaid   = order.payment_status === 'paid';

  // ─── Logo Chello (argent, en base64) ───────────────────────────────────────
  let logoData = null;
  try {
    const res = await fetch('/logo-chello.png');
    if (res.ok) {
      const blob = await res.blob();
      logoData = await new Promise((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = () => resolve(null);
        r.readAsDataURL(blob);
      });
    }
  } catch { logoData = null; }

  // ─── QR code de suivi de commande ──────────────────────────────────────────
  let qrData = null;
  try {
    qrData = await QRCode.toDataURL(`https://${BRAND.site}/suivi`, {
      margin: 0, width: 240, color: { dark: '#18140F', light: '#FFFFFF' },
    });
  } catch { qrData = null; }

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const MARGIN = 16;
  const RIGHT  = pageWidth - MARGIN;

  // ─── Header (bandeau ink) ──────────────────────────────────────────────────
  const HEADER_H = 50;
  doc.setFillColor(...COLOR.ink);
  doc.rect(0, 0, pageWidth, HEADER_H, 'F');
  // Filet argent sous le header
  doc.setFillColor(...COLOR.silver);
  doc.rect(0, HEADER_H, pageWidth, 0.8, 'F');

  // Logo Chello (signalétique argent sur fond sombre — carré) — ou fallback texte
  if (logoData) {
    doc.addImage(logoData, 'PNG', MARGIN, 6, 27, 27);
  } else {
    doc.setFont('times', 'italic');
    doc.setFontSize(24);
    doc.setTextColor(...COLOR.white);
    doc.text('Chello', MARGIN, 26);
  }
  // Tagline + contact sous le logo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLOR.silverLt);
  doc.setCharSpace(0.8);
  doc.text(BRAND.tagline, MARGIN + 1, 39);
  doc.setCharSpace(0);
  doc.setFontSize(7.5);
  doc.setTextColor(165, 159, 150);
  doc.text(`${BRAND.phone}    ${BRAND.site}`, MARGIN + 1, 44);

  // ─── Titre + référence (droite) ────────────────────────────────────────────
  const docTitle = isPaid ? 'INVOICE' : 'RECEIPT';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(25);
  doc.setTextColor(...COLOR.silverLt);
  doc.setCharSpace(2.5);
  doc.text(docTitle, RIGHT, 22, { align: 'right' });
  doc.setCharSpace(0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.offwhite);
  doc.text(`N°  ${shortRef}`, RIGHT, 31, { align: 'right' });
  doc.text(dateStr, RIGHT, 36.5, { align: 'right' });

  // ─── Blocs Vendeur / Client ────────────────────────────────────────────────
  const snap = order.shipping_address_snapshot || {
    full_name: order.full_name,
    address_line_1: order.address,
    city: order.city,
    country: 'Oman',
    phone: order.phone,
  };
  const blockTop = HEADER_H + 14;
  const blockH   = 50;
  const gap      = 6;
  const colW     = (pageWidth - MARGIN * 2 - gap) / 2;
  const sellerX  = MARGIN;
  const clientX  = MARGIN + colW + gap;

  const sectionLabel = (label, x, ytop, width) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR.silverDk);
    doc.setCharSpace(1);
    doc.text(label, x, ytop);
    doc.setCharSpace(0);
    doc.setDrawColor(...COLOR.silver);
    doc.setLineWidth(0.3);
    doc.line(x, ytop + 2, x + width, ytop + 2);
  };

  // Vendeur
  sectionLabel('FROM', sellerX, blockTop, colW);
  let sy = blockTop + 9;
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(...COLOR.ink);
  doc.text('Chello', sellerX, sy); sy += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR.text);
  doc.text('Al Araimi Boulevard, Seeb', sellerX, sy); sy += 4.6;
  doc.text('Muscat, Oman', sellerX, sy); sy += 4.6;
  doc.setTextColor(...COLOR.muted);
  doc.text(`WhatsApp ${BRAND.phone}`, sellerX, sy); sy += 4.4;
  doc.text(BRAND.site, sellerX, sy);

  // Client (bloc crème)
  doc.setFillColor(...COLOR.cream);
  doc.roundedRect(clientX, blockTop - 4, colW, blockH, 2, 2, 'F');
  sectionLabel('BILL TO', clientX + 6, blockTop, colW - 12);
  let cy = blockTop + 9;
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(...COLOR.ink);
  const clientName = snap.full_name || 'Customer';
  if (!(await drawMaybeArabic(doc, clientName, clientX + 6, cy, { fontPx: 30, color: '#18140f', weight: 600, maxWmm: colW - 12 }))) {
    doc.text(clientName, clientX + 6, cy);
  }
  cy += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR.text);
  if (snap.address_line_1) {
    if (!(await drawMaybeArabic(doc, snap.address_line_1, clientX + 6, cy, { fontPx: 19, maxWmm: colW - 12 }))) doc.text(String(snap.address_line_1), clientX + 6, cy);
    cy += 4.6;
  }
  if (snap.address_line_2) {
    if (!(await drawMaybeArabic(doc, snap.address_line_2, clientX + 6, cy, { fontPx: 19, maxWmm: colW - 12 }))) doc.text(String(snap.address_line_2), clientX + 6, cy);
    cy += 4.6;
  }
  const cityLine = `${snap.postal_code || ''} ${snap.city || ''}`.trim();
  if (cityLine) {
    if (!(await drawMaybeArabic(doc, cityLine, clientX + 6, cy, { fontPx: 19, maxWmm: colW - 12 }))) doc.text(cityLine, clientX + 6, cy);
    cy += 4.6;
  }
  doc.text(snap.country || 'Oman', clientX + 6, cy); cy += 4.6;
  doc.setTextColor(...COLOR.muted);
  doc.setFontSize(8);
  if (snap.phone) { doc.text(`Phone ${snap.phone}`, clientX + 6, cy); }

  const blocksBottom = blockTop + blockH;

  // ─── Table data ────────────────────────────────────────────────────────────
  // Les articles sont stockés dans la colonne JSONB `items` :
  // { product_id, name, size, color, quantity, price }
  const tableData = [];
  (order.items || []).forEach((item) => {
    const qty  = Number(item.quantity) || 1;
    const unit = Number(item.price) || 0;
    const itemName = (item.name || '') + (item.size ? `  (${item.size})` : '');
    tableData.push([
      itemName,
      qty.toString(),
      unit.toFixed(3) + ' OMR',
      (unit * qty).toFixed(3) + ' OMR',
    ]);
  });

  const shippingCost = Number(order.shipping_cost || 0);
  if (shippingCost > 0) {
    tableData.push([
      `Shipping (${order.delivery_method || 'Standard'})`,
      '1',
      shippingCost.toFixed(3) + ' OMR',
      shippingCost.toFixed(3) + ' OMR',
    ]);
  }

  // ─── Pré-rendu des noms de produits ARABES en images (colonne Description) ──
  const nameImages = {};
  for (let i = 0; i < tableData.length; i++) {
    if (hasArabic(tableData[i][0])) {
      try { nameImages[i] = await textToImage(tableData[i][0], { fontPx: 23, color: '#37322d', weight: 500 }); } catch { /* repli texte */ }
    }
  }

  // ─── Autotable ─────────────────────────────────────────────────────────────
  autoTable(doc, {
    startY: blocksBottom + 8,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: COLOR.ink,
      textColor: COLOR.offwhite,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
      cellPadding: { top: 4, bottom: 4, left: 6, right: 6 },
      lineWidth: 0,
    },
    styles: {
      font: 'helvetica',
      fontSize: 9.5,
      cellPadding: { top: 5, bottom: 5, left: 6, right: 6 },
      textColor: COLOR.text,
      valign: 'middle',
    },
    bodyStyles: { textColor: COLOR.text, fontStyle: 'normal', minCellHeight: 11 },
    didParseCell: (data) => {
      // Efface le texte arabe (charabia jsPDF) : il sera redessiné en image.
      if (data.section === 'body' && data.column.index === 0 && nameImages[data.row.index]) {
        data.cell.text = [''];
      }
    },
    didDrawCell: (data) => {
      if (data.section !== 'body' || data.column.index !== 0) return;
      const img = nameImages[data.row.index];
      if (!img) return;
      const pad = 6;
      const maxW = data.cell.width - pad * 2;
      const maxH = data.cell.height - 3;
      const r = Math.min(maxW / img.wmm, maxH / img.hmm, 1);
      const w = img.wmm * r, h = img.hmm * r;
      doc.addImage(img.dataURL, 'PNG', data.cell.x + pad, data.cell.y + (data.cell.height - h) / 2, w, h);
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 18 },
      2: { halign: 'right',  cellWidth: 32 },
      3: { halign: 'right',  cellWidth: 32, fontStyle: 'bold', textColor: COLOR.ink },
    },
    alternateRowStyles: { fillColor: COLOR.cream },
    tableLineColor: COLOR.line,
    tableLineWidth: 0.1,
  });

  const finalY = doc.lastAutoTable?.finalY || 120;

  // ─── Totaux ────────────────────────────────────────────────────────────────
  const subtotal = Number(order.subtotal ?? (Number(order.total || 0) - shippingCost));
  const discount = Number(order.discount_amount || 0);
  const shipping  = shippingCost;

  const totBoxW = 78;
  const totBoxX = RIGHT - totBoxW;
  const labelX  = totBoxX + 6;
  const valueX  = RIGHT - 6;
  const hasDiscount = discount > 0 || !!order.promo_code;

  let rows = 1;
  if (hasDiscount) rows += 1;
  if (shipping > 0) rows += 1;
  const lineH    = 6;
  const totBoxTop = finalY + 10;
  const totBoxH   = rows * lineH + 16;

  doc.setFillColor(...COLOR.cream);
  doc.setDrawColor(...COLOR.line);
  doc.setLineWidth(0.2);
  doc.roundedRect(totBoxX, totBoxTop, totBoxW, totBoxH, 2, 2, 'FD');

  let totalY = totBoxTop + 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  // Sous-total
  doc.setTextColor(...COLOR.muted);
  doc.text('Subtotal', labelX, totalY);
  doc.setTextColor(...COLOR.text);
  doc.text(`${subtotal.toFixed(3)} OMR`, valueX, totalY, { align: 'right' });
  totalY += lineH;

  // Remise (code promo)
  if (hasDiscount) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR.emerald);
    const promoText = order.promo_code ? `Discount (${order.promo_code})` : 'Discount';
    doc.text(promoText, labelX, totalY);
    doc.text(`- ${discount.toFixed(3)} OMR`, valueX, totalY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    totalY += lineH;
  }

  // Livraison
  if (shipping > 0) {
    doc.setTextColor(...COLOR.muted);
    doc.text('Shipping', labelX, totalY);
    doc.setTextColor(...COLOR.text);
    doc.text(`${shipping.toFixed(3)} OMR`, valueX, totalY, { align: 'right' });
    totalY += lineH;
  }

  // Filet argent avant le total
  doc.setDrawColor(...COLOR.silver);
  doc.setLineWidth(0.4);
  doc.line(labelX, totalY - 1, valueX, totalY - 1);
  totalY += 5;

  // Net à payer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLOR.ink);
  doc.text('Total Due', labelX, totalY);
  doc.setFontSize(13);
  doc.setTextColor(...COLOR.ink);
  doc.text(`${Number(order.total).toFixed(3)} OMR`, valueX, totalY, { align: 'right' });

  // ─── Paiement (gauche, en regard des totaux) ───────────────────────────────
  const payTop = finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR.silverDk);
  doc.setCharSpace(1);
  doc.text('PAYMENT', MARGIN, payTop);
  doc.setCharSpace(0);
  doc.setDrawColor(...COLOR.silver);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, payTop + 2, MARGIN + 70, payTop + 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.text);
  doc.text('Cash on Delivery (COD)', MARGIN, payTop + 9);

  if (isPaid) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR.emerald);
    doc.text('Paid', MARGIN, payTop + 15.5);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR.silverDk);
    doc.text('To be paid on delivery', MARGIN, payTop + 15.5);
  }

  // ─── QR de suivi de commande (bas droite) ──────────────────────────────────
  if (qrData) {
    const qrSize = 22;
    const qrX = RIGHT - qrSize;
    const qrY = (pageHeight - 22) - qrSize - 7;
    doc.addImage(qrData, 'PNG', qrX, qrY, qrSize, qrSize);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...COLOR.silverDk);
    // Pas de charSpace ici : jsPDF ne le déduit pas de l'alignement à droite, ce
    // qui faisait déborder le texte SUR le QR. Marge de 5 mm pour être tranquille.
    doc.text('SCAN TO TRACK', qrX - 5, qrY + 9, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLOR.muted);
    doc.text('your order online', qrX - 5, qrY + 13.5, { align: 'right' });
  }

  // ─── Footer ────────────────────────────────────────────────────────────────
  const footTop = pageHeight - 22;
  doc.setDrawColor(...COLOR.line);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, footTop, RIGHT, footTop);

  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR.ink);
  doc.text('Thank you for shopping with Chello', pageWidth / 2, footTop + 7, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR.muted);
  doc.setCharSpace(0.5);
  doc.text(`${BRAND.phone}   ·   ${BRAND.site}`, pageWidth / 2, footTop + 12, { align: 'center' });
  doc.setCharSpace(0);

  // ─── Download ──────────────────────────────────────────────────────────────
  const fileLabel = isPaid ? 'Invoice' : 'Receipt';
  doc.save(`${fileLabel}_Chello_${shortRef}.pdf`);
}
