// Helpers de formatage partagés par les écrans admin.
// Admin en anglais → chiffres latins + "OMR" (cohérent avec les autres écrans admin).

export function formatCurrency(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(amount) + ' OMR';
}

export function shortRef(id) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
}
