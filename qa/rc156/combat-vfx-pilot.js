/* Unpublished RC156 opt-in trial: Hwando and memory gunner BASIC A only.
 * Native reducers, routes, sprite poses, render metadata and physics still run.
 * Decorative state lives only in this private closure; combat RNG is not read.
 */
(function(root){'use strict';
 const finite=Number.isFinite,clamp=v=>Math.max(0,Math.min(1,v));
 const styles=Object.freeze({hwando:{color:'#eff5ff',edge:'#a1bacd',shape:'cut'},gunner:{color:'#98efff',edge:'#479bd5',shape:'pierce'}});
 function create({enabled=false,project,plans,anchor}){
  if(typeof project!=='function'||typeof plans!=='function'||typeof anchor!=='function')throw Error('Trial requires native projection, delivery routes and authored weapon anchors');
  const worlds=new WeakMap();let flag=enabled===true;
  const totals={flights:0,hits:0,duplicate:0,declined:0,unresolvedAnchors:0,retired:0,effectCalls:0,basicCalls:0,nativeEffectCalls:0};
  const scope=s=>flag&&!s?.egoGuardianRC155?.active&&!!styles[s?.activeHeroId];
  function memory(s){let m=worlds.get(s);if(!m||m.zone!==s.zone||s.time<m.time){m={zone:s.zone,time:s.time,hits:[],seen:new Set(),flights:[]};worlds.set(s,m);}m.time=s.time;m.hits=m.hits.filter(h=>s.time-h.born<.22-1e-8);return m;}
  const own=(s,e)=>scope(s)&&!e?.partySlotV31322&&!(e?.collabKey||e?.collabSkillVfx||e?.reflected)&&String(e?.deliveryHeroV31322??e?.heroId31213??e?.heroIdV31313??e?.heroIdV31225??e?.impactHeroIdV31315??e?.deliverySeedV31322?.heroId)===s.activeHeroId&&String(e?.deliveryKeyV31322??e?.skillActionKey??e?.heroActionKey31213??e?.deliverySeedV31322?.key??'').toUpperCase()==='A';
  // Deterministic decoration hash has no relationship to the native RNG stream.
  const noise=(key,i)=>{let x=2166136261;for(const c of String(key)+':'+i)x=Math.imul(x^c.charCodeAt(0),16777619);return(x>>>0)/4294967296;};
  function record(s,target,row,source){
   if(!scope(s)||source?.partySlotV31322||source?.collabKey||String(source?.actionKey??'').toUpperCase()!=='A'||row?.kind!=='OUTGOING'||row.attackerHeroId!==s.activeHeroId||row.result!=='HIT'||!(row.appliedDamage>0)||![s.time,target?.x,target?.y].every(finite)){totals.declined++;return false;}
   const m=memory(s),key=row.epoch+':'+row.sequence;if(m.seen.has(key)){totals.duplicate++;return false;}m.seen.add(key);while(m.seen.size>256)m.seen.delete(m.seen.values().next().value);
   let route=null;for(const e of s.effects??[])if(own(s,e))for(const r of e.deliveryRoutesV31322??[])if(String(r.strikeId)===String(source.id))route={e,r};
   // Only actual native routed contacts are presented: unresolved/support calls
   // stay in their original feedback path rather than manufacturing an impact.
   if(!route){totals.declined++;return false;}
   const p=project(target.x,target.y),x=p.x+route.r.endOffsetX,y=p.y+route.r.endOffsetY,a=anchor(route.e,route.r,s.time),dx=x-(a?.x??p.x),dy=y-(a?.y??p.y);
   if(!a||![x,y,dx,dy].every(finite)){totals.unresolvedAnchors++;return false;}
   m.hits.push({key,sourceId:String(source.id),targetId:String(target.id),hero:s.activeHeroId,born:row.time,x,y,angle:Math.atan2(dy,dx),world:{x:target.x,y:target.y},particles:Array.from({length:4},(_,i)=>({angle:(noise(key,i)-.5)*1.2,speed:26+noise(key,i+4)*30}))});if(m.hits.length>16)m.hits.shift();totals.hits++;return true;
  }
  function line(ctx,a,b,width,color,alpha=1){ctx.strokeStyle=color;ctx.globalAlpha*=alpha;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  // These widths are native projected canvas units for this two-hero trial.
  // A dark edge plus a light core stays legible on both floor and enemy art;
  // reducedFlash keeps that local contrast without a screen flash or shake.
  function outlinedLine(ctx,a,b,width,color){line(ctx,a,b,width+3,'#17242f');line(ctx,a,b,width,color);}
  function flight(ctx,cache,e,time,settings,s){
   if(!own(s,e)||!e.deliveryRoutesV31322?.length||e.damageHitV31315||e.heroHitVfxV31315)return false;
   const style=styles[s.activeHeroId],rows=plans(e,time),m=memory(s);m.flights=[];
   ctx.save();try{ctx.filter='none';ctx.shadowBlur=0;ctx.globalCompositeOperation='source-over';ctx.lineCap='round';ctx.lineJoin='round';
    for(const p of rows.slice(0,16)){const r=p.route,a=anchor(e,r,time,cache);if(!a){totals.unresolvedAnchors++;continue;}const start=r.born,u=clamp((time-start)/Math.max(.001,r.at-start));if(time<start||time>=r.at)continue;const dx=p.end.x-a.x,dy=p.end.y-a.y,length=Math.hypot(dx,dy);if(!(length>.001))continue;const ux=dx/length,uy=dy/length,tip={x:a.x+dx*u,y:a.y+dy*u},tail=Math.min(length*u,s.activeHeroId==='gunner'?44:76),baseAlpha=settings.reducedFlash?.88:.96;
     ctx.save();ctx.globalAlpha*=baseAlpha;const nx=-uy,ny=ux;
     // Keep the native crescent/projectile underneath this weapon-aligned cue.
     // The old faint taper erased the crescent and the gunner cue appeared only
     // in the final90ms. Now the cue spans the actual born -> contact interval.
     if(s.activeHeroId==='hwando'){const width=4+4*Math.sin(Math.PI*u);ctx.fillStyle=style.color;ctx.strokeStyle='#17242f';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(tip.x,tip.y);ctx.lineTo(tip.x-ux*tail*.45+nx*width,tip.y-uy*tail*.45+ny*width);ctx.lineTo(tip.x-ux*tail,tip.y-uy*tail);ctx.lineTo(tip.x-ux*tail*.45-nx*width,tip.y-uy*tail*.45-ny*width);ctx.closePath();ctx.stroke();ctx.fill();}else{outlinedLine(ctx,{x:tip.x-ux*tail,y:tip.y-uy*tail},tip,3.8,style.color);}
     const launchAge=time-start,launchAlpha=clamp(1-launchAge/Math.min(.10,Math.max(.016,r.at-start)));if(launchAlpha>0){ctx.save();ctx.globalAlpha*=launchAlpha;outlinedLine(ctx,{x:a.x-ux*2,y:a.y-uy*2},{x:a.x+ux*11,y:a.y+uy*11},3.5,style.color);ctx.restore();}ctx.restore();
     m.flights.push({sourceId:String(r.strikeId),hero:s.activeHeroId,at:time,worldStart:{x:r.x,y:r.y},worldEnd:{x:r.tx,y:r.ty},start:{x:a.x,y:a.y},end:{...p.end},tip,angle:Math.atan2(dy,dx),u,anchorPath:a.path??null});totals.flights++;
    }
   }finally{ctx.restore();}return true;
  }
  function drawHits(ctx,s,actor,time,settings={}){
   if(!scope(s))return false;const rows=memory(s).hits.filter(h=>h.targetId===String(actor.id));if(!rows.length)return false;
   ctx.save();try{ctx.filter='none';ctx.shadowBlur=0;ctx.globalCompositeOperation='source-over';ctx.lineCap='round';
    for(const h of rows){const age=time-h.born;if(age<0||age>=.22-1e-8)continue;const style=styles[h.hero],alpha=(1-age/.22),core=clamp(1-age/.14);ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.angle);ctx.globalAlpha*=settings.reducedFlash?.88:.96;
     if(core>0){ctx.save();ctx.globalAlpha*=core;outlinedLine(ctx,{x:-9,y:0},{x:h.hero==='gunner'?18:15,y:0},3.5,style.color);if(h.hero==='hwando')outlinedLine(ctx,{x:3,y:-12},{x:-3,y:12},3,style.color);ctx.restore();}
     ctx.globalAlpha*=alpha;const count=settings.lowFx?1:4;for(const p of h.particles.slice(0,count)){const x=Math.cos(p.angle)*p.speed*age,y=Math.sin(p.angle)*p.speed*age;outlinedLine(ctx,{x,y},{x:x-Math.cos(p.angle)*6,y:y-Math.sin(p.angle)*6},1.7,style.edge);}ctx.restore();
    }
   }finally{ctx.restore();}return true;
  }
  // Every native effect, including the original crescent and contact artwork,
  // paints exactly once. The trial adds only its private, bounded cue afterward.
  function drawEffect(native,ctx,cache,e,time,settings,s){totals.effectCalls++;const value=native(ctx,cache,e,time,settings);totals.nativeEffectCalls++;if(own(s,e)&&!!e.deliveryRoutesV31322?.length&&!e.damageHitV31315&&!e.heroHitVfxV31315){totals.basicCalls++;flight(ctx,cache,e,time,settings,s);}return value;}
  return Object.freeze({setEnabled:value=>{flag=value===true;},record,drawEffect,drawHits,scope,noise,snapshot:s=>({enabled:flag,scope:scope(s),maxHits:16,maxParticles:64,totals:{...totals},hits:memory(s).hits.map(h=>({...h,particles:h.particles.map(p=>({...p}))})),flights:memory(s).flights.map(p=>({...p}))})});
 }
 root.__HAPIL_VFX_PILOT_RC156__=Object.freeze({create,styles});if(typeof module!=='undefined'&&module.exports)module.exports={create,styles};
})(typeof window!=='undefined'?window:globalThis);
