/* RC128_INTEGRATED */
/* RC91: two modes; lethal-hit revival on an unscaled combat clock. */
(() => {
 'use strict';
 const DURATION=7,COOLDOWN=77,KEY='hapil.samongUnlocked.rc91';
 const HEROES=Object.freeze(['hwando','seoha','neon','michaela','lauren','hunter','slayer','gunner']);
 const art=Object.freeze(Object.fromEntries(HEROES.map(id=>[id,'./assets/rc91/awakening/'+id+'.png'])));
 const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
 const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,n(v)));
 const pictures=new Map(),tempo=new WeakMap();let installed=false,tries=0,mobileHud=null;
 function unlocked(s){
  if(s?.hapilEndingCleared===true||s?.samongUnlockedRC91===true||window.__HAPIL_ENDING_CLEARED_V31300__===true)return true;
  try{return localStorage.getItem(KEY)==='true'||localStorage.getItem('hapilEndingCleared')==='true';}catch(_){return false;}
 }
 function unlock(s,reason){
  if(!['777','story-ending','validated-save'].includes(reason))return false;
  if(s)s.samongUnlockedRC91=true;
  try{localStorage.setItem(KEY,'true');}catch(_){}
  window.dispatchEvent?.(new Event('hapil-samong-unlocked-rc91'));return true;
 }
 function select(value,s){return ['DREAM','SAMONG'].includes(String(value).toUpperCase())&&unlocked(s)?'DREAM':'STORY';}
 function enabled(s){return !!s&&!s.practiceV31329&&select(s.gameModeV31346,s)==='DREAM';}
 function memory(s){
  if(!s.samongPassiveRC91||typeof s.samongPassiveRC91!=='object')s.samongPassiveRC91={version:1,clock:0,active:0,cooldown:0,grace:0,activations:0,heroId:null};
  return s.samongPassiveRC91;
 }
 function active(s){return enabled(s)&&s.hp>0&&n(s.samongPassiveRC91?.active)>0;}
 function protectedNow(s){return active(s)&&n(s.samongPassiveRC91?.grace)>0;}
 function picture(id){
  if(typeof document!=='undefined'&&document.fonts&&!pictures.size)document.fonts.load('24px "Noto Serif KR"','死夢覺醒').catch(()=>{});
  if(!art[id]||typeof Image==='undefined')return null;
  if(!pictures.has(id)){const im=new Image();im.decoding='async';im.src=art[id];pictures.set(id,im);}
  const im=pictures.get(id);return im.complete&&im.naturalWidth>0?im:null;
 }
 function activate(s,origin){
  if(!['ego','revival'].includes(origin)||!enabled(s)||!Number.isFinite(s.hp)||!(n(s.maxHp)>0)||(origin==='revival'?(s.hp>0||!revivalAuthorized(s)):s.hp<=0))return false;
  const P=window.__HAPIL_PARTY_V31322__;
  if(P?.state===s&&P?.status?.role==='guest')return false;
  const m=memory(s);if(n(m[origin+'Cooldown'],m.origin===origin?n(m.cooldown):0)>1e-8)return false;
  const policy=window.__HAPIL_SAMONG_POLICY_RC133__;
  if(policy?!policy.admit(s,m,origin):origin!=='revival'||(window.__HAPIL_AWAKENING_POLICY_RC128__&&!window.__HAPIL_AWAKENING_POLICY_RC128__.claim(s,m)))return false;
  const config=policy?.profile(s)??{duration:DURATION,cooldown:COOLDOWN,grace:.6};
  m.active=config.duration;m.duration=config.duration;m[origin+'Cooldown']=config.cooldown;m.cooldown=Math.max(n(m.egoCooldown),n(m.revivalCooldown));m.grace=config.grace;m.origin=origin;m.activations=Math.max(0,n(m.activations))+1;
  m.heroId=HEROES.includes(s.activeHeroId)?s.activeHeroId:'hwando';
  if(origin==='revival')s.hp=Math.max(1,Math.ceil(s.maxHp*.5));
  // Keep the native EGO state for this awakening only; the normal resonance
  // policy resumes as soon as the seven-second Samong window expires.
  const beforeUntil=n(s.awakeningUntil);s.awakeningUntil=Math.max(beforeUntil,s.time+config.duration);
  window.__HAPIL_AWAKENING_POLICY_RC128__?.ownEgo(s,m,beforeUntil,s.awakeningUntil);
  // Revival is not ordinary healing: keep the debuff, but move its lethal
  // pre-revival ceiling to the restored HP so the next status tick cannot
  // undo the revival (including lethal glutton-absorb contacts).
  if(origin==='revival')s.heroHealingCeiling=s.hp;
  s.heroStatus='死夢覺醒 · '+(origin==='revival'?'위기 부활':'EGO 7회')+' · '+config.duration+'초';
  s.heroSleepUntil=s.time;s.heroCharmUntil=s.time;s.staggerUntil=s.time;
  policy?.complete(s,true);
  picture(m.heroId);
  window.__HAPIL_FEEDBACK_RC128__?.awakening(s,m);
  window.__HAPIL_COMBAT_CORE_V31401__?.step?.(s,s,'samong-'+origin+'-rc133');return true;
 }
 const choices=new WeakMap();
 function revivalAuthorized(s){return choices.get(s)==='samong';}
 function canRevive(s){return enabled(s)&&!memory(s).encounterRC128?.used&&n(memory(s).revivalCooldown,memory(s).origin==='revival'?n(memory(s).cooldown):0)<=1e-8;}
 function chooseRevival(s,choice){
  if(!s||!(s.hp<=0)||!['samong','checkpoint'].includes(choice)||choices.has(s))return false;
  choices.set(s,choice);
  if(choice==='checkpoint')return true;
  try{return tryRevive(s);}finally{choices.delete(s);}
 }
 function deathPending(s){return !!s&&s.hp<=0&&choices.get(s)!=='checkpoint';}
 function consumeCheckpoint(s){if(!s||s.hp>0||choices.get(s)!=='checkpoint')return false;choices.delete(s);return true;}
 function tryRevive(s){if(!s||s.hp>0||!revivalAuthorized(s))return false;if(window.__HAPIL_INNER_FINAL_RC133__?.onPlayerLethal?.(s))return true;return activate(s,'revival');}
 function tryEgo(s){return activate(s,'ego');}
 function activateFinalClash(s){
  const inner=window.__HAPIL_INNER_FINAL_RC133__,clash=s?.innerFinalRC133?.clash;
  if(!inner?.encounter?.(s)||clash?.used!==true||clash.admitting!==true||clash.admitted===true||!Number.isFinite(s.maxHp)||s.maxHp<=0)return false;
  if(s.hp<=0&&!revivalAuthorized(s))return false;
  const P=window.__HAPIL_PARTY_V31322__;if(P?.state===s&&(P.status?.role==='guest'||P.status?.paused||P.status?.disconnected))return false;
  const policy=window.__HAPIL_SAMONG_POLICY_RC133__,ego=policy?.memory(s);
  if(ego?.admitting)return false;
  const m=memory(s),profile=policy?.profile(s)??{duration:7,cooldown:COOLDOWN,grace:.6},reuse=n(m.active)>0;
  if(ego){ego.admitting=true;ego.admittingOrigin=s.hp<=0?'revival':'counter';}
  clash.admitted=true;clash.admitting=false;
  const ledger=window.__HAPIL_AWAKENING_POLICY_RC128__?.sync?.(s,m,true);if(ledger&&s.hp<=0)ledger.used=true;
  m.active=Math.max(n(m.active),profile.duration);m.duration=profile.duration;if(s.hp<=0)m.revivalCooldown=profile.cooldown;m.cooldown=Math.max(n(m.egoCooldown),n(m.revivalCooldown));m.grace=profile.grace;m.origin=s.hp<=0?'revival':'counter';
  if(!reuse||s.hp<=0)m.activations=Math.max(0,n(m.activations))+1;
  m.heroId=HEROES.includes(s.activeHeroId)?s.activeHeroId:'hwando';
  if(s.hp<=0){s.hp=Math.max(1,Math.ceil(s.maxHp*.22));s.heroHealingCeiling=s.hp;}
  s.invulnerableUntil=Math.max(n(s.invulnerableUntil),s.time+.9);
  const before=n(s.awakeningUntil);s.awakeningUntil=Math.max(before,s.time+m.active);
  window.__HAPIL_AWAKENING_POLICY_RC128__?.ownEgo(s,m,before,s.awakeningUntil);
  s.heroStatus='死夢覺醒 · 쌍각성 · '+profile.duration+'초';s.heroSleepUntil=s.time;s.heroCharmUntil=s.time;s.staggerUntil=s.time;
  policy?.complete(s,true);
  picture(m.heroId);if(!reuse)window.__HAPIL_FEEDBACK_RC128__?.awakening(s,m);
  window.__HAPIL_COMBAT_CORE_V31401__?.step?.(s,s,'samong-hidden-final-clash-rc133');return true;
 }
 function advance(s,dt,blocked){
  if(s?.samongPassiveRC91)window.__HAPIL_AWAKENING_POLICY_RC128__?.sync(s,s.samongPassiveRC91,enabled(s));
  if(!s||blocked||!enabled(s)||!Number.isFinite(dt)||dt<=0)return;
  const m=memory(s),step=dt;
  tryRevive(s);if(s.hp<=0)return;
  m.lastDelta=step;m.clock+=step;m.active=Math.max(0,m.active-step);m.egoCooldown=Math.max(0,n(m.egoCooldown,m.origin==='ego'?n(m.cooldown):0)-step);m.revivalCooldown=Math.max(0,n(m.revivalCooldown,m.origin==='revival'?n(m.cooldown):0)-step);m.cooldown=Math.max(m.egoCooldown,m.revivalCooldown);m.grace=Math.max(0,m.grace-step);
  if(m.active<1e-8){m.active=0;m.grace=0;}
  window.__HAPIL_AWAKENING_POLICY_RC128__?.sync(s,m,true);
  tryEgo(s);
  picture(HEROES.includes(s.activeHeroId)?s.activeHeroId:'hwando');
 }
 function hostile(a){return !!a&&n(a.maxHp)>0&&!a.visualOnly&&!a.friendly&&!a.neutral&&!a.canonAlly&&!a.canonAllyV31217&&!a.canonicalAllyV31217&&!a.objectiveStructureV31238&&!a.narrativeStructureV31238&&!a.protectedObjective;}
 const FIELDS=Object.freeze(['damage','attackDamage','projectileDamage','moveSpeed','speed','attackSpeed','staggerResistance','defense','armor']);
 function scaleEnemies(s){
  if(!s||!Array.isArray(s.enemies))return;const factor=enabled(s)?2:1;
  for(const a of s.enemies){
   if(!hostile(a))continue;let b=a.samongStatsRC91;
   if(!b||b.version!==1){
    const boss=!!(a.boss||a.midboss),hpBase=n(a.maxHp)*(boss?1.08:1),fraction=clamp(n(a.hp)/Math.max(1,n(a.maxHp)),0,1),fields={};
    for(const k of FIELDS)if(typeof a[k]==='number'&&Number.isFinite(a[k]))fields[k]=a[k]*(boss?(k==='staggerResistance'?.97:['speed','moveSpeed','attackSpeed'].includes(k)?1.03:['damage','attackDamage','projectileDamage'].includes(k)?1.05:1):1);
    b={version:1,factor,baseMaxHp:hpBase,observedMaxHp:hpBase*factor,fields};a.samongStatsRC91=b;
    a.maxHp=b.observedMaxHp;a.hp=fraction*a.maxHp;for(const [k,v]of Object.entries(fields))a[k]=v*factor;
   }else{
    if(b.factor===factor&&a.maxHp===b.observedMaxHp)continue;
    const previous=b.factor===2?2:1;
    if(n(a.maxHp)!==n(b.observedMaxHp))b.baseMaxHp=n(a.maxHp)/previous;
    const fraction=clamp(n(a.hp)/Math.max(1,n(a.maxHp)),0,1);
    a.maxHp=b.baseMaxHp*factor;a.hp=fraction*a.maxHp;
    if(factor!==previous)for(const [k,v]of Object.entries(b.fields??{}))a[k]=v*factor;
    b.factor=factor;b.observedMaxHp=a.maxHp;
   }
  }
  paceEnemies(s);
 }
 function paceEnemies(s){
  if(!enabled(s))return;
  for(const a of s.enemies??[]){if(!hostile(a)||a.rc88Part||a.hp<=0||Math.max(n(a.atomicCastUntil31210),n(a.recoverUntil),n(a.activePatternUntil),n(a.attackImpactAt),n(a.phaseTransitionUntil),n(a.combatEntryGraceUntilV31239))>s.time)continue;
   const old=tempo.get(a)??{};for(const k of ['readyAt','patternReadyAt'])if(Number.isFinite(a[k])&&a[k]>s.time&&a[k]!==old[k]){a[k]=s.time+(a[k]-s.time)/2;old[k]=a[k];}tempo.set(a,old);
  }
 }
 // Fixed native descriptors do not read actor.damage. Scale their final packet
 // once, after native damage caps/mitigation/floors, without mutating the attack.
 const incomingFactor=s=>enabled(s)?2:1;
 const incomingBuff=s=>active(s)?.12:1;
 function status(s){const m=s?.samongPassiveRC91;return{enabled:enabled(s),active:active(s),remaining:Math.max(0,Math.min(9,n(m?.active))),cooldown:Math.max(0,Math.min(COOLDOWN,n(m?.cooldown))),ready:enabled(s)&&n(m?.revivalCooldown,m?.origin==='revival'?n(m?.cooldown):0)<=1e-8&&!m?.encounterRC128?.used,reviveUsed:m?.encounterRC128?.used===true};}
 function snapshot(s){
  const m=memory(s);return {version:1,unlocked:unlocked(s),clock:n(m.clock),active:clamp(m.active,0,9),cooldown:clamp(m.cooldown,0,COOLDOWN),egoCooldown:clamp(n(m.egoCooldown,m.origin==='ego'?n(m.cooldown):0),0,COOLDOWN),revivalCooldown:clamp(n(m.revivalCooldown,m.origin==='revival'?n(m.cooldown):0),0,COOLDOWN),grace:clamp(m.grace,0,1),activations:Math.max(0,Math.floor(n(m.activations))),heroId:HEROES.includes(m.heroId)?m.heroId:null,duration:clamp(m.duration,7,9),origin:['ego','revival','counter'].includes(m.origin)?m.origin:'revival',bossAwakeningRC137:window.__HAPIL_AWAKENING_RULES_RC137__?.snapshot(s)??null,egoRC133:window.__HAPIL_SAMONG_POLICY_RC133__?.clean(s.samongEgoRC133)??null,upgradesRC133:window.__HAPIL_SAMONG_POLICY_RC133__?.upgrades(s.samongUpgradesRC133)??null,encounterRC128:window.__HAPIL_AWAKENING_POLICY_RC128__?.snapshot(s,m)??null,
   enemies:(s.enemies??[]).filter(a=>hostile(a)&&a.samongStatsRC91).slice(0,384).map(a=>({id:String(a.id),hp:Math.max(0,n(a.hp)),maxHp:Math.max(1,n(a.maxHp)),stats:JSON.parse(JSON.stringify(a.samongStatsRC91))}))};
 }
 function safeZone(raw){return typeof raw?.zone==='string'?raw.zone:null;}
 function sanitize(raw){
  if(!raw||raw.version!==1)return null;
  const upgradesRC133=window.__HAPIL_SAMONG_POLICY_RC133__?.upgrades(raw.upgradesRC133)??null,
   duration=clamp(raw.duration,7,7+(upgradesRC133?.samongDuration??0)),
   activeLeft=clamp(raw.active,0,duration),cooldown=clamp(raw.cooldown,0,COOLDOWN);
  return {version:1,unlocked:raw.unlocked===true,clock:Math.max(0,n(raw.clock)),active:activeLeft,cooldown:Math.max(activeLeft,cooldown),egoCooldown:clamp(n(raw.egoCooldown,raw.origin==='ego'?cooldown:0),0,COOLDOWN),revivalCooldown:clamp(n(raw.revivalCooldown,raw.origin!=='ego'?cooldown:0),0,COOLDOWN),grace:Math.min(activeLeft,clamp(raw.grace,0,1)),activations:Math.max(0,Math.floor(n(raw.activations))),heroId:HEROES.includes(raw.heroId)?raw.heroId:null,duration,origin:['ego','revival','counter'].includes(raw.origin)?raw.origin:'revival',bossAwakeningRC137:window.__HAPIL_AWAKENING_RULES_RC137__?.clean(raw.bossAwakeningRC137,safeZone(raw.bossAwakeningRC137))??null,egoRC133:window.__HAPIL_SAMONG_POLICY_RC133__?.clean(raw.egoRC133)??null,upgradesRC133,encounterRC128:window.__HAPIL_AWAKENING_POLICY_RC128__?.sanitize(raw.encounterRC128)??null,
   enemies:(Array.isArray(raw.enemies)?raw.enemies:[]).slice(0,384).filter(a=>typeof a?.id==='string'&&a.id.length<180&&Number.isFinite(a.hp)&&Number.isFinite(a.maxHp)&&a.maxHp>0&&a.hp>=0&&a.hp<=a.maxHp&&a.stats?.version===1&&[1,2].includes(a.stats.factor)&&Number.isFinite(a.stats.baseMaxHp)&&a.stats.baseMaxHp>0).map(a=>({...a,stats:{version:1,factor:a.stats.factor,baseMaxHp:a.stats.baseMaxHp,observedMaxHp:a.maxHp,fields:Object.fromEntries(FIELDS.filter(k=>Number.isFinite(a.stats.fields?.[k])).map(k=>[k,a.stats.fields[k]]))}}))};
 }
 function restoreVitals(s,raw){
  const data=sanitize(raw);if(!data)return;const saved=new Map(data.enemies.map(a=>[a.id,a]));
  for(const a of s.enemies??[]){const row=saved.get(String(a.id));if(!row||!hostile(a))continue;a.hp=row.hp;a.maxHp=row.maxHp;a.samongStatsRC91=JSON.parse(JSON.stringify(row.stats));for(const[k,v]of Object.entries(row.stats.fields))a[k]=v*row.stats.factor;}
  scaleEnemies(s);
 }
 function restore(s,raw){
  const data=sanitize(raw);if(!s||!data)return;if(data.unlocked)unlock(s,'validated-save');
  s.samongEgoRC133=data.egoRC133??{version:1,count:0,pending:false,lastEntry:null,serial:0,admitting:false};s.samongUpgradesRC133=data.upgradesRC133??{};
  window.__HAPIL_AWAKENING_RULES_RC137__?.restore(s,data.bossAwakeningRC137);
  s.samongPassiveRC91={...data};delete s.samongPassiveRC91.enemies;delete s.samongPassiveRC91.unlocked;
  if(!enabled(s)){s.samongPassiveRC91.active=0;s.samongPassiveRC91.grace=0;}
  window.__HAPIL_AWAKENING_POLICY_RC128__?.restore(s,s.samongPassiveRC91,data.encounterRC128);
  restoreVitals(s,data);picture(s.samongPassiveRC91.heroId||s.activeHeroId);
 }
 function drawMobile(s,canvas){
  const touch=window.__HAPIL_MOBILE_V31366__?.enabled?.()===true||document.documentElement.classList.contains('hapil-touch-v31366');
  if(mobileHud)mobileHud.style.display='none';
  // Mobile uses the compact resonance/Samong timer panel. Avoid a second portrait overlay.
  return touch;
 }
 function draw(ctx,s,width=1280,height=720){
  if(!enabled(s)||!ctx)return false;const m=memory(s),on=active(s),small=width<900,edge=width-18;
  ctx.save();try{
   ctx.filter='none';ctx.globalAlpha=1;ctx.textAlign='right';ctx.textBaseline='top';ctx.shadowBlur=0;
   if(on){
    const im=picture(m.heroId),box=small?120:172;
    if(im){const ratio=im.naturalHeight/im.naturalWidth,w=box,h=Math.min(small?230:300,w*ratio);ctx.globalAlpha=.9;ctx.drawImage(im,edge-w,46,w,h);ctx.globalAlpha=1;}
    ctx.font=`bold ${small?21:27}px "Noto Serif KR",serif`;ctx.lineWidth=4;ctx.strokeStyle='#08090e';ctx.fillStyle='#f4f1ff';ctx.strokeText('死夢覺醒',edge,24);ctx.fillText('死夢覺醒',edge,24);
    ctx.font='bold 12px "Noto Serif KR",sans-serif';ctx.fillStyle='#ffffff';ctx.fillText('각성 '+m.active.toFixed(1)+'초 · 위력 ×7',edge,small?252:334);
   }else{ctx.font='bold 12px "Noto Serif KR",sans-serif';ctx.fillStyle='#d1d5e6';ctx.fillText(m.encounterRC128?.used?'死夢覺醒 · 이 전투의 부활 사용 완료':m.cooldown>0?'死夢覺醒 · '+Math.ceil(m.cooldown)+'초':'死夢覺醒 · 위기 부활 준비',edge,height-26);}
  }finally{ctx.restore();}return true;
 }
 function install(){
  if(installed)return true;const B=window.__HAPIL_RC86_BRIDGE__;
  if(!B?.modeApi?.installed||!window.__HAPIL_DANMAKU_RPG_RC88__?.installed)return false;
  const save=B.serializeSave,norm=B.normalizeSave,entry=B.restoreEntry,final=B.restoreFinalBattle,frame=B.renderFrame;
  B.serializeSave=function(s,...args){scaleEnemies(s);const result=save.call(this,s,...args);if(result)result.samongRC91=snapshot(s);return result;};
  B.normalizeSave=function(raw,...args){const result=norm.call(this,raw,...args);if(result)result.samongRC91=sanitize(raw?.samongRC91);return result;};
  B.restoreEntry=function(s,raw,...args){if(sanitize(raw?.samongRC91)?.unlocked===true)unlock(s,'validated-save');const result=entry.call(this,s,raw,...args);restore(s,raw?.samongRC91);return result;};
  if(typeof final==='function')B.restoreFinalBattle=function(s,raw,...args){const result=final.call(this,s,raw,...args);if(enabled(s)){s.hapilFinalBattleV31300=null;s.hapilSamongActiveV31300=false;}restoreVitals(s,raw?.samongRC91);return result;};
  B.renderFrame=function(canvas,s,cache,hero,settings={}){const result=frame.call(this,canvas,s,cache,hero,settings);const ctx=canvas?.getContext?.('2d');if(ctx){const k=ctx.getTransform?.().a||1;
   const plot=(B.modeApi.mode(s)==='STORY'&&s.zone==='cult04'&&s.hapilFinalBattleV31300?.monochromeActiveV31377===true&&!s.hapilFinalBattleV31300.completed);
   if(active(s)&&!window.__HAPIL_INNER_FINAL_RC133__?.active(s)&&!(s.zone==='cult04'&&s.innerFinalRC133?.phase==='complete')){ctx.save();try{ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='copy';ctx.filter='grayscale(1) contrast(1.08)';ctx.drawImage(canvas,0,0);}finally{ctx.restore();}}
   window.__HAPIL_INNER_FINAL_RC133__?.compose(ctx,s,canvas);
   if(window.__HAPIL_FEEDBACK_RC128__)window.__HAPIL_FEEDBACK_RC128__.draw(ctx,s,canvas,settings);
   else if(!drawMobile(s,canvas)&&window.__HAPIL_COMBAT_INFO_RC108__?.eligible?.()!==true)draw(ctx,s,canvas.width/k,canvas.height/k);
   if(plot){ctx.save();try{ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='copy';ctx.filter='grayscale(1) contrast(1.08)';ctx.drawImage(canvas,0,0);}finally{ctx.restore();}}
  }return result;};
  installed=true;return true;
 }
 window.__HAPIL_SAMONG_RC91__=Object.freeze({version:'RC91',get installed(){return installed;},heroes:HEROES,art,duration:DURATION,cooldown:COOLDOWN,unlocked,unlock,select,enabled,active,protected:protectedNow,revivalAuthorized,canRevive,chooseRevival,deathPending,consumeCheckpoint,tryRevive,tryEgo,activate,activateFinalClash,advance,scaleEnemies,incomingFactor,incomingBuff,status,delta:(s,fallback)=>n(s?.samongPassiveRC91?.lastDelta,fallback),snapshot,sanitize,restore,restoreVitals,draw,picture,clock:s=>n(s?.samongPassiveRC91?.clock)});
 function ready(){if(!install()&&++tries<2000)setTimeout(ready,20);}ready();
})();
