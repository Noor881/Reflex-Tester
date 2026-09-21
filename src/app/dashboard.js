import { tools } from "../data/tools.js";
import { store, summarize } from "../core/store.js";
import { mountShell } from "./shell.js";
mountShell("results");
const activity = tools
  .map((tool) => ({ tool, attempts: store.attempts(tool.slug) }))
  .filter((x) => x.attempts.length);
const main = document.querySelector("#main");
main.innerHTML = `<div class="page"><header class="catalog-head"><div><span class="eyebrow">Local results</span><h1>Your measurements.</h1><p class="lede">Only real attempts from this browser appear here.</p></div><button class="button secondary" data-clear ${activity.length ? "" : "disabled"}>Clear local data</button></header>${
  activity.length
    ? `<div class="tool-list">${activity
        .map(({ tool, attempts }) => {
          const lower = [
              "visual",
              "audio",
              "double",
              "compare",
              "numbers",
            ].includes(tool.mechanic),
            stats = summarize(attempts, "score", lower);
          return `<a class="tool-row" href=".${tool.url}"><span class="tool-kind">${attempts.length} attempts</span><span class="tool-name">${tool.name}</span><p>Best ${Number(stats.best).toFixed(Number(stats.best) % 1 ? 1 : 0)} · average ${Number(stats.average).toFixed(1)}</p><span class="tool-arrow">→</span></a>`;
        })
        .join("")}</div>`
    : `<div class="empty-state"><h2>No results yet.</h2><p>Complete a test or training session and it will appear here.</p><a class="button accent" href="./tools/visual-reflex-test.html">Run a reaction test</a></div>`
}</div>`;
main.querySelector("[data-clear]")?.addEventListener("click", () => {
  if (
    confirm(
      "Clear all ReflexTester results and saved settings from this browser?",
    )
  ) {
    store.clear();
    location.reload();
  }
});
