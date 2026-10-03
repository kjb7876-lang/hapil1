'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const native='(window.__HAPIL_FLOW_V31343__?.profile(t.zone) ? window.__HAPIL_FLOW_V31343__.gate(t).clear : t.enemies.length === 0)';
const operations=[
 {name:'wrath portal rendering uses canonical cleared-actor identity',from:'      t.enemies.length === 0 &&\n      t.egoDrops.length === 0 &&',to:'      /* RC132_WRATH_PORTAL */ (window.__HAPIL_DREAM_BALANCE_RC132__?.exitActorsClear(t,t.enemies.length === 0) ?? (t.enemies.length === 0)) &&\n      t.egoDrops.length === 0 &&'},
 {name:'wrath native interaction uses same authoritative gate',from:native,to:'/* RC132_WRATH_EXIT */ (window.__HAPIL_DREAM_BALANCE_RC132__?.exitActorsClear(t,'+native+') ?? '+native+')'}
];
function apply(root){const file=path.join(root,'assets/index-v31526.js');let source=fs.readFileSync(file,'utf8');if(source.includes('RC132_WRATH_EXIT')){assert(source.includes('RC132_WRATH_PORTAL'));return false;}for(const op of operations){assert.equal(source.split(op.from).length-1,1,op.name);source=source.replace(op.from,op.to);}fs.writeFileSync(file,source);return true;}
module.exports={operations,apply};if(require.main===module)console.log('RC132_WRATH_APPLY',apply(path.resolve(__dirname,'..')));
