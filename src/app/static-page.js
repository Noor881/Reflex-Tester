import { mountShell } from "./shell.js";
import "./affiliate-tracking.js";

mountShell(document.body.dataset.active || "");

const input = document.querySelector("[data-search]");
if (input) {
  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    document.querySelectorAll(".tool-row").forEach((row) => {
      row.hidden = !row.textContent.toLowerCase().includes(query);
    });
  });
}
