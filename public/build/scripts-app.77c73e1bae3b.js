(() => {
  "use strict";

  const field = document.querySelector("#cohort-field");
  const observatory = document.querySelector("#cohort-observatory");
  if (field && observatory) {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 178; index += 1) {
      const treatment = index < 121;
      const hit = treatment ? index < 84 : index - 121 < 33;
      const person = document.createElement("span");
      person.className = `person ${treatment ? "treatment" : "control"}${hit ? " hit" : ""}`;
      person.style.setProperty("--i", index);
      fragment.append(person);
    }
    field.append(fragment);
    requestAnimationFrame(() => observatory.classList.add("is-filled"));
  }

  const disclosure = document.querySelector(".cohort-disclosure");
  const mobile = matchMedia("(max-width: 760px)");
  if (disclosure) {
    const setInitialState = () => {
      if (mobile.matches && !disclosure.dataset.touched) disclosure.open = false;
      if (!mobile.matches) disclosure.open = true;
    };
    setInitialState();
    mobile.addEventListener?.("change", setInitialState);
    disclosure.addEventListener("toggle", () => {
      disclosure.dataset.touched = "true";
      window.Sendlyr?.trackEvent("cohort_toggle", { state: disclosure.open ? "open" : "closed" });
    });
  }

  for (const tabs of document.querySelectorAll("[data-tabs]")) {
    const controls = [...tabs.querySelectorAll('[role="tab"]')];
    const panels = [...tabs.querySelectorAll('[role="tabpanel"]')];

    function select(control, focus = false) {
      controls.forEach((item) => {
        const selected = item === control;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      panels.forEach((panel) => { panel.hidden = panel.id !== control.getAttribute("aria-controls"); });
      if (focus) control.focus();
      window.Sendlyr?.trackEvent("proof_tab_change", { tab: control.textContent.trim() });
    }

    controls.forEach((control, index) => {
      control.addEventListener("click", () => select(control));
      control.addEventListener("keydown", (event) => {
        let next = null;
        if (["ArrowRight", "ArrowDown"].includes(event.key)) next = (index + 1) % controls.length;
        if (["ArrowLeft", "ArrowUp"].includes(event.key)) next = (index - 1 + controls.length) % controls.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = controls.length - 1;
        if (next !== null) {
          event.preventDefault();
          select(controls[next], true);
        }
      });
    });
  }
})();
