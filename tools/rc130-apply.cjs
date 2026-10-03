'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function patch(file,changes){let text=fs.readFileSync(path.join(root,file),'utf8');for(const[from,to]of changes){if(text.includes(to))continue;assert.equal(text.split(from).length-1,1,file+' unique anchor: '+from.slice(0,100));text=text.replace(from,to);}fs.writeFileSync(path.join(root,file),text);}
const bundle='assets/index-v31526.js';
patch(bundle,[
 ['ownershipSourceIdV31322: e.id,\n                        kind: r.fxKind,','ownershipSourceIdV31322: e.id,\n                        rc130StationaryMelee: !s,\n                        rc130MeleeX: MONGSE_lockedTargetXSmartR1,\n                        rc130MeleeY: MONGSE_lockedTargetYSmartR1,\n                        kind: r.fxKind,'],
 ['function eligible(s,e,reason){\n    if(!authority(s)','function eligible(s,e,reason){\n    if(window.__HAPIL_PRESENTATION_RC130__?.melee(e))return false;\n    if(!authority(s)'],
 ['function canTransfer(s,e){return !!(s&&e&&!own(e)','function canTransfer(s,e){return !!(s&&e&&!window.__HAPIL_PRESENTATION_RC130__?.melee(e)&&!own(e)'],
 ['window.__HAPIL_COMBAT_SAFETY_RC126__?.prepareFrame(o);','window.__HAPIL_COMBAT_SAFETY_RC126__?.prepareFrame(o);\n              window.__HAPIL_PRESENTATION_RC130__?.prepare(o);'],
 ['return window.__HAPIL_PROJECTILE_RENDER_V31402__.dispatch(base,this,[ctx,cache,p,time,settings]);','const paint=()=>window.__HAPIL_PROJECTILE_RENDER_V31402__.dispatch(base,this,[ctx,cache,p,time,settings]);\n   return window.__HAPIL_PRESENTATION_RC130__?window.__HAPIL_PRESENTATION_RC130__.projectile(ctx,p,paint):paint();']
]);
let text=fs.readFileSync(path.join(root,bundle),'utf8');
if(!text.includes('/* RC130_FINAL_PRESENTATION_HOOK */'))text+='\n/* RC130_FINAL_PRESENTATION_HOOK */\n(()=>{const previous=Gn;Gn=function HAPIL_meleeAndProjectileRC130(ctx,cache,e,time,settings={}){const p=window.__HAPIL_PRESENTATION_RC130__;if(!p)return previous.call(this,ctx,cache,e,time,settings);if(p.drawMelee(ctx,cache,e,time,settings,{project:G,queue:MONGSE_queueImage,opacity:MONGSE_skillFxOpacity}))return true;return p.projectile(ctx,e,()=>previous.call(this,ctx,cache,e,time,settings));};const audio=MONGSE_resolveHeroSfxV31233;MONGSE_resolveHeroSfxV31233=function(hero,action,...rest){const original=audio.call(this,hero,action,...rest);return window.__HAPIL_AUDIO_RC130__?.attack(hero,action,original)??original;};window.__HAPIL_RC130_NATIVE_INSTALLED__=true;})();\n';
fs.writeFileSync(path.join(root,bundle),text);
patch('assets/rc128/combat-feedback.js',[
 ["function sound(s,key,priority,gain){root.__HAPIL_FEEDBACK_RC22__?.impact?.(s,{key,priority,gain});}","function sound(s,key,priority,gain,meta={}){root.__HAPIL_FEEDBACK_RC22__?.impact?.(s,{key,priority,gain,...meta});}"],
 ["sound(s,f.sound,f.priority,f.power>=1?.35:.24);","sound(s,f.sound,f.priority,f.power>=1?.35:.24,{channel:f.outgoing?'enemy-hit':f.kind==='guard'?'guard':'ally-hurt',heroId:s.activeHeroId});"]
]);
patch('assets/rc23/feedback.js',[
 ["window.__HAPIL_CONTACT_RC23__?.mark(s,target,damage,source);","window.__HAPIL_CONTACT_RC23__?.mark(s,target,damage,source);\n  if(window.__HAPIL_AUDIO_RC130__&&!window.__HAPIL_AUDIO_RC130__.enemyHit(s))return;"],
 ["m.queue.push({key,at:s.time,priority:source.critical?3:2,gain:source.critical?.46:.33});","m.queue.push({key,channel:'enemy-hit',heroId:source.heroId,at:s.time,priority:2,gain:source.critical?.18:.14});"],
 ["const m=state(s);if(m.queue.length>=8)return false;\n  m.queue.push({key:event.key,at:s.time,priority:Math.max(0,Math.min(7,Number(event.priority)||0)),gain:Math.max(0,Math.min(.5,Number(event.gain)||0))});return true;","if(event.channel==='enemy-hit'&&window.__HAPIL_AUDIO_RC130__&&!window.__HAPIL_AUDIO_RC130__.enemyHit(s))return false;\n  const m=state(s);if(m.queue.length>=16)return false;\n  m.queue.push({key:event.key,channel:event.channel,heroId:event.heroId,at:s.time,priority:event.channel==='ally-hurt'?9:event.channel==='enemy-hit'?2:Math.max(0,Math.min(7,Number(event.priority)||0)),gain:event.channel==='enemy-hit'?Math.min(.18,Number(event.gain)||.14):Math.max(0,Math.min(.5,Number(event.gain)||0))});return true;"],
 ["if(e.kind==='hurt'&&(e.slot==='__host'||!e.slot))m.queue.push({key:e.sound==='heavy'||(s.enemies??[]).some(a=>a.id===e.source&&a.boss)?'heavy':'hurt',at:s.time,priority:5,gain:.46});","if(e.kind==='hurt')m.queue.push({key:e.sound==='heavy'?'heavy':'hurt',channel:'ally-hurt',heroId:e.heroId??e.targetHeroId??(e.slot==='__host'||!e.slot?s.activeHeroId:null),at:s.time,priority:9,gain:.44});"],
 ["m.queue.push({key:'roar',at:s.time,priority:1,gain:.24});","m.queue.push({key:'roar',at:s.time,priority:0,gain:.1});"],
 ["m.queue.push({key:'laser',at:s.time,priority:4,gain:.4});","m.queue.push({key:'laser',at:s.time,priority:1,gain:.2});"],
 ["play('./audio/rc23/upload-'+String(index).padStart(2,'0')+'.wav',e.gain,.12);","const original='./audio/rc23/upload-'+String(index).padStart(2,'0')+'.wav';\n  play(window.__HAPIL_AUDIO_RC130__?.route(s,e,original)??original,e.gain,.12);"]
]);
patch('assets/rc130/audio-policy.js',[["const hero=event.heroId??s?.activeHeroId,pack=","const hero=Object.prototype.hasOwnProperty.call(event,'heroId')?event.heroId:s?.activeHeroId,pack="]]);
const htmlPath=path.join(root,'index.html');let html=fs.readFileSync(htmlPath,'utf8');
if(!html.includes('assets/rc130/projectile-policy.js')){const anchor=html.match(/<script[^>]*src=["'][^"']*assets\/rc128\/awakening-policy\.js[^"']*["'][^>]*><\/script>/)?.[0];assert(anchor,'RC128 load anchor');html=html.replace(anchor,'<script src="./assets/rc130/projectile-policy.js?v=43001"></script>\n<script src="./assets/rc130/audio-policy.js?v=43001"></script>\n'+anchor);}
for(const file of ['assets/index-v31526.js','assets/rc128/combat-feedback.js','assets/rc23/feedback.js']){const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const rx=new RegExp(escaped+'\\?v=[^"\\s]+','g');assert(rx.test(html),'cache anchor '+file);html=html.replace(rx,file+'?v=43001');}
fs.writeFileSync(htmlPath,html);console.log('RC130 integration applied; native damage, laser and RC129 pattern logic preserved.');
