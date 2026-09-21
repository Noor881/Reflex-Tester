const form = document.querySelector("[data-contact-form]");
const status = document.querySelector("[data-contact-status]");

if (form && status) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    status.textContent = "Sending…";
    status.className = "form-status";
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(result.error || "Message could not be sent.");
      form.reset();
      status.textContent = "Thanks — your message has been sent.";
      status.classList.add("success");
    } catch (error) {
      status.textContent = error.message;
      status.classList.add("error");
    } finally {
      button.disabled = false;
    }
  });
}
