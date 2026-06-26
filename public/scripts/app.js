/* ═══════════════════════════════════════════════════════════════
   Sendlyr — Landing redesign · interactions
   Vanilla JS, no dependencies. Calm motion, reduced-motion aware.
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const $$ = (sel, root) => (root || document).querySelectorAll(sel);
  const NS = 'http://www.w3.org/2000/svg';
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Reveal ─────────────────────────────── */
  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      $$('.fade-up').forEach(el => el.classList.add('visible'));
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    $$('.fade-up').forEach(el => obs.observe(el));
  }

  /* ─── Scroll progress ─────────────────────── */
  function initScrollProgress() {
    const bar = $('scroll-progress');
    if (!bar) return;
    let ticking = false;
    function update() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = pct + '%';
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ─── Nav active link ─────────────────────── */
  function initNavActive() {
    const map = {};
    $$('.nav-mid a[data-nav]').forEach(a => {
      const id = a.getAttribute('href').replace('#', '');
      if (id) map[id] = a;
    });
    const ids = Object.keys(map);
    if (!ids.length || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          ids.forEach(id => map[id].classList.toggle('is-current', id === e.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    ids.forEach(id => { const s = $(id); if (s) obs.observe(s); });
  }

  /* ═══════════════════════════════════════════
     PIPELINE CONSOLE — interactive
  ═══════════════════════════════════════════ */
  const STAGES = [
    { label: 'USAGE', title: 'Usage', desc: 'Historical event exports and outcome cohorts — the raw material every classification is scored against.', metric: '24,118', metricLbl: 'trials analyzed', x: 6 },
    { label: 'ANALYSIS', title: 'Analysis', desc: 'Early product behaviors are scored against conversion and retention by lift, coverage, and confidence.', metric: 'lift × coverage', metricLbl: 'scored', x: 28 },
    { label: 'PAI', title: 'Product Activation Indicator', desc: 'The single early behavior that best predicts retention. For Typesy: an activation milestone reached within 14 days.', metric: '+5.5pp', metricLbl: 'absolute lift', pai: true, x: 50 },
    { label: 'STATES', title: 'User states', desc: 'Live users are classified by how close they are to the PAI — active, stuck, reached — so each gets a different message.', metric: '6 states', metricLbl: 'per experiment', x: 72 },
    { label: 'EXPERIMENT', title: 'Controlled experiment', desc: 'Human-approved templates run against a control through your existing sender, measured before broad rollout.', metric: 'treat / control', metricLbl: 'measured', x: 94 },
  ];

  let activeStage = 2;
  let autoTimer = null;
  let paused = false;

  function buildConsole() {
    const wrap = $('pipe-stages');
    if (!wrap) return;
    STAGES.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.className = 'pstage' + (s.pai ? ' is-pai' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', s.title);
      btn.style.left = s.x + '%';
      btn.innerHTML = `<span class="pst-node"></span><span class="pst-label">${s.label}</span>`;
      btn.addEventListener('click', () => { selectStage(i); pauseFor(6000); });
      btn.addEventListener('mouseenter', () => { selectStage(i); paused = true; });
      btn.addEventListener('focus', () => { selectStage(i); paused = true; });
      wrap.appendChild(btn);
    });
    selectStage(activeStage, true);

    const stage = $('console-svg') && $('console-svg').parentElement;
    if (stage) {
      stage.addEventListener('mouseleave', () => { paused = false; });
    }

    if (!RM) {
      spawnParticles('pipe-particles-fwd', 'pipe-path-fwd', 'forward');
      spawnParticles('pipe-particles-back', 'pipe-path-back', 'back');
      startAuto();
    }
  }

  function selectStage(i, instant) {
    activeStage = i;
    const btns = $$('.pstage');
    btns.forEach((b, idx) => {
      b.classList.toggle('is-active', idx === i);
      b.setAttribute('aria-selected', idx === i ? 'true' : 'false');
    });
    const s = STAGES[i];
    const main = $('console-readout');
    if (!main) return;
    const num = $('cr-num'), title = $('cr-title'), desc = $('cr-desc'),
          mv = $('cr-metric-val'), ml = $('cr-metric-lbl');
    const apply = () => {
      if (num) num.textContent = String(i + 1).padStart(2, '0');
      if (title) title.textContent = s.title;
      if (desc) desc.textContent = s.desc;
      if (mv) mv.textContent = s.metric;
      if (ml) ml.textContent = s.metricLbl;
    };
    if (instant || RM) { apply(); return; }
    const groups = [$('cr-num') && $('cr-num').parentElement, $('cr-title') && $('cr-title').parentElement, $('cr-metric-val') && $('cr-metric-val').parentElement];
    groups.forEach(g => g && g.classList.add('cr-fade'));
    setTimeout(() => { apply(); groups.forEach(g => g && g.classList.remove('cr-fade')); }, 150);
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      if (paused) return;
      selectStage((activeStage + 1) % STAGES.length);
    }, 2900);
  }
  function pauseFor(ms) {
    paused = true;
    clearTimeout(pauseFor._t);
    pauseFor._t = setTimeout(() => { paused = false; }, ms);
  }

  function spawnParticles(groupId, pathId, dir) {
    const group = $(groupId), path = $(pathId);
    if (!group || !path) return;
    const total = path.getTotalLength();
    const COUNT = dir === 'forward' ? 5 : 3;
    const parts = [];
    for (let i = 0; i < COUNT; i++) {
      const p = document.createElementNS(NS, 'circle');
      p.setAttribute('r', dir === 'forward' ? 3.2 : 2.3);
      const color = dir === 'forward' ? (i % 2 === 0 ? '#0B5F66' : '#6D5BD0') : '#B4BFBC';
      p.setAttribute('fill', color);
      p.setAttribute('opacity', dir === 'forward' ? '0.9' : '0.5');
      group.appendChild(p);
      parts.push({ el: p, offset: i / COUNT });
    }
    let t = 0;
    (function tick() {
      t += dir === 'forward' ? 0.0024 : 0.0016;
      parts.forEach(part => {
        const pos = (t + part.offset) % 1;
        const pt = path.getPointAtLength(pos * total);
        part.el.setAttribute('cx', pt.x);
        part.el.setAttribute('cy', pt.y);
        if (dir === 'forward') {
          const fade = Math.min(pos * 8, (1 - pos) * 8, 1);
          part.el.setAttribute('opacity', String(0.2 + 0.7 * fade));
        }
      });
      requestAnimationFrame(tick);
    })();
  }

  /* ═══════════════════════════════════════════
     HOW IT WORKS — fill bars on scroll
  ═══════════════════════════════════════════ */
  function initStepBars() {
    const stage = $('sv-test');
    if (!stage) return;
    const fill = () => stage.querySelectorAll('.tfill').forEach(f => {
      setTimeout(() => { f.style.width = f.getAttribute('data-w') + '%'; }, 60);
    });
    if (RM || !('IntersectionObserver' in window)) { fill(); return; }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { fill(); obs.unobserve(stage); } });
    }, { threshold: 0.4 });
    obs.observe(stage);
  }

  /* ═══════════════════════════════════════════
     PROBLEM — comparison toggle
  ═══════════════════════════════════════════ */
  function initComparison() {
    const vis = $('decision-visual');
    if (!vis) return;
    const tabs = $$('.cmp-tab');
    const COPY = {
      fixed: { eye: 'Fixed sequence', a: 'day-7 email', b: 'day-7 email', outcome: 'Both users · same day-7 email' },
      sendlyr: { eye: 'Sendlyr decision layer', a: 'reinforce · upgrade', b: 'unblock next action', outcome: 'Routed by state · approved in your stack' },
    };
    function set(mode) {
      vis.setAttribute('data-mode', mode);
      const c = COPY[mode];
      const eye = $('dv-eye-text'); if (eye) eye.textContent = c.eye;
      const ra = $('dv-route-a'); if (ra) ra.textContent = c.a;
      const rb = $('dv-route-b'); if (rb) rb.textContent = c.b;
      const out = vis.querySelector('.dv-outcome-chip'); if (out) out.textContent = c.outcome;
      tabs.forEach(t => {
        const on = t.dataset.mode === mode;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }
    tabs.forEach(t => t.addEventListener('click', () => set(t.dataset.mode)));
    set('fixed');
    // auto-demo once when scrolled into view (then leave it to the user)
    if (!RM && 'IntersectionObserver' in window) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            obs.unobserve(vis);
            setTimeout(() => set('sendlyr'), 1100);
          }
        });
      }, { threshold: 0.4 });
      obs.observe(vis);
    }
  }

  /* ═══════════════════════════════════════════
     PAI EXPLORER — interactive proof
  ═══════════════════════════════════════════ */
  const BASE = 34.0;
  const DOMAIN = 50; // retention % mapped to full bar height
  const SIGNALS = [
    { id: 'a', name: 'Key action A · 14d', ret: 36.1, cov: '82%', p: 'p < 0.01', decision: 'Dropped · low lift', kind: 'drop' },
    { id: 'b', name: 'Key action B · 14d', ret: 37.9, cov: '81%', p: 'p < 0.01', decision: 'Dropped · low lift', kind: 'drop' },
    { id: 'primary', name: 'Threshold met · 14d', ret: 39.5, cov: '79%', p: 'p < 0.001', decision: 'Primary PAI', kind: 'primary', primary: true },
  ];
  let pexActive = 'primary';

  function initExplorer() {
    const list = $('pex-signals');
    if (!list) return;
    SIGNALS.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'pex-chip' + (s.primary ? ' is-primary' : '');
      btn.dataset.sig = s.id;
      btn.setAttribute('role', 'tab');
      btn.innerHTML = `<span class="pex-chip-dot"></span><span class="pex-chip-name">${s.name}</span><span class="pex-chip-ret">${s.ret.toFixed(1)}%</span>`;
      btn.addEventListener('click', () => selectSignal(s.id));
      list.appendChild(btn);
    });

    // set baseline bar + initial selection when scrolled into view
    const chart = $('pex-chart');
    const drawBaseline = () => {
      const base = $('pex-bar-base');
      if (base) base.style.height = (BASE / DOMAIN * 100) + '%';
    };
    if (RM || !('IntersectionObserver' in window)) {
      drawBaseline(); selectSignal('primary', true);
    } else {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            obs.unobserve(chart);
            drawBaseline();
            setTimeout(() => selectSignal('primary'), 200);
          }
        });
      }, { threshold: 0.3 });
      if (chart) obs.observe(chart); else { drawBaseline(); selectSignal('primary', true); }
    }
  }

  function selectSignal(id, instant) {
    pexActive = id;
    const s = SIGNALS.find(x => x.id === id);
    if (!s) return;
    $$('.pex-chip').forEach(c => c.classList.toggle('is-active', c.dataset.sig === id));

    const cand = $('pex-bar-cand');
    const candVal = $('pex-cand-val');
    const candLbl = $('pex-cand-lbl');
    if (cand) {
      // height starts at 0 (CSS default); the transition animates from the
      // current height to the new target — no reset needed.
      cand.style.height = (s.ret / DOMAIN * 100) + '%';
    }
    if (candVal) candVal.textContent = s.ret.toFixed(1) + '%';
    if (candLbl) candLbl.textContent = s.name.split(' · ')[0];

    const lift = (s.ret - BASE);
    const lv = $('pex-lift-val');
    if (lv) animateLift(lv, lift, instant);

    const dec = $('pex-decision'), cov = $('pex-coverage'), pv = $('pex-pvalue');
    if (dec) dec.textContent = s.decision;
    if (cov) cov.textContent = s.cov;
    if (pv) pv.innerHTML = s.p.replace('<', '&lt;');

    const decStat = dec && dec.closest('.pex-stat');
    if (decStat) {
      decStat.classList.toggle('is-primary', s.kind === 'primary');
      decStat.classList.toggle('is-drop', s.kind === 'drop');
    }
  }

  function animateLift(el, target, instant) {
    const txt = (v) => '+' + v.toFixed(1);
    if (instant || RM) { el.textContent = txt(target); return; }
    const start = parseFloat((el.textContent || '0').replace('+', '')) || 0;
    const dur = 480, t0 = performance.now();
    (function step(now) {
      const k = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = txt(start + (target - start) * e);
      if (k < 1) requestAnimationFrame(step);
      else el.textContent = txt(target);
    })(t0);
  }

  /* ═══════════════════════════════════════════
     PROOF BAR — count up on view
  ═══════════════════════════════════════════ */
  function initCounters() {
    const proof = $('hero-proof');
    if (!proof) return;
    const cells = $$('.hp-val[data-count]', proof);
    const run = () => cells.forEach(el => countUp(el));
    if (RM || !('IntersectionObserver' in window)) {
      cells.forEach(el => setVal(el, parseFloat(el.dataset.count)));
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { run(); obs.unobserve(proof); } });
    }, { threshold: 0.4 });
    obs.observe(proof);
  }

  function setVal(el, v) {
    const pre = el.dataset.prefix || '';
    const suf = el.dataset.suffix || '';
    const dec = el.dataset.decimals != null ? +el.dataset.decimals : (String(el.dataset.count).indexOf('.') >= 0 ? 1 : 0);
    el.innerHTML = pre + v.toFixed(dec) + (suf ? `<span class="hp-unit">${suf}</span>` : '');
  }
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const dur = 1100, t0 = performance.now();
    (function step(now) {
      const k = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - k, 3);
      setVal(el, target * e);
      if (k < 1) requestAnimationFrame(step);
      else setVal(el, target);
    })(t0);
  }

  /* ─── Boot ─── */
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initScrollProgress();
    initNavActive();
    buildConsole();
    initStepBars();
    initComparison();
    initExplorer();
    initCounters();
    // fail-safe: pop any fade-ups already in view
    setTimeout(() => {
      $$('.fade-up').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('visible');
      });
    }, 500);
  });
})();
