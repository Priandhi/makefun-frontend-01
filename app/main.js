// make.fun frontend - router & view controller
// Vanilla ES modules, no framework, ETag caching, minimal bytes

import { api } from './api.js';
import { renderBoard, renderBounty, renderLeaderboard, renderProfile, renderSearch } from './views.js';
import { showToast } from './utils.js';

const app = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav a');

// Route registry
const routes = {
'board': { render: renderBoard, title: 'Open Bounties', needsData: true },
'bounty': { render: renderBounty, title: 'Bounty', needsData: true, param: true },
'leaderboard': { render: renderLeaderboard, title: 'Leaderboard', needsData: true, param: true },
'profile': { render: renderProfile, title: 'Profile', needsData: true, param: true },
'search': { render: renderSearch, title: 'Search', needsData: true }
};

// Parse hash route
function parseRoute() {
const hash = location.hash.slice(1) || '/';
const [, view, ...params] = hash.split('/').filter(Boolean);
return { view: view || 'board', params };
}

// Update active nav
function updateNav(view) {
navLinks.forEach(link => {
const linkView = link.dataset.view;
link.setAttribute('aria-current', linkView === view ? 'page' : 'false');
});
}

// Main render function
async function render() {
const { view, params } = parseRoute();
const route = routes[view] || routes.board;

window.__shotReady = false;
app.innerHTML = '<div class="skeleton" style="height:200px"></div>';

try {
let data = null;
if (route.needsData) {
if (route.param && params[0]) {
data = await route.fetch(params[0]);
} else {
data = await route.fetch();
}
}
await route.render(app, data, params);
document.title = `${route.title} | make.fun`;
updateNav(view);
} catch (err) {
console.error('Render error:', err);
app.innerHTML = `
<div class="empty">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
<h2>Failed to load</h2>
<p>${err.message}</p>
<button class="btn btn-primary" onclick="location.reload()">Retry</button>
</div>
`;
} finally {
window.__shotReady = true;
}
}

// Route fetch functions
routes.board.fetch = () => api.getBounties();
routes.bounty.fetch = (slug) => api.getBounty(slug);
routes.leaderboard.fetch = (slug) => api.getLeaderboard(slug);
routes.profile.fetch = (handle) => api.getProfile(handle);
routes.search.fetch = () => api.getBounties(); // Search uses board data for client-side filter

// Hash change listener
window.addEventListener('hashchange', render);

// Keyboard navigation: Escape goes home
document.addEventListener('keydown', (e) => {
if (e.key === 'Escape' && location.hash !== '#/') {
location.hash = '#/';
}
});

// Initial render
render();

// Expose for debugging
window.__makefun = { api, render, routes };