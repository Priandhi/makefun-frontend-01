// make.fun views - all 4 surfaces + search
// Pure functions: data -> HTML string

import { esc, money, date, timeLeft, badge } from './format.js';

// ============================================================================
// UTILITY
// ============================================================================

function card(html, className = '') {
return `<article class="card ${className}">${html}</article>`;
}

function link(href, text, className = '') {
return `<a href="${esc(href)}" class="${className}">${esc(text)}</a>`;
}

function row(label, value) {
return `<div class="row"><span class="label">${esc(label)}</span><span class="value">${value}</span></div>`;
}

// ============================================================================
// BOARD VIEW - Surface 1: Bounty board with live pot, fee, time left, entries
// ============================================================================

export function renderBoard(container, data) {
if (!data?.items?.length) {
container.innerHTML = `
<div class="empty">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"></polygon></svg>
<h2>No open bounties</h2>
<p>Check back later for new competitions.</p>
</div>
`;
return;
}

const rows = data.items.map(b => {
const status = b.deadline ? (new Date(b.deadline) > Date.now() ? 'live' : 'ended') : 'soon';
const statusBadge = badge(status === 'live' ? 'Live' : status === 'ended' ? 'Ended' : 'Soon', status);
const pot = b.potUsd ?? b.rewardAmount;
const fee = b.entryFeeUsd ? `<span class="fee">${money(b.entryFeeUsd)} entry</span>` : '';

return `
<li class="board-item" data-slug="${esc(b.slug)}">
<a href="#/bounty/${encodeURIComponent(b.slug)}" class="bounty-link">
<div class="bounty-main">
<h3>${esc(b.title)}</h3>
<p class="summary">${esc(b.summary || 'No description')}</p>
</div>
<div class="bounty-meta">
<span class="pot money">${money(pot)}</span>
${fee}
<span class="time ${status}">${timeLeft(b.deadline)}</span>
<span class="entries">${b.submissionCount} ${b.submissionCount === 1 ? 'entry' : 'entries'}</span>
${statusBadge}
</div>
</a>
</li>
`;
}).join('');

container.innerHTML = `
<ul class="board" role="list">${rows}</ul>
<style>
.board { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.board-item { border: 1px solid var(--border); border-radius: var(--radius); background: var(--card-bg); transition: all var(--transition); overflow: hidden; }
.board-item:hover { border-color: var(--border-strong); box-shadow: var(--shadow); }
.bounty-link { display: grid; grid-template-columns: 1fr auto; gap: var(--space-4); padding: var(--space-4); text-decoration: none; color: inherit; align-items: start; }
.bounty-main { min-width: 0; }
.bounty-main h3 { margin: 0 0 var(--space-1); font-size: 1rem; font-weight: 600; color: var(--fg); }
.bounty-main h3:hover { color: var(--accent); }
.summary { margin: 0; font-size: 0.875rem; color: var(--fg-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.bounty-meta { display: flex; flex-direction: column; gap: var(--space-1); align-items: flex-end; min-width: 160px; text-align: right; }
.pot { font-size: 1.1rem; font-weight: 700; color: var(--accent); white-space: nowrap; }
.fee { font-size: 0.75rem; color: var(--fg-muted); white-space: nowrap; }
.time { font-size: 0.75rem; font-family: var(--mono); white-space: nowrap; }
.time.live { color: #166534; }
.time.ended { color: #991b1b; }
.time.soon { color: #92400e; }
@media (prefers-color-scheme: dark) {
.time.live { color: #86efac; }
.time.ended { color: #fca5a5; }
.time.soon { color: #fde047; }
}
.entries { font-size: 0.75rem; color: var(--fg-muted); white-space: nowrap; }
.badge { align-self: flex-start; }
@media (max-width: 640px) {
.bounty-link { grid-template-columns: 1fr; gap: var(--space-3); }
.bounty-meta { flex-direction: row; flex-wrap: wrap; justify-content: flex-start; align-items: center; min-width: 0; text-align: left; }
}
</style>
`;
}

