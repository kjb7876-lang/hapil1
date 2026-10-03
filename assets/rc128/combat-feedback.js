/* RC128: deterministic, bounded presentation driven by accepted combat results.
 * Native timeStopUntil is used for brief ENEMY-side impact pauses, never player speed.
 * No HP, damage formula, projectile geometry, save progress or PRNG is changed here.
 */
(function(root){
 'use strict';
 const n=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?v:d;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const now=()=>typeof performance!=='undefined'?performance.now()/1000:Date.now()/1000;
 const HEROES=Object.freeze({
  hwando:Object.freeze({name:'환도',color:'#ec5267',accent:'#fff0ed',dark:'#210e18',motif:'blade',sound:'slash'}),
  seoha:Object.freeze({name:'윤서하',color:'#8bd9f4',accent:'#f2fcff',dark:'#10202c',motif:'needle',sound:'arcane'}),
  neon:Object.freeze({name:'네온',color:'#ec65d4',accent:'#72f8ee',dark:'#21152f',motif:'glitch',sound:'arcane'}),
  michaela:Object.freeze({name:'미카엘라',color:'#ecd994',accent:'#c5a3f6',dark:'#281d2c',motif:'wings',sound:'arcane'}),
  lauren:Object.freeze({name:'라우렌',color:'#b996e9',accent:'#e3a1b5',dark:'#281429',motif:'sigil',sound:'arcane'}),
  hunter:Object.freeze({name:'헌터',color:'#d5aa68',accent:'#f2ddd0',dark:'#2b2018',motif:'reticle',sound:'shot'}),
  slayer:Object.freeze({name:'슬레이어',color:'#e74750',accent:'#fac7b3',dark:'#250b10',motif:'execution',sound:'heavy'}),
  gunner:Object.freeze({name:'기억사수',color:'#9cd8d4',accent:'#d9c7ed',dark:'#182332',motif:'memory',sound:'shot'})
 });
 const states=new WeakMap(),cameras=new WeakMap(),fallbackPictures=new Map();
 const totals={events:0,accepted:0,discarded:0,throttled:0,pauses:0,frames:0,drawErrors:0,missingArt:0};
 let installed=false,attempts=0;
 function reduced(){return root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;}
 function state(s){
  let m=states.get(s);
  if(!m||m.zone!==s.zone||n(s.time)<m.worldTime-1e-8){
   if(m)releasePause(s,m,true);
   m={zone:s.zone,worldTime:n(s.time),effects:[],lastEpoch:-1,lastSequence:-1,
    windowAt:now(),budget:0,nextPause:0,pauseDeadline:0,ownedUntil:0,
    nextEffect:0,defensive:new Map(),shakeUntil:0,shake:0,settings:{},artMissing:new Set(),lastDraw:0};
   states.set(s,m);
  }
  m.worldTime=n(s.time);return m;
 }
 function releasePause(s,m,force=false){
  if(!(m.ownedUntil>0)||(!force&&now()<m.pauseDeadline))return;
  if(n(s.timeStopUntil)===m.ownedUntil)s.timeStopUntil=n(s.time);
  m.ownedUntil=0;m.pauseDeadline=0;
 }
 function continuous(row,source){
  return row?.source?.family==='laser'||!!(source?.dot||source?.isDot||source?.damageOverTime||source?.statusTick||source?.periodicDamage)||/bleed|poison-tick|burn-tick|damage-over-time/i.test(String(source?.kind??source?.tag??row?.reason??''));
 }
 function pause(s,m,seconds){
  const t=now();releasePause(s,m);
  if(!(seconds>0)||s.paused||s.pause||s.hp<=0||reduced()||m.settings.hitPause===false)return false;
  if(root.__HAPIL_PARTY_V31322__?.state===s&&root.__HAPIL_PARTY_V31322__?.status?.role==='guest')return false;
  if(t-m.windowAt>=1){m.windowAt=t;m.budget=0;}
  if(t<m.nextPause||m.budget+seconds>.09||n(s.timeStopUntil)>n(s.time))return false;
  m.budget+=seconds;m.nextPause=t+.105;
  m.ownedUntil=n(s.time)+seconds;m.pauseDeadline=t+seconds;
  s.timeStopUntil=m.ownedUntil;totals.pauses++;return true;
 }
 function sound(s,key,priority,gain,meta={}){root.__HAPIL_FEEDBACK_RC22__?.impact?.(s,{key,priority,gain,...meta});}
 function classify(s,target,row,source){
  if(!row||row.result==='ERROR'||row.result==='REJECTED'||row.result==='MISS')return null;
  if(row.kind==='REMOVAL'&&row.result==='CANCELLED')return {kind:'cancel',color:'#a3eee3',accent:'#eefaf8',label:'소거',power:.35,duration:.18,pause:0,sound:'guard',priority:1,outgoing:true};
  const outgoing=row.kind==='OUTGOING',incoming=row.kind==='CONTACT'&&row.targetId==='__host';
  if(!outgoing&&!incoming)return null;
  if(outgoing&&row.attackerHeroId!==s.activeHeroId)return null;
  const profile=HEROES[outgoing?(row.attackerHeroId||s.activeHeroId):s.activeHeroId]||HEROES.hwando;
  if(row.result==='HIT'&&n(row.appliedDamage)>0){
   const ratio=n(row.appliedDamage)/Math.max(1,n(row.hpBefore,1));
   const danger=incoming&&(ratio>=.2||n(row.hpAfter)/Math.max(1,n(s.maxHp,1))<.25);
   const crit=outgoing&&row.criticalRequested===true;
   const strong=outgoing&&(crit||row.defeated||ratio>=.12||source?.ultimate===true);
   const ranged=row.source?.family==='projectile'||['hunter','gunner','neon'].includes(row.attackerHeroId);
   return {kind:incoming?(danger?'danger':'hurt'):(crit?'critical':strong?'heavy':ranged?'shot':'hit'),
    color:incoming?(danger?'#ed7882':'#f4baa0'):profile.color,accent:profile.accent,
    label:incoming?(danger?'위험':row.before?.guardActive?'공명 방어':n(s.rc127Defense?.reduction)>0?'피해 감소':'피격'):(crit?'치명':strong?'강타':''),
    power:danger||strong?1:.55,duration:danger||strong?.3:.2,
    pause:continuous(row,source)?0:danger?.032:incoming?.014:crit?.026:strong?.036:ranged?.009:.014,
    sound:incoming?(danger?'heavy':'hurt'):strong?'heavy':profile.sound,priority:incoming?6:strong?4:2,
    boss:target?.boss===true,outgoing,hero:profile};
  }
  if(incoming&&['PARRY','SHIELD','INVULNERABLE','EVADE'].includes(row.result)){
   const samong=/samong/.test(row.reason??''),blink=row.before?.invulnerableUntil>row.time&&row.reason==='native-invulnerability'&&n(s.dashingUntil)>row.time,automatic=n(s.autoEvadeUntil31223)>row.time,parry=row.result==='PARRY';
   return {kind:parry?'parry':blink||automatic||row.result==='EVADE'?'dodge':samong?'dream-guard':'guard',color:samong?'#c4b6ee':parry?'#c3fff2':'#b5d8ee',accent:'#eafffc',label:parry?'PARRY':blink||automatic||row.result==='EVADE'?'회피':samong?'사몽 보호':row.result==='SHIELD'?'방어':'무적',power:.5,duration:.22,pause:0,sound:'guard',priority:3,outgoing:false,hero:profile};
  }
  return null;
 }
 function record(s,target,row,source){
  if(!s||!target||!row)return false;
  const m=state(s);totals.events++;
  if(row.epoch===m.lastEpoch&&row.sequence<=m.lastSequence){totals.discarded++;return false;}
  m.lastEpoch=row.epoch;m.lastSequence=row.sequence;
  const f=classify(s,target,row,source);if(!f){totals.discarded++;return false;}
  totals.accepted++;
  const t=now();
  if(!f.outgoing&&row.result!=='HIT'){const key=String(row.result)+'|'+String(row.reason)+'|'+String(row.source?.ownerId??row.source?.id??'contact'),last=m.defensive.get(key)??-1e9;if(t-last<(continuous(row,source)?.45:.18)){totals.throttled++;return false;}m.defensive.set(key,t);while(m.defensive.size>128)m.defensive.delete(m.defensive.keys().next().value);}
  if(t<m.nextEffect&&f.power<1){totals.throttled++;return false;}
  m.nextEffect=t+.025;
  m.effects.push({...f,x:n(target.x,n(s.x)),y:n(target.y,n(s.y)),born:t,sequence:row.sequence});
  if(m.effects.length>32)m.effects.splice(0,m.effects.length-32);
  pause(s,m,f.pause);
  if(!reduced()&&m.settings.shake!==false&&m.settings.screenShake!==false&&f.kind!=='guard'){
   m.shake=Math.max(m.shake,f.boss&&!f.outgoing?1.3:f.power>=1?1:.35);m.shakeUntil=t+.085;
  }
  sound(s,f.sound,f.priority,f.power>=1?.35:.24,{channel:f.outgoing?'enemy-hit':f.kind==='guard'?'guard':'ally-hurt',heroId:s.activeHeroId});
  return true;
 }
 function awakening(s,m){
  const f=state(s);pause(s,f,.06);sound(s,HEROES[m?.heroId]?.sound||'arcane',7,.42);
 }
 function point(s,x,y,cssWidth,cssHeight){
  const data=cameras.get(s),adaptive=root.__HAPIL_ADAPTIVE_RC125__;
  // Portrait has two native cameras. Never guess a world-to-screen mapping there.
  if(!data||!adaptive?.wide?.())return null;
  const p=data.project(x,y),v=adaptive.view(cssWidth,cssHeight),c=data.camera;
  if(!p||![p.x,p.y,c?.x,c?.y,c?.scale].every(Number.isFinite))return null;
  return{x:(c.x+p.x*c.scale-v.x)*v.k,y:(c.y+p.y*c.scale-v.y)*v.k,scale:c.scale*v.k};
 }
 function segment(ctx,x1,y1,x2,y2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
 function ring(ctx,r,a=0,b=Math.PI*2){ctx.beginPath();ctx.arc(0,0,r,a,b);ctx.stroke();}
 function motif(ctx,profile,r,t,compact){
  ctx.strokeStyle=profile.color;ctx.fillStyle=profile.color;ctx.lineWidth=compact?1.3:1.8;
  const count=compact?4:8,spin=reduced()?0:t*.45;
  ctx.save();ctx.rotate(spin);
  switch(profile.motif){
   case 'blade':
    for(let i=0;i<3;i++){ctx.save();ctx.rotate(i*Math.PI*.66);segment(ctx,-r*.7,-r*.25,r*.8,r*.2);ring(ctx,r*(.7+i*.09),-.65,.4);ctx.restore();}break;
   case 'needle':
    for(let i=0;i<4;i++){ctx.save();ctx.rotate(i*Math.PI/2);segment(ctx,0,-r*.2,0,-r);segment(ctx,-r*.1,-r*.65,0,-r);segment(ctx,r*.1,-r*.65,0,-r);ctx.restore();}ring(ctx,r*.48);break;
   case 'glitch':
    for(let i=0;i<count;i++){const a=i*Math.PI*2/count;ctx.save();ctx.rotate(a);ctx.strokeStyle=i%2?profile.accent:profile.color;ctx.strokeRect(r*.7,-r*.09,r*(.16+(i%3)*.04),r*.18);ctx.restore();}segment(ctx,-r,-r*.2,r*.7,-r*.2);break;
   case 'wings':
    ring(ctx,r*.55,-2.9,-.3);for(let k=-1;k<=1;k+=2)for(let i=0;i<(compact?3:5);i++){segment(ctx,k*r*.18,-r*.1+i*3,k*r*(.58+i*.08),-r*(.62-i*.15));}break;
   case 'sigil':
    ring(ctx,r);ring(ctx,r*.66);for(let i=0;i<5;i++){const a=i*Math.PI*2/5,b=(i+2)*Math.PI*2/5;segment(ctx,Math.cos(a)*r,Math.sin(a)*r,Math.cos(b)*r,Math.sin(b)*r);}break;
   case 'reticle':
    ring(ctx,r*.65);for(let i=0;i<4;i++){ctx.save();ctx.rotate(i*Math.PI/2);segment(ctx,r*.4,0,r,0);segment(ctx,r*.85,-r*.14,r*.85,r*.14);ctx.restore();}break;
   case 'execution':
    ctx.lineWidth=compact?2:3;segment(ctx,-r*.7,-r*.8,r*.55,r*.75);segment(ctx,r*.7,-r*.8,-r*.55,r*.75);segment(ctx,-r*.55,r*.75,0,r);segment(ctx,0,r,r*.55,r*.75);break;
   case 'memory':
    for(let i=0;i<3;i++){ctx.save();ctx.translate((i-1)*r*.14,(i-1)*r*.08);ctx.globalAlpha*=1-i*.18;ring(ctx,r*(.62+i*.12),.3,5.7);ctx.restore();}for(let i=0;i<3;i++){ctx.save();ctx.rotate(i*2.09);segment(ctx,r*.75,-r*.1,r*.94,0);segment(ctx,r*.94,0,r*.75,r*.1);ctx.restore();}break;
  }
  ctx.restore();
 }
 function drawAwakening(ctx,s,width,height,compact){
  const A=root.__HAPIL_SAMONG_RC91__;if(!A?.active?.(s))return;
  const m=s.samongPassiveRC91,profile=HEROES[m.heroId]||HEROES.hwando,t=clamp(n(m.duration,7)-n(m.active),0,9);
  const head=point(s,n(s.x),n(s.y),width,height),entry=Math.max(0,1-t/1.1),fade=Math.min(1,n(m.active)/.4);
  // A bounded edge tint leaves the middle of the battlefield unobscured.
  const vignette=ctx.createRadialGradient(width/2,height/2,Math.min(width,height)*.22,width/2,height/2,Math.max(width,height)*.65);
  vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(5,4,12,0.2)');ctx.globalAlpha=fade;ctx.fillStyle=vignette;ctx.fillRect(0,0,width,height);
  if(head){ctx.save();ctx.translate(head.x,head.y-8*head.scale);ctx.scale(1,.55);ctx.globalAlpha=.7*fade;motif(ctx,profile,clamp(54*head.scale,22,68),t,compact);if(entry>0&&!reduced()){ctx.globalAlpha=entry*.65;ctx.strokeStyle=profile.accent;ctx.lineWidth=1.4;ring(ctx,clamp(50*head.scale,20,70)*(1+t*1.7));}ctx.restore();}
  const badgeY=compact?height*.57:25,badgeX=compact?width*.72:width*.73;
  ctx.save();ctx.translate(badgeX,badgeY);ctx.globalAlpha=fade;
  if(compact||!head){ctx.save();ctx.translate(0,32);motif(ctx,profile,compact?19:26,t,true);ctx.restore();}
  ctx.textAlign='center';ctx.textBaseline='top';ctx.lineJoin='round';ctx.lineWidth=3;ctx.strokeStyle='#080a10';
  ctx.font=`bold ${compact?15:20}px "Noto Serif KR",serif`;ctx.fillStyle=profile.color;
  ctx.strokeText('死夢覺醒',0,0);ctx.fillText('死夢覺醒',0,0);
  ctx.font=`bold ${compact?10:12}px sans-serif`;ctx.fillStyle=profile.accent;
  const caption=profile.name+' · '+Math.max(0,n(m.active)).toFixed(1)+'초';
  const captionY=compact||!head?58:25;ctx.strokeText(caption,0,captionY);ctx.fillText(caption,0,captionY);ctx.restore();
  if(entry>0){
   const image=A.picture(m.heroId),w=compact?62:94,h=compact?94:142,x=width-w-12,y=compact?height*.61:64;
   ctx.save();ctx.globalAlpha=entry*.88;
   if(image){const fit=Math.min(w/image.naturalWidth,h/image.naturalHeight),iw=image.naturalWidth*fit,ih=image.naturalHeight*fit;ctx.drawImage(image,x+(w-iw)/2,y,iw,ih);}
   else{const hero=root.__HAPIL_RC95_NATIVE__?.heroes?.find(h=>h.id===m.heroId),own=hero?.sprite;if(own&&typeof Image!=='undefined'){if(!fallbackPictures.has(own)){const im=new Image();im.decoding='async';im.src=own;fallbackPictures.set(own,im);}const fallback=fallbackPictures.get(own);if(fallback.complete&&fallback.naturalWidth){const fit=Math.min(w/fallback.naturalWidth,h/fallback.naturalHeight);ctx.drawImage(fallback,x,y,fallback.naturalWidth*fit,fallback.naturalHeight*fit);}}const f=state(s);if(!f.artMissing.has(m.heroId)){f.artMissing.add(m.heroId);totals.missingArt++;}ctx.translate(x+w/2,y+h/2);motif(ctx,profile,w*.35,t,true);}
   ctx.restore();
  }
 }
 function draw(ctx,s,canvas,settings={}){
  if(!ctx||!s||!canvas)return false;
  const m=state(s),t=now();m.settings=settings||{};releasePause(s,m);
  const rect=canvas.getBoundingClientRect?.(),width=n(rect?.width,1280),height=n(rect?.height,720);
  if(!(width>0&&height>0))return false;
  const compact=width<600||height<320,limit=compact?8:24;
  m.effects=m.effects.filter(e=>t-e.born<e.duration).slice(-limit);
  ctx.save();
  try{
   ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);
   ctx.filter='none';ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.shadowBlur=0;
   ctx.lineCap='round';ctx.lineJoin='round';
   // Shake the composited picture by at most 1.3 CSS px. This does not move hitboxes.
   if(!reduced()&&settings.shake!==false&&settings.screenShake!==false&&t<m.shakeUntil){
    const amp=m.shake*clamp((m.shakeUntil-t)/.085,0,1),dx=Math.sin(t*130)*amp,dy=Math.cos(t*107)*amp*.6;
    ctx.save();ctx.beginPath();ctx.rect(3,3,Math.max(0,width-6),Math.max(0,height-6));ctx.clip();ctx.drawImage(canvas,0,0,canvas.width,canvas.height,dx,dy,width,height);ctx.restore();
   }else m.shake=0;
   drawAwakening(ctx,s,width,height,compact);
   for(const e of m.effects){
    const age=(t-e.born)/e.duration,alpha=1-clamp(age,0,1),p=point(s,e.x,e.y,width,height);
    ctx.save();ctx.globalAlpha=alpha*.85;ctx.strokeStyle=e.color;ctx.fillStyle=e.color;
    if(p){ctx.translate(p.x,p.y-22*p.scale);const r=(e.kind==='guard'?15:10+age*12)*clamp(p.scale,.7,1.5);ctx.lineWidth=e.power>=1?2:1.3;
     if(['guard','parry','dream-guard'].includes(e.kind)){ring(ctx,r);if(e.kind==='parry'){segment(ctx,-r,0,r,0);segment(ctx,0,-r,0,r);}if(e.kind==='dream-guard')ring(ctx,r*.7,.2,5.8);}else if(e.kind==='dodge'){for(let i=0;i<3;i++){ctx.globalAlpha=alpha*(.6-i*.15);ctx.strokeRect(-r*.3-i*6,-r*.8,r*.6,r*1.6);}}else if(e.kind==='cancel'){segment(ctx,-r,-r,r,r);segment(ctx,-r,r,r,-r);}else{for(let i=0;i<(compact?4:6);i++){const a=i*Math.PI*2/(compact?4:6)+(e.sequence%7)*.2;segment(ctx,Math.cos(a)*r*.4,Math.sin(a)*r*.4,Math.cos(a)*r,Math.sin(a)*r);}}
     if(e.label&&(e.power>=1||!e.outgoing)){ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText(e.label,0,-r-6);}
    }else if(!e.outgoing){ctx.lineWidth=e.kind==='danger'?3:1.5;ctx.strokeRect(4,4,width-8,height-8);ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText(e.label,width*.5,height*.76);}
    ctx.restore();
   }
   totals.frames++;m.lastDraw=t;
  }catch(error){totals.drawErrors++;root.console?.warn?.('RC128 presentation error',error);}
  finally{ctx.restore();}
  return true;
 }
 function snapshot(s){const m=s&&states.get(s);return{version:'RC128',installed,totals:{...totals},effects:m?.effects.length||0,recent:m?.effects.map(e=>({kind:e.kind,label:e.label,color:e.color,sequence:e.sequence}))||[],stopBudget:m?.budget||0,missingHeroes:m?Array.from(m.artMissing):[],heroes:Object.keys(HEROES)};}
 function install(){
  if(installed)return true;
  const v=root.__HAPIL_VIEWPORT_RC104__;
  if(!v?.camera||!root.__HAPIL_ADAPTIVE_RC125__?.installed)return false;
  const original=v.camera;
  v.camera=function(s,fallback,project,...args){const camera=original.call(this,s,fallback,project,...args);if(s&&typeof project==='function'&&camera)cameras.set(s,{project,camera});return camera;};
  installed=true;return true;
 }
 const api=Object.freeze({version:'RC128',heroes:HEROES,record,classify,awakening,draw,snapshot,install,get installed(){return installed;}});
 root.__HAPIL_FEEDBACK_RC128__=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 function ready(){if(install()||++attempts>1200)return;root.setTimeout?.(ready,25);}
 if(typeof document!=='undefined')ready();
})(typeof window!=='undefined'?window:globalThis);
