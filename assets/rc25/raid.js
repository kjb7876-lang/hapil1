(()=>{'use strict';
 const VERSION='3.25-RAID-RC25',CUT=.6;
 const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
 const mode=s=>window.__HAPIL_MODES_V31346__?.mode?.(s)||s?.gameModeV31346||'STORY';
 const ratios={STORY:.01,DREAM:.01};
 const metrics={bodyChecks:0,bodyHits:0,damageFloors:0,suppressed:0,statUpdates:0,ultimateDebuffs:0};
 const baseStats=new WeakMap(),tickStates=new WeakMap();
 const flags=(s,h)=>{
  // Weak exiting bodies retain their bounded tail damage, not the live
  // owner's major-attack floor, cap bypass, damage scale or lifesteal.
  if(!s||!h||h.exitDamageV31327||h.friendly||h.reflected||h.visualOnly||h.cancelled||h.damageSuppressedV31226||h.heroSkillVfx||h.heroId31213||h.partySlotV31322)return null;
  const sourceId=String(h.sourceId??h.ownerId??h.actorId??'');
  const actor=(s.enemies??[]).find(a=>String(a.id)===sourceId);
  const explicit=h.raidBodyContactRC24===true||h.raidMinimumRatioRC24>0;
  if(!explicit&&(!actor||actor.hp<=0||actor.visualOnly||actor.protectedNarrativeTargetV31307))return null;
  const boss=!!(actor?.boss||actor?.midboss||h.boss||h.midboss);
  const label=String(h.label??h.name??h.patternNameV31331??'');
  const ultimate=!!(h.raidUltimateRC25||h.cosmicModeV31318==='reliquary'||h.raidUltimateRC24||h.bossFinaleV31334&&h.finaleKindV31334==='ultimate'||h.ultimateImpact||h.kind==='ultimate'||h.finaleKindV31334==='ultimate');
  const laser=!!(h.laserV31330||h.bloodV31516||h.themedLaser||h.cosmicModeV31318==='blood-beam'||/혈광포|혈광 소멸포|blood[- ]?beam/i.test(label));
  const r=ultimate&&boss ? .66 : laser&&boss ? .50 : (h.raidMinimumRatioRC24||ratios[mode(s)]||.01);
  return {actor,boss,sourceId,label,ratio:r,ultimate,laser};
 };
 function key(s,h,f){
  const a=f.actor,variant=String(a?.currentPhase??a?.phaseIndex??a?.form??'0');
  const imageId=h.damageContactIdRC25??h.damageContactIdRC24??h.id??h.projectileId??h.strikeId??h.raidImageKeyRC24??a?.spriteKey??a?.sprite??a?.image??a?.asset??a?.id??f.sourceId;
  const image=String(imageId);
  return `${f.sourceId}|${variant}|${image}`.slice(0,180);
 }
 function suppress(s,h){const f=flags(s,h);if(!f)return false;const now=num(s.time),id=key(s,h,f),ledger=s.raidImageContactLedgerRC24??(s.raidImageContactLedgerRC24={});
  const prev=num(ledger[id],-999);if(now-prev<CUT-1e-8){metrics.suppressed++;return true;}
  ledger[id]=now;for(const k of Object.keys(ledger))if(now-num(ledger[k])>4)delete ledger[k];
  const keys=Object.keys(ledger);if(keys.length>160)for(const k of keys.slice(0,keys.length-120))delete ledger[k];
  return false;
 }
 function bypassCap(s,h){return !!flags(s,h);}
 function floorDamage(s,h,afterMitigation){const f=flags(s,h);if(!f)return afterMitigation;const max=Math.max(1,num(s.maxHp,240));let ratio=f.ratio;if(h.heartContactRC24)ratio*=1.65;
  const floor=Math.max(1,Math.ceil(max*ratio));if(afterMitigation<floor){metrics.damageFloors++;return floor;}return afterMitigation;
 }
 function afterHit(s,h,applied){const f=flags(s,h);if(!f||!(applied>0))return false;
  const m=mode(s);if(f.ultimate){s.heroHealingReducedUntilRC24=Math.max(num(s.heroHealingReducedUntilRC24),num(s.time)+6);metrics.ultimateDebuffs++;s.floatTexts??=[];s.floatTexts.push({id:s.fxSerial++,x:s.x,y:s.y-.7,born:s.time,duration:1.05,text:'회복량 -66% · 6초',color:'#ffd991',critical:true});}
  if(f.actor&&f.boss){const leech=.025;f.actor.hp=Math.min(num(f.actor.maxHp),num(f.actor.hp)+applied*leech);}
  return true;
 }
 function healing(s,a,amount){const n=num(amount);return num(s?.heroHealingReducedUntilRC24)>num(s?.time)?n*.34:n;}
 function ownerColor(a){
  const id=String(a?.id??'').toLowerCase();
  const rows=[[/dist00|root|tree|arbor/,112],[/balrog|wrath|hellfire/,16],[/lust|b05|asmod|seoyun/,338],[/lucifer|cosmic|a11/,274],[/greed|mammon|b06/,48],[/envy|mirror|b03/,166],[/pride|b08|cross/,220],[/sloth|b02/,208],[/glutton|b04/,86]];
  let h=2166136261;for(const c of id)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;
  const family=rows.find(([re])=>re.test(id)),baseHue=family?.[1]??(h%360),hue=(baseHue+((h>>>8)%43)-21+360)%360;
  return {color:`hsl(${hue} 86% 60%)`,accent:`hsl(${(hue+48)%360} 96% 78%)`};
 }
 function damagePalette(a,old={}){const p=ownerColor(a);return {...old,color:typeof old?.color==='string'?old.color:p.color,accent:typeof old?.accent==='string'?old.accent:p.accent};}
 function damageScale(s,h){const f=flags(s,h);if(!f?.boss)return 1;const m=mode(s);return 1.05;}
 function tick(s){if(!s||!Array.isArray(s.enemies))return;const now=num(s.time),m=mode(s),previous=tickStates.get(s),dt=previous?.mode===m?Math.max(0,Math.min(.2,now-previous.time)):0;tickStates.set(s,{time:now,mode:m});
  window.__HAPIL_SAMONG_RC91__?.scaleEnemies(s);
  for(const a of s.enemies){if(!(a.boss||a.midboss)||a.hp<=0||a.visualOnly)continue;
   if(dt>0)a.hp=Math.min(num(a.maxHp),num(a.hp)+num(a.maxHp)*.00038*dt);
   const p=ownerColor(a);a.bossBloodColorRC24=p.color;a.bossBloodAccentRC24=p.accent;
  }
  markLust(s);sweep(s);
 }
 function markLust(s){const ids=new Set(['b05-boss','mb-ep1b05']);const kinds=['hostileProjectiles','pendingHits','impactQueue','telekineticCasts','spatialRiftCasts','narrativeCasts'];
  for(const k of kinds)for(const h of s[k]??[]){if(!h||!ids.has(String(h.sourceId??h.ownerId??''))||h.friendly||h.reflected||h.visualOnly)continue;const id=Number(h.id),raw=String(h.sourceId)+String(h.born)+String(h.x)+String(h.y),seed=Number.isFinite(id)?id:[...raw].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,0),heel=seed%2===0,path=heel?'./assets/rc24/lust-heel.png':'./assets/rc24/lust-lipstick.png';h.lustKindRC24=heel?'heel':'lipstick';h.raidImageKeyRC24=path;h.sprite=path;h.image=path;h.path=path;h.asset=path;h.projectileSprite=path;h.impactSprite=path;h.impactFallbackSprite=path;h.color=heel?'#fa315d':'#e9b947';h.accent=heel?'#ffe4ed':'#fff1b9';h.radius=Math.max(num(h.radius),heel?2.05:.65);}}
 function sweep(s){const control=window.__HAPIL_CONTROLS_V31329__?.binding;if(control?.state?.current!==s||control.phase!=='game'||!(s.hp>0))return;
  for(const a of s.enemies){if(!(a.hp>0)||a.visualOnly||a.protectedNarrativeTargetV31307||a.friendly||a.objectiveStructureV31238)continue;metrics.bodyChecks++;
   const er=Math.min(2.15,Math.max(.55,num(a.bodyRadius,num(a.radius,.85)))),dx=num(s.x)-num(a.x),dy=num(s.y)-num(a.y),d=Math.hypot(dx,dy);if(d>er+.38)continue;
   const source={id:`contact-${a.id}`,sourceId:String(a.id),ownerId:String(a.id),born:s.time,damage:1,boss:!!a.boss,midboss:!!a.midboss,hostile:true,raidBodyContactRC24:true,raidImageKeyRC24:String(a.sprite??a.image??a.id),label:`${a.name??a.id} 접촉`,heartContactRC24:d<.48};
   const damage=window.__HAPIL_COMBAT_V31333__?.damage;if(typeof damage!=='function')continue;
   if(damage(s,1,num(a.x),num(a.y),source))metrics.bodyHits++;
  }
 }
 const modesafe=s=>mode(s);
 function dHeld(s){return !!(window.__HAPIL_CHANNEL_V31364__?.active?.(s)||window.__HAPIL_CHANNEL_V31364__?.held?.(s));}
 function diagnostics(){return {...metrics,contactInterval:CUT,damageByMode:{...ratios},laserMinimum:.5,ultimateMinimum:.66,ultimateHealingMultiplier:.34,ultimateHealingSeconds:6};}
 window.__HAPIL_RAID_RC24__=Object.freeze({version:VERSION,flags,suppress,bypassCap,floorDamage,afterHit,healing,ownerColor,damagePalette,damageScale,tick,sweep,dHeld,diagnostics});
 const frame=()=>{const s=window.__HAPIL_CONTROLS_V31329__?.binding?.state?.current;if(s&&window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='game')tick(s);if(typeof requestAnimationFrame==='function')requestAnimationFrame(frame);};
 if(typeof requestAnimationFrame==='function')requestAnimationFrame(frame);else setInterval(frame,33);
})();