// ============================================================================
// BOUNTY VIEW - Surface 2: Bounty page with summary, description, rules, rewards, dates, status
// ============================================================================

export function renderBounty(container, bounty) {
if (!bounty) {
container.innerHTML = '<div class="empty"><h2>Bounty not found</h2></div>';
return;
}

const status = bounty.deadline ? (new Date(bounty.deadline) > Date.now() ? 'live' : 'ended') : 'soon';
const statusBadge = badge(status === 'live' ? 'Accepting entries' : status === 'ended' ? 'Ended' : 'Upcoming', status);
const pot = bounty.potUsd ?? bounty.rewardAmount;

container.innerHTML = `
<nav class="breadcrumb" aria-label="Breadcrumb">
<a href="#/">Board</a> / <span aria-current="page">${esc(bounty.title)}</span>
</nav>

<header class="bounty-header">
<div>
<h1>${esc(bounty.title)}</h1>
<p class="summary">${esc(bounty.summary || 'No summary')}</p>
</div>
<div class="bounty-status">${statusBadge}</div>
</header>

<div class="bounty-grid">
<dl class="bounty-details card">
${row('Reward', `<span class="money">${money(pot)}</span>`)}
${bounty.entryFeeUsd ? row('Entry fee', money(bounty.entryFeeUsd)) : ''}
${row('Deadline', `${date(bounty.deadline)} (${timeLeft(bounty.deadline)})`)}
${row('Entries', bounty.submissionCount.toString())}
${bounty.category ? row('Category', bounty.category) : ''}
${bounty.skills?.length ? row('Skills', bounty.skills.join(', ')) : ''}
</dl>

<div class="bounty-actions card">
<a href="#/bounty/${encodeURIComponent(bounty.slug)}/leaderboard" class="btn btn-primary">View Leaderboard</a>
${bounty.repoUrl ? `<a href="${esc(bounty.repoUrl)}" target="_blank" rel="noopener" class="btn btn-secondary">View Repository</a>` : ''}
</div>
</div>

${bounty.description ? `
<section class="bounty-description card">
<h2>Description</h2>
<div class="description">${esc(bounty.description).replace(/\n/g, '<br>')}</div>
</section>
` : ''}

${bounty.rules ? `
<section class="bounty-rules card">
<h2>Rules</h2>
<div class="rules">${esc(bounty.rules).replace(/\n/g, '<br>')}</div>
</section>
` : ''}

${bounty.rewards ? `
<section class="bounty-rewards card">
<h2>Rewards</h2>
<table class="rewards-table">
<thead><tr><th>Place</th><th>Amount</th><th>Title</th></tr></thead>
<tbody>
${Object.entries(bounty.rewards).map(([place, amount]) => `
<tr><td>${esc(place)}</td><td class="money">${money(amount)}</td><td>${esc(bounty.rewardTitles?.[place] || '')}</td></tr>
`).join('')}
</tbody>
</table>
<p class="rewards-total">Total: <span class="money">${money(bounty.rewardAmount)}</span>${bounty.entryFeeUsd ? ` + ${money(bounty.entryFeeUsd * bounty.submissionCount)} fees` : ''}</p>
</section>
` : ''}

<style>
.breadcrumb { display: flex; gap: var(--space-2); font-size: 0.875rem; color: var(--fg-muted); margin-bottom: var(--space-4); flex-wrap: wrap; }
.breadcrumb a { color: var(--fg-muted); text-decoration: none; }
.breadcrumb a:hover { color: var(--accent); }
.breadcrumb span { color: var(--fg); }
.bounty-header { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-4); margin-bottom: var(--space-4); flex-wrap: wrap; }
.bounty-header h1 { margin: 0 0 var(--space-1); font-size: 1.5rem; }
.bounty-header .summary { margin: 0; color: var(--fg-muted); }
.bounty-grid { display: grid; grid-template-columns: 1fr 280px; gap: var(--space-4); margin-bottom: var(--space-4); }
@media (max-width: 800px) { .bounty-grid { grid-template-columns: 1fr; } .bounty-actions { text-align: center; } }
.bounty-details { display: grid; grid-template-columns: max-content 1fr; gap: var(--space-2) var(--space-4); }
.bounty-details .label { font-weight: 600; color: var(--fg-muted); }
.bounty-details .value { color: var(--fg); }
.description, .rules { white-space: pre-wrap; line-height: 1.7; }
.rewards-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.rewards-table th, .rewards-table td { padding: var(--space-2) var(--space-3); text-align: left; border-bottom: 1px solid var(--border); }
.rewards-table th { font-weight: 600; color: var(--fg-muted); }
.rewards-table tbody tr:hover { background: var(--accent-soft); }
.rewards-total { margin-top: var(--space-3); font-weight: 600; text-align: right; }
</style>
`;
}

