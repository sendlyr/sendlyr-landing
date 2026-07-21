(() => {
  "use strict";

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  for (const tabs of document.querySelectorAll("[data-instrument-tabs]")) {
    const tablist = tabs.querySelector(".leak-tabs");
    const controls = [...tabs.querySelectorAll("[data-instrument-tab]")];
    const panels = [...tabs.querySelectorAll("[data-instrument-panel]")];
    const eventName = tabs.dataset.event;
    const propertyName = tabs.dataset.property;

    tablist?.setAttribute("role", "tablist");
    controls.forEach((control, index) => {
      control.hidden = false;
      control.setAttribute("role", "tab");
      control.setAttribute("aria-controls", control.dataset.controls);
      control.setAttribute("aria-selected", String(index === 0));
      control.tabIndex = index === 0 ? 0 : -1;
    });
    panels.forEach((panel, index) => {
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", controls[index]?.id || "");
    });

    function reveal(control) {
      const list = control.closest('[role="tablist"]');
      if (!list || list.scrollWidth <= list.clientWidth) return;
      control.scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }

    function select(control, { focus = false, track = true, scroll = true } = {}) {
      const changed = control.getAttribute("aria-selected") !== "true";
      controls.forEach((item) => {
        const selected = item === control;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.id !== control.getAttribute("aria-controls");
      });
      if (focus) control.focus();
      if (scroll) reveal(control);
      if (track && changed && eventName && propertyName) {
        window.Sendlyr?.trackEvent(eventName, { [propertyName]: control.dataset.value });
      }
    }

    tabs.classList.add("is-enhanced");
    const initial = controls.find((control) => control.getAttribute("aria-selected") === "true") || controls[0];
    if (initial) select(initial, { track: false, scroll: false });

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
          select(controls[next], { focus: true });
        }
      });
    });
  }

})();
