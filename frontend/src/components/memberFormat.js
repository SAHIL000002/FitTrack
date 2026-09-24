/**
 * Shared formatting helpers for the Member Dashboard.
 * Non-component exports live here (not in memberUi.jsx) so that file stays
 * react-refresh clean (components-only module).
 */

export function fmtD(v) {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function fmtDT(v) {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function fmtT(v) {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d.getTime()) ? '—' : d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function gm(e) {
  return e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Something went wrong';
}

export function daysRemaining(endDate) {
  if (!endDate) return null;
  const end = new Date(endDate);
  if (isNaN(end.getTime())) return null;
  const ms = end.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(ms / 86400000);
}

export function inr(n) {
  const v = Number(n);
  if (!isFinite(v)) return '—';
  return '₹' + v.toLocaleString('en-IN');
}
