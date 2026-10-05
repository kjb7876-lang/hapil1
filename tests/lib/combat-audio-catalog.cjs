'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');

// These are the only staged-user SFX promoted into the RC141 runtime. Keep
// the exception exact so a broader delivery/ path never becomes a public-media
// allowlist by accident.
const RC141_EFFECT_PATHS=Object.freeze({
 rc141MenuNavigation:'./delivery/additional-audio13-20261005/processed/sfx-candidate/Short_game_menu_navi__4-1791000546558-2a2600cc.ogg',
 rc141TimeAwakening:'./delivery/additional-audio13-20261005/processed/sfx-candidate/Time_manipulation_aw__1-1791000657816-42a47f20.ogg',
 rc141TimeTick0:'./delivery/additional-audio13-20261005/processed/sfx-candidate/time_tick_tack_sound__1-1790999531800-db7f759e.ogg',
 rc141TimeTick1:'./delivery/additional-audio13-20261005/processed/sfx-candidate/time_tick_tack_sound__2-1790999537390-d72161ef.ogg',
 rc141TimeTick2:'./delivery/additional-audio13-20261005/processed/sfx-candidate/time_tick_tack_sound__3-1790999542258-732bf5e2.ogg',
 rc141TreeWeapon:'./delivery/additional-audio13-20261005/processed/sfx-candidate/tree_weapon_attack_s__2-1790999357019-d187038c.ogg',
 rc141ResonanceEnergy:'./delivery/additional-audio13-20261005/processed/sfx-candidate/Resonance_energy_gai__2-1791000424116-211cce07.ogg'
});
const legacyPath=/^\.\/(?:assets\/combat-audio\/v1\/audio\/|audio\/rc133\/processed\/[a-z]+(?:-[a-z]+)*\/)[a-zA-Z0-9_#.,-]+\.(mp3|wav|ogg)$/;
function isSafeRegisteredPath(value){return typeof value==='string'&&(legacyPath.test(value)||Object.values(RC141_EFFECT_PATHS).includes(value));}

module.exports=function registeredCatalog(root){
 const window={};const context=vm.createContext({window});
 for(const file of ['assets/combat-audio/v1/catalog.js','assets/rc133/media-catalog.js','assets/rc141/media-additions.js'])
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
 const catalog=JSON.parse(JSON.stringify(window.__HAPIL_COMBAT_AUDIO_CATALOG_V1__));
 assert.deepEqual(Object.fromEntries(Object.entries(catalog.effects).filter(([,p])=>p.rc141===true).map(([key,p])=>[key,p.path])),RC141_EFFECT_PATHS,'RC141 public catalog is exactly the seven reviewed SFX paths');
 for(const group of ['music','effects'])for(const [key,p]of Object.entries(catalog[group])){
  assert(isSafeRegisteredPath(p.path),'safe registered path '+key);
  if(p.rc141===true)assert.equal(group,'effects','RC141 additions are effects only');
  assert(/^[a-f0-9]{64}$/.test(p.sha256),'registered hash '+key);
  assert(Number.isFinite(p.gain)&&p.gain>0&&p.gain<=1,'bounded registered gain '+key);
  assert(Number.isFinite(p.duration)&&p.duration>0,'registered duration '+key);
 }
 return catalog;
};
module.exports.isSafeRegisteredPath=isSafeRegisteredPath;
module.exports.rc141EffectPaths=RC141_EFFECT_PATHS;
