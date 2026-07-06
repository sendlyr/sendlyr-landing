/* ═══════════════════════════════════════════════════════════════
   Sendlyr — landing interactions
═══════════════════════════════════════════════════════════════ */

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

const STAGES = [
  {
    num: '01',
    label: 'Usage',
    desc: 'Historical event exports and outcome cohorts — the raw material every classification is scored against.',
    metric: '24,118',
    metricLabel: 'trials analyzed',
    x: 6,
    y: 35,
  },
  {
    num: '02',
    label: 'Analysis',
    desc: 'Candidate behaviors are scored by lift, coverage, and confidence against conversion or retention.',
    metric: '5',
    metricLabel: 'signals compared',
    x: 28,
    y: 35,
  },
  {
    num: '03',
    label: 'Signals',
    desc: 'The selected activation signal becomes the behavior worth driving before lifecycle execution starts.',
    metric: '+5.5',
    metricLabel: 'points vs baseline',
    x: 50,
    y: 35,
  },
  {
    num: '04',
    label: 'States',
    desc: 'Users are classified by progress toward the selected activation signal, so active, stalled, and already-activated users split cleanly.',
    metric: '2',
    metricLabel: 'states shown',
    x: 72,
    y: 35,
  },
  {
    num: '05',
    label: 'Experiment',
    desc: 'State rules and treatment/control design run through your stack with measurement before broad rollout.',
    metric: '1',
    metricLabel: 'controlled plan',
    x: 94,
    y: 35,
  },
];

const SIGNALS = [
  {
    name: 'Signal reached',
    retention: 39.5,
    decision: 'Signal reached',
    coverage: '79%',
    pvalue: 'p < 0.001',
  },
  {
    name: 'Key action B',
    retention: 37.9,
    decision: 'Secondary',
    coverage: '81%',
    pvalue: 'p < 0.01',
  },
  {
    name: 'Key action A',
    retention: 36.1,
    decision: 'Drop',
    coverage: '82%',
    pvalue: 'p < 0.05',
  },
];

function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  $$('.fade-up').forEach(el => obs.observe(el));
}

