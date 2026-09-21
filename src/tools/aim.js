import { store } from '../core/store.js';

const modes = {
  grid: { seconds: 30, targets: 3, size: 56, label: 'Three targets remain active. Clear them as efficiently as possible.' },
  spider: { seconds: 30, targets: 1, size: 52, label: 'Return to the centre anchor between every outside target.' },
  flick: { seconds: 25, targets: 1, size: 46, label: 'Acquire each target from a fresh centre starting position.' },
  precision: { seconds: 30, targets: 1, size: 38, label: 'Targets shrink as your hit streak increases.' },
  valorant: { seconds: 30, targets: 1, size: 34, label: 'Targets appear around a narrow head-height band.' },
  cs2: { seconds: 30, targets: 2, size: 36, label: 'Clear paired targets with controlled, accurate taps.' },
  cod: { seconds: 25, targets: 2, size: 50, lifetime: 900, label: 'Targets disappear quickly. Prioritise fast acquisition.' },
  fortnite: { seconds: 30, targets: 1, size: 72, lifetime: 1500, label: 'Track large close-range targets across changing elevations.' }
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function finish(root, tool, stats) {
  const accuracy = stats.shots ? stats.hits / stats.shots * 100 : 0;
  const score = tool.mechanic === 'tracking' || tool.mechanic === 'apex' ? Math.round(stats.tracked) : stats.hits;
  store.record(tool.slug, { score, accuracy, shots: stats.shots, unit: tool.mechanic.includes('tracking') || tool.mechanic === 'apex' ? 'points' : 'hits' });
  root.innerHTML = `<div class="result-panel"><span class="eyebrow">Session complete</span><div class="instrument-readout">${score}<span class="instrument-unit">${tool.mechanic === 'tracking' || tool.mechanic === 'apex' ? 'points' : 'hits'}</span></div><div class="result-detail"><div><strong>${accuracy.toFixed(0)}%</strong><span>Accuracy</span></div><div><strong>${stats.bestStreak}</strong><span>Best streak</span></div><div><strong>${stats.misses}</strong><span>Misses</span></div></div><button class="button accent" data-retry>Run again</button></div>`;
  root.querySelector('[data-retry]').onclick = () => mountAim(root, tool);
}

function mountTracking(root, tool) {
  const seconds = tool.mechanic === 'apex' ? 35 : 30;
  const stats = { hits: 0, shots: 0, tracked: 0, misses: 0, streak: 0, bestStreak: 0 };
  root.innerHTML = `<div class="target-stage arena-${tool.mechanic}"><div class="instruction"><span class="eyebrow">Continuous tracking</span><h2>${tool.name}</h2><p>Keep the pointer inside the moving target. Contact time, not clicks, earns points.</p><button class="button accent">Start tracking</button></div></div>`;
  const stage = root.firstElementChild;
  stage.querySelector('button').onclick = () => {
    const endAt = performance.now() + seconds * 1000;
    let inside = false, last = performance.now(), angle = Math.random() * Math.PI * 2;
    stage.innerHTML = `<div class="aim-hud"><span><strong data-time>${seconds.toFixed(1)}</strong>s</span><span><strong data-score>0</strong> points</span><span><strong data-contact>0</strong>% contact</span></div><button class="tracking-target" aria-label="Moving tracking target"></button>`;
    const target = stage.querySelector('.tracking-target');
    target.onpointerenter = () => { inside = true; stats.hits++; };
    target.onpointerleave = () => { inside = false; stats.misses++; };
    const frame = now => {
      const elapsed = now - last; last = now;
      const remaining = (endAt - now) / 1000;
      if (remaining <= 0) {
        const total = seconds * 1000;
        const contact = Math.max(0, Math.min(100, (stats.tracked * 10) / total * 100));
        stats.shots = 100;
        stats.hits = contact;
        stats.bestStreak = Math.round(contact);
        return finish(root, tool, stats);
      }
      const rect = stage.getBoundingClientRect();
      const speed = tool.mechanic === 'apex' ? 1.35 : 1;
      angle += elapsed * .0011 * speed;
      const x = rect.width * .5 + Math.sin(angle * 1.17) * rect.width * .34;
      const y = rect.height * .52 + Math.sin(angle * 1.83) * rect.height * .29;
      target.style.left = `${clamp(x, 42, rect.width - 42)}px`;
      target.style.top = `${clamp(y, 62, rect.height - 42)}px`;
      if (inside) stats.tracked += elapsed / 10;
      const total = seconds * 1000 - (endAt - now);
      stage.querySelector('[data-time]').textContent = remaining.toFixed(1);
      stage.querySelector('[data-score]').textContent = Math.round(stats.tracked);
      stage.querySelector('[data-contact]').textContent = Math.round((stats.tracked * 10) / Math.max(1, total) * 100);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
}

function mountEdit(root, tool) {
  const patterns = [[0,1,4],[0,3,4],[1,2,5],[3,4,7],[4,5,8],[0,4,8],[2,4,6]];
  const stats = { hits: 0, shots: 0, misses: 0, streak: 0, bestStreak: 0 };
  root.innerHTML = `<div class="edit-game"><div class="instruction"><span class="eyebrow">Build edit drill</span><h2>${tool.name}</h2><p>Copy the highlighted three-tile edit, then confirm it. Complete as many correct edits as possible in 45 seconds.</p><button class="button accent">Start editing</button></div></div>`;
  const game = root.firstElementChild;
  game.querySelector('button').onclick = () => {
    const endAt = performance.now() + 45000;
    let goal = patterns[0], selected = new Set();
    game.innerHTML = `<div class="edit-hud"><strong><span data-time>45.0</span>s</strong><span><b data-score>0</b> edits</span><span><b data-streak>0</b> streak</span></div><div class="edit-reference" aria-label="Target edit pattern"></div><div class="edit-grid" aria-label="Editable wall"></div><button class="button accent" data-confirm>Confirm edit</button>`;
    const grid = game.querySelector('.edit-grid'), reference = game.querySelector('.edit-reference');
    for (let i=0;i<9;i++) { grid.insertAdjacentHTML('beforeend', `<button data-cell="${i}" aria-label="Edit tile ${i+1}"></button>`); reference.insertAdjacentHTML('beforeend', `<i data-ref="${i}"></i>`); }
    const next = () => { selected.clear(); goal = patterns[Math.floor(Math.random()*patterns.length)]; grid.querySelectorAll('button').forEach(x=>x.classList.remove('selected')); reference.querySelectorAll('i').forEach((x,i)=>x.classList.toggle('active',goal.includes(i))); };
    grid.onclick = event => { const tile=event.target.closest('button'); if(!tile)return; const value=Number(tile.dataset.cell); selected.has(value)?selected.delete(value):selected.add(value); tile.classList.toggle('selected'); };
    game.querySelector('[data-confirm]').onclick = () => { stats.shots++; const correct=goal.length===selected.size&&goal.every(x=>selected.has(x)); if(correct){stats.hits++;stats.streak++;stats.bestStreak=Math.max(stats.bestStreak,stats.streak)}else{stats.misses++;stats.streak=0} game.querySelector('[data-score]').textContent=stats.hits;game.querySelector('[data-streak]').textContent=stats.streak;next(); };
    next();
    const frame=now=>{const remaining=(endAt-now)/1000;if(remaining<=0)return finish(root,tool,stats);game.querySelector('[data-time]').textContent=remaining.toFixed(1);requestAnimationFrame(frame)};requestAnimationFrame(frame);
  };
}

function mountTargets(root, tool) {
  const mode = modes[tool.mechanic] || modes.grid;
  const stats = { hits: 0, shots: 0, misses: 0, streak: 0, bestStreak: 0, tracked: 0 };
  let running=false, endAt=0, targetId=0, centreRequired=tool.mechanic==='spider'||tool.mechanic==='flick';
  root.innerHTML=`<div class="target-stage arena-${tool.mechanic}"><div class="instruction"><span class="eyebrow">${tool.category} drill</span><h2>${tool.name}</h2><p>${mode.label}</p><button class="button accent">Start session</button></div></div>`;
  const stage=root.firstElementChild;
  const update=()=>{stage.querySelector('[data-score]').textContent=stats.hits;stage.querySelector('[data-accuracy]').textContent=Math.round(stats.hits/Math.max(1,stats.shots)*100);stage.querySelector('[data-streak]').textContent=stats.streak;};
  const place=target=>{const rect=stage.getBoundingClientRect(),pad=55;let x=pad+Math.random()*Math.max(1,rect.width-pad*2),y=pad+Math.random()*Math.max(1,rect.height-pad*2);if(['valorant','cs2'].includes(tool.mechanic))y=rect.height*.36+(Math.random()-.5)*54;if(tool.mechanic==='fortnite')y=rect.height*(.25+Math.random()*.58);target.style.left=`${x}px`;target.style.top=`${y}px`;};
  const createTarget=(isCentre=false)=>{const target=document.createElement('button');target.className=`aim-target ${['precision','valorant','cs2'].includes(tool.mechanic)?'small':''} ${isCentre?'anchor':''}`;target.style.width=target.style.height=`${tool.mechanic==='precision'?Math.max(20,mode.size-stats.streak*2):mode.size}px`;target.setAttribute('aria-label',isCentre?'Centre anchor':'Target');if(isCentre){target.style.left='50%';target.style.top='50%'}else place(target);const id=++targetId;target.onclick=event=>{event.stopPropagation();if(!running)return;stats.shots++;stats.hits++;stats.streak++;stats.bestStreak=Math.max(stats.bestStreak,stats.streak);target.remove();update();if(centreRequired&&!isCentre)createTarget(true);else if(centreRequired&&isCentre)createTarget(false);else replenish();};stage.append(target);if(mode.lifetime&&!isCentre)setTimeout(()=>{if(running&&target.isConnected&&id<=targetId){target.remove();stats.misses++;stats.streak=0;update();replenish()}},mode.lifetime);};
  const replenish=()=>{while(running&&stage.querySelectorAll('.aim-target').length<mode.targets)createTarget(false);};
  stage.onclick=()=>{if(!running)return;stats.shots++;stats.misses++;stats.streak=0;update();};
  stage.querySelector('button').onclick=event=>{event.stopPropagation();running=true;endAt=performance.now()+mode.seconds*1000;stage.innerHTML=`<div class="aim-hud"><span><strong data-time>${mode.seconds.toFixed(1)}</strong>s</span><span><strong data-score>0</strong> hits</span><span><strong data-accuracy>100</strong>% accuracy</span><span><strong data-streak>0</strong> streak</span></div>`;centreRequired?createTarget(true):replenish();const frame=now=>{if(!running)return;const remaining=(endAt-now)/1000;if(remaining<=0){running=false;return finish(root,tool,stats)}stage.querySelector('[data-time]').textContent=remaining.toFixed(1);requestAnimationFrame(frame)};requestAnimationFrame(frame);};
}

export function mountAim(root, tool) {
  if (tool.mechanic === 'tracking' || tool.mechanic === 'apex') return mountTracking(root, tool);
  if (tool.mechanic === 'edit') return mountEdit(root, tool);
  return mountTargets(root, tool);
}
