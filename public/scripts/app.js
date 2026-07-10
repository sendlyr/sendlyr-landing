(function () {
  'use strict';

  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initMotion() {
    if (reducedMotion) return;
    body.classList.add('motion-enabled');
    requestAnimationFrame(() => requestAnimationFrame(() => body.classList.add('is-ready')));
  }

  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    let queued = false;
    const update = () => {
      const root = document.documentElement;
      const distance = root.scrollHeight - root.clientHeight;
      bar.style.width = `${distance > 0 ? (root.scrollTop / distance) * 100 : 0}%`;
      queued = false;
    };

    window.addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  function initActiveNav() {
    if (!('IntersectionObserver' in window)) return;

    const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
    const entries = links
      .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
      .filter(item => item.section);

    const observer = new IntersectionObserver(changes => {
      const visible = changes.find(change => change.isIntersecting);
      if (!visible) return;

      entries.forEach(item => {
        if (item.section === visible.target) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-35% 0px -58%', threshold: 0 });

    entries.forEach(item => observer.observe(item.section));
  }

  function initLiftSwitch() {
    const consoleEl = document.getElementById('result-console');
    const value = document.getElementById('lift-value');
    const label = document.getElementById('lift-label');
    const note = document.getElementById('lift-note');
    const buttons = [...document.querySelectorAll('[data-lift-mode]')];
    if (!consoleEl || !value || !label || !note || !buttons.length) return;

    const modes = {
      relative: {
        value: '+19.9%',
        label: 'relative lift',
        note: '69.4% treatment versus 57.9% control.',
      },
      absolute: {
        value: '+11.5',
        label: 'percentage points',
        note: 'An 11.5-point treatment gap.',
      },
    };

    const select = mode => {
      const next = modes[mode];
      if (!next) return;
      consoleEl.dataset.activeLiftMode = mode;
      value.textContent = next.value;
      label.textContent = next.label;
      note.textContent = next.note;
      buttons.forEach(button => {
        const active = button.dataset.liftMode === mode;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    };

    buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.liftMode)));
    select('relative');
  }

  function initConsoleGlow() {
    const consoleEl = document.getElementById('result-console');
    if (!consoleEl || reducedMotion) return;

    consoleEl.addEventListener('pointermove', event => {
      const bounds = consoleEl.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;
      consoleEl.style.setProperty('--spot-x', `${x.toFixed(1)}%`);
      consoleEl.style.setProperty('--spot-y', `${y.toFixed(1)}%`);
    });
  }

  function initDecisionBoard() {
    const board = document.getElementById('decision-board');
    const label = document.getElementById('decision-label');
    const heading = document.getElementById('decision-heading');
    const description = document.getElementById('decision-description');
    const routeA = document.getElementById('route-action-a');
    const routeB = document.getElementById('route-action-b');
    const buttons = [...document.querySelectorAll('[data-decision-mode]')];
    if (!board || !label || !heading || !description || !routeA || !routeB) return;

    const modes = {
      calendar: {
        label: 'Fixed schedule',
        heading: 'Same day. Same message.',
        description: 'Different users enter the same journey.',
        routeA: 'Day-7 email',
        routeB: 'Day-7 email',
      },
      signal: {
        label: 'Activation decision layer',
        heading: 'Different state. Different next action.',
        description: 'Each message follows proven product progress.',
        routeA: 'Reinforce progress',
        routeB: 'Unblock first course',
      },
    };

    const select = mode => {
      const next = modes[mode];
      if (!next) return;
      board.dataset.mode = mode;
      label.textContent = next.label;
      heading.textContent = next.heading;
      description.textContent = next.description;
      routeA.textContent = next.routeA;
      routeB.textContent = next.routeB;
      buttons.forEach(button => {
        const active = button.dataset.decisionMode === mode;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    };

    buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.decisionMode)));
    select('calendar');
  }

  function initMethodWorkbench() {
    const panel = document.getElementById('method-panel');
    const kicker = document.getElementById('method-kicker');
    const heading = document.getElementById('method-heading');
    const description = document.getElementById('method-description');
    const visual = document.getElementById('method-visual');
    const buttons = [...document.querySelectorAll('[data-method]')];
    if (!panel || !kicker || !heading || !description || !visual || !buttons.length) return;

    const stages = {
      signal: {
        kicker: 'Find the behavior',
        heading: 'Score early actions against the outcome.',
        description: 'Rank candidates by lift, coverage, sample, and confidence.',
        visual: `
          <div class="score-line"><span>Lift</span><i style="--score: 88%"></i><b>High</b></div>
          <div class="score-line"><span>Coverage</span><i style="--score: 76%"></i><b>Useful</b></div>
          <div class="score-line"><span>Confidence</span><i style="--score: 94%"></i><b>Strong</b></div>
        `,
      },
      states: {
        kicker: 'Define the states',
        heading: 'Map progress toward the signal.',
        description: 'Separate active, stalled, reached, and excluded users.',
        visual: `
          <div class="state-map">
            <div class="state-node"><span>New</span><strong>Watch</strong></div>
            <div class="state-node"><span>Stalled</span><strong>Unblock</strong></div>
            <div class="state-node"><span>Signal reached</span><strong>Reinforce</strong></div>
            <div class="state-node"><span>Excluded</span><strong>Hold</strong></div>
          </div>
        `,
      },
      experiment: {
        kicker: 'Prove the outcome',
        heading: 'Package one controlled test.',
        description: 'Ship rules, cohorts, measures, and implementation notes.',
        visual: `
          <div class="experiment-map">
            <div class="experiment-node"><span>Signal rule</span><strong>Locked</strong></div>
            <div class="experiment-node"><span>Treatment / control</span><strong>Scoped</strong></div>
            <div class="experiment-node"><span>Success event</span><strong>Defined</strong></div>
            <div class="experiment-node"><span>Existing stack</span><strong>Ready</strong></div>
          </div>
        `,
      },
    };

    const select = (name, focus = false) => {
      const next = stages[name];
      const activeButton = buttons.find(button => button.dataset.method === name);
      if (!next || !activeButton) return;

      kicker.textContent = next.kicker;
      heading.textContent = next.heading;
      description.textContent = next.description;
      visual.dataset.stage = name;
      visual.innerHTML = next.visual;
      panel.setAttribute('aria-labelledby', activeButton.id);

      buttons.forEach(button => {
        const active = button === activeButton;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
      });

      if (focus) activeButton.focus();
    };

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => select(button.dataset.method));
      button.addEventListener('keydown', event => {
        let nextIndex = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = buttons.length - 1;
        if (nextIndex === null) return;
        event.preventDefault();
        select(buttons[nextIndex].dataset.method, true);
      });
    });

    select('signal');
  }

  initMotion();
  initScrollProgress();
  initActiveNav();
  initLiftSwitch();
  initConsoleGlow();
  initDecisionBoard();
  initMethodWorkbench();
})();
