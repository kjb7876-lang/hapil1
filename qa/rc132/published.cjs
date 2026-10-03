'use strict';
// Extend the read-only public regression. Never replace responses or inject game state.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),Module=require('module');
let code=fs.readFileSync(path.join(__dirname,'../rc130/public-smoke.cjs'),'utf8');
function replace(from,to){assert.equal(code.split(from).length-1,1,'RC132 public QA anchor');code=code.replace(from,to);}
replace("const files=['index.html',","const files=['assets/rc132/dream-balance.js','assets/combat-v31412/outgoing-native.js','assets/rc131/hero-images.js','index.html',");
replace("version:'RC130',testedCommit:","version:'RC132',testedCommit:");
replace("base+'?v=43001&qa=1'","base+'?v=43201&qa=1'");
replace("window.__HAPIL_RC130_NATIVE_INSTALLED__&&window.__HAPIL_RC127_INSTALLED__","window.__HAPIL_DREAM_BALANCE_RC132__?.version==='RC132'&&window.__HAPIL_MIRROR_V31347__?.removed===true&&window.__HAPIL_RC130_NATIVE_INSTALLED__&&window.__HAPIL_RC127_INSTALLED__");
replace("return{time:s.time,x:s.x,y:s.y,hp:s.hp,","return{rc132:{balance:window.__HAPIL_DREAM_BALANCE_RC132__.snapshot(),enabled:window.__HAPIL_DREAM_BALANCE_RC132__.enabled(s),mirrorRemoved:window.__HAPIL_MIRROR_V31347__.removed,mirror:window.__HAPIL_MIRROR_V31347__.metrics()},time:s.time,x:s.x,y:s.y,hp:s.hp,");
replace("row.status='passed';","assert(row.samples.every(v=>v.rc132.balance.dreamOnly&&!v.rc132.enabled&&v.rc132.mirrorRemoved===true&&v.rc132.mirror.created===0&&v.rc132.mirror.hits===0&&v.rc132.mirror.draws===0),'RC132 removal and unchanged STORY sustain must be observed in live public state');row.status='passed';");
code=code.replaceAll('RC130_PUBLIC','RC132_PUBLIC');
const compiled=new Module(__filename,module);compiled.filename=__filename;compiled.paths=module.paths;compiled._compile(code,__filename);