function initScrollProgress() {
  const progress = $('scroll-progress');
  if (!progress) return;

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

function initActiveNav() {
  const links = [...document.querySelectorAll('[data-nav]')];
  const sections = links
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!links.length || !sections.length) return;

  const obs = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;

    links.forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`);
    });
  }, {
    rootMargin: '-28% 0px -58% 0px',
    threshold: [0.08, 0.18, 0.32],
  });

  sections.forEach(section => obs.observe(section));
}

function spawnParticles(groupId, pathId, direction) {
  const group = $(groupId);
  const path = $(pathId);
  if (!group || !path) return;

  const NS = 'http://www.w3.org/2000/svg';
  const total = path.getTotalLength();
  const count = direction === 'forward' ? 5 : 3;
  const particles = [];

  for (let i = 0; i < count; i++) {
    const particle = document.createElementNS(NS, 'circle');
    const color = direction === 'forward'
      ? (i % 2 === 0 ? '#0B5F66' : '#6D5BD0')
      : '#8B96A0';

    particle.setAttribute('r', direction === 'forward' ? '3.5' : '2.5');
    particle.setAttribute('fill', color);
    particle.setAttribute('opacity', direction === 'forward' ? '0.95' : '0.55');
    group.appendChild(particle);
    particles.push({ el: particle, offset: i / count });
  }

  let t = 0;
  const tick = () => {
    t += direction === 'forward' ? 0.0025 : 0.0016;
    particles.forEach(part => {
      const pos = (t + part.offset) % 1;
      const pt = path.getPointAtLength(pos * total);
      const fade = direction === 'forward' ? Math.min(pos * 8, (1 - pos) * 8, 1) : 0.7;
      part.el.setAttribute('cx', pt.x);
      part.el.setAttribute('cy', pt.y);
      part.el.setAttribute('opacity', String(direction === 'forward' ? 0.25 + 0.7 * fade : 0.55));
    });
    requestAnimationFrame(tick);
  };

  tick();
}

function initConsole() {
  const stage = $('pipe-stages');
  if (!stage) return;

  const setActive = (idx) => {
    const item = STAGES[idx];
    stage.querySelectorAll('.pipe-node').forEach((node, nodeIdx) => {
      node.classList.toggle('is-active', nodeIdx === idx);
      node.setAttribute('aria-selected', String(nodeIdx === idx));
    });

    $('cr-num').textContent = item.num;
    $('cr-title').textContent = item.label;
    $('cr-desc').textContent = item.desc;
    $('cr-metric-val').textContent = item.metric;
    $('cr-metric-lbl').textContent = item.metricLabel;
  };

  stage.innerHTML = STAGES.map((item, idx) => `
    <button class="pipe-node${idx === 0 ? ' is-active' : ''}" type="button" role="tab" aria-selected="${idx === 0}" style="left:${item.x}%;top:${item.y}%">
      <span class="pipe-node-orb">${item.num}</span>
      <span class="pipe-node-label">${item.label}</span>
    </button>
  `).join('');

  stage.querySelectorAll('.pipe-node').forEach((node, idx) => {
    node.addEventListener('click', () => {
      current = idx;
      setActive(current);
    });
  });

  let current = 0;
  setInterval(() => {
    if (document.hidden) return;
    current = (current + 1) % STAGES.length;
    setActive(current);
  }, 4400);

  spawnParticles('pipe-particles-fwd', 'pipe-path-fwd', 'forward');
  spawnParticles('pipe-particles-back', 'pipe-path-back', 'back');
}

function initStepBars() {
  const stage = $('sv-test');
  if (!stage) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        stage.querySelectorAll('.tfill').forEach(fill => {
          fill.style.width = `${fill.getAttribute('data-w')}%`;
        });
        obs.unobserve(stage);
      }
    });
  }, { threshold: 0.4 });

  obs.observe(stage);
}

function initProblemToggle() {
  const visual = $('decision-visual');
  if (!visual) return;

  const tabs = [...document.querySelectorAll('.cmp-tab')];
  const eye = $('dv-eye-text');
  const routeA = $('dv-route-a');
  const routeB = $('dv-route-b');
  const outcome = $('dv-outcome');

  const setMode = (mode) => {
    visual.dataset.mode = mode;
    tabs.forEach(tab => {
      const active = tab.dataset.mode === mode;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    if (mode === 'sendlyr') {
      eye.textContent = 'Sendlyr signal layer';
      routeA.textContent = 'signal reached';
      routeB.textContent = 'next action needed';
      outcome.innerHTML = '<span class="dv-outcome-chip">State logic · approved in existing stack</span>';
    } else {
      eye.textContent = 'Fixed sequence';
      routeA.textContent = 'day-7 email';
      routeB.textContent = 'day-7 email';
      outcome.innerHTML = '<span class="dv-outcome-chip">Both users · same day-7 email</span>';
    }
  };

  tabs.forEach(tab => tab.addEventListener('click', () => setMode(tab.dataset.mode)));
  setMode('fixed');
}

function initProofCounters() {
  const proof = $('hero-proof');
  if (!proof) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      proof.querySelectorAll('[data-count]').forEach(el => {
        const target = Number(el.dataset.count);
        const decimals = Number(el.dataset.decimals || (String(target).includes('.') ? 1 : 0));
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const unit = el.querySelector('.hp-unit');
        const start = performance.now();
        const duration = 850;

        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const value = target * eased;
          el.childNodes[0].nodeValue = `${prefix}${value.toFixed(decimals)}`;
          if (unit) unit.textContent = suffix;
          if (t < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      });

      obs.unobserve(proof);
    });
  }, { threshold: 0.4 });

  obs.observe(proof);
}

function barHeight(value) {
  return `${Math.max(22, Math.min(100, (value / 45) * 100))}%`;
}

function initPaiExplorer() {
  const signalWrap = $('pex-signals');
  if (!signalWrap) return;

  const base = 34.0;
  const candidateBar = $('pex-bar-cand');
  const baseBar = $('pex-bar-base');
  const candVal = $('pex-cand-val');
  const candLabel = $('pex-cand-lbl');
  const liftVal = $('pex-lift-val');

  baseBar.style.height = barHeight(base);

  const setSignal = (idx) => {
    const signal = SIGNALS[idx];
    signalWrap.querySelectorAll('.pex-signal').forEach((btn, btnIdx) => {
      btn.classList.toggle('is-active', btnIdx === idx);
      btn.setAttribute('aria-selected', String(btnIdx === idx));
    });

    $('pex-decision').textContent = signal.decision;
    $('pex-coverage').textContent = signal.coverage;
    $('pex-pvalue').textContent = signal.pvalue;
    candVal.textContent = `${signal.retention.toFixed(1)}%`;
    candLabel.textContent = signal.name;
    liftVal.textContent = `${signal.retention - base >= 0 ? '+' : ''}${(signal.retention - base).toFixed(1)}`;
    candidateBar.style.height = barHeight(signal.retention);
  };

  signalWrap.innerHTML = SIGNALS.map((signal, idx) => `
    <button class="pex-signal${idx === 0 ? ' is-active' : ''}" type="button" role="tab" aria-selected="${idx === 0}">
      <span class="pex-signal-name">${signal.name}</span>
      <span class="pex-signal-ret">${signal.retention.toFixed(1)}%</span>
    </button>
  `).join('');

  signalWrap.querySelectorAll('.pex-signal').forEach((btn, idx) => {
    btn.addEventListener('click', () => setSignal(idx));
  });

  setSignal(0);
}

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initScrollProgress();
  initActiveNav();
  initConsole();
  initStepBars();
  initProblemToggle();
  initProofCounters();
  initPaiExplorer();

  setTimeout(() => {
    document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
  }, 600);
});
