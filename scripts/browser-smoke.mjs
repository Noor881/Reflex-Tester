const cdpPort = process.env.CDP_PORT || "9225";
const baseUrl = process.env.SITE_URL || "http://127.0.0.1:4173";

async function openPage(path) {
  const target = await fetch(
    `http://127.0.0.1:${cdpPort}/json/new?${encodeURIComponent(baseUrl + path)}`,
    { method: "PUT" },
  ).then((res) => res.json());
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let id = 0;
  const pending = new Map();
  const events = [];
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error
        ? reject(new Error(message.error.message))
        : resolve(message.result);
    } else {
      events.push(message);
    }
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const commandId = ++id;
      pending.set(commandId, { resolve, reject });
      socket.send(JSON.stringify({ id: commandId, method, params }));
    });

  await Promise.all([
    send("Page.enable"),
    send("Runtime.enable"),
    send("Log.enable"),
  ]);
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const state = await send("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true,
    });
    if (state.result.value === "complete") break;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    events,
    evaluate: async (expression) => {
      const result = await send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (result.exceptionDetails)
        throw new Error(
          result.exceptionDetails.exception?.description ||
            "Browser evaluation failed",
        );
      return result.result.value;
    },
    close: async () => {
      socket.close();
      await fetch(`http://127.0.0.1:${cdpPort}/json/close/${target.id}`);
    },
  };
}

const scenarios = [
  {
    name: "homepage",
    path: "/index.html?smoke=1",
    test: `({
      title: document.title,
      light: getComputedStyle(document.documentElement).backgroundColor === 'rgb(244, 242, 237)',
      heroImage: Boolean(document.querySelector('.home-intro img')),
      nav: Boolean(document.querySelector('.site-header nav')),
      directTest: Boolean(document.querySelector('a[href="./tools/visual-reflex-test.html"]'))
    })`,
  },
  {
    name: "visual reflex",
    path: "/tools/visual-reflex-test.html?smoke=1",
    test: `(() => {
      const zone = document.querySelector('.reaction-field');
      zone?.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true}));
      return { zone: Boolean(zone), earlyState: zone?.classList.contains('early') === true, moduleRoute: Boolean(document.querySelector('.workspace')) };
    })()`,
  },
  {
    name: "click speed",
    path: "/tools/click-speed-test.html?smoke=1",
    test: `(() => {
      const zone = document.querySelector('[data-zone]');
      zone?.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true}));
      zone?.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true}));
      return { zone: Boolean(zone), started: zone?.textContent === 'Click', liveStatus: document.querySelector('[data-status]')?.textContent.includes('remaining') === true };
    })()`,
  },
  {
    name: "gridshot",
    path: "/tools/gridshot-arena.html?smoke=1",
    test: `(() => {
      const button = document.querySelector('.target-stage .instruction button');
      button?.click();
      return { button: Boolean(button), targets: document.querySelectorAll('.aim-target').length === 3, hud: Boolean(document.querySelector('.aim-hud')) };
    })()`,
  },
  {
    name: "tracking",
    path: "/tools/tracking-challenge.html?smoke=1",
    test: `(() => { const button=document.querySelector('.instruction button'); button?.click(); return { button:Boolean(button), movingTarget:Boolean(document.querySelector('.tracking-target')), contactHud:Boolean(document.querySelector('[data-contact]')) }; })()`,
  },
  {
    name: "fortnite edit",
    path: "/tools/fortnite-edit-trainer.html?smoke=1",
    test: `(() => { const button=document.querySelector('.instruction button'); button?.click(); return { button:Boolean(button), cells:document.querySelectorAll('.edit-grid button').length===9, reference:document.querySelectorAll('.edit-reference .active').length===3 }; })()`,
  },
  {
    name: "recoil",
    path: "/tools/apex-recoil-trainer.html?smoke=1",
    test: `({ pad:Boolean(document.querySelector('.recoil-pad')), guide:Boolean(document.querySelector('.recoil-guide')), start:Boolean(document.querySelector('.recoil-start')) })`,
  },
  {
    name: "sensitivity utility",
    path: "/tools/sensitivity-calculator.html?smoke=1",
    test: `(() => {
      const input = document.querySelector('input[name="sens"]');
      const output = document.querySelector('[data-result]');
      const before = output?.textContent;
      if (input) { input.value = '0.7'; input.dispatchEvent(new Event('input', {bubbles:true})); }
      return { input: Boolean(input), output: Boolean(output), recalculated: output?.textContent !== before };
    })()`,
  },
  {
    name: "article migration",
    path: "/blog/what-is-reaction-time.html?smoke=1",
    test: `({ article: Boolean(document.querySelector('.article')), heading: Boolean(document.querySelector('.article h1')), substantial: document.querySelectorAll('.article p').length > 5, toc: Boolean(document.querySelector('.article-aside')) })`,
  },
];

let failed = false;
for (const scenario of scenarios) {
  const page = await openPage(scenario.path);
  try {
    const result = await page.evaluate(scenario.test);
    const errors = page.events.filter(
      (event) =>
        event.method === "Runtime.exceptionThrown" ||
        (event.method === "Log.entryAdded" &&
          ["error", "warning"].includes(event.params.entry.level)),
    );
    const values = Object.values(result);
    const passed = values.every(Boolean) && errors.length === 0;
    failed ||= !passed;
    console.log(
      `${passed ? "PASS" : "FAIL"} ${scenario.name}: ${JSON.stringify(result)}${errors.length ? ` errors=${errors.length}` : ""}`,
    );
  } finally {
    await page.close();
  }
}

if (failed) process.exit(1);
