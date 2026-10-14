/* RC175: shared straight-stroke geometry, owner tint and simulation-only hole DOT.
 * Ephemeral contact clocks never enter saves. Damage goes through native Y. */
(function(root){'use strict';
 const n=(v,d=0)=>Number.isFinite(v)?v:d, clocks=new WeakMap(),tints=[],cycles=new WeakMap();let tintPixels=0;const MAX_TINT_PIXELS=4194304,MAX_TINT_ENTRIES=8;
 const config=Object.freeze({dotDamage:1,dotInterval:.5});
 const world=(u,v)=>({x:v+u/2,y:v-u/2});
 const validMode=c=>(c?.rc175StrokeMode===undefined||Number.isInteger(c.rc175StrokeMode)&&c.rc175StrokeMode>=0&&c.rc175StrokeMode<4)&&(c?.rc210LaserKind===undefined||[1,2].includes(c.rc210LaserLevel)&&['h','ladder','grid'].includes(c.rc210LaserKind)&&Number.isSafeInteger(c.rc210LaserSeed)&&c.rc210LaserSeed>=0&&c.rc210LaserSeed<=4294967295);
 const strokeMode=c=>validMode(c)&&c?.rc175StrokeMode!==undefined?c.rc175StrokeMode:Math.abs(Math.trunc(n(c?.id)))%4;
 function strokes(c,time){const special=root.__HAPIL_BOOTLOADER_RC210__?.geometry(c,time);if(special)return special;
  const u=n(c.cx,16)-n(c.cy,16),v=(n(c.cx,16)+n(c.cy,16))/2,r=Math.min(18,Math.max(7,n(c.radius,12))),gap=Math.max(5,n(c.width)*3.5);
  // Cast identity selects successive - | / and crossed strokes. Never rotate
  // during a committed cast; warning, body, tail and contact share these lines.
  const mode=strokeMode(c);
  const h=offset=>[world(u-r,v+offset),world(u+r,v+offset)];
  const vertical=offset=>[world(u+offset,v-r/2),world(u+offset,v+r/2)];
  const slash=offset=>[world(u-r,v+r/2+offset),world(u+r,v-r/2+offset)];
  const complexity=c.rc210LaserLevel,kind=c.rc210LaserKind;
  let authored=null;
  if([1,2].includes(complexity)&&['h','ladder','grid'].includes(kind)){
   const reach=Math.min(r,12),left=u-reach*.48,right=u+reach*.48,top=v-reach*.26,bottom=v+reach*.26;
   const line=(x1,y1,x2,y2)=>[world(x1,y1),world(x2,y2)];
   if(kind==='h')authored=[line(left,top,left,bottom),line(right,top,right,bottom),line(left,v,right,v)];
   if(kind==='ladder'){
    authored=[line(left,top,left,bottom),line(right,top,right,bottom)];const rungs=complexity===2?5:3,seed=Math.abs(Math.trunc(n(c.rc210LaserSeed)));
    for(let i=0;i<rungs;i++){const t=(i+1)/(rungs+1),jitter=(((seed>>>((i*5)%24))&15)/15-.5)*.5,y=top+(bottom-top)*t+jitter;authored.push(line(left,y,right,y));}
   }
   if(kind==='grid')authored=[line(left,v-reach*.14,right,v-reach*.14),line(left,v+reach*.14,right,v+reach*.14),line(u-reach*.22,top,u-reach*.22,bottom),line(u+reach*.22,top,u+reach*.22,bottom),...(complexity===2?[line(left,top,right,bottom)]:[])];
  }
  const pairs=authored??(mode===0?[h(-gap),h(gap)]:mode===1?[vertical(-gap),vertical(gap)]:mode===2?[slash(-gap/2),slash(gap/2)]:[h(0),vertical(0),slash(gap)]);
  const lines=pairs.map(([a,b])=>root.__HAPIL_LASERS_V31330__?.clip(a,b)).filter(Boolean).map(l=>({...l,width:c.width}));
  // Use the established shared graph for warning, beam and native contact.
  // Straight primary strokes stay straight; joins are real damaging segments,
  // rather than paint-only bridges between disconnected attack geometries.
  return root.__HAPIL_LASER_TOPOLOGY_RC108__?.normalize(c,lines,true)??lines;
 }
 function configure(c,a,s){root.__HAPIL_BOOTLOADER_RC210__?.configure(c,a,s);if(c.rc175StrokeMode!==undefined&&validMode(c))return;const seed=[...String(a?.id??'')].reduce((v,ch)=>(Math.imul(v,33)+ch.charCodeAt(0))>>>0,0),mode=cycles.get(a)??(seed%4);c.rc175StrokeMode=mode;cycles.set(a,(mode+1)%4);
  const zone=String(s?.zone??a?.enemyCombatZoneV31237??a?.zone??''),level=/^(last|kair|hando|murder|cult)/.test(zone)?2:/^(ep1b|u20)/.test(zone)?1:0;
  if(level){c.rc210LaserLevel=level;c.rc210LaserKind=['h','ladder','grid','h'][mode];c.rc210LaserSeed=(seed^Math.imul(Math.trunc(n(c.id)),2654435761))>>>0;}
}
 function title(c){if(c.rc210LaserKind)return ({h:'H자 연결 획',ladder:'엇갈린 사다리',grid:'교차 격자'})[c.rc210LaserKind];return ['가로 두 획','세로 두 획','대각 두 획','교차 세 획'][strokeMode(c)];}
 function tint(image,color){
  if(!image||image.complete===false||!(image.naturalWidth||image.width)||!root.document?.createElement)return image;
  const index=tints.findIndex(row=>row.image===image&&row.color===color);if(index>=0){const[row]=tints.splice(index,1);tints.push(row);return row.canvas;}
  const canvas=root.document.createElement('canvas');canvas.width=image.naturalWidth||image.width;canvas.height=image.naturalHeight||image.height;
  const ctx=canvas.getContext('2d');if(!ctx)return image;
  ctx.drawImage(image,0,0);ctx.globalCompositeOperation='color';ctx.fillStyle=color;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.globalCompositeOperation='destination-in';ctx.drawImage(image,0,0);ctx.globalCompositeOperation='source-over';
  const pixels=canvas.width*canvas.height;if(pixels<=MAX_TINT_PIXELS){while(tints.length&&(tints.length>=MAX_TINT_ENTRIES||tintPixels+pixels>MAX_TINT_PIXELS))tintPixels-=tints.shift().pixels;tints.push({image,color,canvas,pixels});tintPixels+=pixels;}return canvas;
 }
 function dot(s,holes){
  const party=root.__HAPIL_PARTY_V31322__,binding=root.__HAPIL_CONTROLS_V31329__?.binding;
  const blocked=!s||!(s.hp>0)||s.paused||s.pause||n(s.timeStopUntil)>s.time||party?.state===s&&(party.status?.role==='guest'||party.status?.paused||party.status?.disconnected)||binding?.state?.current===s&&(binding.phase!=='game'||binding.modal?.current||binding.blocked?.()||root.document?.hidden||root.__HAPIL_READING_V31342__?.blocked);
  if(blocked){if(s)clocks.delete(s);return;}
  let m=clocks.get(s);if(!m||m.zone!==s.zone||s.time<m.time){m={zone:s.zone,time:s.time,actors:new WeakMap()};clocks.set(s,m);}
  if(s.time===m.time&&m.done)return;
  const dt=Math.max(0,s.time-m.time);m.time=s.time;m.done=true;
  const live=(holes||[]).filter(h=>h.zone===s.zone&&h.fireAt<=s.time&&h.endAt>s.time&&(s.enemies||[]).some(a=>a.id===h.sourceId&&a.hp>0));
  for(const a of [s,...(party?.state===s?party.actors||[]:[])]){
   const h=a.hp>0&&live.find(h=>Math.hypot(a.x-h.x,a.y-h.y)<=h.radius);
   if(!h){m.actors.delete(a);continue;}
   let rec=m.actors.get(a);if(!rec){rec={elapsed:0};m.actors.set(a,rec);continue;}
   // A world discontinuity is not a retroactive contact. Normal simulation
   // deltas integrate identically at 10, 30, 60 and 144 Hz.
   if(dt>1){rec.elapsed=0;continue;}
   rec.elapsed+=dt;
   while(rec.elapsed+1e-9>=config.dotInterval&&a.hp>0){
    rec.elapsed-=config.dotInterval;
    const src=(s.enemies||[]).find(e=>e.id===h.sourceId),packet={id:s.fxSerial++,sourceId:h.sourceId,born:s.time,at:s.time,x:a.x,y:a.y,originX:h.x,originY:h.y,shape:'circle',radius:h.radius,damage:config.dotDamage,boss:!!src?.boss,status:'none',color:h.color,label:h.label+' · 블랙홀 지속 피해',blackHoleDotRC175:true};
    if(a===s)root.__HAPIL_NATIVE_ARENA_RC138__?.bodyDamage(s,config.dotDamage,a.x,a.y,packet);
    else party?.debug?.allyDamage(s,a,config.dotDamage,packet);
   }
  }
 }
 root.__HAPIL_BOSS_POLICY_RC175__=Object.freeze({config,validMode,configure,title,strokes,tint,dot,tintMetrics:()=>({entries:tints.length,pixels:tintPixels,maxPixels:MAX_TINT_PIXELS,maxEntries:MAX_TINT_ENTRIES})});
})(window);
