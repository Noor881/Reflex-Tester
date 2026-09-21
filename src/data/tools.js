export const tools = [
  ['visual-reflex-test','Visual Reflex Test','test','Reaction','Measure response time to a visual signal.','visual'],
  ['audio-reflex-test','Audio Reflex Test','test','Reaction','Measure response time to an audio signal.','audio'],
  ['click-speed-test','Click Speed Test','test','Speed','Measure clicks per second over a fixed interval.','cps'],
  ['double-click-speed-test','Double-Click Speed Test','test','Speed','Measure the interval between two clicks.','double'],
  ['reaction-comparison-test','Reaction Comparison Test','test','Reaction','Compare visual and audio response times.','compare'],
  ['peripheral-vision-test','Peripheral Vision Test','test','Vision','Respond to targets outside the central focus area.','peripheral'],
  ['hand-eye-coordination-test','Hand–Eye Coordination Test','test','Coordination','Respond to moving targets with speed and accuracy.','coordination'],
  ['color-match-test','Color Match Test','test','Cognition','Match colors under time pressure.','color'],
  ['focus-attention-test','Focus & Attention Test','train','Cognition','Find the relevant target among distractions.','focus'],
  ['memory-sequence-test','Memory Sequence Test','train','Cognition','Recall progressively longer visual sequences.','memory'],
  ['number-speed-test','Number Speed Test','test','Cognition','Find numbers in order as quickly as possible.','numbers'],
  ['stroop-effect-test','Stroop Effect Test','test','Cognition','Name ink colors while ignoring conflicting words.','stroop'],
  ['typing-speed-test','Typing Speed Test','test','Cognition','Measure typing speed and accuracy.','typing'],
  ['gridshot-arena','Gridshot Arena','train','Aim','Hit successive targets quickly and accurately.','grid'],
  ['spidershot-challenge','Spidershot Challenge','train','Aim','Alternate between a center target and outer targets.','spider'],
  ['flick-shot-trainer','Flick Shot Trainer','train','Aim','Practice fast, controlled cursor flicks.','flick'],
  ['tracking-challenge','Tracking Challenge','train','Aim','Keep the pointer on a moving target.','tracking'],
  ['precision-aim-test','Precision Aim Test','test','Aim','Prioritize accuracy on progressively smaller targets.','precision'],
  ['valorant-aim-trainer','Valorant Aim Trainer','train','Aim','Practice tactical head-level flicks and tracking.','valorant'],
  ['csgo-aim-trainer','CS2 Aim Trainer','train','Aim','Practice counter-strike style target acquisition.','cs2'],
  ['apex-aim-trainer','Apex Aim Trainer','train','Aim','Practice tracking and target switching.','apex'],
  ['cod-aim-trainer','COD Aim Trainer','train','Aim','Practice rapid target acquisition.','cod'],
  ['fortnite-aim-trainer','Fortnite Aim Trainer','train','Aim','Practice close and mid-range cursor control.','fortnite'],
  ['sensitivity-calculator','Sensitivity Converter','utility','Universal','Convert mouse sensitivity between games.','sensitivity'],
  ['fortnite-sensitivity-finder','Fortnite Sensitivity Finder','utility','Fortnite','Calculate equivalent Fortnite sensitivity settings.','fortnite-sens'],
  ['csgo-crosshair-generator','CS2 Crosshair Generator','utility','CS2','Build and export a CS2 crosshair configuration.','cs2-crosshair'],
  ['valorant-crosshair-generator','Valorant Crosshair Generator','utility','Valorant','Build and export a Valorant crosshair profile.','valorant-crosshair'],
  ['apex-recoil-trainer','Apex Recoil Trainer','train','Apex','Practice compensating for repeatable recoil paths.','apex-recoil'],
  ['cod-recoil-trainer','COD Recoil Trainer','train','COD','Practice controlled recoil compensation.','cod-recoil'],
  ['csgo-grenade-trainer','CS2 Grenade Trainer','utility','CS2','Study grenade types and lineup fundamentals.','grenade'],
  ['valorant-lineup-trainer','Valorant Lineup Trainer','utility','Valorant','Study repeatable utility lineup procedure.','lineup'],
  ['fortnite-edit-trainer','Fortnite Edit Trainer','train','Fortnite','Practice rapid edit-pattern selection.','edit'],
  ['cod-loadout-builder','COD Loadout Builder','utility','COD','Build and save a weapon loadout locally.','loadout'],
  ['apex-tier-list','Apex Legends Tier List','utility','Apex','Create and save a personal legend tier list.','tier']
].map(([slug,name,section,category,description,mechanic]) => ({slug,name,section,category,description,mechanic,url:`/tools/${slug}.html`}));

export const toolBySlug = Object.fromEntries(tools.map(tool => [tool.slug, tool]));
export const sections = {
  test: { label: 'Test', description: 'Measure a specific response under consistent conditions.' },
  train: { label: 'Train', description: 'Practice speed, accuracy, tracking and cognition.' },
  utility: { label: 'Utilities', description: 'Configure game settings and repeatable setups.' }
};
