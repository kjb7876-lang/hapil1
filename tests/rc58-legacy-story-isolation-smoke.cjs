const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const window={addEventListener(){},innerWidth:1280,innerHeight:900};
const ctx={window,document:{},Br:{interludeText:true,mapEntryDialogue:true},N:{dist00:{},dreamRest:{}},he:['dist00'],
 MONGSE_prepareCombatEncounter31226(s,z,show){s.rosterPrepared=true;s.encounterDialogue31226={kind:'combat',lines:[{text:'OLD reciprocal combat sentence'}]};s.encounterLockUntil31226=s.time+3.3;s.encounterWallUnlockAtV31227=Date.now()+3300;s.invulnerableUntil=s.time+3.3;s.enemies[0].readyAt=s.time+3.3;s.enemies[0].patternReadyAt=s.time+3.3;return s.encounterDialogue31226;},
 MONGSE_prepareRestEncounter31226(s,z,show){s.restPortalUnlockAt31226=s.time+4;s.restPortalWallUnlockAtV31227=Date.now()+4000;s.restDialogueComplete31226=false;s.encounterDialogue31226={kind:'rest',lines:[{text:'OLD interlude sentence'}]};return s.encounterDialogue31226;},
 MONGSE_currentEncounterDialogue31226(){return {text:'OLD encounter line'};},MONGSE_phaseGateHealth(s,e,d){return d;}};
vm.createContext(ctx);
vm.runInContext(read('data/story-rc51.js'),ctx);vm.runInContext(read('assets/rc51/story.js'),ctx);
const story=window.__HAPIL_STORY_DATA_RC51__,secret='OLD LEGACY NARRATIVE SENTENCE';
const legacyNarrative={version:'old',fullMarkdown:secret,fullRawText:secret,sourceText:secret,raw:secret,
 introSlides:[secret],regionDialogue:{dist00:secret},interludes:{hub:{slides:[{body:secret}]}},
 archiveChapters:[{body:secret}],segments:[{text:secret}],bossNarrativeAttacks:{dist00:{pattern:'keep gameplay'}}};
ctx.MONGSE_NARRATIVE_V395=legacyNarrative;ctx.MONGSE_resolveInterlude=()=>({slides:[{body:secret}]});
window.__MONGSE_NARRATIVE_V395__=legacyNarrative;
window.__MONGSE_NARRATIVE_EXACT_V31217__={sourceText:secret,raw:secret,segments:[{text:secret}],rejoin:()=>secret};
window.__MONGSE_NARRATIVE_RUNTIME_V31217__={allPass:true,canonicalInterludeCount:62,probe:()=>({text:secret})};
window.__HAPIL_STORY_DATA_V31300__={allPass:true,dialogue:{sourceFile:'old',sourceSha256:'old',sourceBytes:1,records:[{zone:'dist00',lines:[{text:secret}]}]},
 interlude:{sourceFile:'old',sourceSha256:'old',sourceBytes:1,raw:secret,records:[{text:secret}],scenes:{hub:{slides:[{body:secret}]}},archiveChapters:[{body:secret}]}};
window.__HAPIL_PATIENT_DATA_V31368__={records:[{body:secret}]};
window.__MONGSE_GAMEPLAY_V31240__={encounter:{text:secret},narrativeDialogue:{resolveInterlude:()=>({text:secret})},combatRules:{enabled:true}};
window.__MONGSE_PROGRESSION_DIALOGUE_V31230__={dialogue:{text:secret},resolveDialogue:()=>({text:secret}),resolveSourceRange:()=>secret};
window.__MONGSE_STORY_CONTINUITY_V31231__={installed:true,encounter:{text:secret},narrative:{text:secret}};
window.__MONGSE_NARRATIVE_SPOILER_V31233__={encounter:{text:secret},narrative:{resolveCompletedInterlude:()=>({text:secret})},adjustedZones:['dist00']};
window.__HAPIL_NARRATIVE_V31368__={resolveInterlude:()=>({text:secret})};
for(const v of ['31229','31230','31231','31232','31233','31238','31239','31240','31300']){
 window[`__MONGSE_ENCOUNTER_DIALOGUE_V${v}__`]={resolve:()=>({lines:[{text:secret}]})};
 window[`__MONGSE_NARRATIVE_DIALOGUE_V${v}__`]={resolveInterlude:()=>({slides:[{body:secret}]})};
}
for(let v=31226;v<=31240;v++){
 window[`__MONGSE_ENCOUNTER_DIALOGUE_V${v}__`]={resolve:()=>({lines:[{text:secret}]})};
 window[`__MONGSE_NARRATIVE_DIALOGUE_V${v}__`]={resolveInterlude:()=>({slides:[{body:secret}]})};
}
const bundle=read('assets/index-v31526.js'),start=bundle.indexOf('function HAPIL_installCanonicalStoryRC51(){'),marker=bundle.indexOf('\n}\n\n/* RC54:',start);
assert(start>=0&&marker>start,'the canonical story isolation installer is missing');
vm.runInContext(bundle.slice(start,marker+2)+'\nHAPIL_installCanonicalStoryRC51();',ctx);

