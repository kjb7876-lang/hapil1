/* RC140: bind the approved story-cycle assets to existing actors and story cards. */
(()=>{'use strict';
 const root=window,base='assets/generated-story10-cycle-20261005/cyclic-murder/';
 const characterRows={
  murder01:{id:'yoon-haram',name:'윤하람',files:{idle:'yoon_haram_idle.png',lurch:'yoon_haram_lurch.png'},frames:{idle:{bounds:[445,16,869,1234],anchor:[625,1234]},lurch:{bounds:[396,31,886,1219],anchor:[599,1219]}}},
  murder02:{id:'jang-minjae',name:'장민재',files:{idle:'jang_minjae_idle.png',lurch:'jang_minjae_lurch.png'},frames:{idle:{bounds:[417,25,850,1199],anchor:[617,1199]},lurch:{bounds:[365,49,1030,1214],anchor:[634,1214]}}},
  murder04:{id:'go-seojin',name:'고서진',files:{idle:'go_seojin_idle.png',lurch:'go_seojin_lurch.png'},frames:{idle:{bounds:[374,21,938,1237],anchor:[610,1237]},lurch:{bounds:[301,26,1122,1233],anchor:[671,1233]}}},
  murder03:{id:'han-igyeong',name:'한이경',files:{idle:'han_igyeong_idle.png',lurch:'han_igyeong_lurch.png'},frames:{idle:{bounds:[463,40,803,1214],anchor:[621,1214]},lurch:{bounds:[425,32,1025,1226],anchor:[621,1226]}}}
 };
 for(const row of Object.values(characterRows))for(const pose of ['idle','lurch'])row.frames[pose].path='./'+base+row.files[pose];
 const boss={
  idle:{path:'./'+base+'blue_executor_idle.png',bounds:[270,73,1038,1207],anchor:[642,1207]},
  charge:{path:'./'+base+'blue_executor_charge.png',bounds:[160,26,1214,1236],anchor:[636,1236]},
  attack:{path:'./'+base+'blue_executor_attack.png',bounds:[60,35,1225,1223],anchor:[640,1223]}
 };
 const rcMeta=(frame,width=1254,height=1254)=>{const [left,top,right,bottom]=frame.bounds,[ax,ay]=frame.anchor;return[left/width,top/height,(right-left)/width,(bottom-top)/height,(ax-left)/(right-left),(ay-top)/(bottom-top)];};
 const bossAssets=Object.values(boss).map(frame=>frame.path);
 const characters=Object.fromEntries(Object.entries(characterRows).map(([zone,row])=>[zone,{id:row.id,name:row.name,size:[1254,1254],poses:Object.fromEntries(Object.entries(row.frames).map(([pose,frame])=>[pose,{path:frame.path,contentBoundsAlpha20:frame.bounds,anchorPx:frame.anchor}]))}]));
 const api={version:'RC140',boss,characters:Object.freeze(characters),bossAssets:Object.freeze(bossAssets),assetsForZone(zone){return zone==='murder03'?bossAssets.slice():[];},installed:false,metrics:{bossTemplate:false,metadata:0}};
 root.__HAPIL_RC140_STORY_CYCLE_ART__=api;
 function install(){const bridge=root.__HAPIL_RC86_BRIDGE__,motions=root.__HAPIL_MIDBOSS_MOTIONS_RC135__;
  if(!bridge||!motions?.installed||typeof bridge.setSpriteMetadata!=='function')return false;
  const actor=bridge.actor('murder03','blue-executor');
  if(!actor)return false;
  for(const frame of Object.values(boss)){bridge.setSpriteMetadata(frame.path,rcMeta(frame));api.metrics.metadata++;}
  actor.sprite=boss.idle.path;
  actor.actionSprites={idle:boss.idle.path,move:boss.idle.path,windup:boss.charge.path,attackA:boss.attack.path,attackB:boss.attack.path,rain:boss.charge.path,rift:boss.attack.path,hit:boss.idle.path,stagger:boss.idle.path,transition:boss.charge.path};
  // The bundle may have precomputed per-phase action sheets before RC140
  // installs. Clear that cache so the authored poses above are used in every
  // phase while native attack clocks and phase behavior remain untouched.
  actor.actionSpritesByPhase=null;
  actor.rc140StoryCycleArt=true;api.metrics.bossTemplate=true;api.installed=true;
  root.__HAPIL_RC140_STORY_CYCLE_ART__=Object.freeze({...api,characters:Object.freeze(characters),metrics:Object.freeze({...api.metrics})});
  return true;
 }
 let tries=0;function wait(){if(install())return;if(++tries<1200)setTimeout(wait,10);else api.error='RC86 bridge or boss template unavailable';}wait();
})();
