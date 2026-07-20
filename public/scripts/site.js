(() => {
  "use strict";

  const root = document.documentElement;
  const enabled = root.dataset.analyticsEnabled === "true";
  const endpoint = "/api/events";
  const allowedNames = new Set([
    "page_view",
    "navigation_click",
    "workflow_open",
    "case_study_open",
    "book_sprint_click",
    "cohort_toggle",
    "proof_tab_change",
    "decision_trace_change",
  ]);
  let eventCount = 0;

  function randomId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  function sessionValue(key) {
    try {
      const existing = sessionStorage.getItem(key);
      if (existing) return existing;
      const value = randomId();
      sessionStorage.setItem(key, value);
      return value;
    } catch {
      return randomId();
    }
  }

  const sessionId = sessionValue("sendlyr_session_id");
  const pageId = randomId();

  function clean(value, max = 120) {
    return String(value || "").trim().slice(0, max);
  }

  function track(name, properties = {}) {
    if (!enabled || !allowedNames.has(name) || eventCount >= 50) return false;
    eventCount += 1;
    const payload = JSON.stringify({
      event_id: randomId(),
      event_name: name,
      session_id: sessionId,
      page_id: pageId,
      path: location.pathname,
      referrer_host: document.referrer ? new URL(document.referrer).host : "",
      properties: Object.fromEntries(
        Object.entries(properties).slice(0, 12).map(([key, value]) => [clean(key, 40), clean(value, 160)])
      ),
      occurred_at: new Date().toISOString(),
    });

    if (navigator.sendBeacon) {
      return navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
    }
    fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
    return true;
  }

  window.Sendlyr = Object.freeze({ trackEvent: track });

  const progress = document.querySelector("#scroll-progress");
  function updateProgress() {
    const available = document.documentElement.scrollHeight - innerHeight;
    const value = available > 0 ? Math.min(100, Math.max(0, (scrollY / available) * 100)) : 0;
    if (progress) progress.style.setProperty("--scroll", `${value}%`);
  }
  updateProgress();
  addEventListener("scroll", updateProgress, { passive: true });
  addEventListener("resize", updateProgress, { passive: true });

  const routeRail = document.querySelector(".nav-route-row");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  routeRail?.addEventListener("focusin", (event) => {
    event.target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "nearest", inline: "center" });
  });
  routeRail?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "center" });

  const revealItems = [...document.querySelectorAll(".reveal")];
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.16 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  for (const link of document.querySelectorAll("[data-book-sprint]")) {
    link.addEventListener("click", () => {
      if (enabled) {
        const attributionId = randomId();
        const url = new URL(link.href);
        url.searchParams.set("utm_source", "sendlyr_site");
        url.searchParams.set("utm_medium", "activation_sprint");
        url.searchParams.set("utm_campaign", "book_sprint");
        url.searchParams.set("utm_content", clean(link.dataset.placement, 40));
        url.searchParams.set("utm_term", attributionId);
        link.href = url.toString();
        track("book_sprint_click", { placement: link.dataset.placement, attribution_id: attributionId });
      }
    });
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest("a[data-track]");
    if (target) track(target.dataset.track, { href: target.pathname || target.href });
    const navigation = event.target.closest(".nav-route-row a, .footer-links a");
    if (navigation) track("navigation_click", { href: `${navigation.pathname}${navigation.hash}`, placement: navigation.closest("footer") ? "footer" : "header" });
  });

  track("page_view", { title: document.title });
})();
