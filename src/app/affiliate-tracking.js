const links = document.querySelectorAll("[data-affiliate-click]");

for (const link of links) {
  link.addEventListener("click", () => {
    const body = JSON.stringify({
      name: "affiliate_click",
      slug: link.dataset.affiliateClick,
      path: location.pathname,
      metadata: { destination: link.hostname },
    });
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/events", blob);
    else fetch("/api/events", { method: "POST", body, keepalive: true });
  });
}
