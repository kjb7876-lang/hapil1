'use strict';
const assert=require('node:assert/strict');
// This is an ordinary-time native-input fixture. It does not set animation
// timestamps or invent an eight-frame animation for the supplied still atlas.
async function collect(page,{fixture,capture,label,report}){
 const directions=[['ArrowRight'],['ArrowRight','ArrowDown'],['ArrowDown'],['ArrowLeft','ArrowDown'],['ArrowLeft'],['ArrowLeft','ArrowUp'],['ArrowUp'],['ArrowRight','ArrowUp']];
 for(let direction=0;direction<directions.length;direction++){
  const metadata=await fixture(page,{zone:'dist00',action:'move'}),keys=directions[direction];
  await page.evaluate(()=>{
   const C=__HAPIL_CONTROLS_V31329__,s=C.binding.state.current;C.setMode('manual');C.binding.actions.dismiss();
   delete s.practicePatternV31365;s.paused=false;s.invulnerableUntil=s.time+99;
   window.__RC155_BITMAP_CAPTURE__=[];window.__RC156_MOTION_ROWS__=[];window.__RC156_MOTION_ACTIVE__=true;
   const epoch=window.__RC156_MOTION_EPOCH__=(window.__RC156_MOTION_EPOCH__??0)+1;
   function sample(){if(!__RC156_MOTION_ACTIVE__||epoch!==__RC156_MOTION_EPOCH__)return;
    const s=__HAPIL_CONTROLS_V31329__.binding.state.current,canvas=document.querySelector('.game-stage canvas'),A=__HAPIL_EGO_ART_RC155__,frame=A.selected(s,s.heroMotion),body=__HAPIL_BITMAP_NATIVE_RC133__.body(s,s,true);
    if(__RC156_MOTION_ROWS__.length<180)__RC156_MOTION_ROWS__.push({time:s.time,world:{x:s.x,y:s.y},motion:s.heroMotion?{...s.heroMotion}:null,frame,body,camera:__RC155_QA__.camera(s),viewport:__HAPIL_VIEWPORT_RC104__.view(),projectedFoot:__RC155_QA__.project(s.x,s.y),scroll:{x:scrollX,y:scrollY},canvas:canvas.getBoundingClientRect().toJSON(),lastDraw:(__RC155_BITMAP_CAPTURE__??[]).filter(r=>r.token==='ego155:'+frame?.kind+':'+frame?.index).at(-1)??null});
    requestAnimationFrame(sample);
   }requestAnimationFrame(sample);
  });
  const snapshots=[],record={label,direction,keys,staged:true,status:'running',snapshots};(report.motion??=[]).push(record);async function snap(phase,full=false){
   const state=await page.evaluate(()=>{const rows=__RC156_MOTION_ROWS__,s=__HAPIL_CONTROLS_V31329__.binding.state.current,canvas=document.querySelector('.game-stage canvas'),r=canvas.getBoundingClientRect(),draws=__RC155_BITMAP_CAPTURE__,latest=draws.filter(d=>/ego155:(walk|attack):/.test(d.token)&&d.alpha>0).at(-1);if(!latest)throw Error('Native EGO motion frame was not painted');const d=latest.destination,pad=18,left=Math.max(0,r.x+d.left-pad),top=Math.max(0,r.y+d.top-pad),right=Math.min(innerWidth,r.x+d.right+pad),bottom=Math.min(innerHeight,r.y+d.bottom+pad);return{time:s.time,motion:s.heroMotion?{...s.heroMotion}:null,lastSample:rows.at(-1),lastDraw:latest,clip:{x:left,y:top,width:right-left,height:bottom-top}};});
   await capture(page,label+'-d'+direction+'-'+phase,{...metadata,actionTimestamp:state.time,nativeInput:keys,sequence:true,sequenceScope:'Ordinary-time native arrow/A handler and RAF state transitions; staged EGO/dist00 fixture, not natural Persona victory',phase,...state},full?null:state.clip);snapshots.push({phase,...state});
  }
  try{
   for(const key of keys)await page.keyboard.down(key);await page.waitForTimeout(180);await snap('walk');for(const key of keys)await page.keyboard.up(key);
   // Align only the disclosed authored target/anchor, then let the real A
   // handler choose direction, source frame and native contact transactions.
   const launch=await page.evaluate(()=>{const C=__HAPIL_CONTROLS_V31329__,s=C.binding.state.current,m=s.heroMotion,a=s.enemies.find(a=>a.id==='dist00-boss');if(!a||!(a.hp>0))throw Error('Exact authored dist00 motion target lost: '+JSON.stringify({zone:s.zone,time:s.time,enemies:s.enemies.map(a=>({id:a.id,hp:a.hp})),ledger:s.egoGuardianRC155}));const dx=m?.dx??0,dy=m?.dy??0,len=Math.hypot(dx,dy);if(!(len>0))throw Error('Native directional input never reached movement');const x=s.x+dx/len*3,y=s.y+dy/len*3;__RC155_QA__.position(a,{x,y});a.rc133Anchor={x:a.x,y:a.y};a.moveDx=a.moveDy=a.moveVx=a.moveVy=0;a.movingUntil=0;s.targetEnemyId=a.id;return{time:s.time,lastAttack:s.lastAttack,player:{x:s.x,y:s.y},target:{id:a.id,x:a.x,y:a.y},nativeMovement:{dx,dy}};});
   await page.keyboard.press('a');await page.waitForFunction(at=>{const s=__HAPIL_CONTROLS_V31329__.binding.state.current;return s.lastAttack>at;},launch.lastAttack,{timeout:3000});
   for(const [phase,delay]of [['release',32],['flight',64],['recover',180]]){await page.waitForTimeout(delay);await snap(phase,direction===0&&phase==='flight');}
   await page.waitForTimeout(160);
   const evidence=await page.evaluate(()=>{__RC156_MOTION_ACTIVE__=false;const s=__HAPIL_CONTROLS_V31329__.binding.state.current;s.paused=true;s.practicePatternV31365={finished:true};const result={rows:__RC156_MOTION_ROWS__,draws:__RC155_BITMAP_CAPTURE__,transactions:__HAPIL_COMBAT_CORE_V31401__.snapshot(s).events};delete window.__RC155_BITMAP_CAPTURE__;return result;});
   const row=Object.assign(record,{launch,...evidence});
   assert(row.rows.length>2,'actual native RAF motion samples missing');assert(row.rows.some(r=>r.motion?.kind==='move'),'actual input move state missing');assert(row.rows.some(r=>r.motion?.kind==='attack'),'actual A attack state missing');
   assert(row.draws.some(r=>r.token.startsWith('ego155:walk:')&&r.alpha>0)&&row.draws.some(r=>r.token.startsWith('ego155:attack:')&&r.alpha>0),'real walk-to-attack source switch missing');
   assert(row.draws.every(r=>r.destination.left>=-.01&&r.destination.top>=-.01&&r.destination.right<=r.destination.canvasWidth+.01&&r.destination.bottom<=r.destination.canvasHeight+.01),'native full source body/cloak/weapon crop escaped the canvas');
   const first=row.rows[0];assert(row.rows.every(r=>Math.abs(r.camera.x-first.camera.x)<.001&&Math.abs(r.camera.y-first.camera.y)<.001&&Math.abs(r.camera.scale-first.camera.scale)<.00001&&r.scroll.x===first.scroll.x&&r.scroll.y===first.scroll.y),'EGO motion changed fixed camera or DOM scroll');record.status='passed';
  }finally{record.finalState=await page.evaluate(()=>{const s=__HAPIL_CONTROLS_V31329__.binding.state.current;return{zone:s.zone,time:s.time,enemies:s.enemies.map(a=>({id:a.id,hp:a.hp})),rows:window.__RC156_MOTION_ROWS__??[],draws:window.__RC155_BITMAP_CAPTURE__??null,ledger:s.egoGuardianRC155};});record.finalState.draws??=record.draws??[];for(const key of keys)await page.keyboard.up(key);await page.evaluate(()=>{__RC156_MOTION_ACTIVE__=false;delete window.__RC155_BITMAP_CAPTURE__;});}
 }
}
module.exports={collect};
