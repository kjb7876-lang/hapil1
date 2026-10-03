'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert/strict'),acorn=require(process.env.RC132_MODULES+'/acorn');
const BASE='a624e894788a8a1c21d6ca611299985d62eaf97e',root=path.resolve(__dirname,'..');
const source=cp.execFileSync('git',['show',BASE+':assets/index-v31526.js'],{cwd:root,encoding:'utf8',maxBuffer:40*1024*1024});
let cleared;function walk(n){if(!n||typeof n!=='object')return;if(n.type==='VariableDeclarator'&&n.id?.name==='MONGSE_zoneCombatCleared'){assert(!cleared,'unique shared clear declaration');cleared=n.init;}for(const[k,v]of Object.entries(n)){if(k==='start'||k==='end')continue;if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v.type==='string')walk(v);}}walk(acorn.parse(source,{ecmaVersion:'latest',sourceType:'module'}));
assert(cleared?.body?.type==='BlockStatement','shared combat-clear function');
const clearFrom=source.slice(cleared.start,cleared.end),clearTo=source.slice(cleared.start,cleared.body.start+1)+'\n    /* RC132_WRATH_CLEAR: use the same required-actor gate as the exit. */\n    if(e && t===e.zone && t===\'ep1b07\' && window.__HAPIL_DREAM_BALANCE_RC132__?.enabled(e)){\n      const ready=window.__HAPIL_DREAM_BALANCE_RC132__.exitActorsClear(e,null);\n      if(typeof ready===\'boolean\')return ready;\n    }\n'+source.slice(cleared.body.start+1,cleared.end);
const native='(window.__HAPIL_FLOW_V31343__?.profile(t.zone) ? window.__HAPIL_FLOW_V31343__.gate(t).clear : t.enemies.length === 0)';
const operations=[
 {name:'wrath portal rendering uses canonical cleared-actor identity',from:'      t.enemies.length === 0 &&\n      t.egoDrops.length === 0 &&',to:'      /* RC132_WRATH_PORTAL */ (window.__HAPIL_DREAM_BALANCE_RC132__?.exitActorsClear(t,t.enemies.length === 0) ?? (t.enemies.length === 0)) &&\n      t.egoDrops.length === 0 &&'},
 {name:'wrath native interaction uses same authoritative gate',from:native,to:'/* RC132_WRATH_EXIT */ (window.__HAPIL_DREAM_BALANCE_RC132__?.exitActorsClear(t,'+native+') ?? '+native+')'},
 {name:'wrath shared combat-clear and auto progression use same authoritative required-actor gate',from:clearFrom,to:clearTo}
];
function apply(folder){const file=path.join(folder,'assets/index-v31526.js');let text=fs.readFileSync(file,'utf8'),changed=false;for(const op of operations){const existing=text.split(op.to).length-1;if(existing){assert.equal(existing,1,'unique installed '+op.name);continue;}assert.equal(text.split(op.from).length-1,1,op.name);text=text.replace(op.from,op.to);changed=true;}if(changed)fs.writeFileSync(file,text);return changed;}
module.exports={operations,apply};if(require.main===module)console.log('RC132_WRATH_APPLY',apply(root));
