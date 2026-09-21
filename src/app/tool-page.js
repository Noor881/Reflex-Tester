import { toolBySlug } from '../data/tools.js';
import { store, summarize } from '../core/store.js';
import { mountShell } from './shell.js';
import { mountReaction } from '../tools/reaction.js';
import { mountClick } from '../tools/click.js';
import { mountAim } from '../tools/aim.js';
import { mountCognitive } from '../tools/cognitive.js';
import { mountUtility } from '../tools/utility.js';

const slug=document.body.dataset.tool;
const tool=toolBySlug[slug];
if(!tool) throw new Error(`Unknown tool: ${slug}`);
mountShell(tool.section);

const attempts=store.attempts(slug);
const stats=summarize(attempts,'score',['visual','audio','double','compare','numbers'].includes(tool.mechanic));
document.querySelector('#main').innerHTML=`<div class="tool-page"><div class="tool-context"><a href="../tools.html?section=${tool.section}">${tool.section==='utility'?'Utilities':tool.section==='train'?'Training':'Tests'}</a><span aria-hidden="true">/</span><span>${tool.category}</span></div><header class="tool-header"><div><span class="eyebrow">${tool.category}</span><h1>${tool.name}</h1><p>${tool.description}</p></div><div class="tool-meta"><div><strong>${stats?Number(stats.best).toFixed(Number(stats.best)%1?1:0):'—'}</strong><span>Personal best</span></div><div><strong>${attempts.length}</strong><span>Saved attempts</span></div></div></header><section class="workspace" aria-label="${tool.name} workspace"><div class="workspace-bar"><div class="status-line"><i class="status-dot"></i><span data-workspace-status>Ready</span></div><div class="attempt-strip" aria-label="Recent attempts">${attempts.slice(0,5).map(()=>'<i class="attempt-mark done"></i>').join('')}</div></div><div class="workspace-body" data-workspace></div></section><section class="tool-notes"><h2>What this measures</h2><p>${tool.description} Browser measurements include display, operating-system and input-device latency; they are useful for comparing your own sessions under consistent conditions, not as a medical assessment.</p><h2>For consistent results</h2><ul><li>Use the same device, browser and input method.</li><li>Close distracting applications and keep the test visible.</li><li>Run several attempts and compare averages, not a single score.</li></ul></section></div>`;
const root=document.querySelector('[data-workspace]');
const reaction=['visual','audio','double','compare'];
const cognitive=['color','focus','memory','numbers','stroop','typing','peripheral','coordination'];
const aim=['grid','spider','flick','tracking','precision','valorant','cs2','apex','cod','fortnite','edit'];
if(tool.mechanic==='cps')mountClick(root,tool);
else if(reaction.includes(tool.mechanic))mountReaction(root,tool);
else if(cognitive.includes(tool.mechanic))mountCognitive(root,tool);
else if(aim.includes(tool.mechanic))mountAim(root,tool);
else mountUtility(root,tool);
