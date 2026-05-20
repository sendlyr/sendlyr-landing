/* ═══════════════════════════════════════════════════════════════
   Sendlyr — Landing v2 · interactions
═══════════════════════════════════════════════════════════════ */

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

/* ─── Reveal ─────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  $$('.fade-up').forEach(el => obs.observe(el));
}

/* ═══════════════════════════════════════════
   HERO DIAGRAM — animated analysis → email loop
═══════════════════════════════════════════ */
const HD_NODES = [
  { id: 'events',    x: 100, y: 100, label: 'EVENTS',    sub: 'mixpanel · amplitude',  kind: 'in' },
  { id: 'analysis',  x: 310, y: 100, label: 'ANALYSIS',  sub: 'signals × retention',   kind: 'mid' },
  { id: 'milestone', x: 500, y: 100, label: 'MILESTONE', sub: '+5.5pp 12-week',        kind: 'star' },
  { id: 'email',     x: 690, y: 100, label: 'EMAIL',     sub: 'staged · approved',     kind: 'mid' },
  { id: 'users',     x: 900, y: 100, label: 'USERS',     sub: 'behavior changes',      kind: 'out' },
];

function buildHeroDiagram() {
  const svg = $('hd-svg');
  if (!svg) return;
  const nodesG = $('hd-nodes');
  if (!nodesG) return;

  const NS = 'http://www.w3.org/2000/svg';

  HD_NODES.forEach(n => {
    // halo
    const halo = document.createElementNS(NS, 'circle');
    halo.setAttribute('cx', n.x);
    halo.setAttribute('cy', n.y);
    halo.setAttribute('r', n.kind === 'star' ? 36 : 28);
    halo.setAttribute('fill', '#fff');
    halo.setAttribute('stroke', n.kind === 'star' ? '#0B5F66' : '#E4E6E2');
    halo.setAttribute('stroke-width', n.kind === 'star' ? 1.5 : 1);
    if (n.kind === 'star') {
      halo.setAttribute('filter', 'drop-shadow(0 6px 18px rgba(11,95,102,0.18))');
    } else {
      halo.setAttribute('filter', 'drop-shadow(0 2px 6px rgba(11,23,28,0.06))');
    }
    nodesG.appendChild(halo);

    // inner ring for milestone
    if (n.kind === 'star') {
      const ring = document.createElementNS(NS, 'circle');
      ring.setAttribute('cx', n.x);
      ring.setAttribute('cy', n.y);
      ring.setAttribute('r', 28);
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', '#0B5F66');
      ring.setAttribute('stroke-width', 1);
      ring.setAttribute('stroke-dasharray', '2 4');
      ring.setAttribute('opacity', '0.45');
      ring.classList.add('hd-ring');
      nodesG.appendChild(ring);
    }

    // tiny dot indicator
    const dotColor = n.kind === 'star' ? '#0B5F66' : '#0B1316';
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('cx', n.x);
    dot.setAttribute('cy', n.y - 8);
    dot.setAttribute('r', 2.5);
    dot.setAttribute('fill', dotColor);
    nodesG.appendChild(dot);

    // label
    const label = document.createElementNS(NS, 'text');
    label.setAttribute('x', n.x);
    label.setAttribute('y', n.y + 4);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-family', 'Inter, sans-serif');
    label.setAttribute('font-weight', '700');
    label.setAttribute('font-size', '11');
    label.setAttribute('letter-spacing', '0.6');
    label.setAttribute('fill', n.kind === 'star' ? '#0B5F66' : '#0B1316');
    label.textContent = n.label;
    nodesG.appendChild(label);

    // sublabel below halo
    const sub = document.createElementNS(NS, 'text');
    sub.setAttribute('x', n.x);
    sub.setAttribute('y', n.y + 56);
    sub.setAttribute('text-anchor', 'middle');
    sub.setAttribute('font-family', 'JetBrains Mono, monospace');
    sub.setAttribute('font-size', '9.5');
    sub.setAttribute('fill', '#5A6770');
    sub.textContent = n.sub;
    nodesG.appendChild(sub);
  });

  // Particles
  spawnParticles(svg, 'hd-particles-fwd', 'hd-path-fwd', 'forward');
  spawnParticles(svg, 'hd-particles-back', 'hd-path-back', 'back');

  // animate the milestone ring
  let ringRot = 0;
  function tickRing() {
    ringRot = (ringRot + 0.15) % 360;
    document.querySelectorAll('.hd-ring').forEach(r => {
      r.setAttribute('transform', `rotate(${ringRot} 500 100)`);
    });
    requestAnimationFrame(tickRing);
  }
  tickRing();
}

