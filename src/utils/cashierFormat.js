// Shared formatting helpers for the cashier (caisse) screens.
// Factored out of the individual CashierPOS/CashierOrders/CashierDashboard files
// to avoid duplicated definitions.

export function formatCurrency(amount) {
  if (amount == null) return '—';
  return (
    new Intl.NumberFormat('ar-OM', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount) + ' ر.ع.'
  );
}

export function shortRef(id) {
  if (!id) return '';
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}
