// make.fun utils - toast, helpers

/** Show toast notification */
export function showToast(message, duration = 3000) {
const toast = document.getElementById('toast');
if (!toast) return;
toast.textContent = message;
toast.classList.add('show');
setTimeout(() => toast.classList.remove('show'), duration);
}

/** Debounce function */
export function debounce(fn, delay) {
let timer;
return (...args) => {
clearTimeout(timer);
timer = setTimeout(() => fn(...args), delay);
};
}

/** Throttle function */
export function throttle(fn, limit) {
let inThrottle;
return (...args) => {
if (!inThrottle) {
fn(...args);
inThrottle = true;
setTimeout(() => inThrottle = false, limit);
}
};
}

/** Format bytes human readable */
export function formatBytes(bytes) {
if (bytes === 0) return '0 B';
const k = 1024;
const sizes = ['B', 'KB', 'MB', 'GB'];
const i = Math.floor(Math.log(bytes) / Math.log(k));
return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/** Generate unique ID */
export function uid() {
return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Safe JSON parse */
export function safeParse(json, fallback = null) {
try { return JSON.parse(json); } catch { return fallback; }
}

/** Deep clone */
export function clone(obj) {
return JSON.parse(JSON.stringify(obj));
}