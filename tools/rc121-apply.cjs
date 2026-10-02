'use strict';
// Deterministic, idempotent RC121 patch. Every edit requires an exact known
// call site; no whole-project rollback and no art-renderer replacement.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),changed=new Set();
function edit(file,before,after){const p=path.join(root,file),s=fs.readFileSync(p,'utf8');if(s.includes(after))return;assert.equal(s.split(before).length-1,1,'Expected one exact patch site: '+file+' '+before.slice(0,100));fs.writeFileSync(p,s.replace(before,after));changed.add(file);}
const ric='assets/rc108/samong-ricochet.js',top='assets/rc108/laser-topology.js',choice='assets/rc97/choice-patterns.js',main='assets/index-v31526.js';
edit(ric,'const v=visualFor(s,h,target);if(!rangedStrike(h,v))continue;','const v=visualFor(s,h,target);if(!v||!rangedStrike(h,v))continue; // RC121: leave unpaired strikes on the native delivery path.');
edit(ric,'function draw(ctx,cache,e,time,settings={}){','function draw(ctx,cache,e,time,settings={},queueImage){');
edit(ric,"const image=e.sprite?MONGSE_queueImage(cache,e.sprite,'eager'):null","const image=e.sprite&&typeof queueImage==='function'?queueImage(cache,e.sprite,'eager'):null");
edit(ric,"version:'RC108',installed:true,prepare","version:'RC121',installed:true,prepare");
edit(main,'window.__HAPIL_SAMONG_RICOCHET_RC108__?.draw(view,cache,e,time,settings)??true','window.__HAPIL_SAMONG_RICOCHET_RC108__?.draw(view,cache,e,time,settings,MONGSE_queueImage)??true');
// This is the shared render/contact geometry policy, not a painted-over gap.
edit(top,"function bands(c){if(c?.bossFinaleV31334)return[[0,2+(c.beamWidth+16)/27,c.angle,c.cx,c.cy]];const p=c?.rc97Choice;if(!p)return[];const complex=window.__HAPIL_CONNECTED_LASER_V31377__?.complexType(c.type),half=c.width*1.25*(complex?1.18:1);return[[p.broad,half+1.55],[p.narrow,half+.60]];}","function bands(){return[];} // RC121: user explicitly removed all laser escape bands.");
edit(top,'Bridges stay inside one hazardous region; announced RC97 escape bands remain open.','RC121: all branches connect; former RC97/finale escape bands are removed.');
edit(top,'let lines=splitCrossings(source.filter(l=>distance(l.a,l.b)>EPS).map(l=>({...l,a:{...l.a},b:{...l.b}})));','let lines=splitCrossings(source.filter(l=>distance(l.a,l.b)>EPS).map(l=>({...l,a:{...l.a},b:{...l.b}})));\n  // A solitary straight ray needs no artificial fork: share its existing midpoint.\n  if(lines.length===1){const l=lines[0],m={x:(l.a.x+l.b.x)/2,y:(l.a.y+l.b.y)/2};lines=[{...l,b:m},{...l,a:m}];}');
edit(top,"version:'RC115',normalize","version:'RC121',normalize");
{
 const p=path.join(root,choice),s=fs.readFileSync(p,'utf8');
 if(!s.includes('// RC121 continuous grammar')){
  const start=' function geometry(c,original,shifted=false){',end='\n window.__HAPIL_CHOICE_RC97__';assert.equal(s.split(start).length-1,1);assert.equal(s.split(end).length-1,1);const a=s.indexOf(start),b=s.indexOf(end,a);assert(b>a);
  const replacement=" function geometry(c,original){ // RC121 continuous grammar; retain authored grid, never cut safe bands.\n  if(!c.rc97Choice||!validPlan(c))return original;const p=c.rc97Choice;let lines=original;\n  if(p.family==='order'){lines=[];const spacing=Math.max(4,6.4-Math.min(p.cycle,6)*.4),v=10+6*p.blocked;\n   for(const u of [-spacing,0,spacing]){const l=clip(world(u,1.1),world(u,30.9));if(l)lines.push({...l,width:c.width});}\n   for(const y of [v-spacing,v,v+spacing]){const l=clip(world(-31,y),world(31,y));if(l)lines.push({...l,width:c.width});}\n  }\n  return lines;\n }";
  fs.writeFileSync(p,s.slice(0,a)+replacement+s.slice(b));changed.add(choice);
 }
}
edit(choice,"version:'RC97',profile","version:'RC121',profile");
// The finale also reserved an empty central strip. A center beam now shares the
// same normalizer, warning geometry and collision geometry as the outer beams.
edit(main,"const raw=offsets.map(v=>Math.abs(v)<3.6?Math.sign(v)*3.6:v).map(v=>L.clip(local(-52,v,c),local(52,v,c))).filter(Boolean);","const raw=[...offsets,0].map(v=>L.clip(local(-52,v,c),local(52,v,c))).filter(Boolean); // RC121: no reserved central laser corridor.\n");
// Only scripts actually changed receive a new cache key. Authored beam art stays untouched.
for(const [file,old]of [[choice,'40801'],[top,'41501'],[ric,'40808'],[main,'41605']])edit('index.html',file+'?v='+old,file+'?v=42101');
// Preserve useful failure evidence even when the simulation is paused without a JS error.
const test='tests/rc121-dream-regression-browser.cjs';
edit(test,"}catch(e){row.passed=false;row.failure=e.stack||String(e);}console.log('RC121_DREAM_RESULT'","}catch(e){row.passed=false;row.failure=e.stack||String(e);try{row.diagnostic=await deadline(page.evaluate(()=>{const s=window.__MONGSE_QA_STATE__,b=window.__HAPIL_CONTROLS_V31329__?.binding;return{text:document.body.innerText.slice(-9000),qaTime:s?.time,bindingTime:b?.state?.current?.time,sameState:s===b?.state?.current,bindingKeys:Object.keys(b||{}),flags:Object.fromEntries(Object.entries(s||{}).filter(([k,v])=>/(dead|death|pause|ending|reviv|samong|gameMode|stop|lock)/i.test(k)&&['number','string','boolean'].includes(typeof v))),frames:window.__RC121_FRAMES__};}),5000,'failure diagnostic');await page.screenshot({path:path.join(out,`dream-${mobile?'portrait':'desktop'}-failure.png`),timeout:5000});}catch{}}console.log('RC121_DREAM_RESULT'");
console.log('RC121_PATCH_FILES',JSON.stringify([...changed]));
