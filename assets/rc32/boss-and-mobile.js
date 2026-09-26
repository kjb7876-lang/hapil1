/* RC32: bespoke boss beams, resonance-defended black holes, and light mobile rendering. */
(()=>{'use strict';
 const VERSION='3.32',BEAM_ROOT='./assets/vfx/rc32/boss-lasers/',CUSTOM={
  'dist00-boss':'dist00-boss.webp','dist06-boss':'dist06-boss.webp','a11-boss':'a11-boss.webp','a11-cosmic-v31318':'a11-cosmic-v31318.webp',
  'b02-boss':'b02-boss.webp','b03-boss':'b03-boss.webp','b04-boss':'b04-boss.webp','b05-boss':'b05-boss.webp','b06-boss':'b06-boss.webp','b06b-boss':'b06b-boss.webp','b07-boss':'b07-boss.webp','b08-boss':'b08-boss.webp','b09-boss':'b09-boss.webp',
  'u203-boss':'u203-boss.webp','l301-boss':'l301-boss.webp','l303-boss':'l303-boss.webp','h103-boss':'h103-boss.webp','k103-boss':'k103-boss.webp','c102-boss':'c102-boss.webp','c103-boss':'c103-boss.webp','c104-boss':'c104-boss.webp','l305-boss':'l305-boss.webp',
  'kair-great-01':'kair-great-01.webp','kair-great-02':'kair-great-02.webp','kair-great-03':'kair-great-03.webp','kair-great-04':'kair-great-04.webp','kair-great-05':'kair-great-05.webp','kair-great-06':'kair-great-06.webp'
 };
 const ownerBeam=new Map(Object.entries(CUSTOM).map(([id,file])=>[id,BEAM_ROOT+file]));
 const BLACKHOLE_ROOT='./assets/vfx/rc32/blackholes/',BLACKHOLE_STYLE=Object.freeze({
  'dist00-boss':'infernal','dist06-boss':'infernal',
  'a11-boss':'celestial','a11-cosmic-v31318':'celestial',
  'kair-great-01':'celestial','kair-great-02':'celestial','kair-great-03':'celestial','kair-great-04':'celestial','kair-great-05':'celestial','kair-great-06':'celestial',
  'b02-boss':'sinful','b03-boss':'sinful','b04-boss':'sinful','b05-boss':'sinful','b06-boss':'sinful','b06b-boss':'sinful','b07-boss':'sinful','b08-boss':'sinful','b09-boss':'sinful'
 }),blackholeImages=new Map(),blackholeRetryAfter=new Map();
 const STORY_SHA='76724b81e682cd745c955382ed240d857eda52e3a4e91fd1d723930b71d72bc7';
 const stats={beamsRouted:0,blueCoreSuppressed:0,blackholesSpawned:0,blackholeImageDraws:0,blackholeImagesReady:0,blackholeImageFailures:0,pullSteps:0,resonanceBlocks:0,drawErrors:0,tickErrors:0,textCorrections:0};
 const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d,clamp=(v,a,b)=>Math.max(a,Math.min(b,num(v,a)));
 const guarded=s=>window.__HAPIL_CHANNEL_V31364__?.active?.(s)===true;
 function install(attempt=0){
  if(window.__HAPIL_RC32__?.installed)return;
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
   try{drawBlackholes(ctx,cache,state,opts);}catch(error){stats.drawErrors++;}
   return result;
  };
  const originalTick=api.tick;
  api.tick=function(state,dt,...rest){const result=originalTick.call(this,state,dt,...rest);try{tickBlackholes(state,dt);}catch(error){stats.tickErrors++;}return result;};
  const originalBloodDraw=blood.draw;
  blood.draw=function(ctx,cache,state,cast,settings={}){
   if(cast&&(cast.sourceId==='a11-cosmic-v31318'||cast.ownerIdV31331==='a11-cosmic-v31318'||state?.enemies?.some(actor=>actor.id===cast.sourceId&&actor.cosmicLuciferV31318)))cast.beam=ownerBeam.get('a11-cosmic-v31318');
   return originalBloodDraw.call(this,ctx,cache,state,cast,settings);
  };
  window.__HAPIL_RC32__=Object.freeze({installed:true,version:VERSION,customBossBeams:routed,owners:Object.freeze([...ownerBeam.keys()]),blackholeStyles:BLACKHOLE_STYLE,fixText,stats:()=>({...stats})});
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
  const holes=s.bossBlackHolesRC32??(s.bossBlackHolesRC32=[]),next=s.bossBlackHoleNextRC32??(s.bossBlackHoleNextRC32=Object.create(null));
  s.bossBlackHolesRC32=holes.filter(h=>h.endAt>now&&(s.enemies??[]).some(a=>a.id===h.sourceId&&a.hp>0));
  const live=s.bossBlackHolesRC32;
  for(const actor of (s.enemies??[])){
   if(!actor?.boss||actor.hp<=0||actor.visualOnly||actor.objectiveStructureV31238||actor.protectedNarrativeTargetV31307)continue;
   if(!Number.isFinite(next[actor.id]))next[actor.id]=now+8+(hash(actor.id)%6);
   if(now<next[actor.id]||live.some(h=>h.sourceId===actor.id)||live.some(h=>h.fireAt<=now&&h.endAt>now))continue;
   const owner=window.__HAPIL_LASERS_V31330__?.owners?.find(o=>o.id===actor.id);
   const color=owner?.color||actor.bossColor||actor.color||actor.accent||'#a98bff';
   const dx=num(s.moveVx),dy=num(s.moveVy),lead=Math.min(.8,Math.hypot(dx,dy)*.2);
   const style=BLACKHOLE_STYLE[actor.id]||'abyssal';
   const hole={id:s.fxSerial++,sourceId:actor.id,zone:s.zone,born:now,fireAt:now+1.25,endAt:now+4.35,x:clamp(s.x+dx*lead,1.5,30.5),y:clamp(s.y+dy*lead,1.5,30.5),radius:5.0,color,accent:owner?.accent||'#f8f1ff',sprite:BLACKHOLE_ROOT+style+'.webp',label:actor.name||owner?.name||'보스 블랙홀'};
   live.push(hole);loadBlackholeImage(hole.sprite);next[actor.id]=hole.endAt+15+(hash(actor.id+':rc32')%8);stats.blackholesSpawned++;break;
  }
  for(const h of live){
   const distance=Math.hypot(s.x-h.x,s.y-h.y);
   if(now<h.fireAt||now>=h.endAt||distance>h.radius||distance<.45)continue;
   if(guarded(s)){h.guardedUntil=now+.14;stats.resonanceBlocks++;continue;}
   const dx=h.x-s.x,dy=h.y-s.y,d=Math.hypot(dx,dy),speed=2.1*Math.max(.22,Math.min(1,d/h.radius)),amount=Math.min(d-.35,speed*step);
   s.x=clamp(s.x+dx/d*amount,1,31);s.y=clamp(s.y+dy/d*amount,1,31);s.moveVx=0;s.moveVy=0;stats.pullSteps++;
  }
 }
 function loadBlackholeImage(path){
  if(!path||typeof window.Image!=='function')return null;
  const loaded=blackholeImages.get(path);if(loaded)return loaded;
  const failedAt=blackholeRetryAfter.get(path)||0;if(Date.now()-failedAt<1500)return null;
  try{
   const image=new window.Image();image.decoding='async';image.loading='eager';image.fetchPriority='high';blackholeImages.set(path,image);
   image.onload=()=>{if(image.naturalWidth>0)stats.blackholeImagesReady++;};
   image.onerror=()=>{stats.blackholeImageFailures++;blackholeImages.delete(path);blackholeRetryAfter.set(path,Date.now());};
   const base=window.document?.baseURI||window.location?.href||'http://localhost/';
   image.src=new URL(path+'?v=33201',base).href;
   return image;
  }catch{blackholeImages.delete(path);return null;}
 }
 function drawBlackholes(ctx,cache,s,settings){
  if(!ctx||!s?.bossBlackHolesRC32?.length||!window.__HAPIL_COMBAT_V31333__?.core)return;
  const project=p=>window.__HAPIL_COMBAT_V31333__.core(p);
  for(const h of s.bossBlackHolesRC32){
   if(h.endAt<=s.time)continue;
   const a=project({x:h.x,y:h.y}),px=project({x:h.x+1,y:h.y}),py=project({x:h.x,y:h.y+1});if(!a||!px||!py)continue;
   const rx=h.radius*Math.hypot(px.x-a.x,py.x-a.x),ry=h.radius*Math.hypot(px.y-a.y,py.y-a.y);
   const warn=s.time<h.fireAt,blocked=num(h.guardedUntil)>s.time,progress=clamp((s.time-h.fireAt)/Math.max(.01,h.endAt-h.fireAt),0,1),pulse=1+Math.sin(s.time*6)*.035;
   const cx=a.x,cy=a.y+54,low=settings?.lowFx===true,image=loadBlackholeImage(h.sprite||BLACKHOLE_ROOT+'abyssal.webp');
   ctx.save();try{
    ctx.globalCompositeOperation='screen';ctx.globalAlpha=warn?.64:low?.76:.92;
    if(blocked)ctx.globalAlpha=.98;
    if(image?.complete&&image.naturalWidth>0&&typeof ctx.drawImage==='function'){
     const scale=(warn?.91+progress*.09:1)*pulse;ctx.save();
     try{ctx.translate(cx,cy);ctx.rotate(s.time*.16);ctx.drawImage(image,-rx*.88*scale,-ry*.88*scale,rx*1.76*scale,ry*1.76*scale);stats.blackholeImageDraws++;}
     finally{ctx.restore();}
    }
    // One thin perimeter communicates pull range; the black-hole artwork is the effect itself.
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=blocked?.88:warn?.36:.52;
    ctx.strokeStyle=blocked?'#fff0ac':h.color;ctx.lineWidth=warn?1.5:1.25;ctx.setLineDash(warn?[7,8]:[3,6]);
    ctx.beginPath();ctx.ellipse(cx,cy,rx*pulse,ry*pulse,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
   }finally{ctx.restore();}
  }
 }
 const fixText=value=>String(value??'').replace(/그들을(?=\s*(?:ID\s*\(\s*이드\s*\)|이드))/g,'그들은');
 function copyWithCorrectedText(value){
  if(typeof value==='string')return fixText(value);
  if(!value||typeof value!=='object')return value;
  const copy=Array.isArray(value)?[]:{};let changed=false;
  for(const [key,item] of Object.entries(value)){const next=copyWithCorrectedText(item);copy[key]=next;if(next!==item)changed=true;}
  return changed?copy:value;
 }
 function patchStorySources(attempt=0){
  for(const key of Object.keys(window)){
   if(!/(?:STORY_DATA|PATIENT_DATA|NARRATIVE_V395__)/.test(key))continue;
   const value=window[key];if(!value||typeof value!=='object')continue;
   try{const copy=copyWithCorrectedText(value);if(copy!==value){if(key==='__HAPIL_STORY_DATA_V31300__'&&copy.interlude?.sourceFile==='INTERLUDE_FINAL_KO.txt')copy.interlude={...copy.interlude,sourceSha256:STORY_SHA};window[key]=copy;stats.textCorrections++;}}catch{}
  }
  if(attempt<40)setTimeout(()=>patchStorySources(attempt+1),100);
 }
 function patchTextNode(node){if(node?.nodeType!==3)return;const next=fixText(node.nodeValue);if(next!==node.nodeValue){node.nodeValue=next;stats.textCorrections++;}}
 function scanText(root){
  if(!root)return;
  if(root.nodeType===3){patchTextNode(root);return;}
  if(root.nodeType===1&&/^(SCRIPT|STYLE|TEXTAREA|INPUT)$/i.test(root.tagName||''))return;
  for(const child of root.childNodes||[])scanText(child);
 }
 function installNarrativeTextFix(attempt=0){
  patchStorySources();
  const doc=window.document,root=doc?.documentElement;
  if(root){scanText(root);if(!root.__hapilRc32TextObserver&&typeof window.MutationObserver==='function'){
   const observer=new window.MutationObserver(records=>{for(const r of records){if(r.type==='characterData')patchTextNode(r.target);else for(const n of r.addedNodes||[])scanText(n);}});
   observer.observe(root,{subtree:true,childList:true,characterData:true});root.__hapilRc32TextObserver=observer;
  }}
  const proto=window.CanvasRenderingContext2D?.prototype;
  if(proto&&!proto.__hapilRc32TextWrapped){
   for(const method of ['fillText','strokeText']){const original=proto[method];if(typeof original!=='function')continue;proto[method]=function(text,...args){const fixed=fixText(text);if(fixed!==String(text))stats.textCorrections++;return original.call(this,fixed,...args);};}
   proto.__hapilRc32TextWrapped=true;
  }
 }
 function hash(value){let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0)%997;}
 install();installNarrativeTextFix();
})();
