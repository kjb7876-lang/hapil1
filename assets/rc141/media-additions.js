/* RC141: user supplied nonvoice SFX, mapped to existing native events. */
(function installRc141Media(root){
 'use strict';
 const paths=Object.freeze({
  menu:'./delivery/additional-audio13-20261005/processed/sfx-candidate/Short_game_menu_navi__4-1791000546558-2a2600cc.ogg',
  timeAwakening:'./delivery/additional-audio13-20261005/processed/sfx-candidate/Time_manipulation_aw__1-1791000657816-42a47f20.ogg',
  timeTicks:Object.freeze([
   './delivery/additional-audio13-20261005/processed/sfx-candidate/time_tick_tack_sound__1-1790999531800-db7f759e.ogg',
   './delivery/additional-audio13-20261005/processed/sfx-candidate/time_tick_tack_sound__2-1790999537390-d72161ef.ogg',
   './delivery/additional-audio13-20261005/processed/sfx-candidate/time_tick_tack_sound__3-1790999542258-732bf5e2.ogg'
  ]),
  treeWeapon:'./delivery/additional-audio13-20261005/processed/sfx-candidate/tree_weapon_attack_s__2-1790999357019-d187038c.ogg',
  resonance:'./delivery/additional-audio13-20261005/processed/sfx-candidate/Resonance_energy_gai__2-1791000424116-211cce07.ogg'
 });
 const entries={
  rc141MenuNavigation:{path:paths.menu,gain:1,duration:.6615,cooldown:.38,voices:1,priority:1,group:'ui-navigation',rc141:true,sha256:'ec2604b39c1e68238043a5f273f6a5bf04b4e0042e5af0095edab21305c940b3',sourceSha256:'2a2600ccdc43f57baabd7db8f0e86be65b71670ef95eb342e83c8452ca118e45'},
  rc141TimeAwakening:{path:paths.timeAwakening,gain:1,duration:2.2565,cooldown:2.5,voices:1,duck:.5,priority:7,group:'time-awakening',rc141:true,sha256:'2b55ed494eeb47117fff7159394ed8bd055aa77f1ed47aa428f694934f735c1b',sourceSha256:'42a47f20a64dd5691ae62c58fd85a9308f55a8c1ece1017ec449155d3cdd868b'},
  rc141TimeTick0:{path:paths.timeTicks[0],gain:1,duration:2.2565,cooldown:2.9,voices:1,priority:3,group:'kairo-clock',rc141:true,sha256:'d584d313d5b560317c217a4d75575868850e80d1730a06eb1fb5a490eac8bb22',sourceSha256:'db7f759e82491288f7516a1cb473ee58b89d040fcd7a732df4352aa4671955d1'},
  rc141TimeTick1:{path:paths.timeTicks[1],gain:1,duration:2.2565,cooldown:2.9,voices:1,priority:3,group:'kairo-clock',rc141:true,sha256:'989e00c2525364cc04191a71da687a3bc0d83c00b8f2f6df22ced61a8a2ca282',sourceSha256:'d72161ef2ad8d050bf4227e31d14d19699b482b39a395974994ef5c679f7d9f7'},
  rc141TimeTick2:{path:paths.timeTicks[2],gain:1,duration:2.2565,cooldown:2.9,voices:1,priority:3,group:'kairo-clock',rc141:true,sha256:'295fa352c10e92bfe58f0d1d57f7023393f2d8b37eff3dd23c215f94c235039f',sourceSha256:'732bf5e220046febe1091ece10a459fc5095af4c65c11637bba1f06cb9a851e5'},
  rc141TreeWeapon:{path:paths.treeWeapon,gain:1,duration:2.2565,cooldown:.16,voices:3,priority:3,group:'player-wooden-weapon',rc141:true,sha256:'9ac381a436051e81adf2e1a7e972ceeaf261141496966a571df646f6073e9d11',sourceSha256:'d187038ced36e325e9470681c5e52b48b9b94635695f2eb7150dedf6e4de1715'},
  rc141ResonanceEnergy:{path:paths.resonance,gain:1,duration:2.2565,cooldown:2.6,voices:1,priority:9,group:'resonance-full',rc141:true,sha256:'1ecabb4e4efd2aac32f2dfee0c2de5f237a69c22e2b184daac92d62eaeaed562',sourceSha256:'211cce07d4a0fb2bcd0dd768ce2fedbae7c19c65890ccce8ca4b5344b9bbad9e'}
 };
 const oldCatalog=root.__HAPIL_COMBAT_AUDIO_CATALOG_V1__??{};
 for(const value of Object.values(entries))Object.freeze(value);
 root.__HAPIL_COMBAT_AUDIO_CATALOG_V1__=Object.freeze({...oldCatalog,version:141,effects:Object.freeze({...oldCatalog.effects,...entries})});
 const oldEvents=root.__HAPIL_MEDIA_AUDIO_EVENTS_RC133__??{};
 root.__HAPIL_MEDIA_AUDIO_EVENTS_RC133__=Object.freeze({...oldEvents,
  timeAwakening:'rc141TimeAwakening',
  timeTick:['rc141TimeTick0','rc141TimeTick1','rc141TimeTick2'],
  resonanceEnergy:'rc141ResonanceEnergy'
 });
 const metrics={plays:0,suppressed:0,failures:0},key='mongse_settings_v1',cooldown=.38;
 let clip=null,readyAt=0;
 function settings(){try{return JSON.parse(root.localStorage.getItem(key)??'{}')||{};}catch{return{};}}
 function menuAllowed(target){
  const control=target?.closest?.('button,[role="button"],a[href],select');
  if(!control||control.disabled||control.getAttribute('aria-disabled')==='true'||root.document?.hidden)return false;
  if(control.closest('canvas,[data-combat-primary]'))return false;
  return root.__HAPIL_CONTROLS_V31329__?.binding?.phase!=='game';
 }
 function playMenu(target){
  if(!menuAllowed(target))return false;
  const pref=settings(),volume=Number(pref.sfxVolume??.8);
  if(pref.sound===false||!Number.isFinite(volume)||volume<=0||volume>1){metrics.suppressed++;return false;}
  const now=Number(root.performance?.now?.()??Date.now());
  if(now<readyAt||clip&&!clip.paused&&!clip.ended){metrics.suppressed++;return false;}
  try{
   if(!clip){clip=new root.Audio(paths.menu);clip.preload='auto';clip.loop=false;clip.setAttribute?.('playsinline','');clip.addEventListener?.('error',()=>metrics.failures++);}
   clip.volume=Math.max(0,Math.min(1,volume*.45));clip.currentTime=0;readyAt=now+cooldown;
   const promise=clip.play();if(promise?.catch)promise.catch(()=>{metrics.failures++;});metrics.plays++;return true;
  }catch{metrics.failures++;return false;}
 }
 root.document?.addEventListener?.('click',e=>{if(menuAllowed(e.target))playMenu(e.target);},true);
 root.document?.addEventListener?.('change',e=>{if(e.target?.matches?.('select')&&menuAllowed(e.target))playMenu(e.target);},true);
 const stop=()=>{if(!clip)return;try{clip.pause();clip.currentTime=0;}catch{}};
 root.document?.addEventListener?.('visibilitychange',()=>{if(root.document.hidden)stop();});
 root.addEventListener?.('pagehide',stop);
 root.setInterval?.(()=>{if(root.__HAPIL_CONTROLS_V31329__?.binding?.phase==='game')stop();},250);
 root.addEventListener?.('storage',e=>{if(e.key===key&&(settings().sound===false||Number(settings().sfxVolume)<=0))stop();});
 root.__HAPIL_ADDITIONAL_AUDIO_RC141__=Object.freeze({installed:true,paths,metrics:()=>({...metrics}),playMenu,menuPlaying:()=>!!clip&&!clip.paused&&!clip.ended,stopMenu:stop});
})(typeof window!=='undefined'?window:globalThis);
