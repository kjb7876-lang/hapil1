'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
module.exports=function registeredCatalog(root){
 const window={};const context=vm.createContext({window});
 for(const file of ['assets/combat-audio/v1/catalog.js','assets/rc133/media-catalog.js'])
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
 const catalog=JSON.parse(JSON.stringify(window.__HAPIL_COMBAT_AUDIO_CATALOG_V1__));
 for(const group of ['music','effects'])for(const [key,p]of Object.entries(catalog[group])){
  assert(/^\.\/(?:assets\/combat-audio\/v1\/audio\/|audio\/rc133\/processed\/[a-z]+(?:-[a-z]+)*\/)[a-zA-Z0-9_#.,-]+\.(mp3|wav|ogg)$/.test(p.path),'safe registered path '+key);
  assert(/^[a-f0-9]{64}$/.test(p.sha256),'registered hash '+key);
  assert(Number.isFinite(p.gain)&&p.gain>0&&p.gain<=1,'bounded registered gain '+key);
  assert(Number.isFinite(p.duration)&&p.duration>0,'registered duration '+key);
 }
 return catalog;
};