function spawnParticles(svg, groupId, pathId, direction) {
  const group = $(groupId);
  const path = $(pathId);
  if (!group || !path) return;
  const NS = 'http://www.w3.org/2000/svg';
  const total = path.getTotalLength();

  const COUNT = direction === 'forward' ? 5 : 3;
  const particles = [];

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElementNS(NS, 'circle');
    p.setAttribute('r', direction === 'forward' ? 3.5 : 2.5);
    const color = direction === 'forward'
      ? (i % 2 === 0 ? '#0B5F66' : '#6D5BD0')
      : '#8B96A0';
    p.setAttribute('fill', color);
    p.setAttribute('opacity', direction === 'forward' ? '0.95' : '0.55');
    if (direction === 'forward') {
      p.setAttribute('filter', `drop-shadow(0 0 6px ${color === '#0B5F66' ? 'rgba(11,95,102,0.5)' : 'rgba(109,91,208,0.45)'})`);
    }
    group.appendChild(p);
    particles.push({
      el: p,
      offset: i / COUNT,
      speed: direction === 'forward' ? 0.0025 : 0.0018,
    });
  }

  let t = 0;
  function tick() {
    t += 0.002;
    particles.forEach(part => {
      let pos = ((t + part.offset) % 1);
      const pt = path.getPointAtLength(pos * total);
      part.el.setAttribute('cx', pt.x);
      part.el.setAttribute('cy', pt.y);
      // fade in/out near endpoints for forward
      if (direction === 'forward') {
        const fade = Math.min(pos * 8, (1 - pos) * 8, 1);
        part.el.setAttribute('opacity', String(0.25 + 0.7 * fade));
      }
    });
    requestAnimationFrame(tick);
  }
  tick();
}

/* ═══════════════════════════════════════════
   HOW IT WORKS — fill bars
═══════════════════════════════════════════ */
function initStepBars() {
  const stage = $('sv-test');
  if (!stage) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        stage.querySelectorAll('.tfill').forEach(f => {
          const w = f.getAttribute('data-w');
          setTimeout(() => f.style.width = w + '%', 60);
        });
        obs.unobserve(stage);
      }
    });
  }, { threshold: 0.4 });
  obs.observe(stage);
}

/* ═══════════════════════════════════════════
   MINI-COMPOSER (Before)
═══════════════════════════════════════════ */
const M_SUBS = ['Welcome — start your', 'Hey {{name}}, did you', 'Quick note on your', 'Your first lesson is'];
const M_LINES = [
  ['Hey {{name}},', 'Welcome to Typesy! We are so'],
  ['Hi there,', 'Just checking in to see how'],
  ['Hello {{name}},', "Quick one — we noticed you"],
  ['Hey,', 'Your trial is going strong.'],
];
let mSi = 0, mCi = 0, mDel = false;
function typeMini() {
  const s = M_SUBS[mSi]; const el = $('m-typ'); if (!el) return;
  if (!mDel) {
    mCi++;
    el.textContent = s.slice(0, mCi);
    if (mCi >= s.length) {
      mDel = true;
      $('m-l1').textContent = M_LINES[mSi][0];
      $('m-l2').textContent = M_LINES[mSi][1] + '…';
      setTimeout(typeMini, 1700); return;
    }
    setTimeout(typeMini, 55 + Math.random() * 30);
  } else {
    mCi -= 2;
    el.textContent = s.slice(0, Math.max(mCi, 0));
    if (mCi <= 0) {
      mCi = 0; mDel = false; mSi = (mSi + 1) % M_SUBS.length;
      $('m-l1').textContent = ''; $('m-l2').textContent = '';
      setTimeout(typeMini, 380); return;
    }
    setTimeout(typeMini, 22);
  }
}

/* ═══════════════════════════════════════════
   CADENCE mini (Before)
═══════════════════════════════════════════ */
const CSEQ = [
  { v: 2, fb: 'changing mind…' },
  { v: 5, fb: 'maybe shorter…' },
  { v: 3, fb: 'or longer?' },
  { v: 4, fb: 'still unsure…' },
];
let ci2 = 0;
function cycleCad() {
  const { v, fb } = CSEQ[ci2];
  const valEl = $('cad-val'); const inputEl = $('cad-input'); const fbEl = $('cad-fb');
  if (!valEl) return;
  inputEl.classList.add('editing');
  fbEl.textContent = fb;
  valEl.classList.add('del');
  setTimeout(() => {
    valEl.firstChild.textContent = '';
    valEl.classList.remove('del');
    setTimeout(() => {
      valEl.firstChild.textContent = v;
      inputEl.classList.remove('editing');
      setTimeout(() => { ci2 = (ci2 + 1) % CSEQ.length; cycleCad(); }, 1700);
    }, 220);
  }, 600);
}

