'use strict';
// Keep every RC130 public assertion, adding RC131 without response or state substitution.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
let code=fs.readFileSync(path.join(__dirname,'../rc130/public-smoke.cjs'),'utf8');
function replace(from,to){assert.equal(code.split(from).length,2,'RC131 public verification anchor: '+from);code=code.replace(from,to);}
replace("const files=['index.html',","const files=['assets/rc131/hero-images.js','index.html',");
replace("base+'?v=43001&qa=1'","base+'?v=43101&qa=1'");
replace("window.__HAPIL_RC130_NATIVE_INSTALLED__&&window.__HAPIL_RC127_INSTALLED__","window.__HAPIL_RC131_NATIVE_INSTALLED__&&window.__HAPIL_HERO_RECOVERY_RC131__?.installed&&window.__HAPIL_RC130_NATIVE_INSTALLED__&&window.__HAPIL_RC127_INSTALLED__");
replace("return{time:s.time,x:s.x,y:s.y,hp:s.hp,","return{heroImages:window.__HAPIL_HERO_RECOVERY_RC131__.snapshot(),time:s.time,x:s.x,y:s.y,hp:s.hp,");
replace("assert.deepEqual(row.errors,[]);assert.deepEqual(row.httpErrors,[]);row.status='passed';","assert(row.samples.every(v=>v.heroImages.installed&&v.heroImages.optionErrors===0),'RC131 hero image integration must stay installed and error-free');assert(last.heroImages.calls>0,'Actual public game must use the hero image boundary');assert.deepEqual(row.errors,[]);assert.deepEqual(row.httpErrors,[]);row.status='passed';");
code=code.replaceAll('RC130_PUBLIC','RC131_PUBLIC').replace("version:'RC130'","version:'RC131'");
const child=new Module(__filename,module);child.filename=__filename;child.paths=module.paths;child._compile(code,__filename);
