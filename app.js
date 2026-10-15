/* bukz — app. Reads window.BUKZ (config.js) and ledger.json. No fake numbers: without a CA the shop is "pre-launch". */
(function () {
  'use strict';
  const C = window.BUKZ || {};
  const ITEMS = C.ITEMS || [];
  const GPU = C.GTA_PER_USD || 80000;
  const CA = String(C.CA || '').trim();
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf = n => Math.round(n).toLocaleString('en-US');

  const fmt = {
    usd(n) { if (n == null || isNaN(n)) return '—'; const a = Math.abs(n); if (a >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B'; if (a >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M'; if (a >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K'; return '$' + n.toFixed(2); },
    usdFull(n) { return '$' + nf(n); },
    gta(n) { return 'GTA$ ' + nf(n); },
    gtaShort(n) { const a = Math.abs(n); if (a >= 1e6) return 'GTA$ ' + String(+(n / 1e6).toFixed(2)) + 'M'; if (a >= 1e3) return 'GTA$ ' + String(+(n / 1e3).toFixed(0)) + 'K'; return 'GTA$ ' + nf(n); },
    px(n) { if (n == null || isNaN(n)) return '—'; if (n >= 1) return '$' + n.toFixed(4); if (n >= 0.001) return '$' + n.toFixed(6); return '$' + n.toPrecision(3); },
    pct(n) { if (n == null || isNaN(n)) return '—'; return (n > 0 ? '+' : '') + n.toFixed(1) + '%'; },
    sol(n) { return String(+(+n || 0).toFixed(3)) + ' SOL'; },
    date(s) { return s ? String(s).slice(0, 10) : '—'; }
  };

  /* ---------- toasts */
  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    $('#toasts').appendChild(t);
    setTimeout(() => t.classList.add('out'), 2600); setTimeout(() => t.remove(), 3100);
  }

  /* ---------- tabs */
  const tabs = $('#tabs'), ind = $('.ind', tabs), tabBtns = $$('button[data-tab]', tabs);
  function moveInd() { const b = $('button.on', tabs); if (!b) return; ind.style.left = b.offsetLeft + 'px'; ind.style.width = b.offsetWidth + 'px'; }
  function go(name, scroll) {
    if (!$('#tab-' + name)) name = 'home';
    tabBtns.forEach(b => b.classList.toggle('on', b.dataset.tab === name));
    $$('.panel').forEach(p => p.classList.toggle('on', p.id === 'tab-' + name));
    moveInd();
    if (location.hash !== '#' + name) history.replaceState(null, '', '#' + name);
    if (scroll !== false) window.scrollTo({ top: 0, behavior: 'smooth' });
    if (tabs.scrollWidth > tabs.clientWidth + 2) { const b = $('button.on', tabs); b && b.scrollIntoView({ block: 'nearest', inline: 'center' }); }
  }
  tabs.addEventListener('click', e => { const b = e.target.closest('button[data-tab]'); if (b) go(b.dataset.tab); });
  document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) { e.preventDefault(); go(b.dataset.go); } });
  window.addEventListener('hashchange', () => go(location.hash.slice(1) || 'home'));
  window.addEventListener('resize', moveInd);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInd);
  setTimeout(moveInd, 400);
  document.addEventListener('keydown', e => {
    if (e.target.matches('input,textarea,select') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Escape') { closeDrawer(); return; }
    const i = +e.key; if (i >= 1 && i <= tabBtns.length) go(tabBtns[i - 1].dataset.tab);
  });

  /* ---------- links + CA */
  const buyUrl = CA ? 'https://pump.fun/coin/' + CA : 'https://pump.fun/';
  const chartUrl = CA ? 'https://dexscreener.com/solana/' + CA : 'https://dexscreener.com/solana';
  $('#buy').href = buyUrl; $('#buytop').href = buyUrl; $('#chart').href = chartUrl; $('#xlink').href = C.X || 'https://x.com/';
  function copyCA() {
    const done = () => toast('CA copied');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(CA).then(done, () => legacyCopy(CA, done));
    else legacyCopy(CA, done);
  }
  function legacyCopy(text, done) { const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('Copy failed'); } ta.remove(); }
  if (CA) {
    $('#ca-text').textContent = CA; $('#ca-box').classList.add('set'); $('#ca-box').hidden = false;
    const cp = $('#copyca'); cp.disabled = false; cp.addEventListener('click', copyCA); $('#ca-text').addEventListener('click', copyCA);
  }

  /* ---------- countdown */
  const release = new Date(C.RELEASE || '2026-11-19T00:00:00-05:00').getTime();
  const cdEls = $$('#cd b');
  function tick() {
    const d = release - Date.now();
    if (d <= 0) { cdEls.forEach(b => b.textContent = '00'); $('.count small').textContent = 'The new city is open'; return; }
    const s = Math.floor(d / 1000);
    [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60].forEach((n, i) => {
      const v = String(n).padStart(2, '0'); if (cdEls[i].textContent === v) return;
      cdEls[i].textContent = v; cdEls[i].classList.remove('pop'); void cdEls[i].offsetWidth; cdEls[i].classList.add('pop');
    });
  }
  tick(); setInterval(tick, 1000);

  /* ---------- cash card rates (official store list prices; in-game dollars per card) */
  const CARDS = [[99.99, 8000000], [49.99, 3500000], [19.99, 1250000], [9.99, 500000], [4.99, 200000], [2.99, 100000]];
  function renderRates() {
    const tb = $('#rates tbody'); tb.innerHTML = '';
    const best = Math.max.apply(null, CARDS.map(c => c[1] / c[0]));
    CARDS.forEach(([usd, gta]) => {
      const per = gta / usd; const tr = document.createElement('tr'); if (per === best) tr.className = 'best';
      tr.innerHTML = '<td>$' + usd.toFixed(2) + ' card</td><td class="n">$' + usd.toFixed(2) + '</td><td class="n">' + fmt.gta(gta) + '</td><td class="n">' + nf(per) + (per === best ? ' ★' : '') + '</td>';
      tb.appendChild(tr);
    });
  }

  /* ---------- state from the ledger */
  const state = { entries: [], account: '', updated: '', bal: 0, feesSol: 0, cardsUsd: 0, cardsGta: 0, owned: new Set(), buys: [], next: null, live: null, rugShown: false };
  function compute() {
    let bal = 0, sol = 0, usd = 0, gta = 0; const owned = new Set(); state.buys = [];
    for (const e of state.entries) {
      if (e.type === 'fees') sol += +e.sol || 0;
      else if (e.type === 'card') { usd += +e.usd || 0; gta += +e.gta || 0; bal += +e.gta || 0; }
      else if (e.type === 'buy') { bal -= +e.gta || 0; if (e.item) { owned.add(e.item); state.buys.push(e); } }
    }
    state.bal = Math.max(0, bal); state.feesSol = sol; state.cardsUsd = usd; state.cardsGta = gta; state.owned = owned;
    state.next = ITEMS.find(i => !owned.has(i.id)) || null;
  }
  async function loadLedger() {
    try {
      const r = await fetch('ledger.json?ts=' + Date.now(), { cache: 'no-store' }); if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      state.entries = (j.entries || []).slice().sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
      state.account = j.account || ''; state.updated = j.updated || '';
    } catch (e) { state.entries = []; }
    compute(); renderAll();
  }
  const itemById = id => ITEMS.find(i => i.id === id);
  const itemName = id => { const it = itemById(id); return it ? it.name : ''; };
  function statusOf(it) { return state.owned.has(it.id) ? 'owned' : (state.next && state.next.id === it.id ? 'next' : 'queued'); }
  function progressOf(it) { const st = statusOf(it); return st === 'owned' ? 1 : st === 'next' ? Math.min(1, state.bal / it.gta) : 0; }
  const LABEL = { owned: 'In the garage', next: 'Next', queued: 'Queued' };
  const TAGCLS = { owned: 'ok', next: '', queued: 'dim' };

  /* ---------- icons (own line drawings, viewBox 0 0 120 80) */
  const ICON = {
    car: '<path d="M12 52L16 38L36 34L48 20H78L94 34L108 38L112 52Z"/><path d="M40 34L50 25H76L88 34"/><path d="M12 52H112"/><circle cx="36" cy="55" r="9"/><circle cx="86" cy="55" r="9"/><path d="M100 44H108"/>',
    convertible: '<path d="M12 52L16 38L36 34L46 24H62L64 34L108 38L112 52Z"/><path d="M46 24L50 34"/><path d="M12 52H112"/><circle cx="36" cy="55" r="9"/><circle cx="86" cy="55" r="9"/>',
    garage: '<path d="M20 70V30H100V70"/><path d="M14 30L60 12L106 30"/><path d="M30 70V46H54V70M66 70V46H90V70"/><path d="M30 54H54M66 54H90"/><path d="M8 70H112"/>',
    tower: '<path d="M32 70V22H88V70"/><path d="M60 22V8"/><path d="M42 32H50M56 32H64M70 32H78M42 44H50M56 44H64M70 44H78M42 56H50M70 56H78"/><path d="M56 70V58H64V70"/><path d="M20 70H100"/>',
    heli: '<path d="M30 44Q30 30 48 30H72Q86 30 86 44Q86 56 72 56H48Q30 56 30 44Z"/><path d="M86 42L112 36V46L86 48"/><path d="M22 20H100"/><path d="M60 30V20"/><path d="M36 66H84M44 56V66M72 56V66"/><path d="M106 30V52"/>',
    jet: '<path d="M14 44Q14 36 26 36H92L112 40L92 48H26Q14 48 14 44Z"/><path d="M50 40L36 62H58L70 40"/><path d="M50 48L44 62"/><path d="M24 36L16 20H28L40 36"/><path d="M92 36L98 26"/>',
    storefront: '<path d="M18 70V36H102V70"/><path d="M14 36L22 22H98L106 36"/><path d="M52 70V48H68V70"/><path d="M40 22V14H80V22"/><path d="M28 46H44V58H28ZM76 46H92V58H76Z"/><path d="M8 70H112"/>',
    cabinet: '<path d="M40 70V18H80V70"/><path d="M46 30H74V48H46Z"/><path d="M46 56H74"/><path d="M52 62H56M64 62H68"/><path d="M34 70H86"/>',
    yacht: '<path d="M8 50H112L100 66H24Z"/><path d="M30 50V38H84V50"/><path d="M40 38V28H70V38"/><path d="M58 28V8"/><path d="M58 10L84 28"/><path d="M14 72H106"/>',
    star: '<path d="M60 10L71 36H100L77 52L85 78L60 62L35 78L43 52L20 36H49Z"/>'
  };
  const ICON_BY_ID = { sports: 'car', super: 'car', hyper: 'car', classic: 'convertible', garage: 'garage', pent: 'tower', heli: 'heli', jet: 'jet', club: 'storefront', arcade: 'cabinet', yacht: 'yacht', lot: 'star' };
  const ICON_BY_TIER = { Vehicle: 'car', Property: 'garage', Aircraft: 'jet', Business: 'storefront', Vessel: 'yacht', Milestone: 'star' };
  function icon(it) { const k = ICON_BY_ID[it.id] || ICON_BY_TIER[it.tier] || 'star'; return '<svg viewBox="0 0 120 80" aria-hidden="true">' + ICON[k] + '</svg>'; }

  /* ---------- showroom + garage cards */
  function itemCard(it, no, delay) {
    const st = statusOf(it), p = progressOf(it);
    const el = document.createElement('div');
    el.className = 'item ' + st; el.dataset.id = it.id; el.dataset.tier = it.tier; el.style.animationDelay = (delay * 40) + 'ms';
    el.innerHTML = '<div class="plate">' + icon(it) + '<span class="tag ' + TAGCLS[st] + '">' + LABEL[st] + '</span><span class="no">#' + String(no).padStart(2, '0') + '</span></div>' +
      '<div class="it-b"><div class="it-tier">' + esc(it.tier) + '</div><div class="it-name">' + esc(it.name) + '</div>' +
      '<div class="it-price">' + fmt.gtaShort(it.gta) + '<span>≈ ' + fmt.usdFull(it.gta / GPU) + ' in cards</span></div>' +
      '<div class="bar"><i class="' + (p >= 1 ? 'full' : '') + '" data-w="' + (p * 100).toFixed(1) + '"></i></div></div>';
    el.addEventListener('click', () => openDrawer(it));
    return el;
  }
  function animateBars(root) { requestAnimationFrame(() => requestAnimationFrame(() => $$('.bar i[data-w]', root).forEach(i => i.style.width = i.dataset.w + '%'))); }
  let filter = 'all';
  function renderItems() {
    const box = $('#items'); box.innerHTML = '';
    ITEMS.forEach((it, i) => { const el = itemCard(it, i + 1, i); if (filter !== 'all' && it.tier !== filter) el.style.display = 'none'; box.appendChild(el); });
    animateBars(box);
  }
  $('#filters').addEventListener('click', e => {
    const b = e.target.closest('button[data-f]'); if (!b) return;
    $$('#filters button').forEach(x => x.classList.toggle('on', x === b)); filter = b.dataset.f;
    let n = 0; $$('#items .item').forEach((el, i) => { const show = filter === 'all' || el.dataset.tier === filter; el.style.display = show ? '' : 'none'; if (show) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; el.style.animationDelay = (n++ * 40) + 'ms'; } });
  });
  function renderGarage() {
    countTo($('#g-n'), state.owned.size, v => String(Math.round(v)));
    countTo($('#g-bal'), state.bal, fmt.gta);
    countTo($('#g-usd'), state.cardsUsd, fmt.usdFull);
    countTo($('#g-sol'), state.feesSol, fmt.sol);
    const g = $('#garage'); g.innerHTML = '';
    const ownedItems = ITEMS.filter(i => state.owned.has(i.id));
    ownedItems.forEach((it, i) => g.appendChild(itemCard(it, ITEMS.indexOf(it) + 1, i)));
    animateBars(g);
    $('#g-empty').hidden = ownedItems.length > 0;
    $('#g-away').textContent = state.next ? fmt.gtaShort(Math.max(0, state.next.gta - state.bal)) : '—';
  }

  /* ---------- next on the lot */
  function renderNext() {
    const n = state.next, bar = $('#next-bar');
    if (!n) {
      $('#next-name').textContent = 'The lot is full'; $('#next-tag').textContent = 'done'; $('#next-tag').className = 'tag ok';
      bar.className = 'full'; bar.style.width = '100%'; $('#next-sub').textContent = 'Every item in the showroom has a receipt.'; return;
    }
    const p = Math.min(1, state.bal / n.gta), left = Math.max(0, n.gta - state.bal);
    $('#next-name').textContent = n.name;
    $('#next-tag').textContent = state.owned.size ? 'next' : 'first'; $('#next-tag').className = 'tag';
    requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = (p * 100).toFixed(1) + '%'; }));
    $('#next-sub').textContent = fmt.gta(state.bal) + ' of ' + fmt.gta(n.gta) + ' in the account · ' + fmt.gtaShort(left) + ' to go (≈ ' + fmt.usdFull(left / GPU) + ' in cards)';
  }

  /* ---------- drawer */
  const drawer = $('#drawer'); let drArt = null;
  function openDrawer(it) {
    if (!drArt) { drArt = document.createElement('div'); drArt.className = 'dr-art'; $('#dr-tier').before(drArt); }
    const st = statusOf(it), p = progressOf(it);
    drArt.innerHTML = icon(it); drArt.className = 'dr-art ' + st;
    $('#dr-tier').textContent = it.tier + ' · #' + String(ITEMS.indexOf(it) + 1).padStart(2, '0');
    $('#dr-name').textContent = it.name;
    $('#dr-price').innerHTML = esc(fmt.gta(it.gta)) + '<span>≈ ' + esc(fmt.usdFull(it.gta / GPU)) + ' in cash cards</span>';
    $('#dr-note').textContent = it.note || '';
    $('#dr-stat').innerHTML = '<span class="tag ' + TAGCLS[st] + '">' + LABEL[st] + '</span>';
    const bar = $('#dr-bar'); bar.className = p >= 1 ? 'full' : ''; bar.style.width = '0%';
    requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = (p * 100).toFixed(1) + '%'; }));
    let sub, rec;
    if (st === 'owned') {
      const b = state.buys.find(x => x.item === it.id) || {};
      sub = 'Bought and parked. ' + (b.date ? 'Receipt dated ' + fmt.date(b.date) + '.' : '');
      rec = 'receipt · ' + esc(fmt.date(b.date)) + (b.gta ? ' · ' + esc(fmt.gta(b.gta)) : '') + (b.note ? '<br>' + esc(b.note) : '') + '<br>' + (b.proof ? '<a href="' + esc(b.proof) + '" target="_blank" rel="noopener">open the proof ↗</a>' : 'proof link pending');
    } else if (st === 'next') {
      const left = Math.max(0, it.gta - state.bal);
      sub = fmt.gta(state.bal) + ' of ' + fmt.gta(it.gta) + ' in the account. ' + fmt.gtaShort(left) + ' to go, about ' + fmt.usdFull(left / GPU) + ' in cards.';
      rec = 'no receipt yet · this is the next purchase. When the account holds ' + esc(fmt.gta(it.gta)) + ' the shop buys it and the receipt lands here and on the ledger.';
    } else {
      const ahead = ITEMS.slice(0, ITEMS.indexOf(it)).filter(x => !state.owned.has(x.id)).length;
      sub = ahead + (ahead === 1 ? ' item' : ' items') + ' ahead of it in the queue.';
      rec = 'queued · the shop buys in showroom order. Nothing here is a promise; the ledger is the only truth.';
    }
    $('#dr-sub').textContent = sub; $('#dr-rec').innerHTML = rec;
    drawer.hidden = false; document.body.style.overflow = 'hidden';
  }
  function closeDrawer() { if (drawer.hidden) return; drawer.hidden = true; document.body.style.overflow = ''; }
  $('#dr-x').addEventListener('click', closeDrawer);
  $('.dr-bg').addEventListener('click', closeDrawer);

  /* ---------- ledger table + csv */
  const TYPES = { fees: 'Fees claimed', card: 'Cash card', buy: 'Purchase' };
  function renderLedger() {
    const tb = $('#ledger tbody'); tb.innerHTML = '';
    state.entries.slice().reverse().forEach(e => {
      const tr = document.createElement('tr');
      const item = itemName(e.item) || e.note || '';
      tr.innerHTML = '<td class="n">' + esc(fmt.date(e.date)) + '</td>' +
        '<td><span class="tag ' + (e.type === 'buy' ? 'ok' : e.type === 'card' ? '' : 'dim') + '">' + esc(TYPES[e.type] || e.type) + '</span></td>' +
        '<td class="n">' + (e.sol != null ? esc(fmt.sol(e.sol)) : '—') + '</td>' +
        '<td class="n">' + (e.usd != null ? esc(fmt.usdFull(e.usd)) : '—') + '</td>' +
        '<td class="n">' + (e.gta != null ? (e.type === 'buy' ? '−' : '+') + nf(e.gta) : '—') + '</td>' +
        '<td>' + esc(item) + '</td>' +
        '<td>' + (e.proof ? '<a href="' + esc(e.proof) + '" target="_blank" rel="noopener">view ↗</a>' : '—') + '</td>';
      tb.appendChild(tr);
    });
    $('#l-empty').hidden = state.entries.length > 0;
    $('#l-meta').textContent = 'account: ' + (state.account || '—') + ' · updated: ' + (state.updated || '—') + ' · entries: ' + state.entries.length;
  }
  $('#csv').addEventListener('click', () => {
    const rows = [['date', 'type', 'sol', 'usd', 'gta', 'item', 'note', 'proof']];
    state.entries.forEach(e => rows.push([e.date, e.type, e.sol, e.usd, e.gta, itemName(e.item) || e.item || '', e.note || '', e.proof || '']));
    const csv = rows.map(r => r.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'bukz-ledger.csv';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    toast(state.entries.length ? 'Ledger exported' : 'Exported an empty ledger. The first entry is still ahead.');
  });

  /* ---------- heist board */
  function missions() {
    const L = state.live, mc = L ? L.marketCap : 0;
    return [
      { n: 'Open the shop', d: 'The token goes live on pump.fun and the CA lands on this page.', ok: !!CA, r: 'the lot opens' },
      { n: 'Bond', d: 'The curve fills and the pool moves to PumpSwap. The creator fee tier unlocks.', ok: !!(L && L.bonded), r: 'full fee tier' },
      { n: 'Dex paid', d: 'The chart gets its name, logo and links.', ok: !!(L && L.dexPaid), r: 'a face on the chart' },
      { n: 'First cash card', d: 'Fees claimed, sold, and spent on the first official cash card.', ok: state.cardsGta > 0, r: 'first receipt on the wall' },
      { n: 'First car on the lot', d: 'The sports car is parked in the garage with a screenshot.', ok: state.owned.size >= 1, r: 'the garage opens' },
      { n: '$100K market cap', d: 'Live from the chart.', ok: mc >= 1e5, r: 'wanted level ★★' },
      { n: 'GTA$ 5M through the shop', d: 'Five million in-game dollars bought with fees, total.', ok: state.cardsGta >= 5e6, r: 'a wall of receipts' },
      { n: 'Five items', d: 'Almost half the showroom has receipts.', ok: state.owned.size >= 5, r: 'the lot fills up' },
      { n: '$1M market cap', d: 'Live from the chart.', ok: mc >= 1e6, r: 'wanted level ★★★★★' },
      { n: 'The new city', d: 'November 19. The garage moves there on day one.', ok: Date.now() >= release, r: 'new showroom, new prices' },
      { n: 'A full showroom', d: 'Every item in the showroom has a receipt.', ok: ITEMS.length > 0 && ITEMS.every(i => state.owned.has(i.id)), r: 'ten cars, one wall' }
    ];
  }
  function renderMissions() {
    const box = $('#missions'); box.innerHTML = ''; let activeSet = false;
    missions().forEach((m, i) => {
      let st = 'locked'; if (m.ok) st = 'done'; else if (!activeSet) { st = 'active'; activeSet = true; }
      const el = document.createElement('div'); el.className = 'mission ' + st; el.style.animationDelay = (i * 40) + 'ms';
      el.innerHTML = '<div class="m-n">' + (m.ok ? '✓' : String(i + 1).padStart(2, '0')) + '</div><div><div class="m-name">' + esc(m.n) +
        '<span class="tag ' + (st === 'done' ? 'ok' : st === 'active' ? '' : 'dim') + '">' + (st === 'done' ? 'done' : st === 'active' ? 'in progress' : 'locked') + '</span></div>' +
        '<div class="m-desc">' + esc(m.d) + '</div><div class="m-rew">reward · ' + esc(m.r) + '</div></div>';
      box.appendChild(el);
    });
  }

  /* ---------- calculator */
  const vol = $('#c-vol'), fee = $('#c-fee');
  function setPct(el) { el.style.setProperty('--pct', ((el.value - el.min) / (el.max - el.min) * 100) + '%'); }
  function calc() {
    setPct(vol); setPct(fee);
    const v = +vol.value, f = +fee.value, fees = v * f / 100, gta = fees * GPU;
    $('#c-vol-o').textContent = fmt.usdFull(v); $('#c-fee-o').textContent = f.toFixed(2) + '%';
    $('#c-fees').textContent = fmt.usdFull(fees); $('#c-gta').textContent = fmt.gta(gta);
    const dur = need => { if (need <= 0) return 'now'; if (gta <= 0) return '—'; const h = need / gta * 24; if (h < 1) return Math.max(1, Math.round(h * 60)) + ' min'; if (h < 48) return (h < 10 ? h.toFixed(1) : Math.round(h)) + ' hours'; const d = h / 24; return (d < 10 ? d.toFixed(1) : Math.round(d)) + ' days'; };
    const remaining = ITEMS.filter(i => !state.owned.has(i.id)).reduce((a, b) => a + b.gta, 0);
    $('#c-days').textContent = state.next ? dur(Math.max(0, state.next.gta - state.bal)) : 'lot is full';
    $('#c-cars').textContent = remaining > 0 ? dur(Math.max(0, remaining - state.bal)) : 'bought';
  }
  vol.addEventListener('input', calc); fee.addEventListener('input', calc);

  /* ---------- live data (DexScreener), honest offline states */
  function offline(word, stamp) { const lw = $('#live-word'); if (lw) lw.textContent = word; const dot = $('.dot'); if (dot) dot.classList.remove('live'); document.body.classList.remove('live'); $('#stamp').textContent = stamp; if (state.live) { state.live = null; renderTicker(); } }
  function wanted(L) {
    const t = L.buys + L.sells; if (!t) return 0; const r = L.buys / t;
    let w = r >= .75 ? 5 : r >= .65 ? 4 : r >= .55 ? 3 : r >= .45 ? 2 : 1; if (t < 10) w = Math.min(w, 2); return w;
  }
  async function live() {
    if (!CA) { offline('pre-launch', 'CA not set'); return; }
    try {
      const r = await fetch('https://api.dexscreener.com/latest/dex/tokens/' + CA, { cache: 'no-store' }); if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      const pairs = (j.pairs || []).filter(p => p.chainId === 'solana'); if (!pairs.length) throw new Error('no pair');
      pairs.sort((a, b) => ((b.liquidity && b.liquidity.usd) || 0) - ((a.liquidity && a.liquidity.usd) || 0));
      const p = pairs[0];
      const L = {
        price: +p.priceUsd || 0, h1: +((p.priceChange || {}).h1 || 0), m5: +((p.priceChange || {}).m5 || 0), h24: +((p.priceChange || {}).h24 || 0),
        buys: ((p.txns || {}).h1 || {}).buys || 0, sells: ((p.txns || {}).h1 || {}).sells || 0,
        marketCap: p.marketCap || p.fdv || 0, vol: (p.volume || {}).h24 || 0,
        bonded: pairs.some(x => x.dexId && x.dexId !== 'pumpfun'), dexPaid: !!(p.info && (p.info.imageUrl || (p.info.socials || []).length || (p.info.websites || []).length)),
        pair: p.pairAddress
      };
      state.live = L; renderLive(L);
    } catch (e) { offline('offline', 'no data'); }
  }
  function renderLive(L) {
    const lw = $('#live-word'); if (lw) lw.textContent = 'live'; const dot = $('.dot'); if (dot) dot.classList.add('live'); document.body.classList.add('live');
    $('#stamp').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    countTo($('#s-mc'), L.marketCap, fmt.usd); countTo($('#s-vol'), L.vol, fmt.usd); $('#s-px').textContent = fmt.px(L.price);
    const h = $('#s-h1'); h.textContent = fmt.pct(L.h1); h.className = L.h1 > 0 ? 'up' : L.h1 < 0 ? 'down' : '';
    $('#s-bs').textContent = L.buys + ' / ' + L.sells;
    const wl = wanted(L); $('#s-wl').textContent = '★'.repeat(wl) + '☆'.repeat(5 - wl);
    $$('#stars i').forEach((s, i) => s.classList.toggle('on', i < wl));
    if (L.h1 <= -30 && !state.rugShown) { state.rugShown = true; rug(L); }
    if (state.lastMc && L.marketCap >= state.lastMc * 1.15) toast('Cash up: ' + fmt.usd(L.marketCap));
    state.lastMc = L.marketCap;
    renderMissions(); renderTicker();
  }
  function rug(L) { $('#rug-why').textContent = fmt.pct(L.h1) + ' in an hour. the lot is still here.'; $('#rugged').hidden = false; document.body.classList.add('rug'); }
  $('#rug-x').addEventListener('click', () => { $('#rugged').hidden = true; document.body.classList.remove('rug'); toast("respawned. the garage didn't move."); });

  /* ---------- route animation */
  const nodes = $$('#flow .node'); let fi = 0;
  setInterval(() => { nodes.forEach((n, i) => n.classList.toggle('lit', i === fi)); fi = (fi + 1) % nodes.length; }, 1400);

  /* ---------- the scene: a neon road into the city, drawn on the canvas behind everything */
  const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = $('#bg'), cx2 = cv.getContext('2d');
  const scene = { t: 0, speed: 0.35, k: 0.18, w: 0, h: 0, stars: [], bld: [], cars: [], last: 0 };
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function seedScene() {
    const R = rng(7);
    scene.stars = Array.from({ length: 170 }, () => ({ x: R(), y: R() * 0.55, r: 0.5 + R() * 1.3, p: R() * 6.28 }));
    scene.bld = []; let x = -0.02;
    while (x < 1.05) { const w = 0.014 + R() * 0.045; scene.bld.push({ x, w, h: 0.03 + R() * 0.12, win: Array.from({ length: 2 + Math.floor(R() * 7) }, () => ({ x: R(), y: R(), p: R() * 6.28 })) }); x += w + 0.004; }
    scene.cars = Array.from({ length: 6 }, (_, i) => ({ lane: (i % 2 ? 1 : -1) * (0.3 + R() * 0.55), z: 0.3 + R() * 8, v: 0.5 + R() * 0.7, away: i % 2 === 0 }));
  }
  function sizeScene() { const dpr = Math.min(2, window.devicePixelRatio || 1); scene.w = innerWidth; scene.h = innerHeight; cv.width = Math.round(scene.w * dpr); cv.height = Math.round(scene.h * dpr); cx2.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function laneX(L, y, hz, vx, w, h) { const f = (y - hz) / (h + 40 - hz); return vx + L * (2 + (w * 0.11 - 2) * f); }
  function drawScene(now) {
    const dt = Math.min(0.05, scene.last ? (now - scene.last) / 1000 : 0); scene.last = now; scene.t += dt * scene.speed;
    const c = cx2, w = scene.w, h = scene.h, k = scene.k, hz = h * 0.6, vx = w / 2, S = 0.55;
    let g = c.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, '#090d1c'); g.addColorStop(1, '#1a0c3c'); c.fillStyle = g; c.fillRect(0, 0, w, hz);
    g = c.createLinearGradient(0, hz, 0, h); g.addColorStop(0, '#15082c'); g.addColorStop(1, '#090d1c'); c.fillStyle = g; c.fillRect(0, hz, w, h - hz);
    c.fillStyle = '#fff';
    for (const s of scene.stars) { c.globalAlpha = (0.3 + 0.7 * Math.abs(Math.sin(scene.t * 0.9 + s.p))) * (0.45 + 0.55 * k); c.beginPath(); c.arc(s.x * w, s.y * h, s.r, 0, 6.2832); c.fill(); }
    c.globalAlpha = 1;
    const sr = Math.min(w, h) * 0.17, sx = w * 0.72, sy = hz - sr * 0.2;
    c.save(); c.beginPath(); c.rect(0, 0, w, hz); c.clip(); c.globalAlpha = 0.3 + 0.7 * k;
    g = c.createRadialGradient(sx, sy, sr * 0.5, sx, sy, sr * 2.4); g.addColorStop(0, 'rgba(158,42,255,.38)'); g.addColorStop(1, 'rgba(158,42,255,0)'); c.fillStyle = g; c.fillRect(sx - sr * 2.4, sy - sr * 2.4, sr * 4.8, sr * 4.8);
    g = c.createLinearGradient(0, sy - sr, 0, sy + sr); g.addColorStop(0, '#f3c8ff'); g.addColorStop(0.4, '#c84dff'); g.addColorStop(1, '#5a10b8'); c.fillStyle = g; c.beginPath(); c.arc(sx, sy, sr, 0, 6.2832); c.fill();
    c.fillStyle = '#1a0c3c'; let y = sy + sr * 0.08, i = 0;
    while (y < sy + sr) { const band = Math.max(3, sr * 0.1 - i * sr * 0.011), gap = Math.max(2, sr * 0.018 + i * sr * 0.011); c.fillRect(sx - sr - 2, y + band, sr * 2 + 4, gap); y += band + gap; i++; }
    c.restore();
    c.fillStyle = '#06081a';
    for (const b of scene.bld) c.fillRect(b.x * w, hz - b.h * h, b.w * w, b.h * h + 2);
    for (const b of scene.bld) { const bx = b.x * w, bw = b.w * w, bh = b.h * h; for (const win of b.win) { if (Math.sin(scene.t * 0.5 + win.p) < -0.25) continue; c.fillStyle = win.p > 4.2 ? 'rgba(224,179,255,.85)' : 'rgba(255,228,170,.6)'; c.globalAlpha = 0.25 + 0.75 * k; c.fillRect(bx + 2 + win.x * (bw - 5), hz - bh + 3 + win.y * (bh - 7), 2, 2); } }
    c.globalAlpha = 1;
    c.strokeStyle = 'rgba(196,92,255,' + (0.35 + 0.65 * k) + ')'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, hz + 0.5); c.lineTo(w, hz + 0.5); c.stroke();
    c.lineWidth = 1;
    for (let n = -14; n <= 14; n++) { const a = (0.1 + 0.28 * (1 - Math.abs(n) / 14)) * (0.35 + 0.65 * k); c.strokeStyle = 'rgba(196,92,255,' + a + ')'; c.beginPath(); c.moveTo(vx + n * 2, hz); c.lineTo(vx + n * w * 0.11, h + 40); c.stroke(); }
    const frac = scene.t % 1;
    for (let n = 0; n < 16; n++) { const z = n + 1 - frac, p = 1 / (1 + z * S), yy = hz + (h - hz) * p; c.strokeStyle = 'rgba(196,92,255,' + ((0.06 + 0.6 * p) * (0.35 + 0.65 * k)) + ')'; c.lineWidth = 0.6 + 2.2 * p; c.beginPath(); c.moveTo(0, yy); c.lineTo(w, yy); c.stroke(); }
    for (const car of scene.cars) {
      car.z += dt * car.v * scene.speed * 2.2 * (car.away ? 1 : -1);
      if (car.z > 9.5) car.z = 0.25; if (car.z < 0.25) car.z = 9.5;
      const p = 1 / (1 + car.z * S), yy = hz + (h - hz) * p, x = laneX(car.lane, yy, hz, vx, w, h), r = 0.8 + 5 * p, gap = 2 + 9 * p;
      const col = car.away ? '255,92,122' : '255,246,224'; const a = (0.25 + 0.75 * p) * (0.3 + 0.7 * k);
      c.fillStyle = 'rgba(5,6,18,' + (0.5 + 0.5 * p) + ')'; c.fillRect(x - gap - r * 1.4, yy - r * 1.6, (gap + r * 1.4) * 2, r * 2.6);
      c.fillStyle = 'rgba(' + col + ',' + (a * 0.18) + ')'; c.fillRect(x - gap - r * 2.2, yy - r * 1.2, (gap + r * 2.2) * 2, r * 2.4);
      c.fillStyle = 'rgba(' + col + ',' + a + ')'; c.fillRect(x - gap - r, yy - r * 0.5, r * 2, r); c.fillRect(x + gap - r, yy - r * 0.5, r * 2, r);
    }
    c.fillStyle = 'rgba(9,13,28,' + (0.74 * (1 - k)) + ')'; c.fillRect(0, 0, w, h);
  }
  function loop(now) { if (!document.hidden) drawScene(now); else scene.last = 0; requestAnimationFrame(loop); }
  seedScene(); sizeScene(); window.addEventListener('resize', sizeScene);
  if (REDUCED) { scene.speed = 0; drawScene(0); } else requestAnimationFrame(loop);
  function tweenScene(k, speed, ms) { const t0 = performance.now(), k0 = scene.k, s0 = scene.speed; (function f(now) { const u = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - u, 3); scene.k = k0 + (k - k0) * e; scene.speed = s0 + (speed - s0) * e; if (u < 1) requestAnimationFrame(f); })(t0); }

  /* ---------- intro */
  const intro = $('#intro'); let introTimer = null;
  const TIPS = ['loading the new city…', 'fees buy the cars.', 'receipts on the wall.', 'items stay in the shop. not backing.', 'not affiliated with rockstar or take-two.', 'ready.'];
  function startIntro() {
    clearInterval(introTimer); window.scrollTo(0, 0); closeDrawer();
    document.body.classList.add('intro'); document.body.classList.remove('in');
    intro.hidden = false; intro.className = ''; $('#enter').hidden = true; $('#in-bar').style.width = '0%';
    scene.k = 1; scene.speed = 1.7; scene.last = 0;
    $('#in-clock').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let i = 0; $('#in-tip').textContent = TIPS[0];
    requestAnimationFrame(() => requestAnimationFrame(() => { intro.classList.add('go'); $('#in-bar').style.width = '100%'; }));
    introTimer = setInterval(() => {
      i++;
      if (i >= TIPS.length - 1) { clearInterval(introTimer); $('#in-tip').textContent = TIPS[TIPS.length - 1]; $('#enter').hidden = false; intro.classList.add('ready'); return; }
      $('#in-tip').textContent = TIPS[i];
    }, 520);
  }
  function enterShop() {
    if (intro.hidden) return;
    clearInterval(introTimer); try { sessionStorage.setItem('bukz-intro', '1'); } catch (e) { }
    intro.classList.add('out'); document.body.classList.remove('intro'); document.body.classList.add('in');
    tweenScene(0.18, 0.35, 1600); moveInd();
    setTimeout(() => { intro.hidden = true; }, 900);
  }
  $('#enter').addEventListener('click', enterShop); $('#skip').addEventListener('click', enterShop);
  intro.addEventListener('click', e => { if (intro.classList.contains('ready') && !e.target.closest('button')) enterShop(); });
  document.addEventListener('keydown', e => { if (!intro.hidden && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); enterShop(); } });
  $('#replay').addEventListener('click', () => { go('home', false); startIntro(); });
  let seen = false; try { seen = !!sessionStorage.getItem('bukz-intro'); } catch (e) { }
  if (REDUCED || (seen && !/[?&]intro\b/.test(location.search))) { intro.hidden = true; document.body.classList.remove('intro'); document.body.classList.add('in'); }
  else startIntro();

  /* ---------- ticker */
  function renderTicker() {
    const parts = [];
    const L = state.live;
    if (L) parts.push('<span class="live"><em>live</em><b>' + fmt.usd(L.marketCap) + ' mcap</b> · ' + fmt.px(L.price) + ' · 1h ' + esc(fmt.pct(L.h1)) + '</span>');
    else parts.push('<span><em class="dim">' + (CA ? 'offline' : 'pre-launch') + '</em><b>the shop for the new city</b></span>');
    ITEMS.forEach((it, i) => { const st = statusOf(it); parts.push('<span><em class="' + TAGCLS[st] + '">' + LABEL[st] + '</em><b>#' + String(i + 1).padStart(2, '0') + ' ' + esc(it.name) + '</b> ' + esc(fmt.gtaShort(it.gta)) + '</span>'); });
    parts.push('<span><em class="dim">garage</em><b>' + state.owned.size + ' of ' + ITEMS.length + '</b> items · ' + esc(fmt.gta(state.bal)) + ' in the account</span>');
    parts.push('<span><em class="dim">ledger</em><b>' + state.entries.length + '</b> entries · ' + esc(fmt.sol(state.feesSol)) + ' claimed</span>');
    const html = parts.join('');
    $('#tk').innerHTML = html + html;
  }

  /* ---------- pointer: tilt on items, light on cards */
  if (window.matchMedia && window.matchMedia('(hover: hover)').matches && !REDUCED) {
    document.addEventListener('pointermove', e => {
      const el = e.target.closest('.item,.card,.mission'); if (!el) return;
      const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      if (el.classList.contains('item')) el.style.transform = 'perspective(900px) rotateX(' + ((0.5 - py) * 9).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * 11).toFixed(2) + 'deg) translateY(-4px)';
    });
    document.addEventListener('pointerout', e => { const el = e.target.closest('.item'); if (el && !el.contains(e.relatedTarget)) el.style.transform = ''; });
  }

  /* ---------- count-ups */
  function countTo(el, to, f) {
    const from = +el.dataset.v || 0; if (from === to) { el.textContent = f(to); return; }
    el.dataset.v = to; const t0 = performance.now(), d = REDUCED ? 0 : 750;
    (function step(now) { const u = d ? Math.min(1, (now - t0) / d) : 1, e = 1 - Math.pow(1 - u, 3); el.textContent = f(from + (to - from) * e); if (u < 1) requestAnimationFrame(step); })(t0);
  }

  /* ---------- boot */
  function renderAll() { renderNext(); renderItems(); renderGarage(); renderLedger(); renderMissions(); renderTicker(); calc(); }
  compute(); renderRates(); renderAll();
  go(location.hash.slice(1) || 'home', false);
  loadLedger();
  live(); setInterval(() => { if (!document.hidden) live(); }, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) live(); });
})();
