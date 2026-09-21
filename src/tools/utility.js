import { store } from "../core/store.js";

const gameFactors = {
  Valorant: 0.07,
  CS2: 0.022,
  Apex: 0.022,
  COD: 0.0066,
  Fortnite: 0.01,
};
function sensitivity(root, tool) {
  root.innerHTML = `<div class="utility-layout"><form class="control-stack"><label class="field"><span>Source game</span><select name="from">${Object.keys(
    gameFactors,
  )
    .map((x) => `<option>${x}</option>`)
    .join(
      "",
    )}</select></label><label class="field"><span>Source sensitivity</span><input name="sens" type="number" min="0.001" step="0.001" value="0.35"></label><label class="field"><span>Target game</span><select name="to">${Object.keys(
    gameFactors,
  )
    .map((x) => `<option ${x === "CS2" ? "selected" : ""}>${x}</option>`)
    .join(
      "",
    )}</select></label><button class="button accent">Convert</button></form><div class="preview-pane"><div class="result-panel"><span class="eyebrow">Equivalent sensitivity</span><div class="instrument-readout" data-result>1.114</div><p>Preserves the same angular distance using normalized yaw factors.</p></div></div></div>`;
  const form = root.querySelector("form"),
    result = root.querySelector("[data-result]");
  const calculate = () => {
    const data = new FormData(form),
      value =
        (Number(data.get("sens")) * gameFactors[data.get("from")]) /
        gameFactors[data.get("to")];
    result.textContent = value.toFixed(3);
    store.set("sensitivity-settings", Object.fromEntries(data));
  };
  form.oninput = calculate;
  form.onsubmit = (e) => {
    e.preventDefault();
    calculate();
  };
  calculate();
}
function crosshair(root, tool) {
  root.innerHTML = `<div class="utility-layout"><form class="control-stack"><label class="field"><span>Size</span><input name="size" type="range" min="8" max="80" value="34"></label><label class="field"><span>Thickness</span><input name="thick" type="range" min="1" max="10" value="3"></label><label class="field"><span>Color</span><input name="color" type="color" value="#00a86b"></label><label class="field"><span>Center gap</span><input name="gap" type="number" min="0" max="20" value="4"></label><button class="button secondary" type="button" data-copy>Copy configuration</button></form><div class="preview-pane"><div><div class="crosshair-preview"><i></i><i></i></div><pre data-code style="white-space:pre-wrap;font-size:.75rem"></pre></div></div></div>`;
  const form = root.querySelector("form"),
    preview = root.querySelector(".crosshair-preview"),
    code = root.querySelector("[data-code]");
  const update = () => {
    const d = Object.fromEntries(new FormData(form));
    preview.style.setProperty("--cross-size", `${d.size}px`);
    preview.style.setProperty("--cross-thick", `${d.thick}px`);
    preview
      .querySelectorAll("i")
      .forEach((i) => (i.style.background = d.color));
    const config = `size=${d.size}; thickness=${d.thick}; gap=${d.gap}; color=${d.color}`;
    code.textContent = config;
    store.set(`${tool.slug}:config`, d);
    return config;
  };
  form.oninput = update;
  root.querySelector("[data-copy]").onclick = () =>
    navigator.clipboard?.writeText(update());
  update();
}
function loadout(root, tool) {
  root.innerHTML = `<div class="utility-layout"><form class="control-stack"><label class="field"><span>Weapon</span><select name="weapon"><option>Assault rifle</option><option>SMG</option><option>Marksman rifle</option><option>Sniper rifle</option></select></label><label class="field"><span>Optic</span><select name="optic"><option>Iron sights</option><option>Red dot</option><option>2× optic</option><option>4× optic</option></select></label><label class="field"><span>Barrel</span><select name="barrel"><option>Compensator</option><option>Suppressor</option><option>Long barrel</option></select></label><label class="field"><span>Build name</span><input name="name" value="Balanced setup"></label><button class="button accent">Save locally</button></form><div class="preview-pane"><div><span class="eyebrow">Saved build</span><h2 data-name>Balanced setup</h2><dl data-summary></dl></div></div></div>`;
  const form = root.querySelector("form");
  const render = () => {
    const d = Object.fromEntries(new FormData(form));
    root.querySelector("[data-name]").textContent = d.name;
    root.querySelector("[data-summary]").innerHTML =
      `<dt>Weapon</dt><dd>${d.weapon}</dd><dt>Optic</dt><dd>${d.optic}</dd><dt>Barrel</dt><dd>${d.barrel}</dd>`;
    return d;
  };
  form.oninput = render;
  form.onsubmit = (e) => {
    e.preventDefault();
    store.set(`${tool.slug}:build`, render());
  };
  render();
}
function reference(root, tool) {
  const steps =
    tool.mechanic === "grenade"
      ? [
          "Choose the grenade for the intended area denial or entry purpose.",
          "Set a repeatable standing position.",
          "Use a stable screen landmark for the crosshair.",
          "Keep movement and release timing consistent.",
        ]
      : tool.mechanic === "lineup"
        ? [
            "Choose the ability and target location.",
            "Stand against a repeatable map landmark.",
            "Align the crosshair with a clear geometry point.",
            "Practice the same release until repeatable.",
          ]
        : [
            "Choose an item.",
            "Place it in the tier that reflects your own use case.",
            "Save the ordering on this device.",
            "Revisit it when balance changes.",
          ];
  root.innerHTML = `<div style="width:min(48rem,100%)"><span class="eyebrow">Practice procedure</span><h2>${tool.name}</h2><ol style="font-size:1.1rem;line-height:1.8">${steps.map((s) => `<li>${s}</li>`).join("")}</ol><label class="field"><span>Your practice note</span><textarea rows="5" placeholder="Record a position, landmark, timing or decision..."></textarea></label><button class="button accent" style="margin-top:1rem">Save note locally</button></div>`;
  const note = root.querySelector("textarea");
  note.value = store.get(`${tool.slug}:note`, "");
  root.querySelector("button").onclick = () =>
    store.set(`${tool.slug}:note`, note.value);
}
function recoil(root, tool) {
  let active = false,
    startY = 0,
    distance = 0;
  root.innerHTML = `<div style="width:min(34rem,100%);text-align:center"><span class="eyebrow">Pointer-control drill</span><h2>Pull against the recoil path</h2><p>Press and drag downward in one controlled motion.</p><div data-pad style="height:20rem;border:1px solid var(--line-strong);background:repeating-linear-gradient(0deg,#fff,#fff 39px,#e3e1da 40px);touch-action:none;display:grid;place-items:center">Drag downward</div><p data-result>Distance: 0 px</p></div>`;
  const pad = root.querySelector("[data-pad]");
  pad.onpointerdown = (e) => {
    active = true;
    startY = e.clientY;
    distance = 0;
    pad.setPointerCapture(e.pointerId);
  };
  pad.onpointermove = (e) => {
    if (!active) return;
    distance = Math.max(0, e.clientY - startY);
    root.querySelector("[data-result]").textContent =
      `Distance: ${Math.round(distance)} px`;
  };
  pad.onpointerup = () => {
    active = false;
    store.record(tool.slug, { score: distance, unit: "px" });
  };
}
function tier(root, tool) {
  const names = ["Assault", "Skirmisher", "Recon", "Support", "Controller"],
    saved = store.get(`${tool.slug}:tiers`, {});
  root.innerHTML = `<div style="width:min(54rem,100%)"><p>Assign each role to your own S–D ranking. This is a personal board, not an editorial claim.</p>${["S", "A", "B", "C", "D"].map((rank) => `<div class="surface" style="display:grid;grid-template-columns:3rem 1fr;min-height:4rem;border-bottom:0"><strong style="display:grid;place-items:center;background:var(--surface-2)">${rank}</strong><div data-rank="${rank}" style="display:flex;gap:.45rem;align-items:center;padding:.5rem;flex-wrap:wrap"></div></div>`).join("")}<div data-pool style="display:flex;gap:.45rem;flex-wrap:wrap;padding-top:1rem"></div></div>`;
  for (const name of names) {
    const button = document.createElement("button");
    button.className = "segment";
    button.textContent = name;
    button.onclick = () => {
      const ranks = ["S", "A", "B", "C", "D"];
      const current = button.parentElement?.dataset.rank;
      const next =
        ranks[(Math.max(-1, ranks.indexOf(current)) + 1) % ranks.length];
      root.querySelector(`[data-rank="${next}"]`).append(button);
      const data = {};
      root
        .querySelectorAll("[data-rank]")
        .forEach((row) =>
          row
            .querySelectorAll("button")
            .forEach((item) => (data[item.textContent] = row.dataset.rank)),
        );
      store.set(`${tool.slug}:tiers`, data);
    };
    const rank = saved[name];
    (rank
      ? root.querySelector(`[data-rank="${rank}"]`)
      : root.querySelector("[data-pool]")
    ).append(button);
  }
}
export function mountUtility(root, tool) {
  if (tool.mechanic.includes("crosshair")) return crosshair(root, tool);
  if (tool.mechanic === "sensitivity" || tool.mechanic === "fortnite-sens")
    return sensitivity(root, tool);
  if (tool.mechanic === "loadout") return loadout(root, tool);
  if (tool.mechanic === "tier") return tier(root, tool);
  if (tool.mechanic.includes("recoil")) return recoil(root, tool);
  return reference(root, tool);
}
