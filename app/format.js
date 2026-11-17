// make.fun format helpers - tiny, pure functions

/** Escape HTML special chars */
export function esc(value) {
return String(value ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
}

/** Format dollar amount */
export function money(value) {
const n = Number(value);
return n.toLocaleString('en-US', {
style: 'currency',
currency: 'USD',
minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
maximumFractionDigits: 2
});
}

/** Format deadline as date in UTC */
export function date(iso) {
if (!iso) return '—';
return new Date(iso).toLocaleString('en-US', {
dateStyle: 'medium',
timeStyle: 'short',
timeZone: 'UTC'
}) + ' UTC';
}

/** Format time until deadline */
export function timeLeft(iso) {
if (!iso) return '—';
const ms = new Date(iso).getTime() - Date.now();
if (ms <= 0) return 'ended';
const days = Math.floor(ms / 86400000);
const hours = Math.floor((ms % 86400000) / 3600000);
const minutes = Math.floor((ms % 3600000) / 60000);
if (days > 0) return `${days}d ${hours}h left`;
if (hours > 0) return `${hours}h ${minutes}m left`;
return `${minutes}m left`;
}

/** Status badge */
export function badge(text, variant = 'default') {
const classes = `badge badge-${variant}`;
return `<span class="${classes}">${esc(text)}</span>`;
}