/* ═══════════════════════════════════════════
   FLOW mini (Before)
═══════════════════════════════════════════ */
const NCX = 56;
const NY = { n1: 14, n2: 54, n3: 94 };
const NH = 24;
const DRAG_W = 90;
const WP = [
  { x: 130, y: 74 }, { x: 180, y: 50 }, { x: 200, y: 110 }, { x: 160, y: 140 },
  { x: 110, y: 120 }, { x: 120, y: 80 }, { x: 160, y: 60 }, { x: 190, y: 90 },
  { x: 130, y: 74 },
];
let widx = 0, wt = 0;
function getDP() {
  const a = WP[widx], b = WP[(widx + 1) % WP.length];
  const t = ease(wt);
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}
function setLine(id, x1, y1, x2, y2) {
  const e = $(id); if (!e) return;
  e.setAttribute('x1', x1); e.setAttribute('y1', y1);
  e.setAttribute('x2', x2); e.setAttribute('y2', y2);
}
function flowTick() {
  wt += 0.0030;
  if (wt >= 1) { wt = 0; widx = (widx + 1) % (WP.length - 1); }
  const dp = getDP();
  const drag = $('mf-drag');
  if (drag) { drag.style.left = dp.x + 'px'; drag.style.top = dp.y + 'px'; }
  const cur = $('mf-cur');
  if (cur) { cur.style.left = (dp.x + DRAG_W - 8) + 'px'; cur.style.top = (dp.y + 8) + 'px'; }
  setLine('mf-l1', NCX, NY.n1 + NH, NCX, NY.n2 - 2);
  setLine('mf-l2', NCX, NY.n2 + NH, NCX, NY.n3 - 2);
  setLine('mf-l3', NCX + 30, NY.n3 + NH / 2, dp.x - 3, dp.y + NH / 2);
  requestAnimationFrame(flowTick);
}

/* ═══════════════════════════════════════════
   GEN mini (After)
═══════════════════════════════════════════ */
const GP = 'create onboarding sequence...';
const GCARDS = [
  { cls: 'indigo',  state: 'New',    subj: 'Start your first lesson' },
  { cls: 'amber',   state: 'Stuck',  subj: 'Pick up where you left off' },
  { cls: 'rose',    state: 'Risk',   subj: 'What stopped you?' },
  { cls: 'emerald', state: 'Active', subj: 'Upgrade for unlimited' },
];
function typeGen(cb) {
  const el = $('gen-prompt'); if (!el) { if (cb) cb(); return; }
  let i = 0;
  function tick() {
    i++; el.textContent = GP.slice(0, i);
    if (i >= GP.length) { if (cb) cb(); return; }
    setTimeout(tick, 35 + Math.random() * 20);
  }
  el.textContent = ''; tick();
}
function pressGen(cb) {
  const btn = $('gen-go'); if (!btn) { if (cb) cb(); return; }
  btn.classList.add('press');
  setTimeout(() => { btn.classList.remove('press'); btn.classList.add('fire'); if (cb) cb(); }, 180);
}
function renderGenCards() {
  const grid = $('gen-grid'); if (!grid) return;
  grid.innerHTML = '';
  GCARDS.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'mg-card';
    card.innerHTML = `<span class="badge ${c.cls}">${c.state}</span><div class="subj">"${c.subj}"</div>`;
    grid.appendChild(card);
    setTimeout(() => card.classList.add('in'), 80 + i * 120);
  });
}
function genPlay() {
  if (!$('gen-go')) return;
  $('gen-go').classList.remove('fire', 'press');
  $('gen-grid').innerHTML = '';
  typeGen(() => {
    setTimeout(() => pressGen(() => setTimeout(renderGenCards, 220)), 600);
  });
  setTimeout(genPlay, 8000);
}

/* ═══════════════════════════════════════════
   ROUTING mini (After)
═══════════════════════════════════════════ */
const RUSERS = [
  { i: 'A', c: '#0B5F66', k: 'new' },
  { i: 'M', c: '#F58025', k: 'intent' },
  { i: 'P', c: '#B5701A', k: 'stuck' },
  { i: 'J', c: '#B53D45', k: 'risk' },
  { i: 'S', c: '#15795E', k: 'activated' },
  { i: 'C', c: '#0B5F66', k: 'new' },
  { i: 'N', c: '#F58025', k: 'intent' },
  { i: 'L', c: '#15795E', k: 'activated' },
];
const RC = { new: 0, stuck: 0, intent: 0, risk: 0, activated: 0 };
let rui = 0;

function bumpRBucket(k) {
  RC[k]++;
  const cnt = $('rb-' + k);
  if (cnt) { cnt.textContent = RC[k]; cnt.classList.remove('bump'); void cnt.offsetWidth; cnt.classList.add('bump'); setTimeout(() => cnt.classList.remove('bump'), 280); }
  const row = document.querySelector(`[data-key="${k}"]`);
  if (row) { row.classList.add('lit'); setTimeout(() => row.classList.remove('lit'), 420); }
}

