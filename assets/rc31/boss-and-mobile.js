/* RC31: bespoke boss beams, resonance-defended black holes, and light mobile rendering. */
(()=>{'use strict';
 const VERSION='3.31',BEAM_ROOT='./assets/vfx/rc31/boss-lasers/',CUSTOM={
  'dist00-boss':'dist00-boss.svg','dist06-boss':'dist06-boss.svg','a11-boss':'a11-boss.svg','a11-cosmic-v31318':'a11-cosmic-v31318.svg',
  'b02-boss':'b02-boss.svg','b03-boss':'b03-boss.svg','b04-boss':'b04-boss.svg','b05-boss':'b05-boss.svg','b06-boss':'b06-boss.svg','b06b-boss':'b06b-boss.svg','b07-boss':'b07-boss.svg','b08-boss':'b08-boss.svg','b09-boss':'b09-boss.svg',
  'u203-boss':'u203-boss.svg','l301-boss':'l301-boss.svg','l303-boss':'l303-boss.svg','h103-boss':'h103-boss.svg','k103-boss':'k103-boss.svg','c102-boss':'c102-boss.svg','c103-boss':'c103-boss.svg','c104-boss':'c104-boss.svg','l305-boss':'l305-boss.svg',
  'kair-great-01':'kair-great-01.svg','kair-great-02':'kair-great-02.svg','kair-great-03':'kair-great-03.svg','kair-great-04':'kair-great-04.svg','kair-great-05':'kair-great-05.svg','kair-great-06':'kair-great-06.svg'
 };
 const ownerBeam=new Map(Object.entries(CUSTOM).map(([id,file])=>[id,BEAM_ROOT+file]));
 const stats={beamsRouted:0,blueCoreSuppressed:0,blackholesSpawned:0,pullSteps:0,resonanceBlocks:0,drawErrors:0,tickErrors:0};
 const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d,clamp=(v,a,b)=>Math.max(a,Math.min(b,num(v,a)));
 const guarded=s=>window.__HAPIL_CHANNEL_V31364__?.active?.(s)===true;
 function install(attempt=0){
  if(window.__HAPIL_RC31__?.installed)return;
  const api=window.__HAPIL_LASERS_V31330__,blood=window.__HAPIL_BLOOD_RC16__;
  if(!api?.installed||!api.owners||!api.tick||!api.draw||!blood?.draw){if(attempt<240)setTimeout(()=>install(attempt+1),25);return;}
  let routed=0;
  for(const owner of api.owners){const path=ownerBeam.get(owner.id);if(!path)continue;owner.beam=path;routed++;}
  const bloodOwner=api.owners.find(owner=>owner.id==='a11-cosmic-v31318');
  if(bloodOwner){bloodOwner.beam=ownerBeam.get(bloodOwner.id);try{blood.asset=ownerBeam.get(bloodOwner.id);}catch{}}
  stats.beamsRouted=routed;
  const originalDraw=api.draw;
  api.draw=function(ctx,cache,state,settings={}){
   const mobile=window.__HAPIL_MOBILE_V31366__?.enabled?.()===true;
   const opts=mobile?{...settings,lowFx:true,reducedFlash:true,showCombatInfo:false}:settings;
   let result;
   try{result=filterCanvas(ctx,()=>originalDraw.call(this,ctx,cache,state,opts));}
   catch(error){stats.drawErrors++;result=originalDraw.call(this,ctx,cache,state,opts);}
   try{drawBlackholes(ctx,state,opts);}catch(error){stats.drawErrors++;}
   return result;
  };
  const originalTick=api.tick;
  api.tick=function(state,dt,...rest){const result=originalTick.call(this,state,dt,...rest);try{tickBlackholes(state,dt);}catch(error){stats.tickErrors++;}return result;};
  const originalBloodDraw=blood.draw;
  blood.draw=function(ctx,cache,state,cast,settings={}){
   if(cast&&(cast.sourceId==='a11-cosmic-v31318'||cast.ownerIdV31331==='a11-cosmic-v31318'||state?.enemies?.some(actor=>actor.id===cast.sourceId&&actor.cosmicLuciferV31318)))cast.beam=ownerBeam.get('a11-cosmic-v31318');
   return originalBloodDraw.call(this,ctx,cache,state,cast,settings);
  };
  window.__HAPIL_RC31__=Object.freeze({installed:true,version:VERSION,customBossBeams:routed,owners:Object.freeze([...ownerBeam.keys()]),stats:()=>({...stats})});
 }
 function filterCanvas(ctx,render){
  if(!ctx||typeof render!=='function')return render?.();
  const own=Object.getOwnPropertyDescriptor(ctx,'drawImage'),original=ctx.drawImage;
  try{
   Object.defineProperty(ctx,'drawImage',{configurable:true,writable:true,value:function(...args){
    const im=args[0],height=num(im?.naturalHeight||im?.height),sourceY=num(args[2]),sourceH=num(args[4]);
    // Drop the extra narrow, additive center stamp. The owner-specific texture
    // and its correctly sized main beam stay untouched.
    if(this.globalCompositeOperation==='lighter'&&args.length===9&&height>0&&Math.abs(sourceY/height-.38)<.012&&Math.abs(sourceH/height-.25)<.012){stats.blueCoreSuppressed++;return;}
    return original.apply(this,args);
   }});
  }catch{return render();}
  try{return render();}
  finally{if(own)Object.defineProperty(ctx,'drawImage',own);else delete ctx.drawImage;}
 }
 function tickBlackholes(s,dt){
  const party=window.__HAPIL_PARTY_V31322__,status=party?.status;
  if(!s||!Number.isFinite(s.time)||s.hp<=0||s.paused||s.pause||party?.state===s&&(status?.role==='guest'||status?.paused||status?.disconnected))return;
  const now=s.time,step=Math.min(.05,Math.max(0,num(dt)))*1.5;if(!(step>0))return;
  const holes=s.bossBlackHolesRC31??(s.bossBlackHolesRC31=[]),next=s.bossBlackHoleNextRC31??(s.bossBlackHoleNextRC31=Object.create(null));
  s.bossBlackHolesRC31=holes.filter(h=>h.endAt>now&&(s.enemies??[]).some(a=>a.id===h.sourceId&&a.hp>0));
  const live=s.bossBlackHolesRC31;
  for(const actor of (s.enemies??[])){
   if(!actor?.boss||actor.hp<=0||actor.visualOnly||actor.objectiveStructureV31238||actor.protectedNarrativeTargetV31307)continue;
   if(!Number.isFinite(next[actor.id]))next[actor.id]=now+8+(hash(actor.id)%6);
   if(now<next[actor.id]||live.some(h=>h.sourceId===actor.id)||live.some(h=>h.fireAt<=now&&h.endAt>now))continue;
   const owner=window.__HAPIL_LASERS_V31330__?.owners?.find(o=>o.id===actor.id);
   const color=owner?.color||actor.bossColor||actor.color||actor.accent||'#a98bff';
   const dx=num(s.moveVx),dy=num(s.moveVy),lead=Math.min(.8,Math.hypot(dx,dy)*.2);
   const hole={id:s.fxSerial++,sourceId:actor.id,zone:s.zone,born:now,fireAt:now+1.25,endAt:now+4.35,x:clamp(s.x+dx*lead,1.5,30.5),y:clamp(s.y+dy*lead,1.5,30.5),radius:5.0,color,accent:owner?.accent||'#f8f1ff',label:actor.name||owner?.name||'보스 블랙홀'};
   live.push(hole);next[actor.id]=hole.endAt+15+(hash(actor.id+':rc31')%8);stats.blackholesSpawned++;break;
  }
  for(const h of live){
   const distance=Math.hypot(s.x-h.x,s.y-h.y);
   if(now<h.fireAt||now>=h.endAt||distance>h.radius||distance<.45)continue;
   if(guarded(s)){h.guardedUntil=now+.14;stats.resonanceBlocks++;continue;}
   const dx=h.x-s.x,dy=h.y-s.y,d=Math.hypot(dx,dy),speed=2.1*Math.max(.22,Math.min(1,d/h.radius)),amount=Math.min(d-.35,speed*step);
   s.x=clamp(s.x+dx/d*amount,1,31);s.y=clamp(s.y+dy/d*amount,1,31);s.moveVx=0;s.moveVy=0;stats.pullSteps++;
  }
 }
 function drawBlackholes(ctx,s,settings){
  if(!ctx||!s?.bossBlackHolesRC31?.length||!window.__HAPIL_COMBAT_V31333__?.core)return;
  const project=p=>window.__HAPIL_COMBAT_V31333__.core(p);
  for(const h of s.bossBlackHolesRC31){
   if(h.endAt<=s.time)continue;
   const a=project({x:h.x,y:h.y}),px=project({x:h.x+1,y:h.y}),py=project({x:h.x,y:h.y+1});if(!a||!px||!py)continue;
   const rx=h.radius*Math.hypot(px.x-a.x,py.x-a.x),ry=h.radius*Math.hypot(px.y-a.y,py.y-a.y);
   const warn=s.time<h.fireAt,blocked=num(h.guardedUntil)>s.time,progress=clamp((s.time-h.fireAt)/Math.max(.01,h.endAt-h.fireAt),0,1),pulse=1+Math.sin(s.time*6)*.045;
   const cx=a.x,cy=a.y+54,low=settings?.lowFx===true;
   ctx.save();try{
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=warn?.3:.78;
    ctx.beginPath();ctx.ellipse(cx,cy,rx*pulse,ry*pulse,0,0,Math.PI*2);ctx.fillStyle='rgba(3,4,12,.76)';ctx.fill();
    ctx.strokeStyle=blocked?'#fff0ac':h.color;ctx.lineWidth=warn?2.5:3;ctx.setLineDash(warn?[8,7]:[]);ctx.beginPath();ctx.ellipse(cx,cy,rx*pulse,ry*pulse,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    if(!warn){ctx.globalAlpha=.72;ctx.fillStyle=h.color;ctx.beginPath();ctx.ellipse(cx,cy,rx*.27,ry*.34,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.95;ctx.fillStyle='#03030a';ctx.beginPath();ctx.ellipse(cx,cy,rx*.19,ry*.26,0,0,Math.PI*2);ctx.fill();
     ctx.globalAlpha=.75;ctx.strokeStyle=blocked?'#fff0ac':h.accent;ctx.lineWidth=low?2:3;for(let i=0;i<(low?1:3);i++){ctx.beginPath();ctx.ellipse(cx,cy,rx*(.32+i*.12),ry*(.39+i*.13),s.time*(i%2?-.65:.8),.18+i*.6,Math.PI*1.65+i*.42);ctx.stroke();}
    }else{ctx.globalAlpha=.12+.16*Math.sin(s.time*7)**2;ctx.fillStyle=h.color;ctx.beginPath();ctx.ellipse(cx,cy,rx*progress,ry*progress,0,0,Math.PI*2);ctx.fill();}
   }finally{ctx.restore();}
  }
 }
 function hash(value){let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0)%997;}
 install();
})();
