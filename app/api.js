// make.fun API client - ETag caching, minimal requests
// Uses If-None-Match for minute-boundary revalidation

const API = 'https://make.fun/api';
const cache = new Map(); // key -> { etag, data, timestamp }

function cacheKey(path, params = {}) {
const search = new URLSearchParams(params).toString();
return `${path}${search ? '?' + search : ''}`;
}

async function request(path, params = {}) {
const key = cacheKey(path, params);
const cached = cache.get(key);
const headers = { 'Accept': 'application/json' };

if (cached?.etag) {
headers['If-None-Match'] = cached.etag;
}

const url = `${API}${path}${params ? '?' + new URLSearchParams(params) : ''}`;
const res = await fetch(url, { headers });

if (res.status === 304 && cached) {
return cached.data; // Return cached data
}

if (!res.ok) {
throw new Error(`API ${res.status}: ${res.statusText}`);
}

const data = await res.json();
const etag = res.headers.get('ETag') || res.headers.get('etag');

if (etag) {
cache.set(key, { etag, data, timestamp: Date.now() });
}

return data;
}

// Specific API calls
export const api = {
// Get open bounties with time data
getBounties: () => request('/competitions', { status: 'open', activity: 'times' }),

// Get single bounty by slug
getBounty: (slug) => request(`/competitions/${encodeURIComponent(slug)}`),

// Get leaderboard for a bounty
getLeaderboard: (slug) => request(`/competitions/${encodeURIComponent(slug)}/submissions`, { limit: 100 }),

// Get public profile by handle
getProfile: (handle) => request(`/users/${encodeURIComponent(handle)}`),

// Clear cache (for manual refresh)
clearCache: () => cache.clear(),

// Get cache stats
getCacheStats: () => ({ size: cache.size, keys: Array.from(cache.keys()) })
};

// Periodic cache cleanup (entries older than 5 minutes)
setInterval(() => {
const now = Date.now();
for (const [key, value] of cache.entries()) {
if (now - value.timestamp > 5 * 60 * 1000) {
cache.delete(key);
}
}
}, 60 * 1000);