function spawnBall() {
  const u = RUSERS[rui % RUSERS.length]; rui++;
  const stage = $('route-stage'); const zone = $('route-zone');
  if (!stage || !zone) { setTimeout(spawnBall, 1000); return; }

  const ball = document.createElement('div');
  ball.className = 'uball-mini';
  ball.style.background = u.c;
  ball.textContent = u.i;
  stage.appendChild(ball);

  const stageRect = stage.getBoundingClientRect();
  const zoneRect = zone.getBoundingClientRect();
  const startX = (zoneRect.left - stageRect.left) + 8;
  const startY = (zoneRect.top - stageRect.top) + 26 + Math.random() * (zoneRect.height - 50);
  ball.style.left = startX + 'px'; ball.style.top = startY + 'px';

  const targetEl = document.querySelector(`[data-key="${u.k}"]`);
  if (!targetEl) { ball.remove(); setTimeout(spawnBall, 800); return; }
  const tRect = targetEl.getBoundingClientRect();
  const tx = tRect.left - stageRect.left + 8;
  const ty = tRect.top - stageRect.top + tRect.height / 2 - 11;

  const dur = 1300; const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / dur, 1);
    const e = ease(t);
    const px = lerp(startX, tx, e);
    const py = lerp(startY, ty, e) + Math.sin(e * Math.PI) * (-18);
    ball.style.left = px + 'px';
    ball.style.top = py + 'px';
    if (t >= 1) {
      bumpRBucket(u.k);
      ball.style.transition = 'opacity 0.3s, transform 0.3s';
      ball.style.opacity = '0'; ball.style.transform = 'scale(0.5)';
      setTimeout(() => ball.remove(), 320);
      return;
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
  setTimeout(spawnBall, 700 + Math.random() * 200);
}

/* ═══════════════════════════════════════════
   APPROVAL mini (After)
═══════════════════════════════════════════ */
const AUSERS = [
  { i: 'A', c: '#0B5F66', n: 'Alice',  s: 'New' },
  { i: 'M', c: '#F58025', n: 'Marco',  s: 'Intent' },
  { i: 'P', c: '#B5701A', n: 'Priya',  s: 'Stuck' },
  { i: 'S', c: '#15795E', n: 'Sofia',  s: 'Active' },
];
function renderAList() {
  const list = $('app-list'); if (!list) return;
  list.innerHTML = '';
  AUSERS.forEach(u => {
    const row = document.createElement('div');
    row.className = 'ma-row';
    row.innerHTML = `
      <div class="ma-av" style="background:${u.c}">${u.i}</div>
      <div>
        <div class="ma-name">${u.n}</div>
        <div class="ma-state">${u.s}</div>
      </div>
    `;
    list.appendChild(row);
  });
}
function scanRows(cb) {
  const rows = document.querySelectorAll('#app-list .ma-row');
  let i = 0;
  function step() {
    if (i >= rows.length) { if (cb) cb(); return; }
    rows.forEach(r => r.classList.remove('scanning'));
    rows[i].classList.add('scanning');
    setTimeout(() => { rows[i].classList.remove('scanning'); i++; step(); }, 280);
  }
  step();
}
function approveAll(cb) {
  const rows = document.querySelectorAll('#app-list .ma-row');
  rows.forEach((r, i) => setTimeout(() => r.classList.add('approved'), i * 100));
  setTimeout(cb, rows.length * 100 + 200);
}
function pressAppBtn() {
  const btn = $('app-btn'); if (!btn) return;
  btn.classList.add('press');
  setTimeout(() => btn.classList.remove('press'), 160);
  setTimeout(() => {
    btn.classList.add('fire');
    setTimeout(() => { const sb = $('app-success'); if (sb) sb.classList.add('show'); }, 400);
  }, 200);
}
function appPlay() {
  if (!$('app-btn')) return;
  $('app-success').classList.remove('show');
  $('app-btn').classList.remove('fire', 'press');
  renderAList();
  setTimeout(() => {
    scanRows(() => {
      setTimeout(() => {
        approveAll(() => { setTimeout(pressAppBtn, 250); });
      }, 250);
    });
  }, 700);
  setTimeout(appPlay, 11000);
}

/* ─── Boot ─── */
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  buildHeroDiagram();
  initStepBars();
  // pop fade-ups quickly if they're in initial viewport
  setTimeout(() => {
    document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
  }, 600);
  typeMini();
  cycleCad();
  flowTick();
  genPlay();
  spawnBall();
  appPlay();
});
