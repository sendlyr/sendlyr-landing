(() => {
  "use strict";

  document.documentElement.classList.add("is-enhanced");

  const preview = document.querySelector("[data-signal-preview]");
  if (!preview) return;

  const signalData = {
    task: {
      signal: "Complete a first meaningful task",
      prior: "Previously 3 of 3",
      observation: "Coverage moved from 38% to 44%. The timing coincides with an onboarding release; cause is unknown.",
      product: "Test a clearer first-task prompt for eligible new users.",
      lifecycle: "Test a day-one reminder for users who have not completed the task.",
      combined: "Run the product prompt first while lifecycle stays unchanged. Test the reminder second.",
      "product-short": "First-task prompt",
      "lifecycle-short": "Day-one reminder"
    },
    session: {
      signal: "Return for a second active session",
      prior: "Previously 1 of 3",
      observation: "Descriptive lift moved from +17% to +15%. Event and cohort definitions still require review.",
      product: "Test a clearer return path after the first session.",
      lifecycle: "Test one return reminder on day two.",
      combined: "Hold product constant while testing the reminder. Review the product path next.",
      "product-short": "Return path",
      "lifecycle-short": "Day-two reminder"
    },
    core: {
      signal: "Use a core feature three times",
      prior: "Previously 2 of 3",
      observation: "Coverage moved from 32% to 28%. The signal remains exploratory.",
      product: "Test a clearer path back to the core feature after the first meaningful task.",
      lifecycle: "Test a reminder for users who used the feature once but did not return.",
      combined: "Test the product path first. Add lifecycle follow-up only if repeat use remains low.",
      "product-short": "Core-feature path",
      "lifecycle-short": "Repeat-use reminder"
    }
  };

  const listbox = preview.querySelector('[role="listbox"]');
  const signalOptions = [...preview.querySelectorAll(".signal-option")];
  const boundValues = [...document.querySelectorAll("[data-bind]")];

  function selectSignal(option, focus = false) {
    const values = signalData[option.dataset.signalKey];
    if (!values) return;

    signalOptions.forEach((item) => {
      const selected = item === option;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    listbox?.setAttribute("aria-activedescendant", option.id);
    boundValues.forEach((node) => {
      const value = values[node.dataset.bind];
      if (value) node.textContent = value;
    });
    if (focus) option.focus();
  }

  signalOptions.forEach((option, index) => {
    option.addEventListener("click", () => selectSignal(option));
    option.addEventListener("keydown", (event) => {
      let nextIndex = null;
      if (["ArrowRight", "ArrowDown"].includes(event.key)) nextIndex = (index + 1) % signalOptions.length;
      if (["ArrowLeft", "ArrowUp"].includes(event.key)) nextIndex = (index - 1 + signalOptions.length) % signalOptions.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = signalOptions.length - 1;
      if (nextIndex !== null) {
        event.preventDefault();
        selectSignal(signalOptions[nextIndex], true);
      }
    });
  });

  for (const tabs of document.querySelectorAll("[data-test-views]")) {
    const controls = [...tabs.querySelectorAll('[role="tab"]')];
    const panels = [...tabs.querySelectorAll('[role="tabpanel"]')];

    function selectTab(control, focus = false) {
      controls.forEach((item) => {
        const selected = item === control;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.id !== control.getAttribute("aria-controls");
      });
      if (focus) control.focus();
    }

    controls.forEach((control, index) => {
      control.addEventListener("click", () => selectTab(control));
      control.addEventListener("keydown", (event) => {
        let nextIndex = null;
        if (["ArrowRight", "ArrowDown"].includes(event.key)) nextIndex = (index + 1) % controls.length;
        if (["ArrowLeft", "ArrowUp"].includes(event.key)) nextIndex = (index - 1 + controls.length) % controls.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = controls.length - 1;
        if (nextIndex !== null) {
          event.preventDefault();
          selectTab(controls[nextIndex], true);
        }
      });
    });

    const selected = controls.find((control) => control.getAttribute("aria-selected") === "true") || controls[0];
    if (selected) selectTab(selected);
  }

  const previewStates = {
    loading: {
      title: "Preparing the illustrative snapshot…",
      copy: "This state demonstrates how the concept holds its layout while data is prepared."
    },
    empty: {
      title: "No signals ranked in this preview yet.",
      copy: "Start with an approved data sample and a clear later outcome."
    },
    error: {
      title: "The concept preview is unavailable.",
      copy: "The Sprint method and evidence remain available below."
    },
    success: { title: "", copy: "" },
    partial: {
      title: "Some fields are under review.",
      copy: "Available signal rows remain usable while uncertain values are labelled."
    }
  };

  const stateMessage = preview.querySelector(".preview-state-message");
  const stateSkeleton = preview.querySelector(".preview-skeleton");
  const stateTitle = preview.querySelector("[data-state-title]");
  const stateCopy = preview.querySelector("[data-state-copy]");
  const stateLink = preview.querySelector("[data-state-link]");
  const stateOptions = [...preview.querySelectorAll("[data-preview-option]")];
  const pendingValues = [...preview.querySelectorAll('[data-signal-key="core"] [data-value]')];

  function selectPreviewState(state) {
    const content = previewStates[state];
    if (!content) return;

    preview.dataset.previewState = state;
    stateOptions.forEach((option) => {
      option.setAttribute("aria-pressed", String(option.dataset.previewOption === state));
    });

    const showsMessage = state !== "success";
    stateMessage.hidden = !showsMessage;
    stateSkeleton.classList.toggle("is-loading", state === "loading");
    stateTitle.textContent = content.title;
    stateCopy.textContent = content.copy;
    stateLink.hidden = !["empty", "error"].includes(state);

    pendingValues.forEach((value) => {
      value.textContent = state === "partial" ? "Review pending" : value.dataset.value;
    });
  }

  stateOptions.forEach((option) => {
    option.addEventListener("click", () => selectPreviewState(option.dataset.previewOption));
  });

  const dashboardAnchor = document.querySelector("[data-dashboard-anchor]");
  const previewTitle = document.querySelector("#signal-preview-title");
  dashboardAnchor?.addEventListener("click", (event) => {
    event.preventDefault();
    preview.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });
    window.setTimeout(() => previewTitle?.focus({ preventScroll: true }), 320);
  });
})();
