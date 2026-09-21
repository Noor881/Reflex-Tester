import { store, summarize } from '../core/store.js';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => 1100 + Math.random() * 2300;

function resultsView(root, tool, values, unit = 'ms', lower = true) {
  const stats = summarize(values, 'score', lower);
  root.innerHTML = `<div class="result-panel"><span class="eyebrow">Completed</span><div class="instrument-readout">${Math.round(stats.latest)}<span class="instrument-unit">${unit}</span></div><div class="result-detail"><div><strong>${Math.round(stats.best)}</strong><span>Personal best</span></div><div><strong>${Math.round(stats.average)}</strong><span>Average</span></div><div><strong>${stats.count}</strong><span>Saved attempts</span></div></div><div class="instruction-actions"><button class="button accent" data-retry>Try again</button><a class="button secondary" href="../dashboard.html">View history</a></div></div>`;
  root.querySelector('[data-retry]').addEventListener('click', () => mountReaction(root, tool));
}

async function reactionRound(root, audio, attempt) {
  return new Promise(resolve => {
  let state = 'waiting';
  let startedAt = 0;
  const field = document.createElement('button');
  field.className = 'reaction-field waiting';
  field.innerHTML = `<span>${audio ? 'Listen for the tone' : 'Wait for the signal'}<small style="display:block;font-weight:500;color:var(--muted);margin-top:.5rem">Attempt ${attempt} of 5 · early input restarts this attempt</small></span>`;
  root.replaceChildren(field);
  field.focus();
  const activate = async () => {
    await wait(randomDelay());
    if (state !== 'waiting') return;
    state = 'go'; startedAt = performance.now(); field.className = 'reaction-field go';
    field.textContent = audio ? 'Press now' : 'Click now';
    if (audio) {
      const context = new AudioContext(); const oscillator = context.createOscillator();
      oscillator.frequency.value = 720; oscillator.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .12);
    }
  };
  const respond = () => {
    if (state === 'waiting') {
      state = 'early'; field.className = 'reaction-field early'; field.textContent = 'Too early — this attempt will restart';
      setTimeout(() => resolve(null), 900); return;
    }
    if (state !== 'go') return;
    const score = performance.now() - startedAt;
    state = 'done'; field.textContent = `${Math.round(score)} ms`; setTimeout(() => resolve(score), 450);
  };
  field.addEventListener('pointerdown', respond);
  field.addEventListener('keydown', event => { if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); respond(); } });
  activate();
  });
}

async function reactionSession(root, tool, audio = false) {
  const samples=[];
  while(samples.length<5){const score=await reactionRound(root,audio,samples.length+1);if(score!==null)samples.push(score);}
  const score=samples.reduce((sum,value)=>sum+value,0)/samples.length;
  resultsView(root,tool,store.record(tool.slug,{score,samples,unit:'ms'}));
}

function doubleClick(root, tool) {
  let first = 0;
  root.innerHTML = `<button class="reaction-field"><span>Double-click anywhere in this area<small style="display:block;font-weight:500;color:var(--muted);margin-top:.5rem">Two deliberate clicks. The interval is measured.</small></span></button>`;
  const field = root.firstElementChild;
  field.addEventListener('pointerdown', () => {
    const now = performance.now();
    if (!first) { first = now; field.textContent = 'Click again'; return; }
    const score = now - first;
    if (score > 900) { first = now; field.textContent = 'Too slow. First click recorded again.'; return; }
    resultsView(root, tool, store.record(tool.slug, { score, unit: 'ms' }));
  });
}

export function mountReaction(root, tool) {
  root.classList.add('is-active');
  if (tool.mechanic === 'double') return doubleClick(root, tool);
  if (tool.mechanic === 'compare') {
    root.innerHTML = `<div class="instruction"><span class="eyebrow">Two-part test</span><h2>Visual first, audio second</h2><p>Complete one clean attempt of each stimulus. Your result shows the difference.</p><button class="button accent">Start comparison</button></div>`;
    root.querySelector('button').addEventListener('click', async () => {
      let visual=null,audio=null;
      while(visual===null)visual=await reactionRound(root,false,1);
      while(audio===null)audio=await reactionRound(root,true,1);
      store.record(tool.slug, { score:(visual+audio)/2, visual, audio, unit:'ms' });
      root.innerHTML = `<div class="result-panel"><span class="eyebrow">Comparison</span><div class="result-detail"><div><strong>${Math.round(visual)} ms</strong><span>Visual</span></div><div><strong>${Math.round(audio)} ms</strong><span>Audio</span></div><div><strong>${Math.round(visual-audio)} ms</strong><span>Difference</span></div></div><button class="button accent" data-retry>Try again</button></div>`;
      root.querySelector('[data-retry]').onclick=()=>mountReaction(root,tool);
    }); return;
  }
  reactionSession(root, tool, tool.mechanic === 'audio');
}
