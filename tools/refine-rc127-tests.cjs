'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
function change(file,from,to){let s=fs.readFileSync(file,'utf8');if(s.includes(to))return;assert.equal(s.split(from).length-1,1,'refinement anchor '+file);fs.writeFileSync(file,s.replace(from,to));}
change('tests/rc127-policy.cjs',"assert.throws(()=>P.schedule(s,a,()=>{throw Error('fixture');}));checks++;P.schedule(s,a,()=>{s.fxSerial++;a.readyAt=27;return true;});check(a.readyAt===34,'thrown dispatch releases transaction lock');","assert.throws(()=>P.schedule(s,a,()=>{throw Error('fixture');}));checks++;s.time=31;P.schedule(s,a,()=>{s.fxSerial++;a.readyAt=38;return true;});check(a.readyAt===45,'thrown dispatch releases transaction lock after prior cooldown expires');");
change('tests/rc127-browser.cjs',"  const {s,a}=make('ep1b03','b03-boss');s.practiceV31329=false;",`  // The death-cleanup tests deliberately remove their actors. Keep a separate LIVE render fixture.
  {const f=cosmic('STORY');A.trySchedule(f.s,f.a,'reliquary');const h=f.s.pendingHits[f.s.pendingHits.length-1];f.s.time=h.at+.01;f.s.pendingHits=[];T.impact(f.s,h);A.tick(f.s);window.__RC127_COSMIC_FIXTURE__=f.s;}
  const {s,a}=make('ep1b03','b03-boss');s.practiceV31329=false;`);
change('assets/rc127/dark-jelly.js',"const owner=(root.__HAPIL_LASERS_V31330__?.owners??[]).find(a=>String(a.id)===id);","const registry=root.__HAPIL_LASERS_V31330__?.owners;const owner=Array.isArray(registry)?registry.find(a=>String(a.id)===id):null;");
const oldMode="function mode(s){return String(root.__HAPIL_MODES_V31346__?.mode(s)??s?.gameModeV31346??(s?.hellModeV31322?'HELL':'STORY')).toUpperCase();}";
const newMode=`function mode(s){
  const explicit=String(s?.gameModeV31346??'').toUpperCase();
  if(explicit==='DREAM')return 'DREAM';
  // Legacy saves can mark HELL only with a boolean; modern state may name it.
  // Neither form may accidentally receive STORY-only cooldown scaling.
  if(explicit==='HELL'||s?.hellModeV31322===true)return 'HELL';
  if(explicit==='STORY')return 'STORY';
  const native=String(root.__HAPIL_MODES_V31346__?.mode(s)??'STORY').toUpperCase();
  return ['STORY','HELL','DREAM'].includes(native)?native:'STORY';
 }`;
change('assets/rc127/combat-policy.js',oldMode,newMode);
change('tests/rc127-browser.cjs','gameModeV31346:mode,practiceV31329:true','gameModeV31346:mode,hellModeV31322:mode===\'HELL\',practiceV31329:true');
change('tests/rc127-policy.cjs',"const code=fs.readFileSync('assets/index-v31526.js','utf8');",`// RC127_MODE_REGRESSION: distinguish modern and legacy non-story state.
for(const [state,expected] of [[{gameModeV31346:'HELL'},'HELL'],[{hellModeV31322:true},'HELL'],[{gameModeV31346:'STORY',hellModeV31322:true},'HELL'],[{gameModeV31346:'DREAM',hellModeV31322:true},'DREAM'],[{gameModeV31346:'STORY'},'STORY']]){
 check(P.mode(state)===expected,'correct explicit/legacy mode');check(P.multiplier(state,{boss:true})===(expected==='STORY'?2:1),'no accidental non-story cooldown');
}
window.__HAPIL_MODES_V31346__={mode:()=> 'STORY'};check(P.mode({gameModeV31346:'HELL'})==='HELL','legacy resolver cannot downgrade explicit HELL');delete window.__HAPIL_MODES_V31346__;
const code=fs.readFileSync('assets/index-v31526.js','utf8');`);
console.log('RC127 refinement: modern and legacy HELL excluded; actual native fixtures use both mode fields.');
