/* Threadwell Studio — app logic (catalog, flow, monogram/name modes).
   3D lives in js/stage3d.js (module); every call here is guarded so the
   site still fully works in 2D if WebGL/modules are unavailable. */
'use strict';

var DATA = null;
var state = {
  product: null, panel: null,
  mode: 'name',                       // 'name' | 'mono'
  lang: 'en', style: 'print', text: 'Gohar', translit: 'Gohar',
  mono: { f: 'G', m: 'A', l: 'H' }, monoStyle: 'classic',
  thread: '#1f2f6b', fabric: '#f4f2ec'
};
var THREADS = [['Navy', '#1f2f6b'], ['Black', '#141414'], ['White', '#f4f2ea'], ['Gold', '#b8912e'], ['Burgundy', '#6d1b2e'], ['Silver', '#9aa1ac']];
var FABRICS = [['White', '#f4f2ec'], ['Ivory', '#efe6cf'], ['Black', '#1b1b1e'], ['Navy', '#232c44'], ['Burgundy', '#58222c'], ['Silver', '#c9ccd2']];
var TYPE_LABELS = { all: 'All', shirt: 'Shirts', jacket_suit: 'Suits & Tuxedos', vest: 'Vests', cummerbund: 'Cummerbunds', pocket_square: 'Pocket squares', robe: 'Robes' };
var PANEL_POS = {
  left_chest: { x: .34, y: .36, w: .22, h: .11 }, left_cuff: { x: .19, y: .74, w: .14, h: .06 }, right_cuff: { x: .81, y: .74, w: .14, h: .06 },
  collar_band: { x: .5, y: .13, w: .16, h: .05 }, back_yoke: { x: .5, y: .22, w: .34, h: .1 },
  interior_lining: { x: .37, y: .42, w: .2, h: .1 }, back_showpiece: { x: .5, y: .44, w: .56, h: .34 },
  back: { x: .5, y: .46, w: .54, h: .32 }, front_left: { x: .36, y: .42, w: .16, h: .09 },
  front_center: { x: .5, y: .5, w: .6, h: .18 }, corner: { x: .34, y: .44, w: .12, h: .09 }
};
var STAGE_FOR = { left_cuff: 'cuff', right_cuff: 'cuff', collar_band: 'collar', front_center: 'band', corner: 'pocket' };
var STAGE_NAMES = { cuff: 'THE CUFF — live 3D', collar: 'THE COLLAR — live 3D', band: 'CUMMERBUND — live 3D', pocket: 'POCKET SQUARE — live 3D', panel: 'FABRIC PANEL — live 3D' };

/* ---------------- boot ---------------- */
fetch('./presets/products.json').then(function (r) { return r.json(); }).then(function (d) {
  DATA = d; buildChips(); renderGrid(); renderSwatches();
}).catch(function () { document.getElementById('grid').innerHTML = '<div class="loading">Could not load the catalog.</div>'; });

function signIn(name) { document.getElementById('who').textContent = 'Hi, ' + name; }
window.signIn = signIn;

/* ---------------- navigation ---------------- */
var backBtn = document.getElementById('backBtn');
var histStack = ['signin'];
function show(name) {
  document.querySelectorAll('.screen').forEach(function (s) { s.classList.toggle('on', s.dataset.screen === name); });
  backBtn.style.display = (name === 'signin' || name === 'sent') ? 'none' : 'inline-block';
  window.scrollTo(0, 0);
}
function go(name) { if (histStack[histStack.length - 1] !== name) histStack.push(name); show(name); }
backBtn.onclick = function () { if (histStack.length > 1) { histStack.pop(); show(histStack[histStack.length - 1]); } };
document.addEventListener('click', function (e) {
  var t = e.target.closest('[data-go]'); if (!t) return;
  if (t.getAttribute('data-go') === 'sent') prepareSummary();
  go(t.getAttribute('data-go'));
});
window.resetOrder = function () { state.product = null; state.panel = null; go('catalog'); };

