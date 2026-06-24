import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Identité de marque (constantes locales) ────────────────────────────────
const BRAND = {
  name:     'CHELLO',
  tagline:  "أزياء نسائية — Women's Fashion, Muscat, Oman",
  phone:    '+968 96777671',
  whatsapp: '+968 96777671',
  site:     'chello-nine.vercel.app',
};

// ─── Palette (cohérente avec la charte ambre/dorée) ─────────────────────────
const COLOR = {
  ink:       [28, 25, 23],    // stone-950 (fonds sombres / titres)
  amber:     [180, 83, 9],    // #B45309 (accent doré print-safe)
  amberLite: [217, 119, 6],   // #D97706 (accent secondaire)
  paper:     [250, 249, 247], // fonds de blocs très doux
  line:      [228, 222, 214], // séparateurs
  text:      [55, 50, 45],    // corps de texte
  muted:     [120, 113, 105], // texte secondaire
  emerald:   [16, 185, 129],  // remise / payé
};

/**
 * Génère et télécharge une facture PDF pour une commande donnée.
 * @param {Object} order L'objet commande provenant de Supabase
 */
export async function generateInvoice(order) {
  if (!order || !order.id) return;

  // Fetch logo as base64
  let logoBase64 = null;
  try {
    const res = await fetch('/logo.png');
    const blob = await res.blob();
    logoBase64 = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 512; // Haute résolution pour le PDF
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Découpage en cercle
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Calcul du scale et position pour correspondre à backgroundSize: 210% et backgroundPosition: 50% 38%
        const drawWidth = size * 2.1;
        const drawHeight = img.height * (drawWidth / img.width);

        const dx = (size - drawWidth) * 0.5;
        const dy = (size - drawHeight) * 0.38;

        ctx.drawImage(img, dx, dy, drawWidth, drawHeight);

        // Bordure dorée (ring-1 ring-amber-500/40)
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)'; // amber-500 un peu plus visible
        ctx.lineWidth = 8;
        ctx.stroke();

        resolve(canvas.toDataURL('image/png'));
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => reject(new Error('Image load error'));
      img.src = URL.createObjectURL(blob);
    });
  } catch (err) {
    console.warn('Impossible de charger le logo pour le PDF', err);
  }

  // Format order date
  const dateObj = new Date(order.created_at);
  const dateStr = dateObj.toLocaleDateString('fr-FR');
  const shortRef = order.id.replace(/-/g, '').slice(0, 8).toUpperCase();
  const isPaid = order.status === 'delivered';

  // Create PDF (A4 Portrait)
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const MARGIN = 16;          // marge généreuse gauche/droite
  const RIGHT = pageWidth - MARGIN;

  // Typography
  doc.setFont('helvetica');

  // ─── Header sombre (luxe) ─────────────────────────────────────────────────
  const HEADER_H = 56;
  doc.setFillColor(...COLOR.ink);
  doc.rect(0, 0, pageWidth, HEADER_H, 'F');

  // Double filet ambré en bas du header (fine + plus fine au-dessus)
  doc.setFillColor(...COLOR.amber);
  doc.rect(0, HEADER_H, pageWidth, 1.8, 'F');
  doc.setFillColor(...COLOR.amberLite);
  doc.rect(0, HEADER_H + 1.8, pageWidth, 0.5, 'F');

  // ─── Logo + Wordmark de marque ────────────────────────────────────────────
  const textX = logoBase64 ? MARGIN + 30 : MARGIN;
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', MARGIN, 13, 24, 24);
  }

  // Wordmark (nom de marque en lettres espacées pour un effet "luxe")
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.setCharSpace(0.8);
  doc.text(BRAND.name, textX, 23);
  doc.setCharSpace(0);

  // Tagline en ambre
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR.amberLite);
  doc.text(BRAND.tagline, textX, 30);

  // Contact dans le header (discret, gris clair)
  doc.setFontSize(7.8);
  doc.setTextColor(170, 162, 152);
  doc.text(`${BRAND.phone}  •  WhatsApp`, textX, 36.5);
  doc.text(BRAND.site, textX, 41.5);

  // ─── Titre du document + référence (à droite) ──────────────────────────────
  const docTitle = isPaid ? 'FACTURE' : 'REÇU';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(...COLOR.amberLite);
  doc.setCharSpace(1);
  doc.text(docTitle, RIGHT, 26, { align: 'right' });
  doc.setCharSpace(0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(210, 202, 192);
  doc.text(`N°  ${shortRef}`, RIGHT, 35, { align: 'right' });
  doc.text(`Date  ${dateStr}`, RIGHT, 41, { align: 'right' });

  // ─── Bloc Vendeur (gauche) + Bloc Client (droite) ──────────────────────────
  const snap = order.shipping_address_snapshot || {};
  const blockTop = HEADER_H + 12;
  const blockH = 50;
  const gap = 6;
  const colW = (pageWidth - MARGIN * 2 - gap) / 2;
  const sellerX = MARGIN;
  const clientX = MARGIN + colW + gap;

  // Helper pour l'en-tête de section (libellé ambre + filet)
  const sectionLabel = (label, x, ytop, width) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR.amber);
    doc.setCharSpace(0.6);
    doc.text(label, x, ytop);
    doc.setCharSpace(0);
    doc.setDrawColor(...COLOR.amber);
    doc.setLineWidth(0.4);
    doc.line(x, ytop + 2, x + width, ytop + 2);
  };

  // --- Bloc Vendeur ---
  sectionLabel('VENDEUR', sellerX, blockTop, colW);
  let sy = blockTop + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLOR.ink);
  doc.text('Chello', sellerX, sy); sy += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR.text);
  doc.text('Al Araimi Boulevard, Seeb, Muscat, Oman', sellerX, sy); sy += 5;
  doc.setTextColor(...COLOR.muted);
  doc.text(`WhatsApp : ${BRAND.phone}`, sellerX, sy); sy += 4.5;
  doc.text(`Web : ${BRAND.site}`, sellerX, sy);

  // --- Bloc Client (fond doux) ---
  doc.setFillColor(...COLOR.paper);
  doc.roundedRect(clientX, blockTop - 4, colW, blockH, 2, 2, 'F');

  sectionLabel('LIVRÉ À', clientX + 6, blockTop, colW - 12);
  let cy = blockTop + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLOR.ink);
  doc.text(snap.full_name || 'Client', clientX + 6, cy); cy += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR.text);
  if (snap.address_line_1) { doc.text(snap.address_line_1, clientX + 6, cy); cy += 4.5; }
  if (snap.address_line_2) { doc.text(snap.address_line_2, clientX + 6, cy); cy += 4.5; }
  const cityLine = `${snap.postal_code || ''} ${snap.city || ''}`.trim();
  if (cityLine) { doc.text(cityLine, clientX + 6, cy); cy += 4.5; }
  doc.text(snap.country || 'Oman', clientX + 6, cy); cy += 4.5;

  doc.setTextColor(...COLOR.muted);
  doc.setFontSize(8);
  if (snap.email) { doc.text(`Email : ${snap.email}`, clientX + 6, cy); cy += 4.2; }
  if (snap.phone) { doc.text(`Tél : ${snap.phone}`, clientX + 6, cy); }

  const blocksBottom = blockTop + blockH;

  // ─── Table Data ──────────────────────────────────────────────────────────
  const tableData = [];
  (order.order_items || []).forEach(item => {
    const meta = item.metadata || {};
    const qty = Number(item.quantity) || 1;

    // Nom affiché : pour un coffret on privilégie le nom du coffret, sinon le produit.
    const isBundle = !!meta.is_bundle;
    const baseName = isBundle
      ? (meta.bundle_name || item.product_name)
      : item.product_name;

    // Label « Pack » discret accolé au nom, sans dépendre de données absentes.
    const itemName =
      (isBundle ? `${baseName}  [Pack]` : baseName) +
      (item.selected_size ? ` (${item.selected_size})` : '');

    const unitPrice = (Number(item.line_total) / qty).toFixed(2) + ' OMR';
    const totalLine = Number(item.line_total).toFixed(2) + ' OMR';

    // Ligne principale de l'article (coffret ou produit simple).
    tableData.push([
      itemName,
      qty.toString(),
      unitPrice,
      totalLine
    ]);

    // Détail du coffret — UNIQUEMENT si les données existent réellement.
    // Le checkout n'écrit pas toujours bundle_contents / original_bundle_price :
    // on ne rend ces lignes que lorsqu'elles sont présentes, sans ligne vide.
    if (isBundle) {
      if (Array.isArray(meta.bundle_contents) && meta.bundle_contents.length > 0) {
        tableData.push([
          `   • ${meta.bundle_contents.join(', ')}`,
          '', '', ''
        ]);
      }

      const originalBundlePrice = Number(meta.original_bundle_price);
      const unit = Number(item.unit_price);
      if (Number.isFinite(originalBundlePrice) && Number.isFinite(unit) && originalBundlePrice > unit) {
        const saving = (originalBundlePrice - unit) * qty;
        tableData.push([
          `   Avantage Pack (économie réalisée)`,
          '', '', `-${saving.toFixed(2)} OMR`
        ]);
      }
    }
  });

  // Si des frais de livraison existent, on les ajoute au tableau
  const shippingCost = Number(order.shipping_cost || 0);
  if (shippingCost > 0) {
    tableData.push([
      `Frais de livraison (${order.delivery_method || 'Standard'})`,
      '1',
      shippingCost.toFixed(2) + ' OMR',
      shippingCost.toFixed(2) + ' OMR'
    ]);
  }

  // ─── Autotable ───────────────────────────────────────────────────────────
  autoTable(doc, {
    startY: blocksBottom + 10,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Désignation', 'Qté', 'Prix unitaire', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: COLOR.ink,        // bandeau sombre
      textColor: [245, 200, 120],  // texte doré clair, lisible
      fontStyle: 'bold',
      fontSize: 9.5,
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
    bodyStyles: { textColor: COLOR.text, fontStyle: 'normal' },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 18 },
      2: { halign: 'right',  cellWidth: 32 },
      3: { halign: 'right',  cellWidth: 32, fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [250, 249, 247],
    },
    tableLineColor: COLOR.line,
    tableLineWidth: 0.1,
  });

  const finalY = doc.lastAutoTable?.finalY || 120;

  // ─── Totaux (bloc encadré aligné à droite) ─────────────────────────────────
  const subtotal = Number(order.subtotal || 0);
  const discount = Number(order.discount_amount || 0);
  const shipping = Number(order.shipping_cost || 0);

  const totBoxW = 78;
  const totBoxX = RIGHT - totBoxW;
  const labelX = totBoxX + 6;
  const valueX = RIGHT - 6;

  // La remise est pilotée par la commande elle-même (order.discount_amount /
  // order.promo_code), jamais par les métadonnées d'articles. On l'affiche dès
  // qu'un montant de remise existe OU qu'un code promo est attaché.
  const hasDiscount = discount > 0 || !!order.promo_code;

  // Hauteur dynamique du bloc selon les lignes affichées
  let rows = 1; // sous-total
  if (hasDiscount) rows += 1;
  if (shipping > 0) rows += 1;
  const lineH = 6;
  const totBoxTop = finalY + 10;
  const totBoxH = rows * lineH + 16; // lignes + total en gras

  doc.setFillColor(...COLOR.paper);
  doc.setDrawColor(...COLOR.line);
  doc.setLineWidth(0.2);
  doc.roundedRect(totBoxX, totBoxTop, totBoxW, totBoxH, 2, 2, 'FD');

  let totalY = totBoxTop + 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  // Sous-total
  doc.setTextColor(...COLOR.muted);
  doc.text('Sous-total', labelX, totalY);
  doc.setTextColor(...COLOR.text);
  doc.text(`${subtotal.toFixed(2)} OMR`, valueX, totalY, { align: 'right' });
  totalY += lineH;

  // Remise (code promo) — accent émeraude, montant en négatif.
  if (hasDiscount) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR.emerald);
    const promoText = order.promo_code
      ? `Remise (CODE: ${order.promo_code})`
      : 'Remise';
    doc.text(promoText, labelX, totalY);
    doc.text(`− ${discount.toFixed(2)} OMR`, valueX, totalY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    totalY += lineH;
  }

  // Livraison
  if (shipping > 0) {
    doc.setTextColor(...COLOR.muted);
    doc.text('Livraison', labelX, totalY);
    doc.setTextColor(...COLOR.text);
    doc.text(`${shipping.toFixed(2)} OMR`, valueX, totalY, { align: 'right' });
    totalY += lineH;
  }

  // Filet de séparation avant le total
  doc.setDrawColor(...COLOR.amber);
  doc.setLineWidth(0.4);
  doc.line(labelX, totalY - 1, valueX, totalY - 1);
  totalY += 5;

  // Net à payer (en gras + accent doré sur le montant)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLOR.ink);
  doc.text('Net à payer', labelX, totalY);
  doc.setFontSize(13);
  doc.setTextColor(...COLOR.amber);
  doc.text(`${Number(order.total).toFixed(2)} OMR`, valueX, totalY, { align: 'right' });

  // ─── Modalités de paiement (gauche, en regard des totaux) ───────────────────
  const payTop = finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR.amber);
  doc.setCharSpace(0.6);
  doc.text('PAIEMENT', MARGIN, payTop);
  doc.setCharSpace(0);
  doc.setDrawColor(...COLOR.amber);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, payTop + 2, MARGIN + 70, payTop + 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.text);
  doc.text('Paiement à la livraison (COD)', MARGIN, payTop + 9);

  // Badge statut conditionnel
  if (isPaid) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR.emerald);
    doc.text('Statut : Payée et livrée', MARGIN, payTop + 15.5);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR.amberLite);
    doc.text('Statut : À payer à la livraison', MARGIN, payTop + 15.5);
  }

  // ─── Footer ──────────────────────────────────────────────────────────────
  // Filet ambré + mention de remerciement et ligne légale/contact
  const footTop = pageHeight - 22;
  doc.setDrawColor(...COLOR.line);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, footTop, RIGHT, footTop);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.amber);
  doc.text('Merci pour votre confiance — Chello', pageWidth / 2, footTop + 6, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR.muted);
  doc.text(
    `${BRAND.phone}  •  ${BRAND.site}`,
    pageWidth / 2,
    footTop + 11,
    { align: 'center' }
  );

  // ─── Download ────────────────────────────────────────────────────────────
  const fileLabel = isPaid ? 'Facture' : 'Recu';
  doc.save(`${fileLabel}_Chello_${shortRef}.pdf`);
}
