import { store, summarize } from '../core/store.js';

export function mountClick(root, tool) {
  let duration = 5, running = false, clicks = 0, start = 0, raf = 0;
  root.innerHTML = `<div class="instruction" style="width:min(42rem,100%)"><span class="eyebrow">Click-speed instrument</span><div class="instrument-readout" data-value>0<span class="instrument-unit">CPS</span></div><p data-status>Choose a duration, then use the test surface.</p><div class="instruction-actions" data-durations><button class="segment" aria-pressed="true" data-seconds="5">5 seconds</button><button class="segment" aria-pressed="false" data-seconds="10">10 seconds</button><button class="segment" aria-pressed="false" data-seconds="30">30 seconds</button></div><button class="button accent" style="width:100%;height:10rem;margin-top:1.5rem" data-zone>Start</button></div>`;
  const value=root.querySelector('[data-value]'), status=root.querySelector('[data-status]'), zone=root.querySelector('[data-zone]');
  root.querySelectorAll('[data-seconds]').forEach(button=>button.onclick=()=>{if(running)return;duration=Number(button.dataset.seconds);root.querySelectorAll('[data-seconds]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));});
  function finish(){running=false;cancelAnimationFrame(raf);const score=clicks/duration;const attempts=store.record(tool.slug,{score,clicks,duration,unit:'CPS'});const stats=summarize(attempts,'score');value.innerHTML=`${score.toFixed(1)}<span class="instrument-unit">CPS</span>`;status.textContent=`${clicks} clicks · personal best ${stats.best.toFixed(1)} CPS`;zone.textContent='Try again';}
  function tick(){const elapsed=(performance.now()-start)/1000;if(elapsed>=duration)return finish();value.innerHTML=`${(clicks/Math.max(elapsed,.01)).toFixed(1)}<span class="instrument-unit">CPS</span>`;status.textContent=`${(duration-elapsed).toFixed(1)} seconds remaining`;raf=requestAnimationFrame(tick);}
  zone.addEventListener('pointerdown',event=>{event.preventDefault();if(!running){running=true;clicks=0;start=performance.now();zone.textContent='Click';tick();return;}clicks+=1;});
}
