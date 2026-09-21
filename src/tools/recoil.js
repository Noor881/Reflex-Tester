import { store } from "../core/store.js";

const patterns = {
  "apex-recoil": [
    [50, 88],
    [46, 78],
    [54, 68],
    [43, 58],
    [58, 48],
    [50, 38],
    [61, 28],
    [55, 18],
    [63, 10],
  ],
  "cod-recoil": [
    [50, 88],
    [52, 78],
    [48, 68],
    [55, 58],
    [45, 48],
    [51, 38],
    [42, 28],
    [47, 18],
    [40, 10],
  ],
};

export function mountRecoil(root, tool) {
  const pattern = patterns[tool.mechanic];
  let active = false,
    samples = [],
    start = 0;
  const points = pattern.map(([x, y]) => `${x},${y}`).join(" ");
  root.innerHTML = `<div class="recoil-drill"><div class="recoil-copy"><span class="eyebrow">Live compensation drill</span><h2>Trace the inverse recoil path</h2><p>Start on the blue point and drag continuously toward the top. Stay close to the reference path; speed and precision both affect the score.</p><div class="recoil-metrics"><span><b data-score>—</b> score</span><span><b data-error>—</b> mean error</span></div></div><div class="recoil-pad" data-pad><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Recoil compensation path"><polyline class="recoil-guide" points="${points}"/><polyline class="recoil-trace" points=""/><circle cx="${pattern[0][0]}" cy="${pattern[0][1]}" r="3" class="recoil-start"/></svg><span data-status>Press the blue starting point</span></div></div>`;
  const pad = root.querySelector("[data-pad]"),
    trace = pad.querySelector(".recoil-trace"),
    status = pad.querySelector("[data-status]");
  const local = (e) => {
    const rect = pad.getBoundingClientRect();
    return [
      Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    ];
  };
  const nearestDistance = ([x, y]) =>
    Math.min(...pattern.map(([px, py]) => Math.hypot(x - px, y - py)));
  pad.onpointerdown = (e) => {
    const point = local(e);
    if (Math.hypot(point[0] - pattern[0][0], point[1] - pattern[0][1]) > 12) {
      status.textContent = "Begin closer to the blue point";
      return;
    }
    active = true;
    samples = [point];
    start = performance.now();
    pad.setPointerCapture(e.pointerId);
    status.textContent = "Keep tracing upward";
  };
  pad.onpointermove = (e) => {
    if (!active) return;
    samples.push(local(e));
    trace.setAttribute(
      "points",
      samples.map(([x, y]) => `${x},${y}`).join(" "),
    );
  };
  pad.onpointerup = () => {
    if (!active) return;
    active = false;
    const elapsed = performance.now() - start;
    const reachedTop = Math.min(...samples.map(([, y]) => y)) < 18;
    const error =
      samples.reduce((sum, p) => sum + nearestDistance(p), 0) /
      Math.max(1, samples.length);
    const score = Math.max(
      0,
      Math.round(
        1000 -
          error * 48 -
          Math.max(0, elapsed - 1800) * 0.08 -
          (reachedTop ? 0 : 250),
      ),
    );
    root.querySelector("[data-score]").textContent = score;
    root.querySelector("[data-error]").textContent = `${error.toFixed(1)}%`;
    status.textContent = reachedTop
      ? "Run complete — repeat for consistency"
      : "Trace all the way to the final point";
    store.record(tool.slug, {
      score,
      accuracy: Math.max(0, 100 - error * 5),
      unit: "points",
    });
  };
}