/* ---------------- catalog ---------------- */
var typeFilter = 'all';
function buildChips() {
  var el = document.getElementById('typeChips'); var order = ['all', 'shirt', 'jacket_suit', 'vest', 'cummerbund', 'pocket_square'];
  el.innerHTML = order.filter(function (k) { return k === 'all' || DATA.counts.by_type[k]; }).map(function (k) {
    var n = k === 'all' ? DATA.counts.embroiderable : DATA.counts.by_type[k];
    return '<button class="chip' + (k === 'all' ? ' on' : '') + '" data-type="' + k + '">' + TYPE_LABELS[k] + ' (' + n + ')</button>';
  }).join('');
  el.querySelectorAll('.chip').forEach(function (c) {
    c.onclick = function () {
      typeFilter = c.dataset.type;
      el.querySelectorAll('.chip').forEach(function (x) { x.classList.toggle('on', x === c); }); renderGrid();
    };
  });
}
document.getElementById('q').addEventListener('input', renderGrid);
function renderGrid() {
  if (!DATA) return;
  var q = document.getElementById('q').value.trim().toLowerCase();
  var list = DATA.products.filter(function (p) {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (q && p.name.toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
  document.getElementById('countNote').textContent = list.length + ' product' + (list.length === 1 ? '' : 's');
  var g = document.getElementById('grid');
  if (!list.length) { g.innerHTML = '<div class="loading">No products match. Try another search.</div>'; return; }
  g.innerHTML = list.slice(0, 300).map(function (p) {
    return '<button class="prod" data-i="' + DATA.products.indexOf(p) + '">' +
      '<span class="ph">' + (p.img ? '<img loading="lazy" src="' + p.img + '" alt="" onerror="this.style.display=\'none\'">' : '') + '</span>' +
      '<span class="cap"><b>' + esc(p.name) + '</b>' +
      (p.christening ? '<span class="tag xmas">Christening</span>' : '<span class="tag">' + (TYPE_LABELS[p.type] || p.type) + '</span>') +
      '</span></button>';
  }).join('');
  g.querySelectorAll('.prod').forEach(function (b) { b.onclick = function () { pickProduct(DATA.products[+b.dataset.i]); }; });
}
function esc(s) { return (s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

/* ---------------- customize ---------------- */
function fabricFromName(p) {
  var s = p.name.toLowerCase();
  var m = [['white', '#f4f2ec'], ['ivory', '#efe6cf'], ['black', '#1b1b1e'], ['navy', '#232c44'], ['royal', '#1d3a8f'], ['blue', '#232c44'],
  ['burgundy', '#58222c'], ['wine', '#58222c'], ['maroon', '#58222c'], ['red', '#7a1f28'], ['charcoal', '#3a3d44'],
  ['grey', '#8f939b'], ['gray', '#8f939b'], ['silver', '#c9ccd2'], ['gold', '#b8912e'], ['pink', '#c26b8f'], ['fuchsia', '#b04a7e'],
  ['green', '#274b33'], ['purple', '#4b2a5e'], ['brown', '#6b4a33'], ['tan', '#a58a66']];
  for (var i = 0; i < m.length; i++) if (s.indexOf(m[i][0]) >= 0) return m[i][1];
  return p.type === 'jacket_suit' ? '#1b1b1e' : '#f4f2ec';
}
function luminance(hex) {
  var n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255;
}
function pickProduct(p) {
  state.product = p; state.panel = p.default_panel || DATA.garmentTypes[p.type].panels[0].id;
  state.fabric = fabricFromName(p);
  state.thread = luminance(state.fabric) < .42 ? '#f4f2ea' : '#1f2f6b';
  document.getElementById('cName').textContent = p.name;
  var img = document.getElementById('garmentImg'); img.src = p.img || ''; img.alt = p.name;
  img.onload = drawPlacement;
  markSwatches();
  go('customize'); updateTranslit(); drawPlacement();
  mount3D(); update3D('slow');
}
function currentPanel() {
  return DATA.garmentTypes[state.product.type].panels.filter(function (x) { return x.id === state.panel; })[0];
}
function drawPlacement() {
  var p = state.product; if (!p) return;
  var card = document.getElementById('photoCard');
  card.querySelectorAll('.dot,.embzone').forEach(function (n) { n.remove(); });
  DATA.garmentTypes[p.type].panels.forEach(function (pan, idx) {
    var pos = PANEL_POS[pan.id] || { x: .5, y: .4, w: .2, h: .1 };
    var dot = document.createElement('button'); dot.className = 'dot' + (pan.id === state.panel ? ' sel' : '');
    dot.style.left = (pos.x * 100) + '%'; dot.style.top = (pos.y * 100) + '%';
    dot.innerHTML = (idx + 1) + '<span class="lbl">' + pan.label + '</span>';
    dot.onclick = function () { state.panel = pan.id; drawPlacement(); updatePlaceInfo(); update3D('slow'); };
    card.appendChild(dot);
  });
  updatePlaceInfo(); renderGhost();
}
function updatePlaceInfo() {
  var pan = currentPanel();
  document.getElementById('placeInfo').innerHTML = '📍 <b>' + pan.label + '</b> · about ' + pan.area_mm[0] + '×' + pan.area_mm[1] + ' mm' + (pan.estimated ? ' (estimated)' : '');
}
function displayString() {
  if (state.mode === 'mono') {
    var mm = state.mono;
    if (state.monoStyle === 'straight') return [mm.f, mm.m, mm.l].filter(Boolean).join(' ');
    return [mm.f, mm.l, mm.m].filter(Boolean).join(' ');       // classic order: first LAST middle
  }
  return state.lang === 'hy' ? state.translit : state.text;
}
function renderGhost() {         /* 2D ghost on the product photo */
  var card = document.getElementById('photoCard'); var old = card.querySelector('.embzone'); if (old) old.remove();
  var pan = currentPanel(); var pos = PANEL_POS[pan.id] || { x: .5, y: .4, w: .24, h: .12 };
  var text = displayString(); if (!text) return;
  var script = (state.mode === 'mono' ? state.monoStyle === 'script' : state.style === 'cursive');
  var fam = script ? "'Segoe Script','Snell Roundhand','Brush Script MT',cursive" : "Georgia,'Times New Roman',serif";
  var zone = document.createElement('div'); zone.className = 'embzone';
  zone.style.left = (pos.x * 100) + '%'; zone.style.top = (pos.y * 100) + '%';
  zone.style.width = (pos.w * 100) + '%'; zone.style.height = (pos.h * 100) + '%';
  zone.innerHTML = '<svg viewBox="0 0 300 100" preserveAspectRatio="xMidYMid meet">' +
    '<text x="150" y="50" text-anchor="middle" dominant-baseline="central" ' +
    'style="font-family:' + fam + ';font-weight:700;font-size:64px;fill:' + state.thread + ';paint-order:stroke;stroke:rgba(0,0,0,.12);stroke-width:1px" ' +
    'lengthAdjust="spacingAndGlyphs" textLength="' + Math.min(290, Math.max(60, text.length * 34)) + '">' + esc(text) + '</text></svg>';
  card.appendChild(zone);
}

/* ---------------- 3D bridge ---------------- */
var mounted3D = false;
function mount3D() {
  if (mounted3D) return;
  var el = document.getElementById('viewer3d');
  if (window.Stage3D && window.Stage3D.mount(el)) { mounted3D = true; }
  else {
    var tries = 0, iv = setInterval(function () {
      tries++;
      if (window.Stage3D && window.Stage3D.mount(el)) { mounted3D = true; clearInterval(iv); update3D('slow'); }
      else if (tries > 20) { clearInterval(iv); document.getElementById('viewerFallback').style.display = 'flex'; }
    }, 150);
  }
}
function update3D(speed) {
  if (!window.Stage3D || !window.Stage3D.ok() || !state.product) return;
  var pan = currentPanel();
  var stage = STAGE_FOR[pan.id] || 'panel';
  document.getElementById('viewerTitle').textContent = STAGE_NAMES[stage];
  window.Stage3D.update({
    stage: stage, panelMM: pan.area_mm,
    fabric: state.fabric, satin: pan.id === 'interior_lining',
    thread: state.thread,
    mode: state.mode, text: displayString(),
    mono: state.mono, monoStyle: state.monoStyle, style: state.style,
    restitch: speed || 'fast'
  });
}

/* ---------------- controls ---------------- */
document.getElementById('modeSeg').addEventListener('click', function (e) {
  var b = e.target.closest('button'); if (!b) return;
  state.mode = b.dataset.mode;
  this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
  document.getElementById('nameFields').style.display = state.mode === 'name' ? '' : 'none';
  document.getElementById('monoFields').style.display = state.mode === 'mono' ? '' : 'none';
  renderGhost(); update3D('slow');
});
document.getElementById('langSeg').addEventListener('click', function (e) {
  var b = e.target.closest('button'); if (!b) return;
  state.lang = b.dataset.lang;
  this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
  updateTranslit(); renderGhost(); update3D();
});
document.getElementById('styleSeg').addEventListener('click', function (e) {
  var b = e.target.closest('button'); if (!b) return;
  state.style = b.dataset.style;
  this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
  renderGhost(); update3D();
});
document.getElementById('monoStyleSeg').addEventListener('click', function (e) {
  var b = e.target.closest('button'); if (!b) return;
  state.monoStyle = b.dataset.mstyle;
  this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
  renderGhost(); update3D();
});
document.getElementById('nameInput').addEventListener('input', function () {
  state.text = this.value; updateTranslit(); renderGhost(); update3D();
});
['monoF', 'monoM', 'monoL'].forEach(function (id, i) {
  document.getElementById(id).addEventListener('input', function () {
    state.mono[['f', 'm', 'l'][i]] = this.value.slice(0, 1); renderGhost(); update3D();
  });
});
function renderSwatches() {
  var t = document.getElementById('swatches');
  t.innerHTML = THREADS.map(function (x) { return '<button class="sw" title="' + x[0] + '" data-c="' + x[1] + '" style="background:' + x[1] + '"></button>'; }).join('');
  t.querySelectorAll('.sw').forEach(function (s) {
    s.onclick = function () { state.thread = s.dataset.c; markSwatches(); renderGhost(); update3D(); };
  });
  var f = document.getElementById('fabricSwatches');
  f.innerHTML = FABRICS.map(function (x) { return '<button class="sw" title="' + x[0] + '" data-c="' + x[1] + '" style="background:' + x[1] + '"></button>'; }).join('');
  f.querySelectorAll('.sw').forEach(function (s) {
    s.onclick = function () { state.fabric = s.dataset.c; markSwatches(); update3D('slow'); };
  });
  markSwatches();
}
function markSwatches() {
  document.querySelectorAll('#swatches .sw').forEach(function (s) { s.classList.toggle('on', s.dataset.c === state.thread); });
  document.querySelectorAll('#fabricSwatches .sw').forEach(function (s) { s.classList.toggle('on', s.dataset.c === state.fabric); });
}

/* ---------------- Armenian phonetic transliteration (Eastern, approximate) ---------------- */
var HY2 = [["ch'", 'չ'], ["ts'", 'ց'], ['zh', 'ժ'], ['kh', 'խ'], ['ts', 'ծ'], ['dz', 'ձ'], ['gh', 'ղ'], ['ch', 'ճ'], ['sh', 'շ'], ['ph', 'փ'], ['th', 'թ'], ['ye', 'ե'], ['ou', 'ու'], ['oo', 'ու']];
var HY1 = { a: 'ա', b: 'բ', g: 'գ', d: 'դ', e: 'ե', z: 'զ', i: 'ի', l: 'լ', k: 'կ', h: 'հ', m: 'մ', y: 'յ', n: 'ն', o: 'ո', p: 'պ', j: 'ջ', r: 'ր', s: 'ս', v: 'վ', t: 'տ', u: 'ու', f: 'ֆ', w: 'վ', c: 'ց', x: 'խ', q: 'ք' };
function translitHY(s) {
  var lower = s.toLowerCase(), out = '', i = 0;
  while (i < lower.length) {
    var m = null;
    for (var d = 0; d < HY2.length; d++) { if (lower.substr(i, HY2[d][0].length) === HY2[d][0]) { m = HY2[d]; break; } }
    if (m) { out += m[1]; i += m[0].length; continue; }
    var ch = lower[i];
    if (HY1[ch]) { out += HY1[ch]; } else if (/\s/.test(ch)) { out += ' '; } else if (/[a-z]/.test(ch) === false) { out += ch; }
    i++;
  }
  return out.replace(/(^|\s)(\S)/g, function (_, sp, c) { return sp + c.toLocaleUpperCase('hy'); });
}
window.translitHY = translitHY;
function updateTranslit() {
  var el = document.getElementById('translit');
  if (state.lang === 'hy') {
    state.translit = translitHY(state.text);
    el.innerHTML = 'Armenian: <b>' + esc(state.translit) + '</b> <span style="opacity:.7">(type by sound — "Gohar" → Գոհար)</span>';
  } else { state.translit = state.text; el.textContent = ''; }
}

/* ---------------- send ---------------- */
function prepareSummary() {
  if (!state.product) return;
  var p = state.product, pan = currentPanel();
  var modeLine = state.mode === 'mono'
    ? 'Monogram (' + state.monoStyle + '): ' + displayString()
    : ({ en: 'English', es: 'Español', hy: 'Armenian' }[state.lang]) + ' · ' + state.style + ': ' + displayString();
  document.getElementById('orderSummary').innerHTML =
    '<b>' + esc(displayString()) + '</b> on <b>' + esc(p.name) + '</b><br>' +
    'Placement: ' + pan.label + ' · ' + pan.area_mm[0] + '×' + pan.area_mm[1] + ' mm<br>' +
    esc(modeLine) + '<br>Thread ' + state.thread + ' · Fabric ' + state.fabric + '<br>' +
    '<span style="font-size:13px;color:var(--ink-soft)">Emailed to you &amp; your mom (demo).</span>';
}
