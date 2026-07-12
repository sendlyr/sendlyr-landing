(() => {
  "use strict";

  const preview = document.querySelector("[data-signal-preview]");
  if (!preview) return;

  const signalData = {
    task: {
      signal: "Complete a first meaningful task",
      "product-short": "First-task prompt",
      "lifecycle-short": "Day-one reminder",
      combined: "Change the product prompt first and hold lifecycle constant, so any movement is attributable to that surface."
    },
    session: {
      signal: "Return for a second active session",
      "product-short": "Return path",
      "lifecycle-short": "Day-two reminder",
      combined: "Hold the product experience constant, so any movement is attributable to the day-two reminder."
    },
    core: {
      signal: "Use a core feature three times",
      "product-short": "Repeat path",
      "lifecycle-short": "First-use nudge",
      combined: "Clarify the repeat path first and hold lifecycle constant, so any movement is attributable to that surface."
    }
  };

  const signalInputs = [...preview.querySelectorAll("[data-signal-key]")];
  const testViews = [...preview.querySelectorAll("[data-test-views]")];
  const announcement = preview.querySelector("[data-signal-announcement]");
  const boundValues = [...document.querySelectorAll("[data-bind]")];
  let currentView = "product";

  function selectedSignalKey() {
    return signalInputs.find((input) => input.checked)?.dataset.signalKey || "task";
  }

  function selectedDetail() {
    return preview.querySelector(`[data-signal-detail="${selectedSignalKey()}"]`);
  }

  function updateBoundValues(key) {
    const values = signalData[key];
    if (!values) return;
    boundValues.forEach((node) => {
      const value = values[node.dataset.bind];
      if (value) node.textContent = value;
    });
  }

  function announceRecommendation() {
    const title = selectedDetail()?.querySelector(`[data-test-panel="${currentView}"] [data-recommendation-title]`)?.textContent.trim();
    if (!title || !announcement) return;
    announcement.textContent = "";
    requestAnimationFrame(() => {
      announcement.textContent = `Recommendation updated: ${title}.`;
    });
  }

  function selectView(viewKey, { focusView = null, announce = false } = {}) {
    currentView = viewKey;
    testViews.forEach((view) => {
      const controls = [...view.querySelectorAll("[data-test-view]")];
      const panels = [...view.querySelectorAll("[data-test-panel]")];
      controls.forEach((control) => {
        const selected = control.dataset.testView === viewKey;
        control.setAttribute("aria-selected", String(selected));
        control.tabIndex = selected ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.testPanel !== viewKey;
      });
    });

    if (focusView) {
      focusView.querySelector(`[data-test-view="${viewKey}"]`)?.focus();
    }
    if (announce) announceRecommendation();
  }

  testViews.forEach((view) => {
    const list = view.querySelector(".test-tab-list");
    const controls = [...view.querySelectorAll("[data-test-view]")];
    const panels = [...view.querySelectorAll("[data-test-panel]")];

    list.setAttribute("role", "tablist");
    controls.forEach((control) => {
      control.hidden = false;
      control.setAttribute("role", "tab");
      control.addEventListener("click", () => {
        selectView(control.dataset.testView, { announce: true });
      });
      control.addEventListener("keydown", (event) => {
        const keys = controls.map((item) => item.dataset.testView);
        const index = keys.indexOf(control.dataset.testView);
        let nextIndex = null;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % keys.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + keys.length) % keys.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = keys.length - 1;
        if (nextIndex !== null) {
          event.preventDefault();
          selectView(keys[nextIndex], { focusView: view, announce: true });
        }
      });
    });

    panels.forEach((panel) => {
      const control = controls.find((item) => item.getAttribute("aria-controls") === panel.id);
      panel.setAttribute("role", "tabpanel");
      if (control) panel.setAttribute("aria-labelledby", control.id);
    });
  });

  signalInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      updateBoundValues(input.dataset.signalKey);
      announceRecommendation();
    });
  });

  updateBoundValues(selectedSignalKey());
  selectView(currentView);
  document.documentElement.classList.add("is-enhanced");

  const dashboardAnchor = document.querySelector("[data-dashboard-anchor]");
  const previewTitle = document.querySelector("#signal-preview-title");
  let dashboardFocusTimer = null;

  function cancelDashboardFocus() {
    window.clearTimeout(dashboardFocusTimer);
    dashboardFocusTimer = null;
  }

  preview.addEventListener("pointerdown", cancelDashboardFocus, true);
  preview.addEventListener("keydown", cancelDashboardFocus, true);
  dashboardAnchor?.addEventListener("click", (event) => {
    event.preventDefault();
    cancelDashboardFocus();
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    preview.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start"
    });
    if (reducedMotion) {
      previewTitle?.focus({ preventScroll: true });
      return;
    }
    dashboardFocusTimer = window.setTimeout(() => {
      dashboardFocusTimer = null;
      previewTitle?.focus({ preventScroll: true });
    }, 320);
  });
})();
