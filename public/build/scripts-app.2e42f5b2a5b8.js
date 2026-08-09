(() => {
  "use strict";

  const attributionPattern = /^[a-zA-Z0-9-]{1,80}$/;

  function attributionId() {
    const value = new URLSearchParams(location.search).get("ref") || "";
    return attributionPattern.test(value) ? value : "";
  }

  for (const form of document.querySelectorAll("[data-pilot-form]")) {
    const status = form.querySelector("[data-pilot-status]");
    const submit = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (event) => {
      if (!globalThis.fetch) return;
      event.preventDefault();

      const data = new FormData(form);
      const budgetAuthority = String(data.get("budget_authority") || "");
      const ref = attributionId();
      if (ref) data.set("attribution_id", ref);

      if (status) {
        status.classList.remove("is-error", "is-success");
        status.textContent = "Sending your request…";
      }
      if (submit) submit.disabled = true;

      try {
        const response = await fetch(form.action, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body: new URLSearchParams(data),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) throw new Error(result.message || "Unable to send your request right now.");

        form.dispatchEvent(new CustomEvent("pilot:submit-success", {
          bubbles: true,
          detail: { budgetAuthority },
        }));
        form.reset();
        if (status) {
          status.classList.add("is-success");
          status.textContent = result.message || "Thanks. We received your request.";
        }
      } catch (error) {
        if (status) {
          status.classList.add("is-error");
          status.textContent = error.message || "Unable to send your request right now.";
        }
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  }
})();
