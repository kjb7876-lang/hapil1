/* Unpublished RC156 opt-in trial: Hwando and memory gunner BASIC A only.
 * Native paint/reducers/poses/routes run unchanged. Existing art bytes are not
 * edited; this closure adds bounded, weapon-aligned raster presentation only.
 */
(function(root){'use strict';
 const finite=Number.isFinite,clamp=v=>Math.max(0,Math.min(1,v));
 const art=Object.freeze({
  hwando:Object.freeze({flight:'./assets/vfx/heroes/hwando-a.webp',contact:'./assets/vfx/heroes/hwando-q.webp',heading:Math.PI,pivot:Object.freeze([.25,.50]),contactHeading:Math.PI/2,contactPivot:Object.freeze([.43,.88]),size:100,contactSize:82}),
  gunner:Object.freeze({flight:'./assets/vfx/heroes/gunner-a.webp',contact:'./assets/vfx/generated/v31307/hero-impacts/gunner-memory-impact.webp',heading:Math.PI*.75,pivot:Object.freeze([.28,.70]),contactHeading:0,contactPivot:Object.freeze([.48,.51]),size:72,contactSize:66})
 });
 const styles=art;
 function create({enabled=false,project,plans,anchor,image}){
  if(typeof project!=='function'||typeof plans!=='function'||typeof anchor!=='function'||typeof image!=='function')throw Error('Trial requires native projection, delivery routes, authored weapon anchors and existing raster lookup');
  const worlds=new WeakMap(),paintRows=[];let flag=enabled===true;
  const totals={flights:0,hits:0,duplicate:0,declined:0,unresolvedAnchors:0,retired:0,effectCalls:0,basicCalls:0,nativeEffectCalls:0,assetDraws:0,missingAssets:0};
  const scope=s=>flag&&!s?.egoGuardianRC155?.active&&!!art[s?.activeHeroId];
  function memory(s){let m=worlds.get(s);if(!m||m.zone!==s.zone||s.time<m.time){m={zone:s.zone,time:s.time,hits:[],seen:new Set(),flights:[]};worlds.set(s,m);}m.time=s.time;m.hits=m.hits.filter(h=>s.time-h.born<.22-1e-8);return m;}
  const own=(s,e)=>scope(s)&&!e?.partySlotV31322&&!(e?.collabKey||e?.collabSkillVfx||e?.reflected)&&String(e?.deliveryHeroV31322??e?.heroId31213??e?.heroIdV31313??e?.heroIdV31225??e?.impactHeroIdV31315??e?.deliverySeedV31322?.heroId)===s.activeHeroId&&String(e?.deliveryKeyV31322??e?.skillActionKey??e?.heroActionKey31213??e?.deliverySeedV31322?.key??'').toUpperCase()==='A';
  // Decoration uses its own stable hash, never the native combat RNG.
  const noise=(key,i)=>{let x=2166136261;for(const c of String(key)+':'+i)x=Math.imul(x^c.charCodeAt(0),16777619);return(x>>>0)/4294967296;};
  const reduced=settings=>settings.reducedMotion===true||root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;
  function record(s,target,row,source){
   if(!scope(s)||source?.partySlotV31322||source?.collabKey||String(source?.actionKey??'').toUpperCase()!=='A'||row?.kind!=='OUTGOING'||row.attackerHeroId!==s.activeHeroId||row.result!=='HIT'||!(row.appliedDamage>0)||![s.time,target?.x,target?.y].every(finite)){totals.declined++;return false;}
   const m=memory(s),key=row.epoch+':'+row.sequence;if(m.seen.has(key)){totals.duplicate++;return false;}m.seen.add(key);while(m.seen.size>256)m.seen.delete(m.seen.values().next().value);
   let route=null;for(const e of s.effects??[])if(own(s,e))for(const r of e.deliveryRoutesV31322??[])if(String(r.strikeId)===String(source.id))route={e,r};
   if(!route){totals.declined++;return false;}
   const p=project(target.x,target.y),x=p.x+route.r.endOffsetX,y=p.y+route.r.endOffsetY,a=anchor(route.e,route.r,s.time),dx=x-(a?.x??p.x),dy=y-(a?.y??p.y);
   if(!a||![x,y,dx,dy].every(finite)){totals.unresolvedAnchors++;return false;}
   m.hits.push({key,sourceId:String(source.id),targetId:String(target.id),hero:s.activeHeroId,born:row.time,x,y,angle:Math.atan2(dy,dx),assetId:art[s.activeHeroId].contact,spawnSource:'qa-rc156-two-hero-contact',world:{x:target.x,y:target.y},particles:Array.from({length:4},(_,i)=>({angle:(noise(key,i)-.5)*1.2,speed:26+noise(key,i+4)*30}))});if(m.hits.length>16)m.hits.shift();totals.hits++;return true;
  }
  // Preserve the entire original raster and its aspect ratio. The source pivot
  // is attached to the actual native muzzle, route head, or committed contact.
  // There is deliberately no geometric replacement when a texture is missing.
  function sprite(ctx,cache,path,point,angle,heading,pivot,size,alpha,role='texture'){
   if(!(alpha>0)||![point.x,point.y,angle,heading,size].every(finite)||size<=0)return false;
   const im=image(path,cache),canvas=typeof im?.getContext==='function',w=canvas?im.width:(im?.naturalWidth||im?.width),h=canvas?im.height:(im?.naturalHeight||im?.height);
   if(!im||im.complete===false||!(w>0&&h>0)){totals.missingAssets++;return false;}
   const height=size*h/w;ctx.save();try{ctx.translate(point.x,point.y);ctx.rotate(angle-heading);ctx.globalAlpha*=clamp(alpha);ctx.drawImage(im,0,0,w,h,-pivot[0]*size,-pivot[1]*height,size,height);const m=ctx.getTransform?.();paintRows.push({role,assetId:path,actualSource:im.src??null,sourceSize:[w,h],sourceRect:[0,0,w,h],point:{...point},angle,sourceHeading:heading,sourcePivot:[...pivot],size:[size,height],alpha:ctx.globalAlpha,transform:m?{a:m.a,b:m.b,c:m.c,d:m.d,e:m.e,f:m.f}:null});if(paintRows.length>32)paintRows.shift();totals.assetDraws++;}finally{ctx.restore();}return true;
  }
  function flight(ctx,cache,e,time,settings,s){
   if(!own(s,e)||!e.deliveryRoutesV31322?.length||e.damageHitV31315||e.heroHitVfxV31315)return false;
   const style=art[s.activeHeroId],rows=plans(e,time),m=memory(s);m.flights=[];
   ctx.save();try{ctx.filter='none';ctx.shadowBlur=0;ctx.globalCompositeOperation='source-over';
    for(const p of rows.slice(0,16)){const r=p.route,a=anchor(e,r,time,cache);if(!a){totals.unresolvedAnchors++;continue;}const start=r.born,u=clamp((time-start)/Math.max(.001,r.at-start));if(time<start||time>=r.at)continue;const dx=p.end.x-a.x,dy=p.end.y-a.y,length=Math.hypot(dx,dy);if(!(length>.001))continue;const angle=Math.atan2(dy,dx),tip={x:a.x+dx*u,y:a.y+dy*u},quiet=reduced(settings),alpha=settings.reducedFlash?.70:.86;
     // The silver crescent contains its own curved, textured taper. Uniform
     // scale grows through the cut then contracts; no straight-line imitation.
     // The memory bullet keeps its round core and angular original fragments.
     const size=style.size*(s.activeHeroId==='hwando'?.76+.30*Math.sin(Math.PI*u):1);
     const echoes=settings.lowFx||quiet?0:s.activeHeroId==='hwando'?2:1;
     for(let i=echoes;i>0;i--){const lag=s.activeHeroId==='hwando'?.025*i:.016*i,v=clamp(u-lag/Math.max(.001,r.at-start));if(v>=u||v===0)continue;sprite(ctx,cache,style.flight,{x:a.x+dx*v,y:a.y+dy*v},angle,style.heading,style.pivot,size*(1-.06*i),alpha*.18/i,'afterimage');}
     const drawn=sprite(ctx,cache,style.flight,tip,angle,style.heading,style.pivot,size,alpha,'flight');
     const launchAge=time-start,launchAlpha=clamp(1-launchAge/Math.min(.08,Math.max(.016,r.at-start)));if(launchAlpha>0)sprite(ctx,cache,style.contact,a,angle,style.contactHeading,style.contactPivot,s.activeHeroId==='hwando'?30:24,launchAlpha*.36,'release');
     m.flights.push({sourceId:String(r.strikeId),hero:s.activeHeroId,at:time,worldStart:{x:r.x,y:r.y},worldEnd:{x:r.tx,y:r.ty},start:{x:a.x,y:a.y},end:{...p.end},tip,angle,u,anchorPath:a.path??null,assetId:style.flight,sourceHeading:style.heading,sourcePivot:[...style.pivot],drawn,spawnSource:'qa-rc156-two-hero-flight'});totals.flights++;
    }
   }finally{ctx.restore();}return true;
  }
  function drawHits(ctx,s,actor,time,settings={},cache){
   if(!scope(s))return false;const rows=memory(s).hits.filter(h=>h.targetId===String(actor.id));if(!rows.length)return false;
   ctx.save();try{ctx.filter='none';ctx.shadowBlur=0;ctx.globalCompositeOperation='source-over';
    for(const h of rows){const age=time-h.born;if(age<0||age>=.22-1e-8)continue;const style=art[h.hero],alpha=clamp(1-age/.22),core=clamp(1-age/.14),quiet=reduced(settings),point={x:h.x,y:h.y};
     if(core>0)sprite(ctx,cache,style.contact,point,h.hero==='hwando'?h.angle:0,style.contactHeading,style.contactPivot,style.contactSize*(1+.10*age/.14),core*(settings.reducedFlash?.58:.78),'contact');
     // A faint copy of the actual texture closes the contact naturally after
     // the core. Low/reduced-motion modes keep the contact at its exact point.
     if(age>=.10)sprite(ctx,cache,style.contact,point,h.hero==='hwando'?h.angle:0,style.contactHeading,style.contactPivot,style.contactSize,alpha*.22,'contact-tail');
     if(!quiet&&!settings.lowFx)for(const p of h.particles){const d=p.speed*age,angle=h.angle+p.angle,point={x:h.x+Math.cos(angle)*d,y:h.y+Math.sin(angle)*d};sprite(ctx,cache,style.contact,point,angle,style.contactHeading,style.contactPivot,8+4*alpha,alpha*.18,'contact-fragment');}
    }
   }finally{ctx.restore();}return true;
  }
  function drawEffect(native,ctx,cache,e,time,settings,s){totals.effectCalls++;const value=native(ctx,cache,e,time,settings);totals.nativeEffectCalls++;if(own(s,e)&&!!e.deliveryRoutesV31322?.length&&!e.damageHitV31315&&!e.heroHitVfxV31315){totals.basicCalls++;flight(ctx,cache,e,time,settings,s);}return value;}
  return Object.freeze({setEnabled:value=>{flag=value===true;},record,drawEffect,drawHits,scope,noise,snapshot:s=>({enabled:flag,scope:scope(s),maxHits:16,maxParticles:64,draws:paintRows.map(r=>({...r,point:{...r.point},transform:r.transform?{...r.transform}:null,sourceRect:[...r.sourceRect],sourceSize:[...r.sourceSize],sourcePivot:[...r.sourcePivot],size:[...r.size]})),totals:{...totals},hits:memory(s).hits.map(h=>({...h,particles:h.particles.map(p=>({...p}))})),flights:memory(s).flights.map(p=>({...p}))})});
 }
 root.__HAPIL_VFX_PILOT_RC156__=Object.freeze({create,styles,art});if(typeof module!=='undefined'&&module.exports)module.exports={create,styles,art};
})(typeof window!=='undefined'?window:globalThis);
