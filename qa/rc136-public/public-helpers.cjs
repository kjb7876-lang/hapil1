'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
async function observe(page,out,seen){
 const row=await page.evaluate(()=>{
  const s=window.__MONGSE_QA_STATE__,P=window.__HAPIL_PERSONA_DUEL_RC134__,H=window.__HAPIL_INNER_FINAL_RC133__,b=H.boss(s),c=document.querySelector('.game-stage canvas');
  return{time:s.time,phase:s.innerFinalRC133?.phase,mood:H.mood(s),player:{x:s.x,y:s.y,hp:s.hp,left:P.contains(s,'left')},boss:{x:b?.x,y:b?.y,hp:b?.hp,right:!!b&&P.contains(b,'right')},active:P.active(s),metrics:P.metrics(),filter:c?.getContext('2d').filter,events:window.__HAPIL_COMBAT_CORE_V31401__.snapshot(s).events.filter(e=>e.finalDamage)};
 });
 const{events,...boundary}=row;out.boundaries.push(boundary);
 if(!out.moods.includes(row.mood))out.moods.push(row.mood);
 for(const e of events){const key=e.epoch+':'+e.sequence;if(!seen.has(key)){seen.add(key);out.transactions.push(e);}}
 assert(row.active&&row.player.left&&row.boss.right,'native player/boss remain on their assigned platform halves');
 return boundary;
}
async function contrast(page){
 return page.evaluate(()=>{
  const H=window.__HAPIL_INNER_FINAL_RC133__,s=window.__MONGSE_QA_STATE__,rows=[];
  for(const name of ['normal','player','boss','opposition']){
   // Detached composer fixtures only: clones do not change live game timers,
   // HP, state, projectile arrays, or native progression.
   const fixture={...s,innerFinalRC133:{...s.innerFinalRC133,phase:'fight',awake:['boss','opposition'].includes(name)?7:0},samongPassiveRC91:{...s.samongPassiveRC91,active:['player','opposition'].includes(name)?7:0}};
   const c=document.createElement('canvas');c.width=40;c.height=16;const ctx=c.getContext('2d');ctx.fillStyle='#405080';ctx.fillRect(0,0,40,16);ctx.filter='none';ctx.globalAlpha=.8;
   const applied=H.compose(ctx,fixture,c);rows.push({fixture:name,mood:H.mood(fixture),applied,left:[...ctx.getImageData(8,8,1,1).data],right:[...ctx.getImageData(32,8,1,1).data],divider:[...ctx.getImageData(20,8,1,1).data],filterAfter:ctx.filter,alphaAfter:ctx.globalAlpha});
  }
  return{scope:'Four detached color-composer clones of the live developer arena; live awakening clocks and state remain untouched',rows};
 }).then(report=>{
  const gray=p=>Math.max(...p.slice(0,3))-Math.min(...p.slice(0,3))<=1,red=p=>p[0]>p[1]&&p[0]>p[2];
  for(const r of report.rows){assert.equal(r.mood,r.fixture);assert.equal(r.filterAfter,'none');assert(Math.abs(r.alphaAfter-.8)<1e-6);if(r.fixture==='normal'){assert.equal(r.applied,false);assert.deepEqual(r.left,[64,80,128,255]);}if(r.fixture==='player')assert(gray(r.left)&&gray(r.right));if(r.fixture==='boss')assert(red(r.left)&&red(r.right));if(r.fixture==='opposition')assert(gray(r.left)&&red(r.right)&&r.divider[0]>200);}
  report.status='passed';return report;
 });
}
async function rotate(page,context,output){
 const cdp=await context.newCDPSession(page),rows=[];
 for(const [i,size] of [[844,390],[390,844],[844,390],[390,844],[844,390]].entries()){
  const landscape=size[0]>size[1];await cdp.send('Emulation.setDeviceMetricsOverride',{width:size[0],height:size[1],deviceScaleFactor:2,mobile:true,screenOrientation:{angle:landscape?90:0,type:landscape?'landscapePrimary':'portraitPrimary'}});await page.waitForTimeout(250);
  const row=await page.evaluate(()=>{const c=document.querySelector('.game-stage canvas'),r=c.getBoundingClientRect(),s=window.__MONGSE_QA_STATE__,P=window.__HAPIL_PERSONA_DUEL_RC134__,H=window.__HAPIL_INNER_FINAL_RC133__,b=H.boss(s);return{viewport:[innerWidth,innerHeight],orientation:screen.orientation.type,canvas:{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom,backing:[c.width,c.height]},active:P.active(s),playerLeft:P.contains(s,'left'),bossRight:!!b&&P.contains(b,'right'),mood:H.mood(s),time:s.time};});
  rows.push({i,size,checkpointMs:250,...row});assert.deepEqual(row.viewport,size);assert(row.canvas.x>=-1&&row.canvas.y>=-1&&row.canvas.right<=size[0]+1&&row.canvas.bottom<=size[1]+1);assert(Math.abs(row.canvas.width-size[0])<1&&Math.abs(row.canvas.bottom-size[1])<1);assert(row.active&&row.playerLeft&&row.bossRight);
  await page.screenshot({path:path.join(output,'public-hidden-rotation-'+i+'.png')});
 }
 await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true,screenOrientation:{angle:0,type:'portraitPrimary'}});await page.waitForTimeout(250);
 return{status:'passed',scope:'Five real CDP mobile orientation changes, no CPU throttling or pressure benchmark; normal 777 arena entry',rows};
}
async function move(page,out,seen){
 const start=await observe(page,out,seen),directions=['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'],rows=[];
 for(const key of directions){await page.keyboard.down(key);for(let i=0;i<4;i++){await page.waitForTimeout(200);rows.push({key,...await observe(page,out,seen)});}await page.keyboard.up(key);}
 return{scope:'Trusted keyboard input only; no actor positions or timers edited',start,rows};
}
function validate(out){
 for(const r of out.boundaries)assert(r.active&&r.player.left&&r.boss.right);
 const counts={incoming:0,outgoing:0};
 for(const e of out.transactions){const f=e.finalDamage,factor=e.controlMode==='full'?(f.direction==='incoming'?.1:1.7):1;assert.equal(f.factor,factor);assert(Math.abs(f.amount-f.baseline*factor)<1e-7*Math.max(1,f.amount));counts[f.direction]++;}
 assert(counts.outgoing>0,'observe actual native outgoing transactions');
 return{status:'passed',boundarySamples:out.boundaries.length,moodsObserved:out.moods,transactionCount:out.transactions.length,directions:counts,scope:'Actual published native transaction metadata and admitted amount arithmetic; no paired survival/healing ratio claim; incoming coverage only when naturally admitted'};
}
module.exports={observe,contrast,rotate,move,validate};