// ============================================================================
// LEADERBOARD VIEW - Surface 3: Bounty's leaderboard
// ============================================================================

export function renderLeaderboard(container, data, params) {
const slug = params[0];
if (!data?.items?.length) {
container.innerHTML = `
<div class="empty">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="20" x2="12" y2="10"></line><polyline points="18,10 12,4 6,10"></polyline></svg>
<h2>No leaderboard yet</h2>
<p>Entries are still being graded.</p>
<a href="#/bounty/${encodeURIComponent(slug)}" class="btn btn-primary" style="margin-top: var(--space-3); display: inline-block;">Back to Bounty</a>
</div>
`;
return;
}

const ranked = data.items
.filter(s => s.rank != null)
.sort((a, b) => (a.rank || 999) - (b.rank || 999))
.slice(0, 50);

const rows = ranked.map(s => `
<tr>
<td class="rank">#${s.rank}</td>
<td class="handle"><a href="#/profile/${encodeURIComponent(s.handle)}">${esc(s.handle)}</a></td>
<td class="title">${esc(s.title || 'Untitled')}</td>
<td class="score">${esc(JSON.stringify(s.score))}</td>
<td class="prize">${s.prize_rank ? `#${s.prize_rank}` : '—'}</td>
<td class="status">${esc(s.status)}</td>
</tr>
`).join('');

container.innerHTML = `
<nav class="breadcrumb" aria-label="Breadcrumb">
<a href="#/">Board</a> / <a href="#/bounty/${encodeURIComponent(slug)}">${esc(slug)}</a> / <span aria-current="page">Leaderboard</span>
</nav>

<h1>Leaderboard</h1>

<div class="card" style="overflow-x: auto;">
<table class="leaderboard-table">
<thead>
<tr><th>Rank</th><th>Handle</th><th>Entry</th><th>Score</th><th>Prize</th><th>Status</th></tr>
</thead>
<tbody>${rows}</tbody>
</table>
</div>

<p class="leaderboard-note">Showing top ${ranked.length} of ${data.items.length} entries.</p>

<style>
.leaderboard-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.leaderboard-table th, .leaderboard-table td { padding: var(--space-2) var(--space-3); text-align: left; border-bottom: 1px solid var(--border); }
.leaderboard-table th { font-weight: 600; color: var(--fg-muted); white-space: nowrap; }
.leaderboard-table .rank { font-family: var(--mono); font-weight: 600; width: 60px; }
.leaderboard-table .handle a { color: var(--fg); text-decoration: none; }
.leaderboard-table .handle a:hover { color: var(--accent); }
.leaderboard-table .score { font-family: var(--mono); font-size: 0.75rem; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.leaderboard-table .prize { font-weight: 600; color: var(--accent); }
.leaderboard-table .status { font-size: 0.75rem; color: var(--fg-muted); text-transform: capitalize; }
.leaderboard-table tbody tr:hover { background: var(--accent-soft); }
.leaderboard-note { margin-top: var(--space-3); font-size: 0.875rem; color: var(--fg-muted); text-align: center; }
</style>
`;
}

// ============================================================================
// PROFILE VIEW - Surface 4: Account's public profile
// ============================================================================

export function renderProfile(container, profile) {
if (!profile) {
container.innerHTML = '<div class="empty"><h2>Profile not found</h2></div>';
return;
}

const avatar = profile.avatarUrl ? `<img src="${esc(profile.avatarUrl)}" alt="" class="avatar" crossorigin="anonymous">` : '<div class="avatar placeholder"></div>';

container.innerHTML = `
<nav class="breadcrumb" aria-label="Breadcrumb">
<a href="#/">Board</a> / <span aria-current="page">${esc(profile.handle)}</span>
</nav>

<header class="profile-header">
${avatar}
<div>
<h1>${esc(profile.handle)}</h1>
${profile.bio ? `<p class="bio">${esc(profile.bio)}</p>` : ''}
<div class="profile-meta">
${profile.location ? `<span>📍 ${esc(profile.location)}</span>` : ''}
${profile.website ? `<span><a href="${esc(profile.website)}" target="_blank" rel="noopener">${esc(profile.website)}</a></span>` : ''}
<span>Joined ${date(profile.createdAt)}</span>
</div>
</div>
</header>

${profile.stats ? `
<section class="profile-stats card">
<div class="stat"><span class="stat-value">${profile.stats.entries || 0}</span><span class="stat-label">Entries</span></div>
<div class="stat"><span class="stat-value">${profile.stats.wins || 0}</span><span class="stat-label">Wins</span></div>
<div class="stat"><span class="stat-value">${profile.stats.prizesUsd ? money(profile.stats.prizesUsd) : '$0'}</span><span class="stat-label">Prizes</span></div>
</section>
` : ''}

${profile.recentEntries?.length ? `
<section class="profile-entries card">
<h2>Recent Entries</h2>
<ul class="entry-list">
${profile.recentEntries.slice(0, 10).map(e => `
<li><a href="#/bounty/${encodeURIComponent(e.slug)}">${esc(e.title)}</a> <span class="status ${e.status}">${esc(e.status)}</span></li>
`).join('')}
</ul>
</section>
` : ''}

<style>
.profile-header { display: flex; gap: var(--space-4); margin-bottom: var(--space-4); flex-wrap: wrap; align-items: center; }
.avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; background: var(--accent-soft); }
.avatar.placeholder { width: 80px; height: 80px; border-radius: 50%; background: var(--accent-soft); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--accent); }
.profile-header h1 { margin: 0 0 var(--space-1); }
.bio { margin: 0 0 var(--space-2); color: var(--fg-muted); }
.profile-meta { display: flex; gap: var(--space-4); flex-wrap: wrap; font-size: 0.875rem; color: var(--fg-muted); }
.profile-meta a { color: var(--accent); }
.profile-stats { display: flex; gap: var(--space-6); justify-content: center; margin-bottom: var(--space-4); }
.stat { display: flex; flex-direction: column; align-items: center; gap: var(--space-1); }
.stat-value { font-size: 1.5rem; font-weight: 700; color: var(--accent); font-family: var(--mono); }
.stat-label { font-size: 0.75rem; color: var(--fg-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.entry-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-2); }
.entry-list li { display: flex; justify-content: space-between; align-items: center; padding: var(--space-2) 0; border-bottom: 1px solid var(--border); }
.entry-list li:last-child { border-bottom: none; }
.entry-list a { color: var(--fg); text-decoration: none; }
.entry-list a:hover { color: var(--accent); }
</style>
`;
}

// ============================================================================
// SEARCH VIEW - Client-side search across bounties
// ============================================================================

export function renderSearch(container, data) {
const bounties = data?.items || [];

container.innerHTML = `
<header class="search-header">
<h1>Search Bounties</h1>
<div class="search-box">
<input type="search" id="search-input" placeholder="Search by title, category, skill…" autocomplete="off" aria-label="Search bounties">
<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
</div>
</header>

<div id="search-results" class="search-results">
${bounties.length ? renderSearchResults(bounties) : '<div class="empty"><p>No bounties found</p></div>'}
</div>

<style>
.search-header { margin-bottom: var(--space-4); }
.search-header h1 { margin: 0 0 var(--space-3); }
.search-box { position: relative; max-width: 480px; }
.search-box input { width: 100%; padding: var(--space-3) var(--space-4) var(--space-3) 44px; border: 1px solid var(--border); border-radius: var(--radius-pill); background: var(--card-bg); color: var(--fg); font: inherit; font-size: 1rem; transition: all var(--transition); }
.search-box input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; color: var(--fg-muted); pointer-events: none; }
.search-results { display: flex; flex-direction: column; gap: var(--space-3); }
.search-item { display: flex; gap: var(--space-3); padding: var(--space-3); background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius); text-decoration: none; color: inherit; transition: all var(--transition); }
.search-item:hover { border-color: var(--accent); box-shadow: var(--shadow); background: var(--card-hover); }
.search-item-main { flex: 1; min-width: 0; }
.search-item h3 { margin: 0 0 var(--space-1); font-size: 1rem; font-weight: 600; }
.search-item p { margin: 0; font-size: 0.875rem; color: var(--fg-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.search-item-meta { display: flex; flex-direction: column; gap: var(--space-1); align-items: flex-end; min-width: 140px; text-align: right; }
.search-item .pot { font-weight: 700; color: var(--accent); }
.search-item .time { font-size: 0.75rem; font-family: var(--mono); }
@media (max-width: 640px) {
.search-item { flex-direction: column; gap: var(--space-2); }
.search-item-meta { flex-direction: row; flex-wrap: wrap; justify-content: flex-start; align-items: center; min-width: 0; text-align: left; }
}
</style>

<script>
(function() {
const input = document.getElementById('search-input');
const results = document.getElementById('search-results');
const bounties = ${JSON.stringify(bounties)};

function render(list) {
if (!list.length) {
results.innerHTML = '<div class="empty"><p>No matches</p></div>';
return;
}
results.innerHTML = list.map(b => \`
<a href="#/bounty/\${encodeURIComponent(b.slug)}" class="search-item">
<div class="search-item-main">
<h3>\${escapeHtml(b.title)}</h3>
<p>\${escapeHtml(b.summary || 'No description')}</p>
</div>
<div class="search-item-meta">
<span class="pot">\${formatMoney(b.potUsd ?? b.rewardAmount)}</span>
<span class="time \${new Date(b.deadline) > Date.now() ? 'live' : 'ended'}">\${formatTimeLeft(b.deadline)}</span>
<span class="entries">\${b.submissionCount} entries</span>
</div>
</a>
\`).join('');
}

function escapeHtml(str) {
return String(str ?? '').replace(/[&<>\"']/g, c => '&#' + c.charCodeAt(0) + ';');
}

function formatMoney(v) {
const n = Number(v);
return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(n) ? 0 : 2 });
}

function formatTimeLeft(iso) {
const ms = new Date(iso).getTime() - Date.now();
if (ms <= 0) return 'ended';
const d = Math.floor(ms / 86400000);
const h = Math.floor((ms % 86400000) / 3600000);
const m = Math.floor((ms % 3600000) / 60000);
if (d > 0) return d + 'd ' + h + 'h left';
if (h > 0) return h + 'h ' + m + 'm left';
return m + 'm left';
}

let debounceTimer;
input.addEventListener('input', () => {
clearTimeout(debounceTimer);
debounceTimer = setTimeout(() => {
const q = input.value.toLowerCase().trim();
if (!q) { render(bounties); return; }
const filtered = bounties.filter(b =>
b.title.toLowerCase().includes(q) ||
(b.summary || '').toLowerCase().includes(q) ||
(b.category || '').toLowerCase().includes(q) ||
(b.skills || []).some(s => s.toLowerCase().includes(q))
);
render(filtered);
}, 100);
});

render(bounties);
})();
</script>
`;
}