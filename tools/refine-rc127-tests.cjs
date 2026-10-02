'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
function change(file,from,to){let s=fs.readFileSync(file,'utf8');if(s.includes(to))return;assert.equal(s.split(from).length-1,1,'refinement anchor '+file);fs.writeFileSync(file,s.replace(from,to));}
change('tests/rc127-policy.cjs',"assert.throws(()=>P.schedule(s,a,()=>{throw Error('fixture');}));checks++;P.schedule(s,a,()=>{s.fxSerial++;a.readyAt=27;return true;});check(a.readyAt===34,'thrown dispatch releases transaction lock');","assert.throws(()=>P.schedule(s,a,()=>{throw Error('fixture');}));checks++;s.time=31;P.schedule(s,a,()=>{s.fxSerial++;a.readyAt=38;return true;});check(a.readyAt===45,'thrown dispatch releases transaction lock after prior cooldown expires');");
change('tests/rc127-browser.cjs',"  const {s,a}=make('ep1b03','b03-boss');s.practiceV31329=false;",`  // The death-cleanup tests deliberately remove their actors. Keep a separate LIVE render fixture.
  {const f=cosmic('STORY');A.trySchedule(f.s,f.a,'reliquary');const h=f.s.pendingHits[f.s.pendingHits.length-1];f.s.time=h.at+.01;f.s.pendingHits=[];T.impact(f.s,h);A.tick(f.s);window.__RC127_COSMIC_FIXTURE__=f.s;}
  const {s,a}=make('ep1b03','b03-boss');s.practiceV31329=false;`);
change('assets/rc127/dark-jelly.js',"const owner=(root.__HAPIL_LASERS_V31330__?.owners??[]).find(a=>String(a.id)===id);","const registry=root.__HAPIL_LASERS_V31330__?.owners;const owner=Array.isArray(registry)?registry.find(a=>String(a.id)===id):null;");
change('assets/rc127/combat-policy.js',"String(s?.gameModeV31346??(s?.hellModeV31322?'HELL':'STORY')).toUpperCase()","String(root.__HAPIL_MODES_V31346__?.mode(s)??s?.gameModeV31346??(s?.hellModeV31322?'HELL':'STORY')).toUpperCase()");
console.log('RC127 refinement: valid expired-deadline fixture; screenshot actor stays alive; palette registry type-safe.');
