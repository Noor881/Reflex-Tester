const cdpPort = process.env.CDP_PORT || '9225';
const baseUrl = process.env.SITE_URL || 'http://127.0.0.1:4173';

async function openPage(path) {
  const target = await fetch(`http://127.0.0.1:${cdpPort}/json/new?${encodeURIComponent(baseUrl + path)}`, { method: 'PUT' }).then((res) => res.json());
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  let id = 0;
  const pending = new Map();
  const events = [];
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(new Error(message.error.message)) : resolve(message.result);
    } else {
      events.push(message);
    }
  });

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const commandId = ++id;
    pending.set(commandId, { resolve, reject });
    socket.send(JSON.stringify({ id: commandId, method, params }));
  });

  await Promise.all([send('Page.enable'), send('Runtime.enable'), send('Log.enable')]);
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const state = await send('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
    if (state.result.value === 'complete') break;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    events,
    evaluate: async (expression) => {
      const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || 'Browser evaluation failed');
      return result.result.value;
    },
    close: async () => {
      socket.close();
      await fetch(`http://127.0.0.1:${cdpPort}/json/close/${target.id}`);
    }
  };
}

const scenarios = [
  {
    name: 'homepage', path: '/index.html?smoke=1',
    test: `({
      title: document.title,
      store: typeof window.ReflexStore === 'object',
      designSystem: [...document.styleSheets].some(sheet => sheet.href?.includes('design-system.css')),
      heroImage: document.querySelector('.site-hero-media img')?.complete === true,
      nav: Boolean(document.querySelector('.nav'))
    })`
  },
  {
    name: 'visual reflex', path: '/tools/visual-reflex-test.html?smoke=1',
    test: `(() => {
      const zone = document.querySelector('#circleWrap');
      zone?.click();
      return { zone: Boolean(zone), started: Boolean(zone && !zone.classList.contains('state-idle')), store: typeof window.ReflexStore === 'object' };
    })()`
  },
  {
    name: 'click speed', path: '/tools/click-speed-test.html?smoke=1',
    test: `(() => {
      const zone = document.querySelector('#cpsZone');
      zone?.click(); zone?.click();
      return { zone: Boolean(zone), started: zone?.classList.contains('running') === true, store: typeof window.ReflexStore === 'object' };
    })()`
  },
  {
    name: 'gridshot', path: '/tools/gridshot-arena.html?smoke=1',
    test: `(() => {
      const button = document.querySelector('#playBtn');
      button?.click();
      const overlay = document.querySelector('#startOverlay');
      return { button: Boolean(button), started: Boolean(overlay && (overlay.classList.contains('hidden') || getComputedStyle(overlay).display === 'none')), canvas: Boolean(document.querySelector('#gameCanvas')) };
    })()`
  },
  {
    name: 'valorant trainer', path: '/tools/valorant-aim-trainer.html?smoke=1',
    test: `(() => {
      const button = document.querySelector('#startBtn');
      const before = button?.textContent;
      button?.click();
      return { button: Boolean(button), started: button?.textContent !== before, canvas: Boolean(document.querySelector('canvas')), store: typeof window.ReflexStore === 'object' };
    })()`
  }
];

let failed = false;
for (const scenario of scenarios) {
  const page = await openPage(scenario.path);
  try {
    const result = await page.evaluate(scenario.test);
    const errors = page.events.filter((event) =>
      event.method === 'Runtime.exceptionThrown' ||
      (event.method === 'Log.entryAdded' && ['error', 'warning'].includes(event.params.entry.level))
    );
    const values = Object.values(result);
    const passed = values.every(Boolean) && errors.length === 0;
    failed ||= !passed;
    console.log(`${passed ? 'PASS' : 'FAIL'} ${scenario.name}: ${JSON.stringify(result)}${errors.length ? ` errors=${errors.length}` : ''}`);
  } finally {
    await page.close();
  }
}

if (failed) process.exit(1);
