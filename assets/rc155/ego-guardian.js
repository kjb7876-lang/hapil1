/* RC155: saved EGO transformation and visit-scoped reverse route. */
(function(root){
 'use strict';
 const VERSION=1,FIELD='egoGuardianRC155',MAX=1000000000,MAX_VISIT_DIGITS=128,MAX_CLEAR_IDS=512,MAX_SCALING_ROWS=384,MAX_HP=1000000000;
 const HEROES=Object.freeze(['hwando','seoha','neon','michaela','lauren','hunter','slayer','gunner']);
 const TRAITS=Object.freeze({
  hwando:Object.freeze({id:'hwando',name:'흰 칼의 결속',effect:'partyDamage',value:1.06}),
  seoha:Object.freeze({id:'seoha',name:'시간의 맥박',effect:'skillRecovery',slots:Object.freeze(['Q','W','E']),value:.06}),
  neon:Object.freeze({id:'neon',name:'성기사의 맹세',effect:'incomingDamage',value:.92}),
  michaela:Object.freeze({id:'michaela',name:'세라핌의 온기',effect:'maxHpHealPerSecond',value:.003}),
  lauren:Object.freeze({id:'lauren',name:'심판의 표식',effect:'bossDamage',value:1.08}),
  hunter:Object.freeze({id:'hunter',name:'혈흔 추적',effect:'criticalDamage',value:1.08}),
  slayer:Object.freeze({id:'slayer',name:'검붉은 투지',effect:'lowHealthDamage',threshold:.5,value:1.12}),
  gunner:Object.freeze({id:'gunner',name:'기억 탄도',effect:'rangedDamage',value:1.08}),
  persona:Object.freeze({id:'persona',name:'순수악의의 무기',effect:'personaSkillDeck',value:1})
 });
 const STORY='진정한 합일을 이루어 마침내 완성된 ego 몽세를 완전히 평정하기 위한 여행을 떠난다. 내면의 악의,욕망 또한 나의 일부분이었음을... 인간은 스스로를 구원할 수 없다...';
 const finite=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?v:d;
 const clamp=(v,lo,hi,d=lo)=>Math.max(lo,Math.min(hi,finite(v,d)));
 const uint=(v,hi=MAX)=>Math.floor(clamp(v,0,hi));
 const safeZone=v=>typeof v==='string'&&/^[a-zA-Z0-9_-]{1,120}$/.test(v)?v:null;
 const validVisit=v=>typeof v==='string'&&/^ego155-[0-9]{1,128}$/.test(v);
 const decimal=v=>typeof v==='string'&&/^\d{1,128}$/.test(v)?v.replace(/^0+(?=\d)/,''):'0';
 function incrementDecimal(v){let a=decimal(v).split(''),i=a.length-1;for(;i>=0;i--){if(a[i]!=='9'){a[i]=String(Number(a[i])+1);break;}a[i]='0';}if(i<0)a.unshift('1');if(a.length>MAX_VISIT_DIGITS)return null;return a.join('');}
 const defaults=()=>({version:VERSION,personaVictory:false,heroUnlocked:false,pendingTransformation:false,pendingFromZone:null,transformed:false,active:false,routeIndex:-1,direction:-1,cycle:0,outerEndpointReached:false,clearCount:0,routeUnlocked:false,firstClearZone:null,routeZone:null,currentZone:null,currentVisitId:null,visitSerial:'0',currentVisitCleared:false,clearReadyVisitId:null,clearedVisitIds:[],cutInSerial:0,cutInPending:false,traitsApplied:false});
 function canonicalRoute(narrative,world){
  const raw=narrative?.zoneOrder??narrative?.route??narrative?.proof?.route;
  if(!Array.isArray(raw)||raw[0]!=='hub'||raw[1]!=='dist01')return [];
  // `hub` is a free-revisit/home node; the authored combat route starts at
  // dist01. The root guardian is its own endpoint immediately before dist01.
  const rows=['dist00',...raw.slice(1)];
  // A missing authored map must fail closed. Filtering it out would silently
  // skip a route node and make the saved route differ from the narrative.
  if(rows.length<3||rows.length>128||rows[0]!=='dist00'||rows.at(-1)!=='village')return [];
  if(rows.some(id=>!safeZone(id)||!world?.[id]?.map)||new Set(rows).size!==rows.length)return [];
  return rows;
 }
 function validRoute(route){return Array.isArray(route)&&route.length>=3&&route.length<=128&&route[0]==='dist00'&&route.at(-1)==='village'&&route.every((z,i)=>safeZone(z)&&route.indexOf(z)===i);}
 function nextStep(m,route){
  if(!validRoute(route)||!Number.isInteger(m?.routeIndex)||m.routeIndex<0||m.routeIndex>=route.length||![-1,1].includes(m.direction))return null;
  let index=m.routeIndex+m.direction,direction=m.direction;
  if(index<0){index=1;direction=1;}else if(index>=route.length){index=route.length-2;direction=-1;}
  return {index,direction,zone:route[index]};
 }
 function cleanClearedIds(raw){return [...new Set((Array.isArray(raw)?raw:[]).filter(validVisit))].slice(-MAX_CLEAR_IDS);}
 function clean(raw,legacy){
  if((!raw||raw.version!==VERSION)&&legacy?.innerFinalRC133?.phase==='complete'&&legacy.innerFinalRC133.entry==='cult-death'){
   const m=defaults();m.personaVictory=true;m.heroUnlocked=true;m.pendingTransformation=true;m.pendingFromZone=safeZone(legacy.zone)||'cult04';m.currentZone=safeZone(legacy.zone)||'cult04';return m;
  }
  if(!raw||raw.version!==VERSION)return defaults();
  const m=defaults();
  Object.assign(m,{personaVictory:raw.personaVictory===true,heroUnlocked:raw.heroUnlocked===true||raw.personaVictory===true,pendingTransformation:raw.pendingTransformation===true,pendingFromZone:safeZone(raw.pendingFromZone),transformed:raw.transformed===true,active:raw.active===true,routeIndex:Number.isInteger(raw.routeIndex)&&raw.routeIndex>=0&&raw.routeIndex<=127?raw.routeIndex:-1,direction:raw.direction===1?1:-1,cycle:uint(raw.cycle),outerEndpointReached:raw.outerEndpointReached===true,clearCount:uint(raw.clearCount),routeUnlocked:raw.routeUnlocked===true,firstClearZone:safeZone(raw.firstClearZone),routeZone:safeZone(raw.routeZone),currentZone:safeZone(raw.currentZone),currentVisitId:validVisit(raw.currentVisitId)?raw.currentVisitId:null,visitSerial:decimal(raw.visitSerial),currentVisitCleared:raw.currentVisitCleared===true,clearReadyVisitId:validVisit(raw.clearReadyVisitId)?raw.clearReadyVisitId:null,clearedVisitIds:cleanClearedIds(raw.clearedVisitIds),cutInSerial:uint(raw.cutInSerial),cutInPending:raw.cutInPending===true,traitsApplied:raw.traitsApplied===true});
  if(!m.pendingTransformation)m.pendingFromZone=null;
  if(m.pendingTransformation&&(!m.pendingFromZone||m.transformed||m.active))m.pendingTransformation=false;
  if(m.active){m.transformed=true;m.pendingTransformation=false;m.pendingFromZone=null;if(m.routeIndex<0||!m.routeZone||!m.currentVisitId){m.active=false;m.routeIndex=-1;m.routeZone=null;m.currentVisitId=null;m.currentVisitCleared=false;m.clearReadyVisitId=null;}}
  if(!m.active){m.routeIndex=-1;m.routeZone=null;m.currentVisitId=null;m.currentVisitCleared=false;m.clearReadyVisitId=null;m.outerEndpointReached=false;}
  if(!m.currentVisitId||m.clearReadyVisitId!==m.currentVisitId)m.clearReadyVisitId=null;
  if(m.currentVisitCleared&&m.currentVisitId&&!m.clearedVisitIds.includes(m.currentVisitId))m.clearedVisitIds.push(m.currentVisitId);
  if(m.clearedVisitIds.length>MAX_CLEAR_IDS)m.clearedVisitIds=m.clearedVisitIds.slice(-MAX_CLEAR_IDS);
  if(m.routeUnlocked&&!m.firstClearZone)m.routeUnlocked=false;
  if(!m.routeUnlocked)m.firstClearZone=null;
  return m;
 }
 function state(s){if(!s)return defaults();if(!s[FIELD]||s[FIELD].version!==VERSION)s[FIELD]=defaults();return s[FIELD];}
 function hostile(a){return !!a&&finite(a.hp)>0&&finite(a.maxHp)>0&&!a.visualOnly&&!a.friendly&&!a.neutral&&!a.canonAlly&&!a.canonAllyV31217&&!a.canonicalAllyV31217&&!a.protectedObjective&&!a.objectiveStructureV31238&&!a.narrativeStructureV31238;}
 function safeBase(a){const fields={};for(const k of ['damage','attackDamage','projectileDamage','speed','moveSpeed','attackSpeed'])if(Number.isFinite(a[k]))fields[k]=clamp(a[k],0,1000000);return {maxHp:clamp(a.maxHp,1,MAX_HP),fields};}
 function safeScalingRow(r){
  if(!r||typeof r.id!=='string'||r.id.length>180||!validVisit(r.visitId)||!Number.isFinite(r.baseMaxHp)||r.baseMaxHp<=0||r.baseMaxHp>MAX_HP||!Number.isFinite(r.maxHp)||r.maxHp<=0||r.maxHp>MAX_HP)return null;
  const fields={};for(const k of ['damage','attackDamage','projectileDamage','speed','moveSpeed','attackSpeed'])if(Number.isFinite(r.baseFields?.[k]))fields[k]=clamp(r.baseFields[k],0,1000000);
  return {id:r.id,visitId:r.visitId,clearCount:uint(r.clearCount),maxHp:clamp(r.maxHp,1,MAX_HP),baseMaxHp:clamp(r.baseMaxHp,1,MAX_HP),baseFields:fields};
 }
 function scalingRows(s){return (s?.enemies??[]).filter(a=>a?.egoGuardianAppliedVisitRC155).slice(0,MAX_SCALING_ROWS).map(a=>safeScalingRow({id:String(a.id),visitId:a.egoGuardianAppliedVisitRC155,clearCount:a.egoGuardianAppliedClearRC155,maxHp:a.maxHp,baseMaxHp:a.egoGuardianBaseRC155?.maxHp,baseFields:a.egoGuardianBaseRC155?.fields})).filter(Boolean);}
 function snapshot(s){const m=clean(s?.[FIELD]);return {...m,scaledActors:scalingRows(s)};}
 function migrate(raw){return clean(raw?.[FIELD],raw);}
 function restore(s,raw,legacy){if(!s)return null;const m=clean(raw,legacy);s[FIELD]=m;if(m.personaVictory)s.egoGuardianNameRC155=NAME;if(m.active){s.egoGuardianNameRC155=NAME;s.egoGuardianTraitsRC155=compositeTraitSources([]);}return m;}
 const NAME='마지막 수호자 EGO';
 function recordPersonaVictory(s){if(!s)return false;const m=state(s);if(m.personaVictory||m.transformed)return false;m.personaVictory=true;m.heroUnlocked=true;m.pendingTransformation=true;m.pendingFromZone=safeZone(s.zone)||'cult04';m.currentZone=safeZone(s.zone);return true;}
 function confirmPersonaVictory(s,finalState){return finalState?.phase==='complete'&&finalState?.entry==='cult-death'?recordPersonaVictory(s):false;}
 function beginVisit(m){const serial=incrementDecimal(m.visitSerial);if(!serial)return false;m.visitSerial=serial;m.currentVisitId='ego155-'+serial;m.currentVisitCleared=false;m.clearReadyVisitId=null;return true;}
 function passage(zone,world){return zone==='hub'||zone==='village'||/^rest/.test(String(zone))||world?.[zone]?.rest===true;}
 function markClear(s,m,zone,visitId){
  if(!visitId||m.currentVisitCleared||m.currentVisitId!==visitId||m.routeZone!==zone||m.clearedVisitIds.includes(visitId))return false;
  m.currentVisitCleared=true;m.clearedVisitIds.push(visitId);if(m.clearedVisitIds.length>MAX_CLEAR_IDS)m.clearedVisitIds=m.clearedVisitIds.slice(-MAX_CLEAR_IDS);m.clearReadyVisitId=null;
  m.clearCount=Math.min(MAX,m.clearCount+1);if(!m.routeUnlocked){m.routeUnlocked=true;m.firstClearZone=zone;}return true;
 }
 function onMapEntry(s,zone,world,narrative){
  if(!s||!safeZone(zone))return {changed:false,transformed:false,advanced:false};
  const m=state(s),route=canonicalRoute(narrative??root.__MONGSE_NARRATIVE_V395__,world),index=route.indexOf(zone),prior=m.currentZone;
  if(m.pendingTransformation){
   if(zone!==m.pendingFromZone&&index>=0){
    m.pendingTransformation=false;m.pendingFromZone=null;m.transformed=true;m.active=true;m.routeIndex=index;m.direction=-1;m.cycle=0;m.outerEndpointReached=false;m.clearCount=0;m.routeUnlocked=false;m.firstClearZone=null;m.routeZone=zone;m.currentZone=zone;m.traitsApplied=true;m.cutInSerial=Math.min(MAX,m.cutInSerial+1);m.cutInPending=true;
    if(!beginVisit(m)){m.active=false;m.transformed=false;m.pendingTransformation=true;m.pendingFromZone=prior;return {changed:false,transformed:false,advanced:false,reason:'visit-id-exhausted'};}
    s.egoGuardianNameRC155=NAME;s.egoGuardianTraitsRC155=compositeTraitSources([]);return {changed:true,transformed:true,advanced:false,from:prior,to:zone,routeIndex:index,direction:-1,visitId:m.currentVisitId};
   }
   m.currentZone=zone;return {changed:prior!==zone,transformed:false,advanced:false,from:prior,to:zone};
  }
  if(!m.active){m.currentZone=zone;return {changed:prior!==zone,transformed:false,advanced:false,from:prior,to:zone};}
  if(index<0){m.currentZone=zone;return {changed:prior!==zone,transformed:false,advanced:false,detour:true,from:prior,to:zone,routeIndex:m.routeIndex,direction:m.direction,visitId:m.currentVisitId};}
  if(zone===m.currentZone)return {changed:false,transformed:false,advanced:false,from:prior,to:zone,visitId:m.currentVisitId};
  const source=m.routeZone,expected=nextStep(m,route),isExpected=expected?.zone===zone&&source!==zone;
  const confirmed=isExpected&&(passage(source,world)?(s.completedZones?.has?.(source)||source==='hub'||source==='village'):m.clearReadyVisitId===m.currentVisitId&&s.completedZones?.has?.(source));
  let advanced=false,flipped=false,wasRoot=false,cleared=null;
  if(confirmed){
   if(!passage(source,world))cleared=markClear(s,m,source,m.currentVisitId);
   const previousIndex=m.routeIndex,previousDirection=m.direction;wasRoot=source==='dist00'&&previousIndex===0&&previousDirection===-1;
   m.direction=expected.direction;m.routeIndex=expected.index;m.routeZone=zone;flipped=previousDirection!==m.direction;
   if(source==='village'&&previousIndex===route.length-1&&previousDirection===1&&flipped)m.outerEndpointReached=true;
   if(zone==='dist00'&&m.outerEndpointReached&&previousIndex===1&&previousDirection===-1){m.cycle=Math.min(MAX,m.cycle+1);m.outerEndpointReached=false;}
   if(!beginVisit(m))return {changed:false,transformed:false,advanced:false,reason:'visit-id-exhausted',from:prior,to:zone};
   advanced=true;
  }else if(zone===m.routeZone&&!m.currentVisitCleared&&!m.clearReadyVisitId){if(!beginVisit(m))return {changed:false,transformed:false,advanced:false,reason:'visit-id-exhausted',from:prior,to:zone};}
  m.currentZone=zone;
  return {changed:true,transformed:false,advanced,detour:!advanced,from:prior,to:zone,routeIndex:m.routeIndex,direction:m.direction,flipped,cleared,visitId:m.currentVisitId};
 }
 function observeClear(s,zone,clear){const m=s?.[FIELD];if(!m?.active||zone!==m.routeZone||zone!==m.currentZone||!m.currentVisitId||passage(zone,null))return false;if(clear===true){if(m.currentVisitCleared||m.clearReadyVisitId===m.currentVisitId||m.clearedVisitIds.includes(m.currentVisitId))return false;m.clearReadyVisitId=m.currentVisitId;return true;}if(m.clearReadyVisitId===m.currentVisitId)m.clearReadyVisitId=null;return false;}
 function nextZone(s,zone,world,narrative){const m=s?.[FIELD];if(!m?.active||zone!==m.routeZone)return null;const route=canonicalRoute(narrative??root.__MONGSE_NARRATIVE_V395__,world);if(route[m.routeIndex]!==zone)return null;return nextStep(m,route)?.zone??null;}
 const originalLinks=new WeakMap();
 function rememberLinks(world){if(!world||typeof world!=='object'||originalLinks.has(world))return;const map=new Map();for(const [zone,row]of Object.entries(world))if(row&&Object.hasOwn(row,'next'))map.set(zone,row.next);originalLinks.set(world,map);}
 function restoreLinks(world){const map=world&&originalLinks.get(world);if(!map)return;for(const [zone,next]of map)if(world[zone])try{world[zone].next=next;}catch(_){}originalLinks.delete(world);}
 function sync(s,world,narrative){if(!s||!world)return false;const m=s[FIELD];if(!m?.active){restoreLinks(world);return false;}if(s.zone!==m.currentZone)onMapEntry(s,s.zone,world,narrative);const current=s[FIELD];if(!current?.active)return false;if(s.zone!==current.routeZone){restoreLinks(world);return false;}rememberLinks(world);const next=nextZone(s,s.zone,world,narrative);if(!next||!world[s.zone])return false;try{world[s.zone].next=next;return true;}catch(_){return false;}}
 function difficulty(clearCount){return 1+Math.min(2,uint(clearCount)*.01);}
 function factors(count){return {hp:difficulty(count),damage:1+Math.min(.5,uint(count)*.0025),speed:1+Math.min(.2,uint(count)*.001)};}
 function applyEnemyScaling(s){const m=s?.[FIELD];if(!m?.active||!Array.isArray(s.enemies))return 0;const f=factors(m.clearCount);let count=0;
  for(const a of s.enemies){if(!hostile(a)||a.egoGuardianAppliedVisitRC155===m.currentVisitId)continue;
   const base=a.egoGuardianBaseRC155&&Number.isFinite(a.egoGuardianBaseRC155.maxHp)?a.egoGuardianBaseRC155:safeBase(a),fraction=clamp(finite(a.hp)/Math.max(1,finite(a.maxHp)),0,1),nextMax=clamp(Math.round(base.maxHp*f.hp),1,MAX_HP);
   a.egoGuardianBaseRC155={maxHp:clamp(base.maxHp,1,MAX_HP),fields:{...base.fields}};a.maxHp=nextMax;a.hp=clamp(Math.round(nextMax*fraction),0,nextMax);
   for(const [key,mul]of [['damage',f.damage],['attackDamage',f.damage],['projectileDamage',f.damage],['speed',f.speed],['moveSpeed',f.speed],['attackSpeed',f.speed]])if(Number.isFinite(base.fields[key]))a[key]=clamp(base.fields[key]*mul,0,1000000);
   if(a.samongStatsRC91&&typeof a.samongStatsRC91==='object')a.samongStatsRC91.observedMaxHp=nextMax;
   a.egoGuardianAppliedVisitRC155=m.currentVisitId;a.egoGuardianAppliedClearRC155=m.clearCount;a.egoGuardianHpFactorRC155=f.hp;a.egoGuardianDamageFactorRC155=f.damage;a.egoGuardianSpeedFactorRC155=f.speed;count++;
  }return count;
 }
 function restoreScaling(s,rows){if(!s||!Array.isArray(rows))return 0;let count=0;const visit=s[FIELD]?.currentVisitId,byId=new Map(rows.slice(0,MAX_SCALING_ROWS).map(safeScalingRow).filter(r=>r&&r.visitId===visit).map(r=>[r.id,r]));
  for(const a of s.enemies??[]){const row=byId.get(String(a.id));if(!row||Math.abs(finite(a.maxHp)-row.maxHp)>.01)continue;a.egoGuardianBaseRC155={maxHp:row.baseMaxHp,fields:{...row.baseFields}};a.egoGuardianAppliedVisitRC155=row.visitId;a.egoGuardianAppliedClearRC155=row.clearCount;const f=factors(row.clearCount);a.egoGuardianHpFactorRC155=f.hp;a.egoGuardianDamageFactorRC155=f.damage;a.egoGuardianSpeedFactorRC155=f.speed;if(a.samongStatsRC91)a.samongStatsRC91.observedMaxHp=a.maxHp;count++;}return count;
 }
 function dedupeTraitSources(sourceIds){const seen=new Set(),rows=[];for(const id of [...(Array.isArray(sourceIds)?sourceIds:HEROES),'persona'])if((HEROES.includes(id)||id==='persona')&&!seen.has(id)){seen.add(id);rows.push(id);}return rows;}
 function compositeTraitSources(_existing){return dedupeTraitSources([...HEROES,'persona']);}
 function additionalHeroTraits(active,existing){if(!active)return [];const seen=new Set((Array.isArray(existing)?existing:[]).filter(id=>HEROES.includes(id)));return HEROES.filter(id=>!seen.has(id));}
 function traitPlan(sourceIds){const ids=dedupeTraitSources(sourceIds);return ids.map(id=>TRAITS[id]).filter(Boolean);}
 function consumeCutIn(s){const m=s?.[FIELD];if(!m?.cutInPending)return false;m.cutInPending=false;return true;}
 function clearPresentation(s){const m=s?.[FIELD];if(!m)return false;m.cutInPending=false;return true;}
 function projectileBudget(current,requested,cap=72){const c=uint(current,1000000),r=uint(requested,1000000),limit=uint(cap,4096);return c+r<=limit;}
 const api=Object.freeze({version:VERSION,field:FIELD,name:NAME,story:STORY,heroes:HEROES,traits:TRAITS,canonicalRoute,validRoute,nextStep,clean,migrate,state,snapshot,restore,recordPersonaVictory,confirmPersonaVictory,onMapEntry,observeClear,nextZone,sync,difficulty,factors,applyEnemyScaling,scalingRows,restoreScaling,dedupeTraitSources,compositeTraitSources,additionalHeroTraits,traitPlan,consumeCutIn,clearPresentation,projectileBudget,metrics:()=>({maxClearIds:MAX_CLEAR_IDS,maxScalingRows:MAX_SCALING_ROWS})});
 root.__HAPIL_EGO_GUARDIAN_RC155__=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
