/* RC175: shared straight-stroke geometry, owner tint and simulation-only hole DOT.
 * Ephemeral contact clocks never enter saves. Damage goes through native Y. */
(function(root){'use strict';
 const n=(v,d=0)=>Number.isFinite(v)?v:d, clocks=new WeakMap(),tints=new WeakMap(),cycles=new WeakMap();
 const config=Object.freeze({dotDamage:1,dotInterval:.5});
 const world=(u,v)=>({x:v+u/2,y:v-u/2});
 function strokes(c){
  const u=n(c.cx,16)-n(c.cy,16),v=(n(c.cx,16)+n(c.cy,16))/2,r=Math.min(18,Math.max(7,n(c.radius,12))),gap=Math.max(5,n(c.width)*3.5);
  // Cast identity selects successive - | / and crossed strokes. Never rotate
  // during a committed cast; warning, body, tail and contact share these lines.
  const mode=Number.isInteger(c.rc175StrokeMode)&&c.rc175StrokeMode>=0&&c.rc175StrokeMode<4?c.rc175StrokeMode:Math.abs(Math.trunc(n(c.id)))%4;
  const h=offset=>[world(u-r,v+offset),world(u+r,v+offset)];
  const vertical=offset=>[world(u+offset,v-r/2),world(u+offset,v+r/2)];
  const slash=offset=>[world(u-r,v+r/2+offset),world(u+r,v-r/2+offset)];
  const pairs=mode===0?[h(-gap),h(gap)]:mode===1?[vertical(-gap),vertical(gap)]:mode===2?[slash(-gap/2),slash(gap/2)]:[h(0),vertical(0),slash(gap)];
  return pairs.map(([a,b])=>root.__HAPIL_LASERS_V31330__?.clip(a,b)).filter(Boolean).map(l=>({...l,width:c.width}));
 }
 function configure(c,a){if(c.rc175StrokeMode!==undefined)return;const mode=cycles.get(a)??0;c.rc175StrokeMode=mode;cycles.set(a,(mode+1)%4);}
 function title(c){return ['가로 두 획','세로 두 획','대각 두 획','교차 세 획'][Number.isInteger(c.rc175StrokeMode)?c.rc175StrokeMode:Math.abs(Math.trunc(n(c.id)))%4];}
 function tint(image,color){
  if(!image||image.complete===false||!(image.naturalWidth||image.width)||!root.document?.createElement)return image;
  let row=tints.get(image);if(row?.color===color)return row.canvas;
  const canvas=root.document.createElement('canvas');canvas.width=image.naturalWidth||image.width;canvas.height=image.naturalHeight||image.height;
  const ctx=canvas.getContext('2d');if(!ctx)return image;
  ctx.drawImage(image,0,0);ctx.globalCompositeOperation='color';ctx.fillStyle=color;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.globalCompositeOperation='destination-in';ctx.drawImage(image,0,0);ctx.globalCompositeOperation='source-over';
  tints.set(image,{color,canvas});return canvas;
 }
 function dot(s,holes){
  const party=root.__HAPIL_PARTY_V31322__,binding=root.__HAPIL_CONTROLS_V31329__?.binding;
  const blocked=!s||!(s.hp>0)||s.paused||s.pause||root.__HAPIL_BATTLE_ARENA_RC138__?.locked?.(s)||n(s.timeStopUntil)>s.time||party?.state===s&&(party.status?.role==='guest'||party.status?.paused||party.status?.disconnected)||binding?.state?.current===s&&(binding.phase!=='game'||binding.modal?.current||binding.blocked?.()||root.document?.hidden||root.__HAPIL_READING_V31342__?.blocked);
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
 root.__HAPIL_BOSS_POLICY_RC175__=Object.freeze({config,configure,title,strokes,tint,dot});
})(window);
