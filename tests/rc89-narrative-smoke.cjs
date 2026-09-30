const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),c={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'data/story-rc51.js'),'utf8'),c);
const data=c.window.__HAPIL_STORY_DATA_RC51__,record=id=>data.records.find(r=>r.zone===id);
assert(!record('ep1b09').pre.includes('나는 검을 내려놓았다'));
assert(record('ep1b09').post.startsWith('나는 검을 내려놓았다'));
assert.equal(record('murder03').postNarrator,'〈한이경의 기억〉');
assert(record('cult04').awakenPre.includes('코스믹 보스들의 망령'));
assert(record('cult04').awakenPre.includes('꼭두각시'));
const fixture=fs.readFileSync(path.join(root,'tests/rc88-danmaku-rpg-smoke.cjs'),'utf8');
const world={require,console,__dirname:path.join(root,'tests')};
vm.runInNewContext(fixture+`
 const arvelia=state('kair02','kair-great-03');api.tick(arvelia);
 const original=arvelia.enemies[0];assert(original.protectedNarrativeTargetV31307);
 assert.equal(api.damageFactor(arvelia,original),0);
 assert.equal(bridge.phaseGateHealth(arvelia,original,999999),1000);
 const kernels=arvelia.enemies.filter(a=>a.rc88Part);assert.equal(kernels.length,3);
 const ongoingSave=api.snapshot(arvelia),ongoingLoad=state('kair02','kair-great-03');api.restore(ongoingLoad,ongoingSave);const ongoingBody=ongoingLoad.enemies.find(a=>a.id===original.id);assert(ongoingBody.rc89CommandBody&&ongoingBody.protectedNarrativeTargetV31307);assert.equal(bridge.phaseGateHealth(ongoingLoad,ongoingBody,999999),ongoingBody.hp);api.tick(ongoingLoad);assert.equal(ongoingLoad.enemies.filter(a=>a.rc88Part).length,3);

 for(const a of kernels){a.hp=0;api.beforeDeath(arvelia,a);}
 assert.equal(arvelia.enemies.length,0);assert(arvelia.bossDefeated);
 assert(arvelia.clues.has('rc89:arvelia-command-freed'));
 assert.equal(arvelia.defeated.some(a=>a.id===original.id),false);
 const liberatedSave=api.snapshot(arvelia),liberatedLoad=state('kair02','kair-great-03');
 api.restore(liberatedLoad,liberatedSave);api.tick(liberatedLoad);assert.equal(liberatedLoad.enemies.length,0);
 const chairman=state('ep1b09','b09-boss');chairman.enemies[0].hp=0;
 let nativeDeaths=0;window.__HAPIL_CONTROLS_V31329__={binding:{state:{current:chairman},actions:{death:a=>{nativeDeaths++;assert(a.rc89ConnectionDone);chairman.enemies=[];}}}};
 assert(api.beforeDeath(chairman,chairman.enemies[0]));assert.equal(chairman.enemies[0].hp,1);
 chairman.time+=.7;const connectedSave=api.snapshot(chairman),connectedLoad=state('ep1b09','b09-boss');api.restore(connectedLoad,connectedSave);assert(Math.abs(api.snapshot(connectedLoad).connectionRemaining-.5)<.001);window.__HAPIL_CONTROLS_V31329__.binding.state.current=connectedLoad;window.__HAPIL_CONTROLS_V31329__.binding.actions.death=a=>{nativeDeaths++;assert(a.rc89ConnectionDone);};connectedLoad.time+=.51;api.tick(connectedLoad);assert.equal(nativeDeaths,1);
 assert(!tree.floatTexts.some(t=>String(t.text).includes('강화탄')));
 assert(echo.slice(-2).every(args=>args[4].rc89SupportHeroId==='lauren'));
`,world);
console.log('RC89 PASS: protected Arvelia body, 3 destructible command cores, nonlethal liberation and save, delayed native bootloader finale, twin spears, narrator and wraith narrative.');
