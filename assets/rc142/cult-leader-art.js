/* RC142: restore the authored four-form cult-leader route at the live renderer. */
(function(root){'use strict';
 const paths=Object.freeze([
  './assets/cult-v3123/pride_cyborg_cult_leader.webp',
  './assets/generated-v31224/actors-normalized/c6827b44795a_superego_cyborg_cult_leader.webp',
  './assets/generated-v31224/actors-normalized/a000c91070d3_final_pride_cyborg_lord.webp',
  './assets/generated-v31224/actors-normalized/57967d1070df_black_ritual_cyborg_boss.webp'
 ]);
 const phaseNames=Object.freeze(['사이보그 교주','EGO 탈취체','삼중자아 합일체','적그리스도 소환좌']);
 const states=Object.freeze(['idle','move','windup','attackA','attackB','rain','rift','hit','stagger','transition','death']);
 const sheet=path=>Object.freeze(Object.fromEntries(states.map(key=>[key,path])));
 const ratios=Object.freeze([.76,.5,.25]);let installed=false,attempts=0;
 const index=actor=>{const ratio=Math.max(0,Number(actor?.hp)||0)/Math.max(1,Number(actor?.maxHp)||1);return ratio<=ratios[2]?3:ratio<=ratios[1]?2:ratio<=ratios[0]?1:0;};
 function applyActor(actor){if(actor?.id!=='c104-boss')return false;
  Object.assign(actor,{sprite:paths[0],phaseCount:4,phaseMax:3,phaseThresholds:[...ratios],phaseNames:[...phaseNames],humanPhase0:true,
   phaseSprites:[...paths],phaseSpriteFallbacks:[...paths],actionSprites:sheet(paths[0]),actionSpritesByPhase:paths.map(sheet),sourceFacing31223:'right',
   rc142CultLeaderForms:true,rc142PhaseSource:'authored-c104-four-form'});
  return true;
 }
 function applyState(state){if(state?.zone!=='cult04')return 0;const B=root.__HAPIL_RC86_BRIDGE__;let count=0;const template=B?.actor?.('cult04','c104-boss');if(applyActor(template))count++;
  for(const actor of state.enemies??[])if(applyActor(actor))count++;return count;
 }
 function install(){if(installed)return true;const B=root.__HAPIL_RC86_BRIDGE__,controls=root.__HAPIL_CONTROLS_V31329__;
  if(!B?.renderFrame||typeof B.renderFrame!=='function'||!B?.zoneAssetManifest||typeof B.zoneAssetManifest!=='function'||!controls?.frameStart||typeof controls.frameStart!=='function')return false;
  const manifest=B.zoneAssetManifest;B.zoneAssetManifest=function(zone,...args){const original=manifest.call(this,zone,...args);if(zone!=='cult04')return original;const out=new Set(original instanceof Set?original:Array.isArray(original)?original:[]);for(const path of paths)out.add(path);return out;};
  const frameStart=controls.frameStart;controls.frameStart=function(state,...args){const result=frameStart.call(this,state,...args);applyState(state);return result;};
  const render=B.renderFrame;B.renderFrame=function(canvas,state,cache,...args){applyState(state);return render.call(this,canvas,state,cache,...args);};
  applyActor(B.actor('cult04','c104-boss'));installed=true;return true;
 }
 function ready(){if(install()||++attempts>=600)return;setTimeout(ready,50);}ready();
 root.__HAPIL_CULT_LEADER_ART_RC142__=Object.freeze({version:'RC142',installed:()=>installed,paths,phaseNames,thresholds:ratios,phaseIndex:index,applyActor,applyState,assets:()=>paths.slice(),sourceFacing:'right'});
})(window);