assert.equal(window.__HAPIL_LEGACY_STORY_RC58__.activeLines,0);
assert.equal(window.__HAPIL_LEGACY_STORY_RC58__.combatDialogue,false);
assert.equal(window.__HAPIL_LEGACY_STORY_RC58__.interludes,false);
assert.equal(window.__MONGSE_ENCOUNTER_DIALOGUE_V31229__.resolve('dist00','combat').lines.length,0);
assert.equal(window.__MONGSE_ENCOUNTER_DIALOGUE_V31229__.resolve('dreamRest','rest').lines.length,0);
assert.equal(window.__MONGSE_NARRATIVE_DIALOGUE_V31229__.resolveInterlude('hub','dist00'),null);
assert.equal(Object.keys(window.__MONGSE_NARRATIVE_V395__.interludes).length,0);
assert.equal(window.__MONGSE_NARRATIVE_V395__.raw,story.raw);
assert.equal(window.__MONGSE_NARRATIVE_V395__.rejoin(),story.raw);
assert.equal(window.__MONGSE_NARRATIVE_EXACT_V31217__.rejoin(),story.raw);
assert.equal(window.__MONGSE_NARRATIVE_RUNTIME_V31217__.activeDialogueLineCount,0);
assert.equal(window.__HAPIL_STORY_DATA_V31300__.dialogue.records.length,0);
assert.equal(window.__HAPIL_STORY_DATA_V31300__.interlude.scenes&&Object.keys(window.__HAPIL_STORY_DATA_V31300__.interlude.scenes).length,0);
assert.equal(window.__HAPIL_STORY_DATA_V31300__.dialogue.sourceFile,story.sourceFile);
assert.equal(window.__HAPIL_STORY_DATA_V31300__.interlude.raw,story.raw);
assert.equal(ctx.Br.interludeText,false);assert.equal(ctx.Br.mapEntryDialogue,false);
assert.equal(window.__HAPIL_PATIENT_DATA_V31368__,window.__HAPIL_PATIENT_DATA_RC51__);
assert.equal(window.__MONGSE_GAMEPLAY_V31240__.encounter,window.__MONGSE_ENCOUNTER_DIALOGUE_V31229__);
assert.equal(window.__MONGSE_GAMEPLAY_V31240__.combatRules.enabled,true,'the gameplay API retains non-story mechanics');
assert.equal(window.__MONGSE_GAMEPLAY_V31240__.narrativeDialogue.resolveInterlude('hub','dist00'),null);
assert.equal(window.__MONGSE_PROGRESSION_DIALOGUE_V31230__.resolveDialogue('dist00').lines.length,0);
assert.equal(window.__MONGSE_STORY_CONTINUITY_V31231__.encounter,window.__MONGSE_ENCOUNTER_DIALOGUE_V31229__);
assert.equal(window.__MONGSE_NARRATIVE_SPOILER_V31233__.narrative.resolveCompletedInterlude(),null);
assert.equal(window.__MONGSE_NARRATIVE_SPOILER_V31233__.adjustedZones.length,0);
assert.equal(window.__HAPIL_NARRATIVE_V31368__.resolveInterlude('hub','dist00'),null);
assert.equal(window.__HAPIL_STORY_RC26__.scene('opening'),null);
assert.equal(window.__MONGSE_CHRISTIAN_OPENING_V31236__,null);
assert.equal(window.__MONGSE_CHRISTIAN_OPENING_CORE_V31236__,null);
for(const old of [window.__MONGSE_NARRATIVE_V395__,window.__MONGSE_NARRATIVE_EXACT_V31217__,window.__HAPIL_STORY_DATA_V31300__,window.__MONGSE_ENCOUNTER_DIALOGUE_V31229__,window.__MONGSE_NARRATIVE_DIALOGUE_V31229__,window.__MONGSE_NARRATIVE_SPOILER_V31233__])
 assert(!JSON.stringify(old).includes(secret),'legacy dialogue leaked through an active global');
for(let v=31226;v<=31240;v++){
 assert.equal(window[`__MONGSE_ENCOUNTER_DIALOGUE_V${v}__`].resolve('dist00','combat').lines.length,0,`encounter alias V${v} must be empty`);
 assert.equal(window[`__MONGSE_NARRATIVE_DIALOGUE_V${v}__`].resolveInterlude('hub','dist00'),null,`narrative alias V${v} must not resolve an interlude`);
}

const combat={time:20,enemies:[{readyAt:24,patternReadyAt:24,invulnerableUntil:24}],invulnerableUntil:24};
assert.equal(ctx.MONGSE_prepareCombatEncounter31226(combat,'dist00'),null,'the setup API must not return legacy text');
assert.equal(combat.rosterPrepared,true,'native encounter setup remains active');
assert.equal(combat.encounterDialogue31226,null);assert.equal(combat.encounterLockUntil31226,0);
assert(combat.invulnerableUntil<=20.12);assert(combat.enemies[0].readyAt<=20.14);assert(combat.enemies[0].patternReadyAt<=20.28);
assert.equal(ctx.MONGSE_currentEncounterDialogue31226(combat),null);
const rest={time:40,zone:'dreamRest',enemies:[]};assert.equal(ctx.MONGSE_prepareRestEncounter31226(rest,'dreamRest'),null,'rest setup must not return legacy text');
assert.equal(rest.encounterDialogue31226,null);assert.equal(rest.restDialogueComplete31226,true);assert.equal(rest.restPortalUnlockAt31226,40);
assert.equal(ctx.MONGSE_resolveInterlude('hub','dist00'),null);
console.log('RC58 PASS: active legacy text APIs are empty, interludes are unreachable, combat setup survives, and old entry/portal locks are cleared.');
