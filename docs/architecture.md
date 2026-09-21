# ReflexTester rebuild architecture

The repository treats the previous site as a route and content inventory only. The shipped application is generated from the new `src/` system.

## Information architecture

- **Test** — repeatable reaction, speed, vision and cognition measurements.
- **Train** — aim, tracking, coordination and game-specific practice.
- **Utilities** — sensitivity, crosshair, recoil, loadout, lineup and tier-list tools.
- **Results** — activity-derived local history, bests and averages.
- **Guides** — preserved long-form articles in a new reading layout.

## Source boundaries

- `src/data/tools.js` is the canonical tool inventory and route metadata.
- `src/core/store.js` owns defensive local persistence and statistics.
- `src/tools/` contains isolated mechanics by interaction family.
- `src/app/` contains page composition and navigation behavior.
- `src/styles/` contains the light-only visual system and page-specific layouts.
- `scripts/generate-site.mjs` creates SEO-preserving static route entries and migrates article bodies.
- `scripts/validate-site.mjs` checks routes, assets, duplicate IDs and inline syntax.

Tool routes remain static HTML URLs for direct loading and search indexing. They load small ES modules without a framework or global application bundle. No personal performance figure is displayed unless it comes from activity stored on the current device.

## Mechanics

- Reaction timing uses `performance.now()` with early-input recovery and five-attempt sessions.
- Aim and coordination tasks use Pointer Events and `requestAnimationFrame()`.
- Audio reaction uses the Web Audio API and runs only after user interaction.
- Calculators use deterministic conversion factors and persist settings locally.
- Each engine records a compact result object through the shared store.

## Build

Run `npm run generate` after route/content metadata changes, then `npm run build`. The project has no runtime package dependencies.
