'use strict';
// Extend the existing read-only public smoke test; never intercept network or inject state.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),assert=require('node:assert/strict');
let code=fs.readFileSync(path.join(__dirname,'../rc126/published-smoke.cjs'),'utf8');
const rc128=fs.readFileSync(path.join(__dirname,'../../index.html'),'utf8').includes('assets/rc128/combat-feedback.js');
function replace(from,to){assert.equal(code.split(from).length-1,1,'published QA anchor');code=code.replace(from,to);}
const added=['assets/rc127/combat-policy.js','assets/rc127/dark-jelly.js','assets/combat-v31412/skill-completion.js'];
if(rc128)added.push('assets/rc128/awakening-policy.js','assets/rc128/combat-feedback.js','assets/rc91/samong-awakening.js','assets/combat-v31402/combat-core.js','assets/rc23/feedback.js');
replace("const files=['index.html',","const files=["+added.map(f=>JSON.stringify(f)).join(',')+",'index.html',");
replace("url.searchParams.set('v','42602')","url.searchParams.set('v','"+(rc128?'42801':'42701')+"')");
replace("window.__HAPIL_COMBAT_SAFETY_RC126__?.snapshot().installed&&window.__HAPIL_FINITE_NATIVE_RC126__?.version==='RC126-finite-2'","window.__HAPIL_RC127_INSTALLED__&&"+(rc128?"window.__HAPIL_FEEDBACK_RC128__?.installed&&window.__HAPIL_AWAKENING_POLICY_RC128__?.version==='RC128'&&":"")+"window.__HAPIL_COMBAT_SAFETY_RC126__?.snapshot().installed&&window.__HAPIL_FINITE_NATIVE_RC126__?.version==='RC126-finite-2'");
replace("return{zone:s.zone,time:s.time,hp:s.hp,hero:s.activeHeroId,","return{"+(rc128?"rc128:window.__HAPIL_FEEDBACK_RC128__.snapshot(s),":"")+"rc127:{installed:window.__HAPIL_RC127_INSTALLED__,fixed:window.__HAPIL_POLICY_RC127__.fixedSpeed,actual:s.rc127MovementSpeed,incoming:s.rc127Defense?.incoming},zone:s.zone,time:s.time,hp:s.hp,hero:s.activeHeroId,");
replace("row.passed=true;","assert(row.samples.every(v=>v.rc127.installed&&Number.isFinite(v.rc127.actual)&&Math.abs(v.rc127.actual-v.rc127.fixed)<1e-8&&v.rc127.incoming>=.25&&v.rc127.incoming<=1),'Published RC127 simulation must actually use fixed speed and bounded defense');"+(rc128?"assert(row.samples.every(v=>v.rc128.installed&&v.rc128.totals.drawErrors===0&&v.rc128.effects<=32),'Published RC128 presentation must remain installed, bounded and error-free');":"")+"row.passed=true;");
code=code.replaceAll('RC126_PUBLIC',rc128?'RC128_PUBLIC':'RC127_PUBLIC');
const child=new Module(__filename,module);child.filename=__filename;child.paths=module.paths;child._compile(code,__filename);
